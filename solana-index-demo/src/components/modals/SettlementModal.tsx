'use client'
import React, { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  depositSig: string
  memoId?: string
  expectedText?: string // 例: "Expected: 0.03988 AXIS"
  explorerBase?: string // devnet solscan
}
type Phase = 'pending' | 'paid' | 'failed'
type Record = {
  phase: Phase
  side: 'mint' | 'burn'
  payoutSig?: string
  error?: string
}
const apiUrl = "https://api.axis-protocol.xyz"

// Notification function
const showNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon })
  }
}

// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
export default function SettlementModal({ open, onClose, depositSig, memoId, expectedText, explorerBase='https://solscan.io' }: Props) {
  const [phase, setPhase] = useState<Phase>('pending')
  const [payoutSig, setPayoutSig] = useState<string>()
  const [error, setError] = useState<string>()
  const [since, setSince] = useState<number>(Date.now())
  const [pollCount, setPollCount] = useState<number>(0)
  const [lastPollTime, setLastPollTime] = useState<number>(Date.now())
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [nextPollIn, setNextPollIn] = useState<number>(60) // Countdown to next poll

  useEffect(() => {
    if (!open || !depositSig) return
    
    // Request notification permission when modal opens
    requestNotificationPermission()
    
    console.log(`[SettlementModal] Starting settlement check for: ${depositSig}`)
    setDebugInfo(`Started checking settlement for ${depositSig}`)
    
    let stop = false
    let timeoutId: NodeJS.Timeout
    let countdownId: NodeJS.Timeout
    const maxPolls = 10 // Maximum 10 polls (10 minutes with 60s interval)
    const pollInterval = 60000 // 60 seconds
    
    const poll = async () => {
      if (stop) return
      
      const currentTime = Date.now()
      const timeSinceStart = currentTime - since
      const currentPoll = pollCount + 1
      
      console.log(`[SettlementModal] Poll #${currentPoll} - Time since start: ${Math.round(timeSinceStart/1000)}s`)
      setDebugInfo(`Poll #${currentPoll} - Time: ${Math.round(timeSinceStart/1000)}s`)
      
      try {
        console.log(`[SettlementModal] Fetching settlement data from /api/settlement/${depositSig}`)
        const response = await fetch(`${apiUrl}/api/settlement/${depositSig}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`[SettlementModal] API response:`, data)
        
        const rec: Record | null = data?.record ?? null
        if (rec) {
          console.log(`[SettlementModal] Record found:`, rec)
          setPhase(rec.phase)
          setPayoutSig(rec.payoutSig)
          setError(rec.error)
          
          if (rec.phase !== 'pending') {
            console.log(`[SettlementModal] Settlement completed with phase: ${rec.phase}`)
            setDebugInfo(`Settlement ${rec.phase} - ${rec.payoutSig ? `Payout: ${rec.payoutSig}` : 'No payout'}`)
            
            // Show notification
            if (rec.phase === 'paid') {
              showNotification(
                'Settlement Complete! 🎉',
                `Your ${rec.side === 'mint' ? 'AXIS tokens' : 'USDC'} have been sent successfully.`,
                '/favicon.ico'
              )
            } else if (rec.phase === 'failed') {
              showNotification(
                'Settlement Failed ❌',
                `Settlement failed: ${rec.error || 'Unknown error'}`,
                '/favicon.ico'
              )
            }
            
            return // 完了
          }
        } else {
          console.log(`[SettlementModal] No record found in response`)
          setDebugInfo(`No settlement record found`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[SettlementModal] Error during poll #${currentPoll}:`, err)
        setDebugInfo(`Error: ${errorMsg}`)
      }
      
      setPollCount(currentPoll)
      setLastPollTime(currentTime)
      
      // Check if we've exceeded max polls
      if (currentPoll >= maxPolls) {
        console.warn(`[SettlementModal] Maximum polls reached (${maxPolls}). Stopping.`)
        setDebugInfo(`Max polls reached (${maxPolls}) - Stopping`)
        setError('Settlement timeout - maximum attempts reached')
        setPhase('failed')
        showNotification(
          'Settlement Timeout ⏰',
          'Settlement check timed out after 10 minutes. Please try again.',
          '/favicon.ico'
        )
        return
      }
      
      // Start countdown for next poll
      setNextPollIn(pollInterval / 1000)
      let countdown = pollInterval / 1000
      countdownId = setInterval(() => {
        countdown--
        setNextPollIn(countdown)
        if (countdown <= 0) {
          clearInterval(countdownId)
        }
      }, 1000)
      
      // Continue polling if not stopped
      if (!stop) {
        timeoutId = setTimeout(poll, pollInterval)
      }
    }
    
    // Start first poll
    poll()
    
    return () => { 
      console.log(`[SettlementModal] Cleaning up settlement check for: ${depositSig}`)
      stop = true 
      if (timeoutId) clearTimeout(timeoutId)
      if (countdownId) clearInterval(countdownId)
    }
  }, [open, depositSig, since])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      console.log(`[SettlementModal] Modal opened for deposit: ${depositSig}`)
      setPhase('pending')
      setPayoutSig(undefined)
      setError(undefined)
      setPollCount(0)
      setLastPollTime(Date.now())
      setNextPollIn(60)
      setDebugInfo('Modal opened')
    } else {
      // Clean up when modal closes
      setNextPollIn(60)
    }
  }, [open, depositSig])

  if (!open) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="w-[720px] max-w-[95vw] bg-[#0e1116] border border-[#232a36] rounded-2xl shadow-2xl shadow-black/35 text-[#e6edf3] flex flex-col">
        <header className="flex items-center justify-between p-4 px-5 border-b border-[#1d2430]">
          <div className="font-semibold text-lg">Order Settlement</div>
          <button className="border-none bg-transparent text-[#8b98a5] text-2xl cursor-pointer hover:text-white transition-colors" onClick={onClose}>×</button>
        </header>

        <div className="p-4 px-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <span>USDC payment</span>
            <a className="text-[#8ab4ff] underline hover:text-blue-300 transition-colors" href={`${explorerBase}/tx/${depositSig}?cluster=devnet`} target="_blank" rel="noreferrer">View transaction</a>
          </div>
          {memoId && <div className="flex items-center justify-between gap-3">
            <span>Memo</span>
            <code className="bg-[#10151f] border border-[#243047] rounded-lg px-2 py-1 font-mono text-sm">{memoId}</code>
          </div>}
          {expectedText && <div className="flex items-center justify-between gap-3">
            <span>Quote</span>
            <b>{expectedText}</b>
          </div>}

          {/* Status Information */}
          <div className="bg-[#10151f] border border-[#243047] rounded-lg p-3 mt-2">
            <div className="text-sm text-[#8b98a5] mb-2">Status:</div>
            <div className="text-xs font-mono">{debugInfo}</div>
            <div className="text-xs text-[#8b98a5] mt-1">
              Polls: {pollCount}/10 | Time: {Math.round((Date.now() - since) / 1000)}s
            </div>
          </div>

          {phase === 'pending' && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-[#385989] border-t-transparent animate-spin" />
                <div>Waiting for settlement processing...</div>
              </div>
              <div className="text-sm text-[#8b98a5]">
                Next check in: <span className="font-mono text-[#8ab4ff]">{nextPollIn}s</span>
              </div>
              <div className="text-xs text-[#8b98a5]">
                Settlement processor runs every 2 minutes. We check every minute.
              </div>
            </div>
          )}

          {phase === 'paid' && <div className="flex items-center gap-2.5 mt-2">
            <div className="text-lg font-bold">✅ Settled</div>
            {payoutSig && <a className="text-[#8ab4ff] underline hover:text-blue-300 transition-colors" href={`${explorerBase}/tx/${payoutSig}?cluster=devnet`} target="_blank" rel="noreferrer">View payout</a>}
          </div>}

          {phase === 'failed' && <div className="flex items-center gap-2.5 mt-2">
            <div className="text-lg font-bold">⚠️ Failed</div>
            <div className="text-[#ff9aa2]">{error || 'Unknown error'}</div>
          </div>}
        </div>

        <footer className="flex justify-between items-center p-3 px-5 border-t border-[#1d2430]">
          {phase === 'pending' && (
            <div className="text-xs text-[#8b98a5]">
              You can close this modal and check back later. You'll get a notification when complete.
            </div>
          )}
          <div className="flex gap-2">
            {phase === 'pending' ? (
              <>
                <button 
                  className="bg-[#1c2533] border border-[#2a3953] text-[#c7d0db] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#2a3953] transition-colors" 
                  onClick={()=>{
                    console.log(`[SettlementModal] Manual refresh requested`)
                    setSince(Date.now())
                    setPollCount(0)
                    setNextPollIn(60)
                    setDebugInfo('Manual refresh triggered')
                  }}
                >
                  Check Now
                </button>
                <button 
                  className="bg-[#2a3953] border border-[#3a4a63] text-[#c7d0db] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#3a4a63] transition-colors" 
                  onClick={onClose}
                >
                  Close & Notify
                </button>
              </>
            ) : (
              <button 
                className="bg-blue-500 border-none text-white px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors" 
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
