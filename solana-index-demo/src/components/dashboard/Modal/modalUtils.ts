import { useEffect, useRef, useMemo } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

// ---- Devnet Constants ----
export const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
export const TREASURY_USDC_ATA = new PublicKey('GPrfbGCK2rBEYL2jy7mMq9pYBht1tTss6ZfLUwU1jxrB')
export const AXIS_MINT_2022 = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1')
export const AXIS_DECIMALS = 9
export const TREASURY_OWNER = new PublicKey('BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj')

// ---- Utility Functions ----
// Format address for display (e.g., "ABC1...XYZ9")
export function formatAddress(pk?: PublicKey | null): string {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

// Get network name from RPC endpoint
export function getNetworkName(rpcEndpoint: string): string {
  return rpcEndpoint.toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet'
}

// Validate amount input
export function validateAmount(amount: string, min: number = 0): boolean {
  const num = parseFloat(amount)
  return isFinite(num) && num > min
}

// Calculate expected tokens based on formula
export function calculateExpectedTokens(
  inputAmount: number, 
  indexPrice: number | null, 
  isBuy: boolean
): number | null {
  if (!indexPrice || !isFinite(inputAmount) || inputAmount <= 0) return null
  
  // Buy: Q_AXIS = Q_USDC / Index
  // Burn: Q_USDC = Q_AXIS × Index
  return isBuy ? inputAmount / indexPrice : inputAmount * indexPrice
}

// Get USDC balance helper
export async function getUserUsdcBalance(conn: any, owner: PublicKey) {
  try {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token')
    const ata = await getAssociatedTokenAddress(USDC_MINT, owner)
    const bal = await conn.getTokenAccountBalance(ata)
    return bal.value.uiAmount || 0
  } catch { return 0 }
}

// ---- Custom Hooks ----
export function useModalLogic(isOpen: boolean, onClose: () => void) {
  const { connection } = useConnection()
  const firstFocusableRef = useRef<HTMLInputElement | null>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose() 
    }
    
    document.addEventListener('keydown', onKey)
    setTimeout(() => firstFocusableRef.current?.focus(), 0)
    
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const networkName = useMemo(
    () => getNetworkName(connection?.rpcEndpoint || ''),
    [connection?.rpcEndpoint]
  )

  return { firstFocusableRef, networkName }
}

export function useNetworkName() {
  const { connection } = useConnection()
  
  return useMemo(
    () => getNetworkName(connection?.rpcEndpoint || ''),
    [connection?.rpcEndpoint]
  )
}
