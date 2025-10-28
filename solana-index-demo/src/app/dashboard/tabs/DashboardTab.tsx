"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ModernCard,
  GridLayout,
  ModernButton,
  getCoinIcon,
} from "../../../components/common";
import Image from "next/image";
import {
  Zap,
  Coins,
  RefreshCcw,
  Landmark,
  Lock,
  User,
  BarChart3,
} from "lucide-react";
import { useIndexPrice } from "../../../hooks/useIndexPrice";

const IndexValueCard = dynamic(
  () => import("../../../components/dashboard/IndexValueCard"),
  { ssr: false }
);
const ChartSection = dynamic(
  () => import("../../../components/dashboard/ChartSection"),
  { ssr: false }
);

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  allocation: number;
  imageUrl: string;
}

interface DashboardTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const sharedTokenData: TokenData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43520.5,
    change24h: 2.5,
    volume24h: 15.2e9,
    marketCap: 850.5e9,
    allocation: 10,
    imageUrl: getCoinIcon("BTC"),
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2640.75,
    change24h: -1.2,
    volume24h: 8.5e9,
    marketCap: 317.2e9,
    allocation: 10,
    imageUrl: getCoinIcon("ETH"),
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 98.45,
    change24h: 5.8,
    volume24h: 2.1e9,
    marketCap: 42.8e9,
    allocation: 10,
    imageUrl: getCoinIcon("SOL"),
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 305.2,
    change24h: 1.1,
    volume24h: 1.8e9,
    marketCap: 46.2e9,
    allocation: 10,
    imageUrl: getCoinIcon("BNB"),
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0.6245,
    change24h: -0.8,
    volume24h: 1.2e9,
    marketCap: 33.5e9,
    allocation: 10,
    imageUrl: getCoinIcon("XRP"),
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.4825,
    change24h: 3.2,
    volume24h: 890e6,
    marketCap: 17.1e9,
    allocation: 10,
    imageUrl: getCoinIcon("ADA"),
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.0845,
    change24h: -2.1,
    volume24h: 650e6,
    marketCap: 12.1e9,
    allocation: 10,
    imageUrl: getCoinIcon("DOGE"),
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 35.67,
    change24h: 4.5,
    volume24h: 520e6,
    marketCap: 13.2e9,
    allocation: 10,
    imageUrl: getCoinIcon("AVAX"),
  },
  {
    symbol: "TRX",
    name: "Tron",
    price: 0.1045,
    change24h: 1.8,
    volume24h: 380e6,
    marketCap: 9.2e9,
    allocation: 10,
    imageUrl: getCoinIcon("TRX"),
  },
  {
    symbol: "SUI",
    name: "Sui",
    price: 1.85,
    change24h: 7.2,
    volume24h: 240e6,
    marketCap: 4.8e9,
    allocation: 10,
    imageUrl: getCoinIcon("SUI"),
  },
];

const DashboardTab = ({
  initialLatestEntry,
  echartsData,
  initialDailyChange,
}: DashboardTabProps) => {
  const tokenomics = [
    {
      label: "Total Supply",
      value: "100M",
      icon: <Coins className="w-4 h-4 mx-auto" />,
    },
    {
      label: "Circulating",
      value: "25M",
      icon: <RefreshCcw className="w-4 h-4 mx-auto" />,
    },
    {
      label: "Market Cap",
      value: "$12.5M",
      icon: <BarChart3 className="w-4 h-4 mx-auto" />,
    },
    {
      label: "Treasury",
      value: "15M",
      icon: <Landmark className="w-4 h-4 mx-auto" />,
    },
  ];

  const stakingStats = [
    {
      label: "Total Staked",
      value: "8.5M AXIS",
      icon: <Lock className="w-4 h-4 mx-auto" />,
    },
    {
      label: "APY",
      value: "12.5%",
      icon: <BarChart3 className="w-4 h-4 mx-auto" />,
    },
    {
      label: "Your Stake",
      value: "0 AXIS",
      icon: <User className="w-4 h-4 mx-auto" />,
    },
  ];

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

  if (!initialLatestEntry || !echartsData?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60 text-lg">No data available</p>
      </div>
    );
  }

  const { data: indexPriceData, loading: priceLoading } = useIndexPrice();
  const displayedIdx = indexPriceData?.normalizedPrice ?? null;

  return (
    <div className="space-y-4">
      {/* Index Value Card - Top */}
      <div className="flex justify-center mt-20">
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

      {/* Tokenomics Section */}
      <ModernCard className="p-4" gradient>
        <h3 className="text-lg font-bold text-base-content mb-3 text-center flex items-center justify-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>AXIS Tokenomics</span>
        </h3>

        <GridLayout cols={4} gap="md">
          {tokenomics.map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-base-200/30 rounded border border-base-300"
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-lg font-bold text-base-content mb-1">
                {item.value}
              </div>
              <div className="text-base-content/70 text-xs">{item.label}</div>
            </div>
          ))}
        </GridLayout>
      </ModernCard>

      {/* Staking Stats */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-base-content mb-3 text-center flex items-center justify-center space-x-2">
          <Lock className="w-5 h-5" />
          <span>Staking</span>
        </h3>

        <GridLayout cols={3} gap="md">
          {stakingStats.map((stat) => (
            <ModernCard key={stat.label} className="text-center p-3" gradient>
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-base-content mb-1">
                {stat.value}
              </div>
              <div className="text-base-content/70 text-xs">{stat.label}</div>
            </ModernCard>
          ))}
        </GridLayout>
      </ModernCard>

      {/* Token Constituents - Market Style */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-base-content mb-4 text-center flex items-center justify-center space-x-2">
          <Coins className="w-5 h-5" />
          <span>Index Constituents</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-base-300">
                <th className="text-left py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                  Token
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium hidden sm:table-cell">
                  Allocation
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                  Price
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium">
                  24h Change
                </th>
                <th className="text-right py-2 px-2 sm:px-3 text-base-content/70 font-medium hidden lg:table-cell">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody>
              {sharedTokenData.map((token) => (
                <tr
                  key={token.symbol}
                  className="border-b border-base-300 hover:bg-base-200/30"
                >
                  <td className="py-2 px-2 sm:px-3">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 relative flex-shrink-0">
                        <Image
                          src={token.imageUrl}
                          alt={token.symbol}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-base-content text-xs sm:text-sm truncate">
                          {token.symbol}
                        </div>
                        <div className="text-base-content/60 text-xs truncate hidden sm:block">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3 hidden sm:table-cell">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <div className="w-8 sm:w-10 bg-base-300 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${(token.allocation / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-base-content font-medium text-xs">
                        {token.allocation}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3 text-base-content font-medium text-xs">
                    {formatPrice(token.price)}
                  </td>
                  <td
                    className={`text-right py-2 px-2 sm:px-3 font-medium text-xs ${
                      token.change24h >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3 text-base-content text-xs hidden lg:table-cell">
                    {formatLargeNumber(token.marketCap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Chart Section */}
      <ModernCard className="p-3 sm:p-4" dark>
        <ChartSection echartsData={echartsData} events={[]} />
      </ModernCard>
    </div>
  );
};

export default DashboardTab;
