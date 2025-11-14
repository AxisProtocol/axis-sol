// app/dashboard/tabs/DashboardTab.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ModernCard,
  getCoinIcon,
} from "../../../components/common";
import Image from "next/image";
import {
  Coins,
  RefreshCcw,
  TrendingUp,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";
import { useIndexPrice } from "../../../hooks/useIndexPrice";
import { motion } from "framer-motion";

const IndexValueCard = dynamic(
  () => import("../../../components/dashboard/IndexValueCard"),
  { ssr: false }
);
const TVChart = dynamic(() => import("../../../components/charts/TVChart"), {
  ssr: false,
});
const RightTradePanel = dynamic(
  () => import("../../../components/dashboard/RightTradePanel"),
  { ssr: false }
);

interface DashboardTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

// Updated with real-time market data (as per pitch: inverse-volatility, liquidity-adjusted weights)
const ASSETS = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    weight: 28.5, // Inverse-volatility weighted
    targetWeight: 28.5,
    price: 115961.47,
    mcap: 2309e9,
    vol: 29.8e9,
    change24h: -0.02,
    color: "#F7931A",
    volatility: 42.3, // Annualized %
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    weight: 25.2,
    targetWeight: 25.0,
    price: 4667.43,
    mcap: 563.2e9,
    vol: 30.3e9,
    change24h: -0.85,
    color: "#627EEA",
    volatility: 48.7,
  },
  {
    name: "Solana",
    symbol: "SOL",
    weight: 22.1,
    targetWeight: 22.0,
    price: 242.67,
    mcap: 131.6e9,
    vol: 7.5e9,
    change24h: +0.12,
    color: "#14F195",
    volatility: 65.4,
  },
  {
    name: "XRP",
    symbol: "XRP",
    weight: 15.2,
    targetWeight: 15.0,
    price: 3.12,
    mcap: 186.1e9,
    vol: 4.9e9,
    change24h: +0.58,
    color: "#00AAE4",
    volatility: 52.1,
  },
  {
    name: "BNB",
    symbol: "BNB",
    weight: 9.0,
    targetWeight: 9.5,
    price: 933.90,
    mcap: 129.9e9,
    vol: 1.6e9,
    change24h: +0.64,
    color: "#F3BA2F",
    volatility: 55.8,
  },
];

