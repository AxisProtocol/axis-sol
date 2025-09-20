import { NextRequest, NextResponse } from 'next/server'
import { classifyDeposit, getPayoutPlan } from '@/lib/settlementProcessor'
import { putPending, getOne } from '@/lib/settlementStore'

// lightweight dedupe window per signature
const g = globalThis as any
if (!g.__AXIS_VERIFY_DEDUPE__) g.__AXIS_VERIFY_DEDUPE__ = new Map<string, number>()
const DEDUPE: Map<string, number> = g.__AXIS_VERIFY_DEDUPE__
const DEDUPE_TTL_MS = 5_000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>null)
    const sig = body?.signature || new URL(request.url).searchParams.get('signature')
    if (!sig) return NextResponse.json({ ok:false, error:'missing signature' }, { status: 400 })
    const url = new URL(request.url)
    const planFlag = body?.plan === 1 || body?.plan === true || url.searchParams.get('plan') === '1'
    const force = body?.force === 1 || body?.force === true || url.searchParams.get('force') === '1'

    // dedupe
    const now = Date.now()
    const last = DEDUPE.get(sig) || 0
    if (!force && now - last < DEDUPE_TTL_MS) {
      return NextResponse.json({ ok:true, deduped:true, signature: sig })
    }
    DEDUPE.set(sig, now)

    const existingRec = getOne(sig)
    let cls = existingRec && !force
      ? (existingRec.side === 'mint'
          ? { kind: 'mint' as const, fromUser: null as any, uiAmount: existingRec.usdcUi || 0 }
          : { kind: 'burn' as const, fromUser: null as any, uiAmount: existingRec.axisUi || 0 })
      : await classifyDeposit(sig)
    if (!cls) return NextResponse.json({ ok:false, error:'not a deposit signature' }, { status: 200 })

    if (!existingRec) {
      if (cls.kind === 'mint') putPending(sig, { side:'mint', depositSig: sig, usdcUi: cls.uiAmount })
      else putPending(sig, { side:'burn', depositSig: sig, axisUi: cls.uiAmount })
    }

    if (planFlag) {
      const plan = await getPayoutPlan(sig)
      return NextResponse.json({ ok:true, plan })
    }
    return NextResponse.json({ ok:true, side: cls.kind, signature: sig })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status: 200 })
  }
}


