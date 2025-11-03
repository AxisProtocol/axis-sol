"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ModernCard, GridLayout } from "../../../components/common";
import Image from "next/image";
import {
  Briefcase,
  ClipboardList,
  BarChart3,
  Coins,
  Flame,
  RefreshCcw,
} from "lucide-react";

const PortfolioStats = dynamic(
  () => import("../../../components/portfolio/PortfolioStats"),
  { ssr: false }
);

interface TokenData {
  symbol: string;
  name: string;

  currentPrice: number;
  mintPrice: number;
  marketCap: number;
  volume24h: number;
  change1d: number;
  change30d: number;
  history: string;
  icon: string;
  imageUrl: string;
  originalChainAddress: string;
  proofOfReserve: string;
  chain: string;
}

interface PortfolioData {
  totalValue: number;
  totalChange: number;
  tokens: TokenData[];
  mintDate: string;
}

interface PortfolioTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const PortfolioTab = ({}: PortfolioTabProps) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>({
    totalValue: 125000,
    totalChange: 8.5,
    mintDate: "2024-01-15",
    tokens: [
      {
        symbol: "AXIS",
        name: "AXIS Index Token",
        currentPrice: 43520.5,
        mintPrice: 42000,
        marketCap: 850.5e9,
        volume24h: 15.2e9,
        change1d: 2.5,
        change30d: 3.6,
        history: "2025-10-01",
        icon: "₿",
        imageUrl: "/Axis_index_token.png",
        originalChainAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "Ethereum",
      },
      {
        symbol: "Cap5",
        name: "Index Token CaP5",
        currentPrice: 43520.5,
        mintPrice: 42000,
        marketCap: 850.5e9,
        volume24h: 15.2e9,
        change1d: 2.5,
        change30d: 3.6,
        history: "2025-10-03",
        icon: "₿",
        imageUrl: "/cap5.png",
        originalChainAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "Ethereum",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-10 h-10 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-base-content mb-3">
          No Portfolio Found
        </h3>
        <p className="text-base-content/70 text-lg mb-6">
          {error ||
            "Connect your wallet and mint some tokens to see your portfolio"}
        </p>
        <button className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-lg hover:opacity-90 transition-colors">
          Mint Tokens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-16">
      {/* Portfolio Stats - Compact */}
      <ModernCard className="p-4" gradient>
        <h2 className="text-xl font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
          <Briefcase className="w-5 h-5" />
          <span>Portfolio Overview</span>
        </h2>
        <PortfolioStats
          totalValue={portfolioData.totalValue}
          totalChange={portfolioData.totalChange}
          mintDate={portfolioData.mintDate}
        />
      </ModernCard>

      {/* Token Details with Additional Info */}
      <ModernCard className="p-4">
        <h3 className="text-xl font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
          <ClipboardList className="w-5 h-5" />
          <span>Token Details</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs table-fixed">
            <thead>
              <tr className="border-b border-base-300">
                <th className="text-left py-2 px-3 text-base-content/70 ">
                  Token
                </th>
                <th className="text-right py-2 px-3 text-base-content/70 align-middle">
                  Balance
                </th>
                <th className="text-right py-2 px-3 text-base-content/70 align-middle">
                  1day Change
                </th>
                <th className="text-right py-2 px-3 text-base-content/70 align-middle">
                  30day Change
                </th>
                <th className="text-right py-2 px-3 text-base-content/70 align-middle">
                  Buy History
                </th>
              </tr>
            </thead>

            <tbody>
              {portfolioData.tokens.map((token) => (
                <tr
                  key={token.symbol}
                  className="border-b border-base-300 hover:bg-base-200/30"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                          src={token.imageUrl}
                          alt={token.symbol}
                          fill
                          className="object-contain rounded-full"
                          sizes="20px"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-base-content text-xs">
                          {token.symbol}
                        </div>
                        <div className="text-base-content/60 text-xs">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="text-right py-2 px-3 text-base-content text-xs">
                    ${token.currentPrice.toFixed(2)}
                  </td>
                  <td
                    className={`text-right py-2 px-3 text-xs ${
                      token.change1d >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {token.change1d >= 0 ? "+" : ""}
                    {token.change1d.toFixed(2)}%
                  </td>
                  <td
                    className={`text-right py-2 px-3 text-xs ${
                      token.change30d >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {token.change30d >= 0 ? "+" : ""}
                    {token.change30d.toFixed(2)}%
                  </td>

                  <td className="text-right py-2 px-3 text-base-content text-xs">
                    {token.history}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Portfolio Status */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Portfolio Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mint Status */}
          <div className="p-3 bg-base-200/30 rounded border border-base-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-semibold text-base-content">
                  Mint
                </span>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="text-xs text-base-content/70">Last: 2025-08-01</div>
          </div>

          {/* Burn Status */}
          <div className="p-3 bg-base-200/30 rounded border border-base-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-base-content">
                  Burn
                </span>
              </div>
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                Available
              </span>
            </div>
            <div className="text-xs text-base-content/70">Last: 2025-08-01</div>
          </div>

          {/* Rebalancing Status */}
          <div className="p-3 bg-base-200/30 rounded border border-base-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RefreshCcw className="w-4 h-4" />
                <span className="text-sm font-semibold text-base-content">
                  Rebalancing
                </span>
              </div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                Scheduled
              </span>
            </div>
            <div className="text-xs text-base-content/70">Last: 2025-08-01</div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};

export default PortfolioTab;
