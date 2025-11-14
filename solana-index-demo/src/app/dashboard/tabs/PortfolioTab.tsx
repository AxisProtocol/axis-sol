// app/dashboard/tabs/PortfolioTab.tsx
"use client";

import { useEffect, useState, startTransition } from "react";
import Image from "next/image";
import { ModernCard } from "../../../components/common";
import {
  Briefcase,
  ClipboardList,
  BarChart3,
  Coins,
  Flame,
  RefreshCcw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// === Solana / Wallet ===
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

// === Live index price ===
import { useIndexPrice } from "../../../hooks/useIndexPrice";

// ====== Config ======
const DEBUG = false;
const CONCURRENCY = 6;
const SIG_LIMIT_STEP = 20;
const SIG_LIMIT_MAX = 50;

// ====== Utils ======
const dlog = (...a: any[]) => DEBUG && console.log("[PortfolioTab]", ...a);
const pct = (cur: number, base: number) =>
  !base ? 0 : ((cur - base) / base) * 100;

const pickClose = (row: (string | number)[]) => Number(row[2]);
const pickTsMs = (row: (string | number)[]) =>
  typeof row[0] === "string" ? Date.parse(row[0]) : (row[0] as number);

function nearestPrice(e: (string | number)[][], whenMs: number) {
  if (!e?.length) return null;
  let bi = -1,
    bd = 1e99;
  for (let i = 0; i < e.length; i++) {
    const t = pickTsMs(e[i]);
    const d = Math.abs(t - whenMs);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi >= 0 ? pickClose(e[bi]) : null;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (it: T, i: number) => Promise<R>
): Promise<R[]> {
  const ret: R[] = new Array(items.length) as any;
  let i = 0;
  const runners: Promise<void>[] = [];
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await worker(items[idx], idx);
    }
  };
  for (let k = 0; k < Math.min(limit, items.length); k++) runners.push(run());
  await Promise.all(runners);
  return ret;
}

// ====== Types ======
interface TokenRow {
  symbol: string;
  name: string;
  currentPrice: number;
  mintPrice: number;
  change1d: number;
  change30d: number;
  history: string;
  imageUrl: string;
  balance: number;
}
interface PortfolioData {
  totalValue: number;
  totalChange: number;
  tokens: TokenRow[];
  indexSinceLaunch: number; // Index performance since launch
  indexSinceEntry: number; // Index performance since user's first buy
}

