'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, ModernButton, GridLayout } from '../../../components/common';
import { useIndexPrice } from '../../../hooks/useIndexPrice';
import { Coins, BarChart3, Wallet, Heart, ArrowRight } from 'lucide-react';

const WalletBar = dynamic(() => import('../../../components/crypto/WalletBar'), { ssr: false });

interface HomeTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const HomeTab = ({ echartsData }: HomeTabProps) => {
  const { data: indexPriceData, loading: priceLoading } = useIndexPrice();
  const latestClose = indexPriceData?.currentPrice ?? echartsData?.at(-1)?.[2] ?? 100;

  const featureCards = [
    {
      icon: <Coins className="w-6 h-6 mx-auto text-orange-400" />,
      title: 'Mint Index',
      subtitle: 'Buy AXIS Tokens',
      description: 'Deposit USDC to mint AXIS tokens at current index price',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'mint' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      icon: <BarChart3 className="w-6 h-6 mx-auto text-blue-400" />,
      title: 'View Market',
      subtitle: 'Market Data',
      description: 'Explore real-time market data and index performance',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'market' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      icon: <Wallet className="w-6 h-6 mx-auto text-emerald-400" />,
      title: 'Portfolio',
      subtitle: 'Your Holdings',
      description: 'Track your AXIS token holdings and performance',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'portfolio' }
        });
        window.dispatchEvent(event);
      }
    }
  ];

  const favorites = [
    {
      name: 'Quick Mint',
      description: 'One-click minting with current index price',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'mint' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      name: 'Market Analysis',
      description: 'Detailed market insights and trends',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'market' }
        });
        window.dispatchEvent(event);
      }
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Home</h1>
        <p className="text-gray-400 text-sm sm:text-base">Welcome to the AXIS Protocol Dashboard</p>
      </div>

      {/* Connect Wallet Banner */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Connect your wallet to view your index positions
        </h2>
        <div className="flex justify-center">
          <WalletBar />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {featureCards.map((card, index) => (
          <ModernCard 
            key={index}
            className="p-4 sm:p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            dark
            onClick={card.action}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{card.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{card.subtitle}</p>
              <p className="text-gray-300 text-xs mb-3 sm:mb-4">{card.description}</p>
              <div className="flex items-center justify-center text-orange-400 text-xs sm:text-sm">
                <span>Explore</span>
                <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Your Favorites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-400" fill="#ef4444" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Your Favorites</h2>
          </div>
          <button className="text-orange-400 text-xs sm:text-sm hover:text-orange-300 transition-colors">
            Discover more <ArrowRight className="inline w-4 h-4 ml-1 align-middle" />
          </button>
        </div>

        <ModernCard className="p-4 sm:p-6" dark>
          {favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((favorite, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={favorite.action}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm sm:text-base truncate">{favorite.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{favorite.description}</p>
                  </div>
                  <span className="text-gray-400 ml-2 flex-shrink-0">→</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No favorite apps yet, <span className="text-orange-400 cursor-pointer hover:text-orange-300">add some!</span>
              </p>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <ModernCard className="p-3 sm:p-4 text-center" gradient>
          <Coins className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
          <div className="text-base sm:text-lg font-bold text-white">${latestClose.toFixed(4)}</div>
          <div className="text-white/70 text-xs sm:text-sm">Current Index Price</div>
        </ModernCard>
        <ModernCard className="p-3 sm:p-4 text-center" gradient>
          <Coins className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
          <div className="text-base sm:text-lg font-bold text-white">1M</div>
          <div className="text-white/70 text-xs sm:text-sm">Total Supply</div>
        </ModernCard>
        <ModernCard className="p-3 sm:p-4 text-center" gradient>
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
          <div className="text-base sm:text-lg font-bold text-white">$25.5M</div>
          <div className="text-white/70 text-xs sm:text-sm">Market Cap</div>
        </ModernCard>
      </div>
    </div>
  );
};

export default HomeTab;
