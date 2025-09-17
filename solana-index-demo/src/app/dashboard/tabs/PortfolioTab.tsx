'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, GridLayout } from '../../../components/common';
import Image from 'next/image';
import { Briefcase, ClipboardList, BarChart3, Coins, Flame, RefreshCcw } from 'lucide-react';

const PortfolioStats = dynamic(() => import('../../../components/portfolio/PortfolioStats'), { ssr: false });

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
    mintDate: '2024-01-15',
    tokens: [
      { 
        symbol: 'BTC', name: 'Bitcoin', allocation: 10, currentPrice: 43520.50, mintPrice: 42000, 
        marketCap: 850.5e9, volume24h: 15.2e9, change24h: 2.5, changeSinceMint: 3.6, icon: '₿',
        imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        originalChainAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Ethereum'
      },
      { 
        symbol: 'ETH', name: 'Ethereum', allocation: 10, currentPrice: 2640.75, mintPrice: 2500, 
        marketCap: 317.2e9, volume24h: 8.5e9, change24h: -1.2, changeSinceMint: 5.6, icon: 'Ξ',
        imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        originalChainAddress: '0x0000000000000000000000000000000000000000',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Ethereum'
      },
      { 
        symbol: 'SOL', name: 'Solana', allocation: 10, currentPrice: 98.45, mintPrice: 95, 
        marketCap: 42.8e9, volume24h: 2.1e9, change24h: 5.8, changeSinceMint: 3.6, icon: '◎',
        imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        originalChainAddress: 'So11111111111111111111111111111111111111112',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Solana'
      },
      { 
        symbol: 'BNB', name: 'BNB', allocation: 10, currentPrice: 305.20, mintPrice: 300, 
        marketCap: 46.2e9, volume24h: 1.8e9, change24h: 1.1, changeSinceMint: 1.7, icon: 'B',
        imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        originalChainAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'BSC'
      },
      { 
        symbol: 'XRP', name: 'Ripple', allocation: 10, currentPrice: 0.6245, mintPrice: 0.6, 
        marketCap: 33.5e9, volume24h: 1.2e9, change24h: -0.8, changeSinceMint: 4.1, icon: 'X',
        imageUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        originalChainAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'XRP Ledger'
      },
      { 
        symbol: 'ADA', name: 'Cardano', allocation: 10, currentPrice: 0.4825, mintPrice: 0.45, 
        marketCap: 17.1e9, volume24h: 890e6, change24h: 3.2, changeSinceMint: 7.2, icon: '₳',
        imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        originalChainAddress: 'addr1q9d8v2yhx69p8nxw8fv4j4tkvwe7ylvun2y3aqh0kcp9t6f3wk2r3qmxwqcx00tay7wlrfkk4z0w4fnycl3w2qssw5d0sqet',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Cardano'
      },
      { 
        symbol: 'DOGE', name: 'Dogecoin', allocation: 10, currentPrice: 0.0845, mintPrice: 0.08, 
        marketCap: 12.1e9, volume24h: 650e6, change24h: -2.1, changeSinceMint: 5.6, icon: 'Ð',
        imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
        originalChainAddress: 'D7Y55CM5bB68XzJ5t2bBZqLqLqLqLqLqLqLqLqLqLqLqLq',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Dogecoin'
      },
      { 
        symbol: 'AVAX', name: 'Avalanche', allocation: 10, currentPrice: 35.67, mintPrice: 32, 
        marketCap: 13.2e9, volume24h: 520e6, change24h: 4.5, changeSinceMint: 11.5, icon: 'A',
        imageUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        originalChainAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Avalanche'
      },
      { 
        symbol: 'TRX', name: 'Tron', allocation: 10, currentPrice: 0.1045, mintPrice: 0.1, 
        marketCap: 9.2e9, volume24h: 380e6, change24h: 1.8, changeSinceMint: 4.5, icon: 'T',
        imageUrl: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
        originalChainAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Tron'
      },
      { 
        symbol: 'SUI', name: 'Sui', allocation: 10, currentPrice: 1.85, mintPrice: 1.5, 
        marketCap: 4.8e9, volume24h: 240e6, change24h: 7.2, changeSinceMint: 23.3, icon: 'S',
        imageUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
        originalChainAddress: '0x2::sui::SUI',
        proofOfReserve: 'https://axis-protocol.xyz/404',
        chain: 'Sui'
      },
    ]
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
        <h3 className="text-xl font-bold text-gray-900 mb-3">No Portfolio Found</h3>
        <p className="text-gray-600 text-lg mb-6">
          {error || 'Connect your wallet and mint some tokens to see your portfolio'}
        </p>
        <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
          Mint Tokens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Stats - Compact */}
      <ModernCard className="p-4" gradient>
        <h2 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
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
        <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
          <ClipboardList className="w-5 h-5" />
          <span>Token Details</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-white/70">Token</th>
                <th className="text-right py-2 px-3 text-white/70">Allocation</th>
                <th className="text-right py-2 px-3 text-white/70">Current Price</th>
                <th className="text-right py-2 px-3 text-white/70">24h Change</th>
                <th className="text-right py-2 px-3 text-white/70">Since Mint</th>
                <th className="text-left py-2 px-3 text-white/70 hidden lg:table-cell">Chain</th>
                <th className="text-left py-2 px-3 text-white/70 hidden xl:table-cell">Address</th>
                <th className="text-center py-2 px-3 text-white/70 hidden xl:table-cell">Proof of Reserve</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.tokens.map((token) => (
                <tr
                  key={token.symbol}
                  className="border-b border-white/10 hover:bg-white/5"
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
                        <div className="font-semibold text-white text-xs">{token.symbol}</div>
                        <div className="text-white/70 text-xs">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-8 bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${token.allocation}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-xs">{token.allocation.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 text-white text-xs">${token.currentPrice.toFixed(4)}</td>
                  <td className={`text-right py-2 px-3 text-xs ${token.change24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 px-3 text-xs ${token.changeSinceMint >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {token.changeSinceMint >= 0 ? '+' : ''}{token.changeSinceMint.toFixed(2)}%
                  </td>
                  <td className="text-left py-2 px-3 text-white/70 text-xs hidden lg:table-cell">
                    {token.chain}
                  </td>
                  <td className="text-left py-2 px-3 text-white/70 text-xs hidden xl:table-cell">
                    <div className="max-w-24 truncate" title={token.originalChainAddress}>
                      {token.originalChainAddress.slice(0, 8)}...{token.originalChainAddress.slice(-6)}
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
        <h3 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Portfolio Status</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mint Status */}
          <div className="p-3 bg-white/10 rounded border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">Mint</span>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="text-xs text-white/70">
              Last: 2025-08-01
            </div>
          </div>

          {/* Burn Status */}
          <div className="p-3 bg-white/10 rounded border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-white">Burn</span>
              </div>
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                Available
              </span>
            </div>
            <div className="text-xs text-white/70">
              Last: 2025-08-01
            </div>
          </div>

          {/* Rebalancing Status */}
          <div className="p-3 bg-white/10 rounded border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RefreshCcw className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">Rebalancing</span>
              </div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                Scheduled
              </span>
            </div>
            <div className="text-xs text-white/70">
              Last: 2025-08-01
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};

export default PortfolioTab;
