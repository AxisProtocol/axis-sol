#!/usr/bin/env ts-node

import axios from 'axios'

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
        mint: process.env.USDC_DEV_MINT || 'mock-usdc-mint',
        fromUserAccount: 'test-user-account',
        toUserAccount: process.env.TREASURY_OWNER || 'mock-treasury',
        tokenAmount: '1000',
        rawTokenAmount: {
          tokenAmount: '1000000000',
          decimals: 6
        }
      }],
      accountData: [{
        tokenBalanceChanges: [{
          mint: process.env.USDC_DEV_MINT || 'mock-usdc-mint',
          tokenAccount: process.env.TREASURY_USDC_ATA || 'mock-treasury-ata',
          userAccount: 'test-user-account',
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
