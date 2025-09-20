import { NextRequest, NextResponse } from 'next/server'
import {
  Connection, PublicKey, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token'
import axios from 'axios'
import { connection, loadTreasurySigner, TREASURY_OWNER } from '@/lib/solana'
import { putPending, markPaid, markFailed } from '@/lib/settlementStore'

// ----- env & const -----
const AUTH = process.env.HELIUS_WEBHOOK_TOKEN || '' // e.g. "Bearer dev-abc123xyz"
const USDC_DEV_MINT = process.env.USDC_DEV_MINT ? new PublicKey(process.env.USDC_DEV_MINT) : null
const TREASURY_USDC_ATA = process.env.TREASURY_USDC_ATA ? new PublicKey(process.env.TREASURY_USDC_ATA.trim()) : null
const AXIS_MINT_2022 = process.env.AXIS_MINT_2022 ? new PublicKey(process.env.AXIS_MINT_2022) : null
const AXIS_DEC = parseInt(process.env.AXIS_DECIMALS || '9', 10)
const PYTH_PRICE_IDS: string[] = JSON.parse(process.env.PYTH_PRICE_IDS || '[]')

// ----- logging helper -----
const L = (o: any) => console.log(JSON.stringify({ ts:new Date().toISOString(), mod:'helius-webhook', ...o }))

// ----- index calc from Hermes (latest_price_feeds) -----
async function fetchIndexValue(): Promise<number> {
  const { data } = await axios.get('https://hermes.pyth.network/api/latest_price_feeds', {
    params: { ids: PYTH_PRICE_IDS, binary: false },
  })
  // 既存の等ウェイト指数
  const base: Record<string, number> = { BTC:42739.27, ETH:2528.09, XRP:0.568, BNB:309.09, SOL:102.07,
    DOGE:0.08053, TRX:0.1083, ADA:0.5278, SUI:1.292, AVAX:36.03 }
  const map: Record<string,string> = {
    'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43':'BTC',
    'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace':'ETH',
    'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d':'SOL',
    '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f':'BNB',
    'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8':'XRP',
    'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c':'DOGE',
    '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42ecd2829867a0d':'ADA',
    '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7':'AVAX',
    '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b':'TRX',
    '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744':'SUI',
  }
  const latest: Record<string, number> = {}
  for (const d of data) {
    const expo = d.price?.expo ?? d.price?.exponent ?? 0
    latest[String(d.id).replace(/^0x/,'').toLowerCase()] = Number(d.price?.price) * Math.pow(10, expo)
  }
  const ratios = Object.entries(map).map(([id, sym]) => {
    const p = latest[id] ?? 0
    const b = base[sym]
    return b ? p / b : 0
  })
  const idx = 100 * (ratios.reduce((a,b)=>a+b,0) / ratios.length)
  return idx
}

// ----- helpers: ensure ATAs & transfers -----
// AXIS(Token-2022) -> user
async function transferAxisToUser(userOwner: PublicKey, axisUiAmount: number) {
  if (!connection) {
    throw new Error('Solana connection not available')
  }
  if (!TREASURY_OWNER) {
    throw new Error('TREASURY_OWNER not available')
  }
  if (!AXIS_MINT_2022) {
    throw new Error('AXIS_MINT_2022 not available')
  }
  
  const signer = loadTreasurySigner()
  const src = (await getOrCreateAssociatedTokenAccount(
    connection, signer, AXIS_MINT_2022, TREASURY_OWNER, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address
  const dst = (await getOrCreateAssociatedTokenAccount(
    connection, signer, AXIS_MINT_2022, userOwner, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address

  const amount = BigInt(Math.floor(axisUiAmount * 10 ** AXIS_DEC))
  const ix = createTransferCheckedInstruction(
    src, AXIS_MINT_2022, dst, signer.publicKey, amount, AXIS_DEC, [], TOKEN_2022_PROGRAM_ID
  ) // Token-2022は programId を明示。:contentReference[oaicite:3]{index=3}

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
    ix
  )
  tx.feePayer = signer.publicKey
  return await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'confirmed' })
}

// USDC(legacy SPL) -> user
async function transferUsdcToUser(userOwner: PublicKey, usdcUiAmount: number) {
  if (!connection) {
    throw new Error('Solana connection not available')
  }
  if (!TREASURY_USDC_ATA) {
    throw new Error('TREASURY_USDC_ATA not available')
  }
  if (!USDC_DEV_MINT) {
    throw new Error('USDC_DEV_MINT not available')
  }
  
  const signer = loadTreasurySigner()
  const src = TREASURY_USDC_ATA
  const dst = (await getOrCreateAssociatedTokenAccount(
    connection, signer, USDC_DEV_MINT, userOwner // legacy SPL（既定）
  )).address

  const amount = BigInt(Math.floor(usdcUiAmount * 10 ** 6))
  const ix = createTransferCheckedInstruction(
    src, USDC_DEV_MINT, dst, signer.publicKey, amount, 6 // USDCは6桁
  ) // Checked系は mint/decimals を検証できる。

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
    ix
  )
  tx.feePayer = signer.publicKey
  return await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'confirmed' })
}

// ----- Helius Enhanced payload helpers -----
type Ev = any

