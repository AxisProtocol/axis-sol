"use client";

import { useState, useEffect } from "react";
import { ModernCard, GridLayout } from "../../../components/common";
import Image from "next/image";
import { Coins, BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";

const TVChart = dynamic(() => import("../../../components/charts/TVChart"), {
  ssr: false,
});

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  allocation: number;
  imageUrl: string;
}

interface MarketTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}
type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  image: string;
};

const sharedMarketData: MarketData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43520.5,
    change24h: 2.5,
    volume24h: 15.2e9,
    marketCap: 850.5e9,
    allocation: 10,
    imageUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2640.75,
    change24h: -1.2,
    volume24h: 8.5e9,
    marketCap: 317.2e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 98.45,
    change24h: 5.8,
    volume24h: 2.1e9,
    marketCap: 42.8e9,
    allocation: 10,
    imageUrl: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 305.2,
    change24h: 1.1,
    volume24h: 1.8e9,
    marketCap: 46.2e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0.6245,
    change24h: -0.8,
    volume24h: 1.2e9,
    marketCap: 33.5e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.4825,
    change24h: 3.2,
    volume24h: 890e6,
    marketCap: 17.1e9,
    allocation: 10,
    imageUrl: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.0845,
    change24h: -2.1,
    volume24h: 650e6,
    marketCap: 12.1e9,
    allocation: 10,
    imageUrl: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 35.67,
    change24h: 4.5,
    volume24h: 520e6,
    marketCap: 13.2e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  },
  {
    symbol: "TRX",
    name: "Tron",
    price: 0.1045,
    change24h: 1.8,
    volume24h: 380e6,
    marketCap: 9.2e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
  },
  {
    symbol: "SUI",
    name: "Sui",
    price: 1.85,
    change24h: 7.2,
    volume24h: 240e6,
    marketCap: 4.8e9,
    allocation: 10,
    imageUrl:
      "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg",
  },
];

const MarketTab = ({}: MarketTabProps) => {
  const [marketData, setMarketData] = useState<MarketData[]>(sharedMarketData);
  useEffect(() => {
    const CG_IDS: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
      BNB: "binancecoin",
      XRP: "ripple",
      ADA: "cardano",
      DOGE: "dogecoin",
      AVAX: "avalanche-2",
      TRX: "tron",
      SUI: "sui",
    };

    const ids = Object.values(CG_IDS).join(",");
    const url =
      `https://api.coingecko.com/api/v3/coins/markets` +
      `?vs_currency=usd&ids=${encodeURIComponent(ids)}`;

    (async () => {
      try {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`CG ${res.status}`);
        const json = (await res.json()) as CoinMarket[];

        setMarketData((prev) =>
          prev.map((tok) => {
            const id = CG_IDS[tok.symbol];
            const coin = json.find((c) => c.id === id);
            if (!coin) return tok;
            return {
              ...tok,
              price: coin.current_price,
              change24h: coin.price_change_percentage_24h,
              marketCap: coin.market_cap,
              imageUrl: coin.image,
            };
          })
        );
      } catch (e) {
        console.error("coingecko market fetch failed", e);
      }
    })();
  }, []);

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

  const totalMarketCap = marketData.reduce(
    (sum, token) => sum + token.marketCap,
    0
  );
  const averageChange =
    marketData.reduce((sum, token) => sum + token.change24h, 0) /
    marketData.length;

  return (
    <div className="space-y-4 pt-15">
      {/* TradingView-like Chart connected to TV API */}
      <ModernCard className="p-3 sm:p-4 ">
        <TVChart
          initialSymbol="INDEX:FAMC"
          initialResolution="60"
          initialBars={1000}
        />
      </ModernCard>
      {/* Market Overview - Compact */}
      <ModernCard className="p-3 sm:p-4" gradient>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-base-200/30 rounded border border-base-300">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" />
            <div className="text-sm sm:text-lg font-bold text-base-content">
              {formatLargeNumber(totalMarketCap)}
            </div>
            <div className="text-base-content/70 text-xs">Market Cap</div>
          </div>

          <div className="text-center p-2 sm:p-3 bg-base-200/30 rounded border border-base-300">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" />
            <div
              className={`text-sm sm:text-lg font-bold ${
                averageChange >= 0 ? "text-success" : "text-error"
              }`}
            >
              {averageChange >= 0 ? "+" : ""}
              {averageChange.toFixed(2)}%
            </div>
            <div className="text-base-content/70 text-xs">24h Change</div>
          </div>

          <div className="text-center p-2 sm:p-3 bg-base-200/30 rounded border border-base-300">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" />
            <div className="text-sm sm:text-lg font-bold text-base-content">
              {marketData.length}
            </div>
            <div className="text-base-content/70 text-xs">Assets</div>
          </div>
        </div>
      </ModernCard>

      {/* Token List - Compact */}
      <ModernCard className="p-3 sm:p-4">
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
              {marketData.map((token) => (
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
                          style={{ width: `${(token.allocation / 20) * 100}%` }}
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
    </div>
  );
};

export default MarketTab;
