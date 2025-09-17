// /lib/solana.ts
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

// Only initialize connection if we're not in build mode and have valid env vars
function createConnection(): Connection | null {
  const rpcUrl = process.env.SOLANA_RPC_URL
  if (!rpcUrl || (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://'))) {
    // During build time, env vars might not be available, so return null
    return null
  }
  return new Connection(rpcUrl, 'confirmed')
}

export const connection = createConnection()

// If connection is null (build time), we'll need to handle this in the functions that use it

// Only initialize TREASURY_OWNER if we have the env var
export const TREASURY_OWNER = process.env.TREASURY_OWNER ? new PublicKey(process.env.TREASURY_OWNER) : null

function toKeypairFromAny(raw: string): Keypair {
  const s = raw.trim()
  if (!s) throw new Error('TREASURY_PRIVATE_KEY is empty')

  // 1) JSON 数値配列（[n0,n1,...]）
  if (s.startsWith('[')) {
    const arr = JSON.parse(s)
    const u8 = Uint8Array.from(arr)
    if (u8.length === 64) return Keypair.fromSecretKey(u8)
    if (u8.length === 32) return Keypair.fromSeed(u8)      // v1系: fromSeed は 32B シード
    throw new Error(`Invalid JSON key length: ${u8.length} (expected 32 or 64)`)
  }

  // 2) Base58（Phantomなど）
  try {
    const u8 = bs58.decode(s)
    if (u8.length === 64) return Keypair.fromSecretKey(u8)
    if (u8.length === 32) return Keypair.fromSeed(u8)
    throw new Error(`Invalid base58 key length: ${u8.length} (expected 32 or 64)`)
  } catch (e) {
    throw new Error('Invalid base58 in TREASURY_PRIVATE_KEY')
  }
}

export function loadTreasurySigner(): Keypair {
  const raw = process.env.TREASURY_PRIVATE_KEY || ''
  const kp = toKeypairFromAny(raw)
  // **本人確認**：設定の TREASURY_OWNER と一致しなければ即エラー
  if (!TREASURY_OWNER) {
    throw new Error('TREASURY_OWNER environment variable is not set')
  }
  if (!kp.publicKey.equals(TREASURY_OWNER)) {
    throw new Error(
      `Signer pubkey mismatch. ENV TREASURY_OWNER=${TREASURY_OWNER.toBase58()} but keypair=${kp.publicKey.toBase58()}`
    )
  }
  return kp
}
