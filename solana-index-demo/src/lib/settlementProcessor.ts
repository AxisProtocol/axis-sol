import { PublicKey, ComputeBudgetProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import axios from 'axios'
import { connection, loadTreasurySigner, TREASURY_OWNER } from '@/lib/solana'
import { putPending, markPaid, markFailed } from '@/lib/settlementStore'

function safePk(raw?: string | null): PublicKey | null {
  try { const v = (raw || '').trim(); if (!v) return null; return new PublicKey(v) } catch { return null }
}

const USDC_DEV_MINT = safePk(process.env.USDC_DEV_MINT)
const TREASURY_USDC_ATA = safePk(process.env.TREASURY_USDC_ATA)
const AXIS_MINT_2022 = safePk(process.env.AXIS_MINT_2022)
const AXIS_DEC = parseInt(process.env.AXIS_DECIMALS || '9', 10)
let PYTH_PRICE_IDS: string[] = []
try { PYTH_PRICE_IDS = JSON.parse(process.env.PYTH_PRICE_IDS || '[]') } catch { PYTH_PRICE_IDS = [] }

const L = (o: any) => console.log(JSON.stringify({ ts:new Date().toISOString(), mod:'settlement-processor', ...o }))

// --- Simple TTL cache for index value ---
let __INDEX_CACHE__: { ts: number, value: number } | null = null
const INDEX_TTL_MS = 45_000

export async function fetchIndexValue(): Promise<number> {
  const now = Date.now()
  if (__INDEX_CACHE__ && (now - __INDEX_CACHE__.ts) < INDEX_TTL_MS) {
    return __INDEX_CACHE__.value
  }
  const { data } = await axios.get('https://hermes.pyth.network/api/latest_price_feeds', {
    params: { ids: PYTH_PRICE_IDS, binary: false },
  })
  const base: Record<string, number> = { BTC:42739.27, ETH:2528.09, XRP:0.568, BNB:309.09, SOL:102.07,
    DOGE:0.08053, TRX:0.1083, ADA:0.5278, SUI:1.292, AVAX:36.03 }
  const map: Record<string,string> = {
    'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43':'BTC',
    'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace':'ETH',
    'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d':'SOL',
    '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f':'BNB',
    'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8':'XRP',
    'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c':'DOGE',
    '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42ecd2829867a0d':'ADA',
    '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7':'AVAX',
    '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b':'TRX',
    '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744':'SUI',
  }
  const latest: Record<string, number> = {}
  for (const d of data) {
    const expo = d.price?.expo ?? d.price?.exponent ?? 0
    latest[String(d.id).replace(/^0x/,'').toLowerCase()] = Number(d.price?.price) * Math.pow(10, expo)
  }
  const ratios = Object.entries(map).map(([id, sym]) => {
    const p = latest[id] ?? 0
    const b = base[sym]
    return b ? p / b : 0
  })
  const idx = 100 * (ratios.reduce((a,b)=>a+b,0) / ratios.length)
  __INDEX_CACHE__ = { ts: now, value: idx }
  return idx
}

async function transferAxisToUser(userOwner: PublicKey, axisUiAmount: number, options?: { fast?: boolean }) {
  if (!connection) throw new Error('Solana connection not available')
  if (!TREASURY_OWNER) throw new Error('TREASURY_OWNER not available')
  if (!AXIS_MINT_2022) throw new Error('AXIS_MINT_2022 not available')
  const signer = loadTreasurySigner()
  const src = (await getOrCreateAssociatedTokenAccount(
    connection, signer, AXIS_MINT_2022, TREASURY_OWNER, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address
  const dst = (await getOrCreateAssociatedTokenAccount(
    connection, signer, AXIS_MINT_2022, userOwner, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address
  const amount = BigInt(Math.floor(axisUiAmount * 10 ** AXIS_DEC))
  const ix = createTransferCheckedInstruction(
    src, AXIS_MINT_2022, dst, signer.publicKey, amount, AXIS_DEC, [], TOKEN_2022_PROGRAM_ID
  )
  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
    ix
  )
  tx.feePayer = signer.publicKey
  if (options?.fast) {
    return await connection.sendTransaction(tx, [signer], { skipPreflight: true })
  }
  return await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'finalized' })
}

async function transferUsdcToUser(userOwner: PublicKey, usdcUiAmount: number, options?: { fast?: boolean }) {
  if (!connection) throw new Error('Solana connection not available')
  if (!TREASURY_USDC_ATA) throw new Error('TREASURY_USDC_ATA not available')
  if (!USDC_DEV_MINT) throw new Error('USDC_DEV_MINT not available')
  const signer = loadTreasurySigner()
  const src = TREASURY_USDC_ATA
  const dst = (await getOrCreateAssociatedTokenAccount(
    connection, signer, USDC_DEV_MINT, userOwner
  )).address
  const amount = BigInt(Math.floor(usdcUiAmount * 10 ** 6))
  const ix = createTransferCheckedInstruction(
    src, USDC_DEV_MINT, dst, signer.publicKey, amount, 6
  )
  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
    ix
  )
  tx.feePayer = signer.publicKey
  if (options?.fast) {
    return await connection.sendTransaction(tx, [signer], { skipPreflight: true })
  }
  return await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'finalized' })
}

