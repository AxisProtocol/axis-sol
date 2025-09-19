import { NextResponse } from 'next/server';
import { getOne } from '@/lib/settlementStore';
import { classifyDeposit } from '@/lib/settlementProcessor';

export async function GET(
  request: Request,
  context: any
) {
  try {
    const sig = context?.params?.sig as string | undefined;

    if (!sig) {
      console.log('[Settlements API] Missing signature parameter');
      return NextResponse.json(
        { error: 'Signature parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[Settlements API] Checking settlement for signature: ${sig}`);

    // Prefer store; if missing, try classify to infer side
    const settlementRecord = getOne(sig);
    
    if (settlementRecord) {
      console.log(`[Settlements API] Found settlement record:`, settlementRecord);
      
      // Return the record in the format expected by the modal
      const responseData = {
        record: {
          phase: settlementRecord.phase,
          side: settlementRecord.side,
          payoutSig: settlementRecord.payoutSig,
          error: settlementRecord.error
        }
      };
      
      console.log(`[Settlements API] Returning settlement data:`, responseData);
      return NextResponse.json(responseData);
    } else {
      console.log(`[Settlements API] No settlement record found for signature: ${sig}`);
      // Try to classify on-chain so UI can show correct side even without store
      const cls = await classifyDeposit(sig).catch(()=>null);
      const side = cls?.kind === 'burn' ? 'burn' as const : 'mint' as const;
      const fallback = { record: { phase: 'pending' as const, side, payoutSig: undefined, error: undefined } };
      console.log(`[Settlements API] Returning inferred pending record:`, fallback);
      return NextResponse.json(fallback);
    }

  } catch (error) {
    console.error('[Settlements API] Error fetching settlement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
