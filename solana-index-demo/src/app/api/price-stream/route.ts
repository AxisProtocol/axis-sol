import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock price stream data
    // In a real implementation, this would connect to a WebSocket or streaming service
    const priceData = {
      timestamp: new Date().toISOString(),
      prices: {
        BTC: Math.random() * 50000 + 40000,
        ETH: Math.random() * 3000 + 2000,
        SOL: Math.random() * 200 + 100,
        // Add more assets as needed
      }
    };

    return NextResponse.json(priceData);

  } catch (error) {
    console.error('Error in price stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
