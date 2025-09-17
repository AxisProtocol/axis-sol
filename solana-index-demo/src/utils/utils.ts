import { PublicKey } from '@solana/web3.js'

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
