import { NextRequest, NextResponse } from 'next/server'
import { getPayoutPlan, payoutForSignature } from '@/lib/settlementProcessor'
import { getOne } from '@/lib/settlementStore'

// minimal dedupe guard
const g = globalThis as any
if (!g.__AXIS_PROCESS_DEDUPE__) g.__AXIS_PROCESS_DEDUPE__ = new Map<string, number>()
const DEDUPE: Map<string, number> = g.__AXIS_PROCESS_DEDUPE__
const DEDUPE_TTL_MS = 5_000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>null)
    const sig = body?.signature || new URL(request.url).searchParams.get('signature')
    if (!sig) return NextResponse.json({ ok:false, error:'missing signature' }, { status: 400 })
    const url = new URL(request.url)
    const planFlag = body?.plan === 1 || body?.plan === true || url.searchParams.get('plan') === '1'
    const fast = body?.fast !== false
    const force = body?.force === 1 || body?.force === true || url.searchParams.get('force') === '1'

    // simple dedupe to avoid double spends in quick retries
    const now = Date.now()
    const last = DEDUPE.get(sig) || 0
    if (!force && now - last < DEDUPE_TTL_MS) {
      const existing = getOne(sig)
      return NextResponse.json({ ok:true, deduped:true, signature: sig, ...(existing ? { record: { phase: existing.phase, side: existing.side, payoutSig: existing.payoutSig, error: existing.error } } : {}) })
    }
    DEDUPE.set(sig, now)

    if (planFlag) {
      const plan = await getPayoutPlan(sig)
      return NextResponse.json({ ok:true, plan })
    }

    // one-shot payout
    const result = await payoutForSignature(sig, fast)
    return NextResponse.json({ ok:true, result })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status: 200 })
  }
}

