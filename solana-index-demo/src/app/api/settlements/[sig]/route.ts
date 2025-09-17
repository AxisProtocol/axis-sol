import { NextRequest, NextResponse } from 'next/server';
import { getOne } from '@/lib/settlementStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sig: string }> }
) {
  try {
    const { sig } = await params;

    if (!sig) {
      console.log('[Settlements API] Missing signature parameter');
      return NextResponse.json(
        { error: 'Signature parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[Settlements API] Checking settlement for signature: ${sig}`);

    // Get settlement data from the store
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
      
      // Return a pending record if none exists (this might happen for new transactions)
      const defaultRecord = {
        record: {
          phase: 'pending' as const,
          side: 'mint' as const,
          payoutSig: undefined,
          error: undefined
        }
      };
      
      console.log(`[Settlements API] Returning default pending record:`, defaultRecord);
      return NextResponse.json(defaultRecord);
    }

  } catch (error) {
    console.error('[Settlements API] Error fetching settlement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
