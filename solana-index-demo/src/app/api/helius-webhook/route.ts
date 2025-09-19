import { NextRequest, NextResponse } from 'next/server'
import { putPending, getOne } from '@/lib/settlementStore'
import { payoutForSignature } from '@/lib/settlementProcessor'

// ----- env & const -----
const AUTH = process.env.HELIUS_WEBHOOK_TOKEN || '' // e.g. "Bearer dev-abc123xyz"
const USDC_DEV_MINT = (process.env.USDC_DEV_MINT || '').trim() || null
const TREASURY_USDC_ATA = (process.env.TREASURY_USDC_ATA || '').trim() || null
const AXIS_MINT_2022 = (process.env.AXIS_MINT_2022 || '').trim() || null
const TREASURY_OWNER = (process.env.TREASURY_OWNER || '').trim() || null
let PYTH_PRICE_IDS: string[] = []
try { PYTH_PRICE_IDS = Array.isArray(JSON.parse(process.env.PYTH_PRICE_IDS || '[]')) ? JSON.parse(process.env.PYTH_PRICE_IDS || '[]') : [] } catch { PYTH_PRICE_IDS = [] }

// ----- logging helper -----
const L = (o: any) => console.log(JSON.stringify({ ts:new Date().toISOString(), mod:'helius-webhook', ...o }))

// (no on-chain or pricing logic here; webhook stays minimal)

// (no token transfers here)

// ----- Helius Enhanced payload helpers -----
type Ev = any

const asArr = <T = any>(v: any): T[] => Array.isArray(v) ? (v as T[]) : []

function scanUsdcDeposit(ev: Ev) {
  if (!TREASURY_OWNER || !USDC_DEV_MINT || !TREASURY_USDC_ATA) return null

  const tt = asArr<any>(ev?.tokenTransfers)
    .find(t => t.mint === USDC_DEV_MINT && t.toUserAccount === TREASURY_OWNER)
  if (tt) return { fromUser: tt.fromUserAccount as string, uiAmount: Number(tt.tokenAmount) }

  const change = asArr<any>(ev?.accountData)
    .flatMap(a => asArr<any>(a?.tokenBalanceChanges))
    .find(c => c.mint === USDC_DEV_MINT && c.tokenAccount === TREASURY_USDC_ATA && Number(c.rawTokenAmount?.tokenAmount ?? '0') > 0)

  return change
    ? { fromUser: change.userAccount as string, uiAmount: Number(change.rawTokenAmount?.tokenAmount ?? '0') }
    : null
}

function scanAxisDeposit(ev: Ev) {
  if (!TREASURY_OWNER || !AXIS_MINT_2022) return null
  const tt = asArr<any>(ev?.tokenTransfers)
    .find(t => t.mint === AXIS_MINT_2022 && t.toUserAccount === TREASURY_OWNER)
  return tt
    ? { fromUser: tt.fromUserAccount as string, uiAmount: Number(tt.tokenAmount) }
    : null
}

// (no on-chain verification here)

// ----- main -----
export async function POST(request: NextRequest) {
  const DEBUG = (process.env.WEBHOOK_DEBUG === 'true') || (request.headers.get('x-debug') === '1')
  const FAST_MODE = process.env.WEBHOOK_FAST_MODE === 'true'
  const conf = {
    hasAuth: !!AUTH,
    USDC_DEV_MINT: USDC_DEV_MINT || 'not-set',
    TREASURY_USDC_ATA: TREASURY_USDC_ATA || 'not-set',
    AXIS_MINT_2022: AXIS_MINT_2022 || 'not-set',
    pythIds: PYTH_PRICE_IDS.length,
    TREASURY_OWNER: TREASURY_OWNER || 'not-set',
  }

  try {
    // 起動時ログ
    L({ lvl:'info', msg:'config.loaded', conf })
    L({ lvl:'info', msg:'flags', debug: !!DEBUG, fastMode: !!FAST_MODE })

    const gotAuth = String(request.headers.get('authorization') || '')
    if (AUTH) {
      if (gotAuth !== AUTH) {
        L({ lvl:'warn', msg:'unauthorized', got: gotAuth ? 'present' : 'missing' })
        return NextResponse.json({ ok:false, error:'unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const events: Ev[] = Array.isArray(body) ? body : (Array.isArray(body?.events) ? body.events : [body])
    L({ lvl:'info', hit:true, ua: String(request.headers.get('user-agent')||''), len: events.length })

    const results:any[] = []

    for (const ev of events) {
      const evType = ev?.type || ev?.transactionType
      const sig    = ev?.signature
      const slot   = ev?.slot
      const ttsCount = Array.isArray(ev?.tokenTransfers) ? ev.tokenTransfers.length : 0
      const accCount = Array.isArray(ev?.accountData) ? ev.accountData.length : 0
      L({ lvl:'debug', evType, sig, slot, desc: ev?.description, tokenTransfers: ttsCount, accountData: accCount })

      // Idempotency guard: skip if we've already paid for this signature
      if (sig) {
        const existing = getOne(sig)
        if (existing?.phase === 'paid') {
          L({ lvl:'info', step:'skip.already_paid', signature: sig })
          results.push({ sig, skipped: true, reason: 'already_paid' })
          continue
        }
      }

      // --- Mint（USDC→Treasury） ---
      const dep = scanUsdcDeposit(ev)
      if (dep && dep.fromUser) {
        const fromUser = dep.fromUser
        const usdcUi   = dep.uiAmount
        L({ lvl:'info', step:'settle.begin', via:'tokenTransfers', fromUser, usdcUi, signature: sig })

        // pending 記録
        putPending(sig, { side:'mint', depositSig: sig, usdcUi })
        L({ lvl:'info', step:'queue.recorded', side:'mint', signature: sig, usdcUi, fastMode: !!FAST_MODE })
        // fast mode: fire-and-forget payout
        if (FAST_MODE && sig) {
          ;(async () => {
            try { await payoutForSignature(sig, true) } catch (e:any) { L({ lvl:'error', step:'fast.payout.fail', signature: sig, err: e?.message }) }
          })()
        }
        results.push({ sig, side:'mint', queued: true })
        continue
      }

      // --- Burn（AXIS→Treasury） ---
      const burn = scanAxisDeposit(ev)
      if (burn && burn.fromUser) {
        const fromUser = burn.fromUser
        const axisUi   = burn.uiAmount
        L({ lvl:'info', step:'settle.begin', via:'tokenTransfers', fromUser, axisUi, signature: sig })

        putPending(sig, { side:'burn', depositSig: sig, axisUi })
        L({ lvl:'info', step:'queue.recorded', side:'burn', signature: sig, axisUi, fastMode: !!FAST_MODE })
        if (FAST_MODE && sig) {
          ;(async () => {
            try { await payoutForSignature(sig, true) } catch (e:any) { L({ lvl:'error', step:'fast.payout.fail', signature: sig, err: e?.message }) }
          })()
        }
        results.push({ sig, side:'burn', queued: true })
        continue
      }

      // 対象外
      L({ lvl:'debug', step:'extract', note:'no-match', signature: sig, tokenTransfers: ttsCount, accountData: accCount })
      results.push({ signature: sig, skipped: true, reason: 'no_match' })
    }

    return NextResponse.json({ ok:true, results, ...(DEBUG ? { conf } : {}) })
  } catch (e:any) {
    L({ lvl:'error', step:'top.fail', err: e?.message, stack: e?.stack })
    const error = e?.message || 'internal-error'
    // Return 200 with error payload to avoid provider treating as transport failure
    return NextResponse.json({ ok:false, error, conf }, { status: 200 })
  }
}
