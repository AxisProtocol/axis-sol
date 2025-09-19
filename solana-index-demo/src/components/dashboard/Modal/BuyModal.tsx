'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import SettlementModal from '../../modals/SettlementModal'
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
  USDC_MINT, 
  TREASURY_USDC_ATA, 
  AXIS_MINT_2022, 
  getUserUsdcBalance, 
  calculateExpectedTokens 
} from './modalUtils'

export default function BuyModal({ isOpen, onClose, indexPrice }: { 
  isOpen: boolean; 
  onClose: () => void; 
  indexPrice: number | null 
}) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [usdcBalance, setUsdcBalance] = useState(0)
  const [amount, setAmount] = useState('10.0')
  const [busy, setBusy] = useState(false)

  // settlement modal state
  const [settleOpen, setSettleOpen] = useState(false)
  const [depositSig, setDepositSig] = useState<string>()
  const [memoId, setMemoId] = useState<string>()

  // Use shared modal logic
  const { firstFocusableRef, networkName } = useModalLogic(isOpen, onClose)

  // --- Fetch USDC balance ---
  useEffect(() => {
    if (publicKey && isOpen) {
      getUserUsdcBalance(connection, publicKey).then(setUsdcBalance)
    }
  }, [publicKey, connection, isOpen, busy])

  const expectedAxis = useMemo(() => {
    const q = parseFloat(amount)
    return calculateExpectedTokens(q, indexPrice, true)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const value = usdcBalance * p
    setAmount(value.toFixed(6))
  }

  const handleBuy = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) return alert('Please connect your wallet.')
    if (networkName !== 'Devnet') return alert('This dApp runs on Devnet only.')

    const usdcAmount = parseFloat(amount)
    if (!isFinite(usdcAmount) || usdcAmount <= 0) return alert('Please enter a valid amount.')
    if (usdcAmount > usdcBalance) return alert('Insufficient USDC balance.')

    try {
      setBusy(true)
      const { AxisSDK } = await import('@axis-protocol/sdk')
      const sdk = new AxisSDK(connection, wallet as any)
      
      const { transaction, memoId: mid } = await sdk.buildUsdcDepositTransaction(usdcAmount)
      setMemoId(mid)
      
      const signature = await sendTransaction(transaction, connection)
      setDepositSig(signature)
      setSettleOpen(true)

      // Kick background processor (non-blocking)
      fetch('/api/settlements/process', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ signature })
      }).catch(()=>{})

      await connection.confirmTransaction(signature, 'confirmed')

    } catch (e: any) {
      console.error('[BuyModal] handleBuy error:', e)
      alert(e?.message || 'An unexpected error occurred.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ModalLayout isOpen={isOpen} onClose={onClose} titleId="buy-title">
        <ModalHeader 
          networkName={networkName}
          publicKey={publicKey?.toBase58() || null}
          onClose={onClose}
          title="Buy AXIS"
        />

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 lg:grid-cols-1">
          {/* Left: form */}
          <section className="bg-white/4 border border-white/10 rounded-xl p-4">
            <BalanceDisplay
              items={[
                { label: 'Your USDC Balance', value: usdcBalance, decimals: 6 },
                { label: 'Current Index Price', value: indexPrice ? `$${indexPrice.toFixed(4)}` : 'N/A' }
              ]}
            />

            <ModalInput
              id="buy-amt"
              label="Amount to Spend (USDC)"
              value={amount}
              onChange={setAmount}
              min="0"
              step="0.01"
              disabled={busy || !connected}
              inputMode="decimal"
            />

            <PercentageButtons
              onSetPercentage={setPct}
              disabled={busy || !connected}
            />

            {connected ? (
              <ModalButton
                onClick={handleBuy}
                disabled={busy || !publicKey}
              >
                {busy ? 'Processing…' : 'Buy AXIS'}
              </ModalButton>
            ) : (
              <div style={{marginTop: '1rem'}}>
                <WalletMultiButton />
              </div>
            )}
          </section>

          {/* Right: details */}
          <InfoDisplay
            title="Purchase Details"
            description="Your USDC is transferred to the treasury. The backend then settles the order and mints new AXIS tokens to your wallet."
            items={[
              { label: 'Receiving Token (AXIS)', value: AXIS_MINT_2022.toBase58() },
              { label: 'Treasury USDC ATA', value: TREASURY_USDC_ATA.toBase58() },
              { label: 'Spending Token (USDC)', value: USDC_MINT.toBase58() }
            ]}
            expectedValue={{
              label: 'Expected AXIS',
              value: expectedAxis ? `~ ${expectedAxis.toFixed(6)}` : '—',
              formula: 'Formula: Q<sub>AXIS</sub> = Q<sub>USDC</sub> / Index'
            }}
          />
        </div>
      </ModalLayout>

      <SettlementModal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        depositSig={depositSig!}
        memoId={memoId}
        expectedText={expectedAxis ? `~ ${expectedAxis.toFixed(6)} AXIS` : undefined}
        explorerBase="https://solscan.io"
      />
    </>
  )
}