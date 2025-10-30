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
  allocation: number;
  currentPrice: number;
  mintPrice: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  changeSinceMint: number;
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
        symbol: "BTC",
        name: "Bitcoin",
        allocation: 10,
        currentPrice: 43520.5,
        mintPrice: 42000,
        marketCap: 850.5e9,
        volume24h: 15.2e9,
        change24h: 2.5,
        changeSinceMint: 3.6,
        icon: "₿",
        imageUrl:
          "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        originalChainAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "Ethereum",
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        allocation: 10,
        currentPrice: 2640.75,
        mintPrice: 2500,
        marketCap: 317.2e9,
        volume24h: 8.5e9,
        change24h: -1.2,
        changeSinceMint: 5.6,
        icon: "Ξ",
        imageUrl:
          "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        originalChainAddress: "0x0000000000000000000000000000000000000000",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "Ethereum",
      },
      {
        symbol: "SOL",
        name: "Solana",
        allocation: 10,
        currentPrice: 98.45,
        mintPrice: 95,
        marketCap: 42.8e9,
        volume24h: 2.1e9,
        change24h: 5.8,
        changeSinceMint: 3.6,
        icon: "◎",
        imageUrl:
          "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        originalChainAddress: "So11111111111111111111111111111111111111112",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "Solana",
      },
      {
        symbol: "BNB",
        name: "BNB",
        allocation: 10,
        currentPrice: 305.2,
        mintPrice: 300,
        marketCap: 46.2e9,
        volume24h: 1.8e9,
        change24h: 1.1,
        changeSinceMint: 1.7,
        icon: "B",
        imageUrl:
          "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        originalChainAddress: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "BSC",
      },
      {
        symbol: "XRP",
        name: "Ripple",
        allocation: 10,
        currentPrice: 0.6245,
        mintPrice: 0.6,
        marketCap: 33.5e9,
        volume24h: 1.2e9,
        change24h: -0.8,
        changeSinceMint: 4.1,
        icon: "X",
        imageUrl:
          "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
        originalChainAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
        proofOfReserve: "https://axis-protocol.xyz/404",
        chain: "XRP Ledger",
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
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-base-300">
                <th className="text-left py-2 px-3 text-base-content/70">
                  Token
                </th>
                <th className="text-right py-2 px-3 text-base-content/70">
                  Allocation
                </th>
                <th className="text-right py-2 px-3 text-base-content/70">
                  Current Price
                </th>
                <th className="text-right py-2 px-3 text-base-content/70">
                  24h Change
                </th>
                <th className="text-right py-2 px-3 text-base-content/70">
                  Since Mint
                </th>
                <th className="text-left py-2 px-3 text-base-content/70 hidden lg:table-cell">
                  Chain
                </th>
                <th className="text-left py-2 px-3 text-base-content/70 hidden xl:table-cell">
                  Address
                </th>
                <th className="text-center py-2 px-3 text-base-content/70 hidden xl:table-cell">
                  Proof of Reserve
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
                      <div className="w-5 h-5 relative flex-shrink-0">
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
                  <td className="text-right py-2 px-3">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-8 bg-base-300 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${token.allocation}%` }}
                        />
                      </div>
                      <span className="text-base-content font-medium text-xs">
                        {token.allocation.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 text-base-content text-xs">
                    ${token.currentPrice.toFixed(4)}
                  </td>
                  <td
                    className={`text-right py-2 px-3 text-xs ${
                      token.change24h >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </td>
                  <td
                    className={`text-right py-2 px-3 text-xs ${
                      token.changeSinceMint >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {token.changeSinceMint >= 0 ? "+" : ""}
                    {token.changeSinceMint.toFixed(2)}%
                  </td>
                  <td className="text-left py-2 px-3 text-base-content/60 text-xs hidden lg:table-cell">
                    {token.chain}
                  </td>
                  <td className="text-left py-2 px-3 text-base-content/60 text-xs hidden xl:table-cell">
                    <div
                      className="max-w-24 truncate"
                      title={token.originalChainAddress}
                    >
                      {token.originalChainAddress.slice(0, 8)}...
                      {token.originalChainAddress.slice(-6)}
                    </div>
                  </td>
                  <td className="text-center py-2 px-3 hidden xl:table-cell">
                    <a
                      href={token.proofOfReserve}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      View
                    </a>
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
