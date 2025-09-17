// /components/TxStatusModal.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

type Props = {
  open: boolean
  onClose: () => void
  connection: any
  user: PublicKey
  axisMint: PublicKey
  axisDecimals: number
  initialAxisBalance: number
  expectedAxis: number
  usdcSignature: string
  memoId: string
}

export default function TxStatusModal({
  open, onClose, connection, user, axisMint, axisDecimals,
  initialAxisBalance, expectedAxis, usdcSignature, memoId
}: Props) {
  const [axisReceived, setAxisReceived] = useState(0)
  const [status, setStatus] = useState<'waiting'|'received'|'timeout'|'error'>('waiting')
  const [err, setErr] = useState<string>('')

  const explorerUrl = useMemo(
    () => `https://solscan.io/tx/${usdcSignature}?cluster=devnet`,
    [usdcSignature]
  )

  useEffect(() => {
    if (!open) return
    let mounted = true
    ;(async () => {
      try {
        console.group('[SettlementWatcher]')
        console.debug('memoId:', memoId)
        console.debug('expectedAxis:', expectedAxis)
        console.debug('initialAxisBalance:', initialAxisBalance)

        const ata = await getAssociatedTokenAddress(axisMint, user, false, TOKEN_2022_PROGRAM_ID)
        // Poll every 2s up to ~90s
        const deadline = Date.now() + 90_000
        while (mounted && Date.now() < deadline) {
          const bal = await connection.getTokenAccountBalance(ata).catch(() => null)
          const ui = bal?.value?.uiAmount ?? 0
          const delta = Math.max(0, ui - initialAxisBalance)
          console.debug('[poll] ui=', ui, 'delta=', delta)
          if (delta > 0 && delta + 1e-9 >= expectedAxis * 0.95) { // 5% tolerance
            setAxisReceived(delta)
            setStatus('received')
            console.groupEnd()
            return
          }
          await new Promise(r => setTimeout(r, 2000))
        }
        setStatus('timeout')
        console.groupEnd()
      } catch (e: any) {
        setErr(e?.message || String(e))
        setStatus('error')
        console.groupEnd()
      }
    })()
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-180 flex items-center justify-center z-[9999]">
      <div className="w-[min(560px,92vw)] bg-gradient-to-b from-[#0b1020] to-[#0d1226] border border-white/8 shadow-2xl shadow-black/35 rounded-2xl text-[#e7ecff]">
        <div className="flex justify-between items-center p-4 px-4.5 border-b border-white/6">
          <div className="text-base font-semibold tracking-wide">Order Settlement</div>
          <button className="bg-transparent border-0 text-[#9fb4ff] text-xl cursor-pointer hover:text-white transition-colors" onClick={onClose}>×</button>
        </div>

        <div className="p-4.5">
          <ol className="list-none m-0 p-0 grid gap-3.5">
            <li className="relative p-2.5 border border-[rgba(103,214,164,0.35)] rounded-xl bg-[rgba(60,210,150,0.08)]">
              <div className="font-semibold mb-1">USDC payment sent</div>
              <a className="text-[#9ab4ff] underline hover:text-blue-300 transition-colors" href={explorerUrl} target="_blank" rel="noreferrer">View transaction</a>
              <div className="opacity-90 text-sm"><span>Memo:</span> <code className="font-mono">{memoId}</code></div>
            </li>

            <li className={status === 'received' ? 'relative p-2.5 border border-[rgba(103,214,164,0.35)] rounded-xl bg-[rgba(60,210,150,0.08)]' : 'relative p-2.5 border border-dashed border-[rgba(154,180,255,0.35)] rounded-xl bg-white/5'}>
              <div className="font-semibold mb-1">
                {status === 'received' ? 'AXIS delivered' : 'Waiting for settlement (backend)'}
              </div>
              <div className="opacity-90 text-sm">
                <span>Expected:</span> <b>{expectedAxis.toFixed(6)}</b> AXIS
                {status === 'received' && (<>
                  &nbsp;|&nbsp;<span>Received:</span> <b>{axisReceived.toFixed(6)}</b> AXIS
                </>)}
              </div>
            </li>

            <li className={
              status === 'received' ? 'relative p-2.5 border border-[rgba(103,214,164,0.35)] rounded-xl bg-[rgba(60,210,150,0.08)]' :
              status === 'timeout'  ? 'relative p-2.5 border border-[rgba(255,128,128,0.35)] rounded-xl bg-[rgba(255,64,64,0.08)]' : 'opacity-60'
            }>
              <div className="font-semibold mb-1">
                {status === 'received' ? 'Completed' : status === 'timeout' ? 'Timeout' : 'Finalizing'}
              </div>
              {status === 'timeout' && (
                <div className="mt-1.5 text-sm opacity-90">
                  Didn't see the tokens within the expected window.  
                  Keep this window open and try "Check again", or contact support with the memo and signature.
                </div>
              )}
              {status === 'error' && <div className="mt-1.5 text-sm opacity-90">Error: {err}</div>}
            </li>
          </ol>
        </div>

        <div className="flex justify-end gap-2 p-3.5 px-4.5 border-t border-white/6">
          <button className="bg-transparent border border-white/20 text-[#d9e1ff] rounded-lg px-3.5 py-2.5 font-semibold cursor-pointer hover:bg-white/10 transition-colors" onClick={()=>{
            navigator.clipboard?.writeText(JSON.stringify({ memoId, usdcSignature, expectedAxis }))
          }}>Copy debug info</button>

          <button className="bg-[#7aa2ff] border-0 text-[#0b1020] rounded-lg px-3.5 py-2.5 font-semibold cursor-pointer hover:bg-blue-400 transition-colors" onClick={onClose}>
            {status === 'received' ? 'Close' : 'Close anyway'}
          </button>
        </div>
      </div>
    </div>
  )
}