interface Props {
  initialLatestEntry: any;
  echartsData: (string | number)[][] | null;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

// ====== Constants ======
const INDEX_TOKEN_MINT = new PublicKey(
  "6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1"
);
const BASE_PRICE = 100; // Launch base price

// ====== Component ======
export default function PortfolioTab({ echartsData }: Props) {
  const { connection: ctxConnection } = useConnection();
  const wallet = useWallet();
  const { data: indexPriceData } = useIndexPrice();

  const connected = !!wallet.publicKey;

  const seriesClose = echartsData?.length ? pickClose(echartsData.at(-1)!) : 100;
  const currentPrice =
    typeof indexPriceData?.normalizedPrice === "number"
      ? indexPriceData.normalizedPrice
      : seriesClose;

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [instantValue, setInstantValue] = useState<number | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMounted, loading]);

  // ====== メイン集計 ======
  useEffect(() => {
    if (!connected) {
      setPortfolio(null);
      setInstantValue(null);
      setErr(null);
      setLoading(false);
      return;
    }
    if (!echartsData?.length) {
      setErr("Price series not available");
      setLoading(false);
      return;
    }

    let aborted = false;
    const abort = () => {
      aborted = true;
    };

    (async () => {
      try {
        setErr(null);

        const connection: Connection =
          ctxConnection ??
          new Connection("https://api.devnet.solana.com", "confirmed");

        await getMint(
          connection,
          INDEX_TOKEN_MINT,
          "confirmed",
          TOKEN_2022_PROGRAM_ID
        );

        const owner = wallet.publicKey!;
        const ata = getAssociatedTokenAddressSync(
          INDEX_TOKEN_MINT,
          owner,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        const balInfo = await connection
          .getTokenAccountBalance(ata, "confirmed")
          .catch(() => null);
        const uiAmount = balInfo?.value?.uiAmount ?? 0;

        setInstantValue(uiAmount * currentPrice);

        const cacheKey = `axis:cap5:avgcost:${owner.toBase58()}:${ata.toBase58()}`;
        const cached = (() => {
          try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return null;
            const v = JSON.parse(raw);
            if (
              Math.abs((v.balance ?? -1) - uiAmount) < 1e-12 &&
              Date.now() - (v.ts ?? 0) < 30 * 60 * 1000
            )
              return v;
          } catch {}
          return null;
        })();

        if (cached && !aborted) {
          const avgCost = cached.avgCost as number;
          const firstBuyMs = cached.firstBuyMs as number | null;

          const endMs = pickTsMs(echartsData.at(-1)!);
          const daysAgo = (d: number) => {
            const p =
              nearestPrice(echartsData, endMs - d * 86400000) ?? currentPrice;
            return pct(currentPrice, p);
          };

          // Index performance calculations
          const indexSinceLaunch = pct(currentPrice, BASE_PRICE);
          const entryPrice = firstBuyMs
            ? nearestPrice(echartsData, firstBuyMs) ?? avgCost
            : avgCost;
          const indexSinceEntry = pct(currentPrice, entryPrice);

          const token: TokenRow = {
            symbol: "CaP5",
            name: "AXIS Index Token",
            currentPrice,
            mintPrice: avgCost,
            change1d: daysAgo(1),
            change30d: daysAgo(30),
            history: firstBuyMs
              ? new Date(firstBuyMs).toISOString().slice(0, 10)
              : "-",
            imageUrl: "/cap5.png",
            balance: uiAmount,
          };

          const totalValue = uiAmount * currentPrice;
          const totalChange = pct(currentPrice, avgCost);

          setPortfolio({
            totalValue,
            totalChange,
            tokens: [token],
            indexSinceLaunch,
            indexSinceEntry,
          });
          return;
        }

        // tx 署名の段階取得
        const fetchAndCompute = async (limit: number) => {
          const sigs = await connection.getSignaturesForAddress(ata, { limit });
          if (!sigs.length) return { avgCost: currentPrice, firstBuyMs: null };

          let bought = 0;
          let cost = 0;
          let firstBuy: number | null = null;

          const candidates = sigs.filter((s) => !/BURN/i.test(String(s.memo)));

          await mapPool(candidates, CONCURRENCY, async (s) => {
            if (aborted) return;
            if (bought >= uiAmount && uiAmount > 0) return;

            const tx = await connection.getTransaction(s.signature, {
              maxSupportedTransactionVersion: 0,
            });
            if (!tx) return;

            const pre = tx.meta?.preTokenBalances ?? [];
            const post = tx.meta?.postTokenBalances ?? [];
            const before = pre.find(
              (b) =>
                b.mint === INDEX_TOKEN_MINT.toBase58() &&
                b.owner === owner.toBase58()
            );
            const after = post.find(
              (b) =>
                b.mint === INDEX_TOKEN_MINT.toBase58() &&
                b.owner === owner.toBase58()
            );

            const preUi = before?.uiTokenAmount?.uiAmount ?? 0;
            const postUi = after?.uiTokenAmount?.uiAmount ?? 0;
            const diff = postUi - preUi;
            if (diff <= 1e-12) return;

            const whenMs =
              (tx.blockTime ?? Math.floor(Date.now() / 1000)) * 1000;
            const px = nearestPrice(echartsData!, whenMs) ?? currentPrice;

            bought += diff;
            cost += diff * px;
            if (firstBuy == null || whenMs < firstBuy) firstBuy = whenMs;
          });

          const avgCost =
            bought > 0 && cost > 0 ? cost / bought : currentPrice;

          return { avgCost, firstBuyMs: firstBuy };
        };

        let result = await fetchAndCompute(SIG_LIMIT_STEP);
        if (!aborted) {
          const sampledEnough =
            (result?.avgCost ?? 0) !== currentPrice || uiAmount === 0;
          if (!sampledEnough) {
            result = await fetchAndCompute(SIG_LIMIT_MAX);
          }
        }
        if (!result) result = { avgCost: currentPrice, firstBuyMs: null };

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              ts: Date.now(),
              balance: uiAmount,
              avgCost: result.avgCost,
              firstBuyMs: result.firstBuyMs,
            })
          );
        } catch {}

        if (aborted) return;

        const endMs = pickTsMs(echartsData.at(-1)!);
        const daysAgo = (d: number) => {
          const p =
            nearestPrice(echartsData, endMs - d * 86400000) ?? currentPrice;
          return pct(currentPrice, p);
        };

        // Index performance calculations
        const indexSinceLaunch = pct(currentPrice, BASE_PRICE);
        const entryPrice = result.firstBuyMs
          ? nearestPrice(echartsData, result.firstBuyMs) ?? result.avgCost
          : result.avgCost;
        const indexSinceEntry = pct(currentPrice, entryPrice);

        const token: TokenRow = {
          symbol: "CaP5",
          name: "AXIS Index Token",
          currentPrice,
          mintPrice: result.avgCost,
          change1d: daysAgo(1),
          change30d: daysAgo(30),
          history: result.firstBuyMs
            ? new Date(result.firstBuyMs).toISOString().slice(0, 10)
            : "-",
          imageUrl: "/cap5.png",
          balance: uiAmount,
        };

        const totalValue = uiAmount * currentPrice;
        const totalChange = pct(currentPrice, result.avgCost);

        startTransition(() => {
          setPortfolio({
            totalValue,
            totalChange,
            tokens: [token],
            indexSinceLaunch,
            indexSinceEntry,
          });
        });
      } catch (e: any) {
        dlog("ERROR", e?.message ?? e);
        setErr(e?.message ?? "Failed to load portfolio");
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    })();

    return abort;
  }, [
    connected,
    wallet.publicKey,
    ctxConnection,
    echartsData,
    indexPriceData?.normalizedPrice,
    currentPrice,
  ]);

  // ====== UI ======
  const BackgroundLayer = () => (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: "url('/portfolio.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.15,
      }}
    />
  );

  const commonWrapperClasses = `
    pt-16 relative min-h-screen
    transition-opacity duration-500 ease-in-out
    ${showContent ? "opacity-100" : "opacity-0"}
  `;

  return (
    <div
      className={commonWrapperClasses}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <BackgroundLayer />

      <div className="relative z-10 space-y-5">
        {/* Devnet Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-500">Devnet Mode:</span>{" "}
            <span className="text-base-content/80">
              You are using test tokens with no real value. All transactions are simulated.
            </span>
          </div>
        </div>

        {!connected && (
          <ModernCard className="p-6">
            <div className="text-base-content/80 text-center mb-4">
              Connect your wallet to view your AXIS portfolio
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-base-200/40 animate-pulse"
                />
              ))}
            </div>
          </ModernCard>
        )}

        {connected && loading && (
          <>
            <ModernCard className="p-4" gradient>
              <h2 className="text-xl font-bold text-base-content mb-2 text-center flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>Your Position</span>
              </h2>
              <div className="grid grid-cols-2 text-center gap-4">
                <div>
                  <div className="text-3xl font-bold">
                    ${instantValue?.toFixed(2) ?? "0.00"}
                  </div>
                  <div className="text-base-content/60 text-sm">
                    Current Value
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">…</div>
                  <div className="text-base-content/60 text-sm">
                    Your Return
                  </div>
                </div>
              </div>
            </ModernCard>
            <ModernCard className="p-4">
              <div className="h-32 bg-base-200/40 rounded animate-pulse" />
            </ModernCard>
          </>
        )}

        {connected && !loading && (err || !portfolio) && (
          <div className="text-center py-16">
            <Briefcase className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-base-content mb-3">
              Portfolio unavailable
            </h3>
            <p className="text-base-content/70 text-lg">
              {err ?? "No portfolio data found."}
            </p>
          </div>
        )}

        {connected && !loading && portfolio && (
          <>
            {/* Overview */}
            <ModernCard className="p-4" gradient>
              <h2 className="text-xl font-bold text-base-content mb-4 text-center flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>Your Position</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-3xl font-bold">
                    ${portfolio.totalValue.toFixed(2)}
                  </div>
                  <div className="text-base-content/70 text-sm">
                    Current Value
                  </div>
                </div>
                <div>
                  <div
                    className={`text-3xl font-bold ${
                      portfolio.totalChange >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {portfolio.totalChange >= 0 ? "+" : ""}
                    {portfolio.totalChange.toFixed(2)}%
                  </div>
                  <div className="text-base-content/70 text-sm">
                    Your Return (P&L)
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div className="grid grid-cols-2 gap-3 text-sm border-t border-base-300/50 pt-3 mt-3">
                <div>
                  <div className="text-base-content/60">Holdings</div>
                  <div className="font-semibold">{portfolio.tokens[0].balance.toFixed(6)} CaP5</div>
                </div>
                <div>
                  <div className="text-base-content/60">Avg Buy Price</div>
                  <div className="font-semibold">${portfolio.tokens[0].mintPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-base-content/60">Current Price</div>
                  <div className="font-semibold">${portfolio.tokens[0].currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-base-content/60">Breakeven Price</div>
                  <div className="font-semibold">${portfolio.tokens[0].mintPrice.toFixed(2)}</div>
                </div>
              </div>
            </ModernCard>

            {/* Performance Comparison */}
            <ModernCard className="p-4">
              <h3 className="text-xl font-bold text-base-content mb-4 text-center flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Performance Comparison</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-base-200/20 rounded">
                  <span className="text-base-content/70">Your Return</span>
                  <span className={`font-bold text-lg ${portfolio.totalChange >= 0 ? "text-success" : "text-error"}`}>
                    {portfolio.totalChange >= 0 ? "+" : ""}{portfolio.totalChange.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-base-200/20 rounded">
                  <span className="text-base-content/70">Index (Since Your Entry)</span>
                  <span className={`font-bold text-lg ${portfolio.indexSinceEntry >= 0 ? "text-success" : "text-error"}`}>
                    {portfolio.indexSinceEntry >= 0 ? "+" : ""}{portfolio.indexSinceEntry.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-base-200/20 rounded">
                  <span className="text-base-content/70">Index (Since Launch)</span>
                  <span className={`font-bold text-lg ${portfolio.indexSinceLaunch >= 0 ? "text-success" : "text-error"}`}>
                    {portfolio.indexSinceLaunch >= 0 ? "+" : ""}{portfolio.indexSinceLaunch.toFixed(2)}%
                  </span>
                </div>
              </div>

              {portfolio.totalChange < portfolio.indexSinceLaunch && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-base-content/80">
                      Your entry was at <strong>${portfolio.tokens[0].mintPrice.toFixed(2)}</strong> when 
                      the index was near its peak. The index has since corrected {portfolio.indexSinceEntry.toFixed(2)}% 
                      from that level, but only {portfolio.indexSinceLaunch.toFixed(2)}% from the launch base of $100.
                    </div>
                  </div>
                </div>
              )}
            </ModernCard>

            {/* Token Details */}
            <ModernCard className="p-4">
              <h3 className="text-xl font-bold text-base-content mb-4 text-center flex items-center justify-center gap-2">
                <ClipboardList className="w-5 h-5" />
                <span>Token Details</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b border-base-300/70">
                      <th className="text-left py-2 px-3 text-base-content/70">
                        Token
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        Balance
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        Avg Cost
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        Current
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        P&L
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        1d
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        30d
                      </th>
                      <th className="text-right py-2 px-3 text-base-content/70">
                        First Buy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.tokens.map((t) => {
                      const pnl = pct(t.currentPrice, t.mintPrice);
                      return (
                        <tr
                          key={t.symbol}
                          className="border-b border-base-300/50 hover:bg-base-200/20"
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 relative shrink-0">
                                <Image
                                  src={t.imageUrl}
                                  alt={t.symbol}
                                  fill
                                  className="object-contain rounded-full"
                                  sizes="40px"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-base-content text-xs">
                                  {t.symbol}
                                </div>
                                <div className="text-base-content/60 text-[11px]">
                                  {t.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-2 px-3 text-base-content text-xs">
                            {t.balance.toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </td>
                          <td className="text-right py-2 px-3 text-base-content text-xs">
                            ${t.mintPrice.toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-3 text-base-content text-xs">
                            ${t.currentPrice.toFixed(2)}
                          </td>
                          <td
                            className={`text-right py-2 px-3 text-xs ${
                              pnl >= 0 ? "text-success" : "text-error"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {pnl.toFixed(2)}%
                          </td>
                          <td
                            className={`text-right py-2 px-3 text-xs ${
                              t.change1d >= 0 ? "text-success" : "text-error"
                            }`}
                          >
                            {t.change1d >= 0 ? "+" : ""}
                            {t.change1d.toFixed(2)}%
                          </td>
                          <td
                            className={`text-right py-2 px-3 text-xs ${
                              t.change30d >= 0 ? "text-success" : "text-error"
                            }`}
                          >
                            {t.change30d >= 0 ? "+" : ""}
                            {t.change30d.toFixed(2)}%
                          </td>
                          <td className="text-right py-2 px-3 text-base-content text-xs">
                            {t.history}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ModernCard>

            {/* Status */}
            <ModernCard className="p-4">
              <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>Portfolio Status</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-base-200/30 rounded border border-base-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      <span className="text-sm font-semibold text-base-content">
                        Mint
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-base-content/70">Available on Devnet</div>
                </div>
                <div className="p-3 bg-base-200/30 rounded border border-base-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-base-content">
                        Burn
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                      Available
                    </span>
                  </div>
                  <div className="text-xs text-base-content/70">Redeem anytime</div>
                </div>
                <div className="p-3 bg-base-200/30 rounded border border-base-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4" />
                      <span className="text-sm font-semibold text-base-content">
                        Rebalancing
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                      Daily
                    </span>
                  </div>
                  <div className="text-xs text-base-content/70">Automated via JitoBAM</div>
                </div>
              </div>
            </ModernCard>
          </>
        )}
      </div>
    </div>
  );
}