export async function verifyUsdcDepositOnChain(signature: string): Promise<{ fromUser: PublicKey, uiAmount: number } | null> {
  if (!connection || !TREASURY_USDC_ATA || !USDC_DEV_MINT) return null
  const tx = await connection.getTransaction(signature, { commitment: 'finalized', maxSupportedTransactionVersion: 0 } as any)
  if (!tx?.meta) return null
  const keys = tx.transaction.message.getAccountKeys()
  const pre = tx.meta.preTokenBalances || []
  const post = tx.meta.postTokenBalances || []
  const findPubkeyByIndex = (idx: number) => { try { return keys.get(idx) as PublicKey } catch { return null } }
  const postTreasury = post.find(b => b.mint === USDC_DEV_MINT.toBase58() && findPubkeyByIndex(b.accountIndex)?.equals(TREASURY_USDC_ATA))
  if (!postTreasury) return null
  const preTreasury = pre.find(b => b.mint === USDC_DEV_MINT.toBase58() && b.accountIndex === postTreasury.accountIndex) || { uiTokenAmount: { uiAmount: 0 } as any }
  const postAmt = Number(postTreasury.uiTokenAmount?.uiAmount || 0)
  const preAmt  = Number((preTreasury as any)?.uiTokenAmount?.uiAmount || 0)
  const delta   = postAmt - preAmt
  if (!(delta > 0)) return null
  let senderEntry: { pb: any, change: number } | null = null
  for (const pb of post) {
    if (pb.mint !== USDC_DEV_MINT.toBase58()) continue
    const preb = pre.find(x => x.accountIndex === pb.accountIndex)
    const pAmt = Number(preb?.uiTokenAmount?.uiAmount || 0)
    const qAmt = Number(pb.uiTokenAmount?.uiAmount || 0)
    const change = qAmt - pAmt
    if (change < 0 && (!senderEntry || change < senderEntry.change)) {
      senderEntry = { pb, change }
    }
  }
  const senderEntryFinal = senderEntry
  if (!senderEntryFinal) return null
  // prefer owner from post balances to avoid extra RPC
  const ownerStr: string | undefined = senderEntryFinal.pb.owner
  if (!ownerStr) return null
  return { fromUser: new PublicKey(ownerStr), uiAmount: delta }
}

export async function verifyAxisDepositOnChain(signature: string): Promise<{ fromUser: PublicKey, uiAmount: number } | null> {
  if (!connection || !AXIS_MINT_2022 || !TREASURY_OWNER) return null
  const tx = await connection.getTransaction(signature, { commitment: 'finalized', maxSupportedTransactionVersion: 0 } as any)
  if (!tx?.meta) return null
  const keys = tx.transaction.message.getAccountKeys()
  const pre = tx.meta.preTokenBalances || []
  const post = tx.meta.postTokenBalances || []
  const findPubkeyByIndex = (idx: number) => { try { return keys.get(idx) as PublicKey } catch { return null } }
  const treasuryOwnerStr = TREASURY_OWNER!.toBase58()
  const postTreasuryAxis = post.find(b => b.mint === AXIS_MINT_2022.toBase58() && b.owner === treasuryOwnerStr)
  if (!postTreasuryAxis) return null
  const preTreasuryAxis = pre.find(b => b.mint === AXIS_MINT_2022.toBase58() && b.accountIndex === postTreasuryAxis.accountIndex) || { uiTokenAmount: { uiAmount: 0 } as any }
  const postAmt = Number(postTreasuryAxis.uiTokenAmount?.uiAmount || 0)
  const preAmt  = Number((preTreasuryAxis as any)?.uiTokenAmount?.uiAmount || 0)
  const delta   = postAmt - preAmt
  if (!(delta > 0)) return null
  let senderEntry: { pb: any, change: number } | null = null
  for (const pb of post) {
    if (pb.mint !== AXIS_MINT_2022.toBase58()) continue
    const preb = pre.find(x => x.accountIndex === pb.accountIndex)
    const pAmt = Number(preb?.uiTokenAmount?.uiAmount || 0)
    const qAmt = Number(pb.uiTokenAmount?.uiAmount || 0)
    const change = qAmt - pAmt
    if (change < 0 && (!senderEntry || change < senderEntry.change)) {
      senderEntry = { pb, change }
    }
  }
  const senderEntryFinal = senderEntry
  if (!senderEntryFinal) return null
  const fromOwner = senderEntryFinal.pb.owner
  if (!fromOwner) return null
  return { fromUser: new PublicKey(fromOwner), uiAmount: delta }
}

export async function processDepositSignature(signature: string) {
  L({ lvl:'info', step:'process.begin', signature })
  try {
    // Try USDC->mint path
    const verUSDC = await verifyUsdcDepositOnChain(signature)
    if (verUSDC) {
      const indexValue = await fetchIndexValue()
      const axisToSend = verUSDC.uiAmount / indexValue
      const sendSig = await transferAxisToUser(verUSDC.fromUser, axisToSend)
      markPaid(signature, { side:'mint', axisUi: axisToSend, indexValue, payoutSig: sendSig })
      return { side:'mint' as const, indexValue, payoutSig: sendSig, axisUi: axisToSend }
    }
    // Try AXIS->burn path
    const verAXIS = await verifyAxisDepositOnChain(signature)
    if (verAXIS) {
      const indexValue = await fetchIndexValue()
      const usdcToSend = verAXIS.uiAmount * indexValue
      const sendSig = await transferUsdcToUser(verAXIS.fromUser, usdcToSend)
      markPaid(signature, { side:'burn', usdcUi: usdcToSend, indexValue, payoutSig: sendSig })
      return { side:'burn' as const, indexValue, payoutSig: sendSig, usdcUi: usdcToSend }
    }
    throw new Error('Signature does not match mint or burn deposit')
  } catch (e:any) {
    L({ lvl:'error', step:'process.fail', signature, err: e?.message })
    markFailed(signature, e?.message || String(e))
    throw e
  }
}

export type DepositClassification =
  | { kind: 'mint', fromUser: PublicKey, uiAmount: number }
  | { kind: 'burn', fromUser: PublicKey, uiAmount: number }
  | null

export async function classifyDeposit(signature: string): Promise<DepositClassification> {
  const mint = await verifyUsdcDepositOnChain(signature)
  if (mint) return { kind: 'mint', fromUser: mint.fromUser, uiAmount: mint.uiAmount }
  const burn = await verifyAxisDepositOnChain(signature)
  if (burn) return { kind: 'burn', fromUser: burn.fromUser, uiAmount: burn.uiAmount }
  return null
}

export async function getPayoutPlan(signature: string): Promise<
  | { side: 'mint', axisUi: number, indexValue: number, fromUser: string }
  | { side: 'burn', usdcUi: number, indexValue: number, fromUser: string }
> {
  const cls = await classifyDeposit(signature)
  if (!cls) throw new Error('Signature does not match mint or burn deposit')
  const indexValue = await fetchIndexValue()
  if (cls.kind === 'mint') {
    const axisUi = cls.uiAmount / indexValue
    return { side: 'mint', axisUi, indexValue, fromUser: cls.fromUser.toBase58() }
  } else {
    const usdcUi = cls.uiAmount * indexValue
    return { side: 'burn', usdcUi, indexValue, fromUser: cls.fromUser.toBase58() }
  }
}

export async function payoutForSignature(signature: string, fast = true) {
  const cls = await classifyDeposit(signature)
  if (!cls) throw new Error('Signature does not match mint or burn deposit')
  const indexValue = await fetchIndexValue()
  if (cls.kind === 'mint') {
    const axisUi = cls.uiAmount / indexValue
    const sendSig = await transferAxisToUser(cls.fromUser, axisUi, { fast })
    markPaid(signature, { side:'mint', axisUi, indexValue, payoutSig: String(sendSig) })
    return { side:'mint' as const, payoutSig: String(sendSig), axisUi, indexValue }
  } else {
    const usdcUi = cls.uiAmount * indexValue
    const sendSig = await transferUsdcToUser(cls.fromUser, usdcUi, { fast })
    markPaid(signature, { side:'burn', usdcUi, indexValue, payoutSig: String(sendSig) })
    return { side:'burn' as const, payoutSig: String(sendSig), usdcUi, indexValue }
  }
}


