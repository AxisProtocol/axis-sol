#!/usr/bin/env ts-node

import axios from 'axios'

// Allow overriding the recipient wallet to a valid base58 pubkey for payout tests
const TEST_USER_PUBKEY =
  process.env.TEST_USER_PUBKEY ||
  process.argv[2] ||
  process.env.TREASURY_OWNER ||
  // Dev default (treasury owner in wrangler.jsonc) – OK for local testing
  'BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj'

// Test script for the Helius webhook endpoint
async function testWebhook() {
  const webhookUrl = 'http://localhost:3000/api/helius-webhook'
  
  // Mock Helius webhook payload for USDC deposit
  const mockPayload = {
    events: [{
      type: 'transfer',
      signature: 'test-sig-123',
      slot: 12345,
      description: 'Test USDC transfer to treasury',
      tokenTransfers: [{
        mint: process.env.USDC_DEV_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
        fromUserAccount: TEST_USER_PUBKEY, // must be valid base58 for payout tx
        toUserAccount: process.env.TREASURY_OWNER || 'BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj',
        tokenAmount: '1000',
        rawTokenAmount: {
          tokenAmount: '1000000000',
          decimals: 6
        }
      }],
      accountData: [{
        tokenBalanceChanges: [{
          mint: process.env.USDC_DEV_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
          tokenAccount: process.env.TREASURY_USDC_ATA || 'GPrfbGCK2rBEYL2jy7mMq9pYBht1tTss6ZfLUwU1jxrB',
          userAccount: TEST_USER_PUBKEY,
          rawTokenAmount: {
            tokenAmount: '1000000000',
            decimals: 6
          }
        }]
      }]
    }]
  }

  try {
    console.log('🧪 Testing Helius webhook endpoint...')
    console.log('👤 Using recipient pubkey:', TEST_USER_PUBKEY)
    console.log('📤 Sending mock payload:', JSON.stringify(mockPayload, null, 2))
    
    const response = await axios.post(webhookUrl, mockPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.HELIUS_WEBHOOK_TOKEN || 'Bearer test-token'
      }
    })
    
    console.log('✅ Webhook response:', response.status, response.data)
    
    if (response.data.ok) {
      console.log('🎉 Webhook test successful!')
      console.log('📊 Results:', response.data.results)
    } else {
      console.log('❌ Webhook returned error:', response.data.error)
    }
    
  } catch (error: any) {
    console.error('❌ Webhook test failed:', error.message)
    if (error.response) {
      console.error('📡 Response status:', error.response.status)
      console.error('📡 Response data:', error.response.data)
    }
  }
}

// Test with different scenarios
async function runTests() {
  console.log('🚀 Starting Helius webhook tests...\n')
  
  // Test 1: USDC deposit (mint)
  console.log('=== Test 1: USDC Deposit (Mint) ===')
  await testWebhook()
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Test 2: Check settlement store
  console.log('=== Test 2: Check Settlement Store ===')
  try {
    const settlementResponse = await axios.get('http://localhost:3000/api/settlements/test-sig-123')
    console.log('📋 Settlement record:', settlementResponse.data)
  } catch (error: any) {
    console.error('❌ Failed to fetch settlement:', error.message)
  }
  
  console.log('\n✅ All tests completed!')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

export { testWebhook, runTests }
