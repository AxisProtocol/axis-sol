'use client'
import React, { useState } from 'react'
import { createTestRecord, getAllRecords, markPaid, markFailed } from '@/lib/settlementStore'
import SettlementModal from '@/components/modals/SettlementModal'

export default function TestSettlementPage() {
  const [testSignature, setTestSignature] = useState('test-sig-123')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'pending' | 'paid' | 'failed'>('pending')

  const handleCreateRecord = () => {
    createTestRecord(testSignature, currentPhase)
    alert(`Created test record for ${testSignature} with phase: ${currentPhase}`)
  }

  const handleChangePhase = (newPhase: 'pending' | 'paid' | 'failed') => {
    if (newPhase === 'paid') {
      markPaid(testSignature, { payoutSig: `payout-${testSignature.slice(0, 8)}` })
    } else if (newPhase === 'failed') {
      markFailed(testSignature, 'Test error message')
    }
    setCurrentPhase(newPhase)
    alert(`Changed phase to: ${newPhase}`)
  }

  const handleViewAllRecords = () => {
    getAllRecords()
  }

  return (
    <div className="min-h-screen bg-[#0e1116] text-[#e6edf3] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settlement Modal Test Page</h1>
        
        <div className="bg-[#1c2533] border border-[#2a3953] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Settlement Record</h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Signature:</label>
              <input
                type="text"
                value={testSignature}
                onChange={(e) => setTestSignature(e.target.value)}
                className="w-full bg-[#10151f] border border-[#243047] rounded-lg px-3 py-2 text-white"
                placeholder="Enter test signature"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Initial Phase:</label>
              <select
                value={currentPhase}
                onChange={(e) => setCurrentPhase(e.target.value as any)}
                className="w-full bg-[#10151f] border border-[#243047] rounded-lg px-3 py-2 text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateRecord}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Test Record
            </button>
          </div>
        </div>

        <div className="bg-[#1c2533] border border-[#2a3953] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Change Record Phase</h2>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleChangePhase('pending')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Set to Pending
            </button>
            
            <button
              onClick={() => handleChangePhase('paid')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Set to Paid
            </button>
            
            <button
              onClick={() => handleChangePhase('failed')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Set to Failed
            </button>
          </div>
        </div>

        <div className="bg-[#1c2533] border border-[#2a3953] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          
          <div className="flex gap-3">
            <button
              onClick={handleViewAllRecords}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View All Records (Console)
            </button>
            
            <button
              onClick={() => setModalOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Open Settlement Modal
            </button>
          </div>
        </div>

        <div className="bg-[#1c2533] border border-[#2a3953] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a test settlement record with your desired phase</li>
            <li>Open the settlement modal to test the polling behavior</li>
            <li>Change the record phase while the modal is open to see real-time updates</li>
            <li>Check the browser console for detailed logging</li>
            <li>Use the debug info panel in the modal to see what's happening</li>
          </ol>
        </div>
      </div>

      <SettlementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        depositSig={testSignature}
        memoId="test-memo-123"
        expectedText="Expected: 100 AXIS"
        explorerBase="https://solscan.io"
      />
    </div>
  )
}
