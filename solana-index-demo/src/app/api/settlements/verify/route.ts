import { NextRequest, NextResponse } from 'next/server'
import { classifyDeposit, getPayoutPlan } from '@/lib/settlementProcessor'
import { putPending, getOne } from '@/lib/settlementStore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>null)
    const sig = body?.signature || new URL(request.url).searchParams.get('signature')
    if (!sig) return NextResponse.json({ ok:false, error:'missing signature' }, { status: 400 })

    const cls = await classifyDeposit(sig)
    if (!cls) return NextResponse.json({ ok:false, error:'not a deposit signature' }, { status: 200 })

    const existing = getOne(sig)
    if (!existing) {
      if (cls.kind === 'mint') putPending(sig, { side:'mint', depositSig: sig, usdcUi: cls.uiAmount })
      else putPending(sig, { side:'burn', depositSig: sig, axisUi: cls.uiAmount })
    }

    const plan = await getPayoutPlan(sig)
    return NextResponse.json({ ok:true, plan })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status: 200 })
  }
}


