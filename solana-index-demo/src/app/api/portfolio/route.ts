import { NextResponse } from 'next/server'

// Mock data - in real implementation, this would come from database and price APIs
const mockPortfolioData = {
  totalValue: 108630.46,
  totalChange: 8.5,
  mintDate: '2024-01-15T00:00:00Z',
  tokens: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      allocation: 10.0,
      currentPrice: 108630.46,
      mintPrice: 100000.00, // Price when user minted
      marketCap: 2163.1e9,
      volume24h: 27.6e9,
      change24h: 0.7,
      changeSinceMint: 8.63, // Calculated from mint price
      icon: 'bitcoin'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      allocation: 10.0,
      currentPrice: 4366.36,
      mintPrice: 4000.00,
      marketCap: 527.3e9,
      volume24h: 18.8e9,
      change24h: 1.4,
      changeSinceMint: 9.16,
      icon: 'ethereum'
    },
    {
      symbol: 'XRP',
      name: 'XRP',
      allocation: 10.0,
      currentPrice: 2.81,
      mintPrice: 2.60,
      marketCap: 167.3e9,
      volume24h: 3.1e9,
      change24h: 0.6,
      changeSinceMint: 8.08,
      icon: 'ripple'
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      allocation: 10.0,
      currentPrice: 863.17,
      mintPrice: 800.00,
      marketCap: 120.2e9,
      volume24h: 748e6,
      change24h: 0.7,
      changeSinceMint: 7.90,
      icon: 'binance-smart-chain'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      allocation: 10.0,
      currentPrice: 202.36,
      mintPrice: 180.00,
      marketCap: 109.4e9,
      volume24h: 5.6e9,
      change24h: -0.2,
      changeSinceMint: 12.42,
      icon: 'solana'
    },
    {
      symbol: 'TRX',
      name: 'TRON',
      allocation: 10.0,
      currentPrice: 0.34,
      mintPrice: 0.31,
      marketCap: 32.1e9,
      volume24h: 501e6,
      change24h: 0.4,
      changeSinceMint: 9.68,
      icon: 'tron'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      allocation: 10.0,
      currentPrice: 0.82,
      mintPrice: 0.75,
      marketCap: 30.0e9,
      volume24h: 1.0e9,
      change24h: 0.0,
      changeSinceMint: 9.33,
      icon: 'cardano'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      allocation: 10.0,
      currentPrice: 15.89,
      mintPrice: 14.50,
      marketCap: 15.9e9,
      volume24h: 1.2e9,
      change24h: 1.1,
      changeSinceMint: 9.59,
      icon: 'chainlink'
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      allocation: 10.0,
      currentPrice: 35.67,
      mintPrice: 32.00,
      marketCap: 12.8e9,
      volume24h: 890e6,
      change24h: 2.3,
      changeSinceMint: 11.47,
      icon: 'avalanche'
    },
    {
      symbol: 'SUI',
      name: 'Sui',
      allocation: 10.0,
      currentPrice: 1.23,
      mintPrice: 1.10,
      marketCap: 8.9e9,
      volume24h: 450e6,
      change24h: -1.2,
      changeSinceMint: 11.82,
      icon: 'sui'
    }
  ]
}

// Calculate portfolio performance since mint date
const calculatePortfolioPerformance = (tokens: any[]) => {
  const totalAllocation = tokens.reduce((sum, token) => sum + token.allocation, 0)
  const weightedChange = tokens.reduce((sum, token) => {
    const weight = token.allocation / totalAllocation
    return sum + (token.changeSinceMint * weight)
  }, 0)
  
  return weightedChange
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    // In real implementation, you would:
    // 1. Get user wallet address from request
    // 2. Query database for user's mint history
    // 3. Get historical prices for mint date
    // 4. Calculate current portfolio value and performance
    // 5. Return real-time data
    
    // For now, return mock data with calculated performance
    const portfolioData = {
      ...mockPortfolioData,
      totalChange: calculatePortfolioPerformance(mockPortfolioData.tokens)
    }

    return NextResponse.json(portfolioData)
  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}
