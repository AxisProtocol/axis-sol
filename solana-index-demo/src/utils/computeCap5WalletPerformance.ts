// utils/computeCap5WalletPerformance.ts
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const INDEX_TOKEN_MINT = new PublicKey(
  "6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1"
);

// === chart helpers ===
const pickClose = (row: (string | number)[]) => Number(row[2]);
const pickTsMs = (row: (string | number)[]) =>
  typeof row[0] === "string" ? Date.parse(row[0]) : (row[0] as number);

/**
 * 未来のバーは除外しつつ、指定時刻に最も近い価格を返す
 */
function nearestPrice(
  e: (string | number)[][],
  whenMs: number
): number | null {
  if (!e?.length) return null;
  let bi = -1;
  let bd = 1e99;

  for (let i = 0; i < e.length; i++) {
    const t = pickTsMs(e[i]);
    if (t > whenMs) continue; // 未来は無視
    const d = Math.abs(t - whenMs);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi >= 0 ? pickClose(e[bi]) : null;
}

export interface WalletPerformance {
  holdings: number; // 現在の保有枚数
  currentPrice: number;
  currentValue: number;

  totalDeposited: number; // これまで投入した合計(USD)
  realizedPayout: number; // これまで回収した合計(USD)

  totalPL: number; // 損益(USD)
  plPercent: number; // 損益(%)

  buyCount: number;
  sellCount: number;

  firstBuyDate: string | null;
  lastTxDate: string | null;
}

interface ComputeParams {
  connection: Connection;
  owner: PublicKey;
  echartsData: (string | number)[][];
  currentPrice: number;
}

const MAX_SIGS = 300;
const MAX_TX_DETAILS = 40;

export async function computeCap5WalletPerformance(
  params: ComputeParams
): Promise<WalletPerformance> {
  const { connection, owner, echartsData, currentPrice } = params;

  if (!echartsData?.length) {
    throw new Error("Price series not available");
  }
  if (!currentPrice || !isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error("Invalid currentPrice");
  }

  // Mint check
  await getMint(connection, INDEX_TOKEN_MINT, "confirmed", TOKEN_2022_PROGRAM_ID);

  const ata = getAssociatedTokenAddressSync(
    INDEX_TOKEN_MINT,
    owner,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // 現在残高
  const balInfo = await connection
    .getTokenAccountBalance(ata, "confirmed")
    .catch(() => null);
  const holdings = balInfo?.value?.uiAmount ?? 0;

  let totalDeposited = 0;
  let realizedPayout = 0;
  let buyCount = 0;
  let sellCount = 0;
  let firstBuyMs: number | null = null;
  let lastTxMs: number | null = null;

  const signatures = await connection.getSignaturesForAddress(
    ata,
    { limit: MAX_SIGS },
    "confirmed"
  );

  const sigsToCheck = signatures.slice(
    0,
    Math.min(MAX_TX_DETAILS, signatures.length)
  );

  for (const sigInfo of sigsToCheck) {
    try {
      const tx = await connection.getParsedTransaction(sigInfo.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

      if (!tx || !tx.meta || tx.meta.err) continue;

      const blockTime = tx.blockTime;
      if (!blockTime) continue;

      const txMs = blockTime * 1000;

      const preBalances = tx.meta.preTokenBalances ?? [];
      const postBalances = tx.meta.postTokenBalances ?? [];

      const preBal = preBalances.find(
        (b) =>
          b.owner === owner.toBase58() &&
          b.mint === INDEX_TOKEN_MINT.toBase58()
      );
      const postBal = postBalances.find(
        (b) =>
          b.owner === owner.toBase58() &&
          b.mint === INDEX_TOKEN_MINT.toBase58()
      );

      const preAmount = preBal?.uiTokenAmount.uiAmount ?? 0;
      const postAmount = postBal?.uiTokenAmount.uiAmount ?? 0;
      const delta = postAmount - preAmount;

      if (delta === 0) continue;

      const priceAtTx = nearestPrice(echartsData, txMs);
      if (!priceAtTx || priceAtTx <= 0) continue;

      if (delta > 0) {
        // Buy / Mint → 投入額
        totalDeposited += delta * priceAtTx;
        buyCount++;
        if (firstBuyMs == null || txMs < firstBuyMs) firstBuyMs = txMs;
      } else {
        // Sell / Burn → 回収額
        const sold = -delta;
        realizedPayout += sold * priceAtTx;
        sellCount++;
      }

      if (lastTxMs == null || txMs > lastTxMs) lastTxMs = txMs;
    } catch (e: any) {
      if (String(e?.message || "").includes("429")) {
        console.warn("[computeCap5WalletPerformance] RPC 429, stop scanning.");
        break;
      }
      console.warn("[computeCap5WalletPerformance] TX parse error, skip:", e);
    }
  }

  const currentValue = holdings * currentPrice;
  const totalPL = realizedPayout + currentValue - totalDeposited;
  const plPercent =
    totalDeposited > 0 ? (totalPL / totalDeposited) * 100 : 0;

  const toDate = (ms: number | null) =>
    ms ? new Date(ms).toISOString().slice(0, 10) : null;

  return {
    holdings,
    currentPrice,
    currentValue,
    totalDeposited,
    realizedPayout,
    totalPL,
    plPercent,
    buyCount,
    sellCount,
    firstBuyDate: toDate(firstBuyMs),
    lastTxDate: toDate(lastTxMs),
  };
}
