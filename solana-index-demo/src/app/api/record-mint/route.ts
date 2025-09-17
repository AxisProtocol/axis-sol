import { NextResponse } from 'next/server'

// In real implementation, this would be a database table
interface MintRecord {
  id: string
  walletAddress: string
  mintDate: string
  tokenAmount: number
  indexType: string
  transactionHash: string
}

// Mock storage - replace with real database
let mintRecords: MintRecord[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, tokenAmount, indexType, transactionHash } = body

    // Validate required fields
    if (!walletAddress || !tokenAmount || !indexType || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create mint record
    const mintRecord: MintRecord = {
      id: Date.now().toString(),
      walletAddress,
      mintDate: new Date().toISOString(),
      tokenAmount,
      indexType,
      transactionHash
    }

    // Store record (in real implementation, save to database)
    mintRecords.push(mintRecord)

    console.log('Mint record created:', mintRecord)

    return NextResponse.json({
      success: true,
      record: mintRecord
    })

  } catch (error) {
    console.error('Record mint API error:', error)
    return NextResponse.json(
      { error: 'Failed to record mint' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find mint records for the wallet
    const userRecords = mintRecords.filter(
      record => record.walletAddress === walletAddress
    )

    return NextResponse.json({
      success: true,
      records: userRecords
    })

  } catch (error) {
    console.error('Get mint records API error:', error)
    return NextResponse.json(
      { error: 'Failed to get mint records' },
      { status: 500 }
    )
  }
}
