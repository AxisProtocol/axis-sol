import { NextRequest, NextResponse } from 'next/server'
import { payoutForSignature } from '@/lib/settlementProcessor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>null)
    const sig = body?.signature || new URL(request.url).searchParams.get('signature')
    const fast = body?.fast !== false // default true
    if (!sig) return NextResponse.json({ ok:false, error:'missing signature' }, { status: 400 })

    const result = await payoutForSignature(sig, fast)
    return NextResponse.json({ ok:true, result })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status: 200 })
  }
}