const DashboardTab = ({
  initialLatestEntry,
  echartsData,
  initialDailyChange,
}: DashboardTabProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { data: indexPriceData, loading: priceLoading } = useIndexPrice();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !priceLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMounted, priceLoading]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString()}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  const displayedIdx = indexPriceData?.normalizedPrice ?? null;

  const ringBackground = (colors: string[]) =>
    `conic-gradient(${colors
      .map((c, i) => `${c} ${i * 20}% ${(i + 1) * 20}%`)
      .join(",")})`;

  // Calculate index-level metrics
  const BASE_PRICE = 100;
  const indexSinceLaunch = displayedIdx ? ((displayedIdx - BASE_PRICE) / BASE_PRICE) * 100 : 0;
  
  // Simulated benchmark (equal-weighted average of constituents)
  const benchmarkReturn = ASSETS.reduce((sum, a) => sum + a.change24h, 0) / ASSETS.length;
  const alpha24h = (initialDailyChange ?? 0) - benchmarkReturn;

  // Risk metrics (simulated for demo)
  const indexVolatility = 28.5; // Lower than avg constituent vol
  const marketAvgVolatility = ASSETS.reduce((sum, a) => sum + a.volatility, 0) / ASSETS.length;
  const maxDrawdown = -15.2; // Example
  const marketAvgMaxDD = -18.7;

  return (
    <>
      {/* Background layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/indexBuy.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.65,
        }}
      />

      <style jsx global>{`
        :root {
          --wallet-adapter-font-family: var(--font-serif);
        }
        .wallet-adapter-button,
        .wallet-adapter-modal,
        .wallet-adapter-modal * {
          font-family: var(--font-serif) !important;
        }
      `}</style>

      <div
        className={`
          relative z-10
          w-full min-h-screen flex flex-col lg:flex-row gap-5 px-4 lg:px-8 mx-auto max-w-none
          transition-opacity duration-500 ease-in-out
          ${showContent ? "opacity-100" : "opacity-0"}
        `}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {!initialLatestEntry || !echartsData?.length ? (
          <div
            className="text-center py-8 w-full"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <p className="text-base-content/60 text-lg">No data available</p>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN */}
            <div className="contents lg:block lg:flex-1 lg:min-w-0">
              {/* Devnet Warning */}
              <div className="order-0 lg:order-none mt-20 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-amber-500">Devnet Mode:</span>{" "}
                  <span className="text-base-content/80">
                    Displaying simulated data. No real transactions or value.
                  </span>
                </div>
              </div>

              {/* Chart */}
              <ModernCard className="order-1 lg:order-none p-5 sm:p-4 h-[calc(100vh-200px)] mb-4 lg:mb-0">
                <TVChart
                  initialSymbol="INDEX:FAMC"
                  initialResolution="60"
                  initialBars={1000}
                />
              </ModernCard>

              {/* Index Performance Card */}
              <ModernCard className="order-2 lg:order-none p-4 mb-4">
                <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Index Performance vs Benchmark</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-base-200/30 rounded">
                    <div className="text-xs text-base-content/60 mb-1">Since Launch</div>
                    <div className={`text-2xl font-bold ${indexSinceLaunch >= 0 ? "text-success" : "text-error"}`}>
                      {indexSinceLaunch >= 0 ? "+" : ""}{indexSinceLaunch.toFixed(2)}%
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      Base: $100.00
                    </div>
                  </div>

                  <div className="p-3 bg-base-200/30 rounded">
                    <div className="text-xs text-base-content/60 mb-1">24h Change</div>
                    <div className={`text-2xl font-bold ${(initialDailyChange ?? 0) >= 0 ? "text-success" : "text-error"}`}>
                      {(initialDailyChange ?? 0) >= 0 ? "+" : ""}{(initialDailyChange ?? 0).toFixed(2)}%
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      Market Avg: {benchmarkReturn >= 0 ? "+" : ""}{benchmarkReturn.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-3 bg-base-200/30 rounded">
                    <div className="text-xs text-base-content/60 mb-1">24h Alpha</div>
                    <div className={`text-2xl font-bold ${alpha24h >= 0 ? "text-success" : "text-error"}`}>
                      {alpha24h >= 0 ? "+" : ""}{alpha24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      Outperformance
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-base-content/80">
                      <strong>Alpha:</strong> Index return minus equal-weighted average of constituents. 
                      Positive alpha demonstrates the effectiveness of inverse-volatility weighting.
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Risk Metrics Card */}
              <ModernCard className="order-3 lg:order-none p-4 mb-4">
                <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Risk Metrics (30-day)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-base-200/30 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-base-content/70">Volatility (Ann.)</span>
                      <span className="text-lg font-bold text-success">{indexVolatility.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-base-content/60">
                      Market Avg: {marketAvgVolatility.toFixed(1)}% 
                      <span className="text-success ml-1">
                        ({((marketAvgVolatility - indexVolatility) / marketAvgVolatility * 100).toFixed(0)}% lower)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-base-200/30 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-base-content/70">Max Drawdown</span>
                      <span className="text-lg font-bold text-success">{maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-base-content/60">
                      Market Avg: {marketAvgMaxDD.toFixed(1)}%
                      <span className="text-success ml-1">
                        ({Math.abs(((marketAvgMaxDD - maxDrawdown) / marketAvgMaxDD * 100)).toFixed(0)}% lower)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-base-content/80">
                      <strong>Lower Risk:</strong> AXIS CaP5's inverse-volatility weighting reduces 
                      portfolio volatility and drawdowns while maintaining market exposure.
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Constituents Table */}
              <ModernCard className="order-4 lg:order-none p-4">
                <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>Index Constituents</span>
                </h3>

                {/* Composition Ring */}
                <div className="my-6">
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className="relative w-44 h-44 md:w-52 md:h-52 rounded-full"
                      style={{
                        background: ringBackground(ASSETS.map((a) => a.color)),
                      }}
                    >
                      <div className="absolute inset-3 bg-[#0B1020] rounded-full flex items-center justify-center text-gray-300">
                        <div className="text-center">
                          <div className="text-3xl font-bold">5</div>
                          <div className="text-sm opacity-70">Assets</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Rebalancing Info */}
                <div className="mb-4 p-3 bg-base-200/30 rounded border border-base-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Next Rebalance</span>
                  </div>
                  <span className="text-sm text-base-content/70">Daily at 00:00 UTC</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-base-300">
                        <th className="text-left py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                          Asset
                        </th>
                        <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                          Target %
                        </th>
                        <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                          Current %
                        </th>
                        <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                          Price
                        </th>
                        <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                          24h
                        </th>
                        <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium hidden lg:table-cell">
                          Market Cap
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASSETS.map((asset) => (
                        <tr
                          key={asset.symbol}
                          className="border-b border-base-300 hover:bg-base-200/30"
                        >
                          <td className="py-2 px-2 sm:px-3">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 relative flex-shrink-0">
                                <Image
                                  src={getCoinIcon(asset.symbol)}
                                  alt={asset.symbol}
                                  fill
                                  className="object-contain"
                                  sizes="24px"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-base-content text-xs sm:text-sm truncate">
                                  {asset.symbol}
                                </div>
                                <div className="text-base-content/60 text-xs truncate hidden sm:block">
                                  {asset.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-2 px-2 sm:px-3 text-base-content font-medium text-xs">
                            {asset.targetWeight.toFixed(1)}%
                          </td>
                          <td className="text-right py-2 px-2 sm:px-3 text-xs">
                            <span className={`font-medium ${
                              Math.abs(asset.weight - asset.targetWeight) > 2 
                                ? "text-amber-400" 
                                : "text-base-content"
                            }`}>
                              {asset.weight.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-2 px-2 sm:px-3 text-base-content font-medium text-xs">
                            {formatPrice(asset.price)}
                          </td>
                          <td
                            className={`text-right py-2 px-2 sm:px-3 font-medium text-xs ${
                              asset.change24h >= 0
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {asset.change24h >= 0 ? "+" : ""}
                            {asset.change24h.toFixed(2)}%
                          </td>
                          <td className="text-right py-2 px-2 sm:px-3 text-base-content text-xs hidden lg:table-cell">
                            {formatLargeNumber(asset.mcap)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-base-content/80">
                      <strong>Smart Weighting:</strong> Weights are dynamically calculated using 
                      inverse-volatility and liquidity-adjusted market cap to reduce concentration risk.
                      Rebalances occur daily when drift exceeds ±2% threshold.
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* RIGHT COLUMN */}
            <div className="order-2 lg:order-none w-full lg:w-[420px] xl:w-[480px] shrink-0 lg:sticky lg:top-20 self-start flex flex-col gap-1">
              <div className="flex justify-center mt-8">
                {priceLoading || displayedIdx === null ? (
                  <div className="flex items-center justify-center h-24">
                    <span className="loading loading-spinner loading-lg text-blue-500"></span>
                  </div>
                ) : (
                  <IndexValueCard
                    indexValue={displayedIdx}
                    dailyChange={initialDailyChange}
                  />
                )}
              </div>
              <RightTradePanel indexPrice={displayedIdx} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardTab;