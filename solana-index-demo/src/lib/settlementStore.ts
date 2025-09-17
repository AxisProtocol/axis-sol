// /src/lib/settlementStore.ts
export type SettlementPhase = 'pending' | 'paid' | 'failed'
export type SettlementSide  = 'mint' | 'burn'

export interface SettlementRecord {
  side: SettlementSide
  phase: SettlementPhase
  depositSig: string            // ユーザーが送った入金Tx
  memoId?: string
  usdcUi?: number
  axisUi?: number
  indexValue?: number
  payoutSig?: string            // サーバからの払い出しTx
  error?: string
  createdAt: number
  updatedAt: number
}

type Store = Map<string, SettlementRecord> // key = depositSig

const g = globalThis as any
if (!g.__AXIS_SETTLEMENT_STORE__) g.__AXIS_SETTLEMENT_STORE__ = new Map<string, SettlementRecord>()
const store: Store = g.__AXIS_SETTLEMENT_STORE__

export const putPending = (key: string, init: Omit<SettlementRecord, 'phase'|'createdAt'|'updatedAt'>) => {
  const rec: SettlementRecord = { ...init, phase: 'pending', createdAt: Date.now(), updatedAt: Date.now() }
  store.set(key, rec)
  console.log(`[SettlementStore] Created pending record for ${key}:`, rec)
  return rec
}

export const markPaid = (key: string, patch: Partial<SettlementRecord>) => {
  const cur = store.get(key); if (!cur) return
  Object.assign(cur, patch, { phase: 'paid', updatedAt: Date.now() })
  console.log(`[SettlementStore] Marked ${key} as paid:`, cur)
}

export const markFailed = (key: string, err: string, patch?: Partial<SettlementRecord>) => {
  const cur = store.get(key) || { side: 'mint' as SettlementSide, depositSig: key, createdAt: Date.now(), updatedAt: Date.now() } as SettlementRecord
  Object.assign(cur, patch, { phase: 'failed', error: err, updatedAt: Date.now() })
  store.set(key, cur)
  console.log(`[SettlementStore] Marked ${key} as failed:`, cur)
}

export const getOne = (key: string) => {
  const record = store.get(key) || null
  console.log(`[SettlementStore] Getting record for ${key}:`, record)
  return record
}

// Helper function for testing - creates a test settlement record
export const createTestRecord = (key: string, phase: SettlementPhase = 'pending') => {
  const testRecord: SettlementRecord = {
    side: 'mint',
    phase,
    depositSig: key,
    memoId: `test-memo-${key.slice(0, 8)}`,
    usdcUi: 1000,
    axisUi: 100,
    indexValue: 10.5,
    payoutSig: phase === 'paid' ? `test-payout-${key.slice(0, 8)}` : undefined,
    error: phase === 'failed' ? 'Test error for debugging' : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  store.set(key, testRecord)
  console.log(`[SettlementStore] Created test record for ${key}:`, testRecord)
  return testRecord
}

// Debug function to see all records
export const getAllRecords = () => {
  const records = Array.from(store.entries())
  console.log(`[SettlementStore] All records:`, records)
  return records
}
