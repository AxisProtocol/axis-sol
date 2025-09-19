'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { 
  ModalLayout, 
  ModalHeader, 
  ModalInput, 
  PercentageButtons, 
  ModalButton, 
  BalanceDisplay, 
  InfoDisplay 
} from './ModalComponents'
import { 
  useModalLogic, 
  AXIS_MINT_2022, 
  AXIS_DECIMALS, 
  TREASURY_OWNER, 
  USDC_MINT as USDC_DEV_MINT, 
  calculateExpectedTokens 
} from './modalUtils'

type Props = {
  isOpen: boolean
  onClose: () => void
  indexPrice: number | null
}

export default function BurnModal({ isOpen, onClose, indexPrice }: Props) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [axisBalance, setAxisBalance] = useState(0)
  const [amount, setAmount] = useState('0.01')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'idle'|'building'|'submitted'|'settling'|'settled'|'error'>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [memoId, setMemoId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Use shared modal logic
  const { firstFocusableRef, networkName } = useModalLogic(isOpen, onClose)

  // -------- Fetch AXIS balance --------
  useEffect(() => {
    let aborted = false
    const run = async () => {
      if (!connected || !publicKey) return
      try {
        const ata = await getAssociatedTokenAddress(
            AXIS_MINT_2022,
            publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
          )
        const bal = await connection.getTokenAccountBalance(ata).catch(() => null)
        if (!aborted) setAxisBalance(bal?.value?.uiAmount || 0)
      } catch { if (!aborted) setAxisBalance(0) }
    }
    run()
  }, [connected, publicKey, connection, step === 'settled'])

  const expectedUsdc = useMemo(() => {
    const q = parseFloat(amount)
    return calculateExpectedTokens(q, indexPrice, false)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const q = axisBalance * p
    setAmount(q.toFixed(AXIS_DECIMALS))
  }

  const handleRedeem = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      setErrorMsg('Connect your wallet on Devnet.')
      setStep('error'); return
    }
    if (networkName !== 'Devnet') {
      setErrorMsg('This dApp runs on Devnet only.')
      setStep('error'); return
    }
    const qAxis = parseFloat(amount)
    if (!isFinite(qAxis) || qAxis <= 0) {
      setErrorMsg('Enter a valid amount.')
      setStep('error'); return
    }
    if (qAxis > axisBalance) {
      setErrorMsg('Insufficient AXIS balance.')
      setStep('error'); return
    }

    try {
      setBusy(true); setErrorMsg(null); setStep('building')

      const { AxisSDK } = await import('@axis-protocol/sdk')
      const sdk = new AxisSDK(connection, wallet as any)

      const { transaction, memoId: mid } = await sdk.buildIndexTokenDepositTransaction(qAxis)
      setMemoId(mid)

      setStep('submitted')
      const signature = await sendTransaction(transaction, connection)
      setTxSig(signature)
      setStep('settling')

      // Kick background processor (non-blocking)
      fetch('/api/settlements/process', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ signature })
      }).catch(()=>{})

      let done = false
      const deadline = Date.now() + 90_000
      while (!done && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 4000))
        done = true
      }
      if (done) setStep('settled')
      else setStep('settling')
    } catch (e: any) {
      console.error('[BurnModal] error:', e)
      setErrorMsg(e?.message || 'Unexpected error')
      setStep('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} titleId="redeem-title">
      <ModalHeader 
        networkName={networkName}
        publicKey={publicKey?.toBase58() || null}
        onClose={onClose}
        title="Redeem AXIS"
      />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 lg:grid-cols-1">
        {/* Left: form */}
        <section className="bg-white/4 border border-white/10 rounded-xl p-4">
          <BalanceDisplay
            items={[
              { label: 'Your AXIS Balance', value: axisBalance, decimals: AXIS_DECIMALS },
              { label: 'Current Index Value', value: indexPrice ? indexPrice.toFixed(6) : 'N/A' }
            ]}
          />

          <ModalInput
            id="redeem-amt"
            label="Amount to Redeem (AXIS)"
            value={amount}
            onChange={setAmount}
            min="0"
            step="0.000000001"
            disabled={busy}
            inputMode="decimal"
          />

          <PercentageButtons
            onSetPercentage={setPct}
            disabled={busy}
          />

          <ModalButton
            onClick={handleRedeem}
            disabled={busy || !publicKey}
          >
            {busy ? 'Processing…' : 'Redeem (Burn)'}
          </ModalButton>

          {/* Inline status */}
          {step !== 'idle' && (
            <div className="mt-3 p-3 rounded-lg bg-black/35 border border-white/12 text-sm">
              {step === 'building'  && <p>Preparing transaction…</p>}
              {step === 'submitted' && <p>Transaction sent. Waiting for confirmation…</p>}
              {step === 'settling'  && (
                <p>
                  Waiting for backend settlement…{' '}
                  <button className="text-[#9db7ff] underline bg-none border-none cursor-pointer hover:text-blue-300 transition-colors" onClick={() => setStep('settling')}>Check again</button>
                </p>
              )}
              {step === 'settled'   && <p>Redeemed successfully. USDC should arrive shortly.</p>}
              {step === 'error'     && <p className="text-[#ff7b7b]">{errorMsg}</p>}
              {txSig && (
                <p>
                  Tx:&nbsp;
                  <a className="text-[#9db7ff] underline hover:text-blue-300 transition-colors" href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer">view</a>
                </p>
              )}
              {memoId && <p>Memo: {memoId}</p>}
            </div>
          )}
        </section>

        {/* Right: details */}
        <InfoDisplay
          title="Redemption Details"
          description="Your AXIS (Token-2022) is transferred to the treasury. The backend then executes the redemption settlement and returns USDC according to the index."
          items={[
            { label: 'AXIS Mint', value: AXIS_MINT_2022.toBase58() },
            { label: 'Treasury (Owner)', value: TREASURY_OWNER.toBase58() },
            { label: 'USDC (devnet)', value: USDC_DEV_MINT.toBase58() }
          ]}
          expectedValue={{
            label: 'Expected USDC',
            value: expectedUsdc ? expectedUsdc.toFixed(6) : '—',
            formula: 'Formula: Q<sub>USDC</sub> = Q<sub>AXIS</sub> × Index'
          }}
        />
      </div>
    </ModalLayout>
  )
}