function scanUsdcDeposit(ev: Ev) {
  if (!TREASURY_OWNER || !USDC_DEV_MINT || !TREASURY_USDC_ATA) return null
  
  // 1) tokenTransfers を優先（fromUserAccount / toUserAccount が楽）:contentReference[oaicite:5]{index=5}
  const tts = Array.isArray(ev?.tokenTransfers) ? ev.tokenTransfers : []
  for (const t of tts) {
    if (t.mint === USDC_DEV_MINT.toBase58() && t.toUserAccount === TREASURY_OWNER.toBase58()) {
      return { fromUser: t.fromUserAccount as string, uiAmount: Number(t.tokenAmount) }
    }
  }
  // 2) accountData.tokenBalanceChanges のフォールバック（toTokenAccount = Treasury USDC ATA）:contentReference[oaicite:6]{index=6}
  const arr = Array.isArray(ev?.accountData) ? ev.accountData : []
  for (const a of arr) {
    const tbc = Array.isArray(a?.tokenBalanceChanges) ? a.tokenBalanceChanges : []
    for (const c of tbc) {
      if (c.mint === USDC_DEV_MINT.toBase58() && c.tokenAccount === TREASURY_USDC_ATA.toBase58()) {
        const amt = Number(c.rawTokenAmount?.tokenAmount ?? '0')
        if (amt > 0) return { fromUser: c.userAccount as string, uiAmount: amt }
      }
    }
  }
  return null
}

function scanAxisDeposit(ev: Ev) {
  if (!TREASURY_OWNER || !AXIS_MINT_2022) return null
  
  // AXIS(Token-2022) が Treasury に入ったら Burn とみなす。tokenTransfers を優先。
  const tts = Array.isArray(ev?.tokenTransfers) ? ev.tokenTransfers : []
  for (const t of tts) {
    if (t.mint === AXIS_MINT_2022.toBase58() && t.toUserAccount === TREASURY_OWNER.toBase58()) {
      return { fromUser: t.fromUserAccount as string, uiAmount: Number(t.tokenAmount) }
    }
  }
  // accountData 側は Token-2022 の ATA を把握していないとマッチしにくいので省略（必要なら追加）
  return null
}

// ----- main -----
export async function POST(request: NextRequest) {
  // 起動時ログ
  L({ lvl:'info', msg:'config.loaded', conf: {
    hasAuth: !!AUTH, USDC_DEV_MINT: USDC_DEV_MINT?.toBase58() || 'not-set',
    TREASURY_USDC_ATA: TREASURY_USDC_ATA?.toBase58() || 'not-set',
    AXIS_MINT_2022: AXIS_MINT_2022?.toBase58() || 'not-set', AXIS_DEC, pythIds: PYTH_PRICE_IDS.length,
    TREASURY_OWNER: TREASURY_OWNER?.toBase58() || 'not-set',
  }})

  const gotAuth = String(request.headers.get('authorization') || '')
  if (AUTH) {
    if (gotAuth !== AUTH) {
      L({ lvl:'warn', msg:'unauthorized', got: gotAuth })
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
    L({ lvl:'debug', evType, sig, slot, desc: ev?.description })

    // --- Mint（USDC→Treasury） ---
    const dep = scanUsdcDeposit(ev)
    if (dep && dep.fromUser) {
      const fromUser = dep.fromUser
      const usdcUi   = dep.uiAmount
      L({ lvl:'info', step:'settle.begin', via:'tokenTransfers', fromUser, usdcUi, signature: sig })

      // pending 記録
      putPending(sig, { side:'mint', depositSig: sig, usdcUi })

      try {
        const t0 = Date.now()
        const indexValue = await fetchIndexValue()
        L({ lvl:'debug', step:'index.calc', ms: Date.now()-t0, indexValue })

        const axisToSend = usdcUi / indexValue
        L({ lvl:'debug', step:'settle.quote', indexValue, axisToSend })

        const sendSig = await transferAxisToUser(new PublicKey(fromUser), axisToSend)
        L({ lvl:'info', step:'settle.ok', sendSig })

        markPaid(sig, { indexValue, axisUi: axisToSend, payoutSig: sendSig })
        results.push({ sig, side:'mint', indexValue, axisToSend, sendSig })
      } catch (e:any) {
        L({ lvl:'error', step:'settle.fail', err: e?.message, stack: e?.stack })
        markFailed(sig, e?.message || String(e))
      }
      continue
    }

    // --- Burn（AXIS→Treasury） ---
    const burn = scanAxisDeposit(ev)
    if (burn && burn.fromUser) {
      const fromUser = burn.fromUser
      const axisUi   = burn.uiAmount
      L({ lvl:'info', step:'settle.begin', via:'tokenTransfers', fromUser, axisUi, signature: sig })

      putPending(sig, { side:'burn', depositSig: sig, axisUi })

      try {
        const t0 = Date.now()
        const indexValue = await fetchIndexValue()
        L({ lvl:'debug', step:'index.calc', ms: Date.now()-t0, indexValue })

        const usdcToSend = axisUi * indexValue
        L({ lvl:'debug', step:'settle.quote', indexValue, usdcToSend })

        const sendSig = await transferUsdcToUser(new PublicKey(fromUser), usdcToSend)
        L({ lvl:'info', step:'settle.ok', sendSig })

        markPaid(sig, { indexValue, usdcUi: usdcToSend, payoutSig: sendSig })
        results.push({ sig, side:'burn', indexValue, usdcToSend, sendSig })
      } catch (e:any) {
        L({ lvl:'error', step:'settle.fail', err: e?.message, stack: e?.stack })
        markFailed(sig, e?.message || String(e))
      }
      continue
    }

    // 対象外
    L({ lvl:'debug', step:'extract', note:'no-match' })
  }

  return NextResponse.json({ ok:true, results })
}