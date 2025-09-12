'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, ModernButton, GridLayout } from '../../../components/common';
import { useIndexPrice } from '../../../hooks/useIndexPrice';
import { Coins, Flame, BarChart3 } from 'lucide-react';

const BuyModal = dynamic(() => import('../../../components/dashboard/Modal/BuyModal'), { ssr: false });
const BurnModal = dynamic(() => import('../../../components/dashboard/Modal/BurnModal'), { ssr: false });
const WalletBar = dynamic(() => import('../../../components/crypto/WalletBar'), { ssr: false });

interface MintTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const MintTab = ({ echartsData }: MintTabProps) => {
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [burnModalOpen, setBurnModalOpen] = useState(false);

  const { data: indexPriceData, loading: priceLoading } = useIndexPrice();
  const latestClose = indexPriceData?.currentPrice ?? echartsData?.at(-1)?.[2] ?? 100;

  const mintStats = [
    { label: 'Index Price', value: `$${latestClose.toFixed(4)}`, icon: <Coins className="w-5 h-5 mx-auto" /> },
    { label: 'Total Supply', value: '1M', icon: <Coins className="w-5 h-5 mx-auto" /> },
    { label: 'Market Cap', value: '$25.5M', icon: <BarChart3 className="w-5 h-5 mx-auto" /> },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Wallet Connection */}
        <div className="flex justify-center">
          <WalletBar />
        </div>

        {/* Stats Cards */}
        <GridLayout cols={3} gap="md">
          {mintStats.map((stat) => (
            <ModernCard key={stat.label} className="text-center p-4" gradient>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </ModernCard>
          ))}
        </GridLayout>

        {/* Action Cards */}
        <GridLayout cols={2} gap="lg">
          {/* Mint Card */}
          <ModernCard className="p-6 text-center" gradient>
            <Coins className="w-10 h-10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Mint Index Tokens</h2>
            <div className="text-3xl font-bold text-white mb-2">{mintStats[0].value}</div>
            <div className="text-white/70 text-sm mb-6">Current Index Price</div>
            <ModernButton
              variant="primary"
              size="lg"
              gradient
              onClick={() => setBuyModalOpen(true)}
              className="w-full"
            >
              Sell

            </ModernButton>
          </ModernCard>

          {/* Burn Card */}
          <ModernCard className="p-6 text-center" gradient>
            <Flame className="w-10 h-10 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-white mb-3">Redeem Index Tokens</h2>
            <div className="text-3xl font-bold text-white mb-2">{mintStats[0].value}</div>
            <div className="text-white/70 text-sm mb-6">Current Index Price</div>
            <ModernButton
              variant="secondary"
              size="lg"
              onClick={() => setBurnModalOpen(true)}
              className="w-full"
            >
              Burn & Redeem
            </ModernButton>
          </ModernCard>
        </GridLayout>

        {/* Info Section */}
        <ModernCard className="p-6" dark>
          <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Buying</h4>
              <p>Deposit USDC to mint AXIS tokens at the current index price. Your tokens represent a share of the underlying crypto index.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Selling</h4>
              <p>Burn your AXIS tokens to receive USDC based on the current index value. The settlement happens automatically.</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {buyModalOpen && (
        <BuyModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          indexPrice={latestClose}
        />
      )}

      {burnModalOpen && (
        <BurnModal
          isOpen={burnModalOpen}
          onClose={() => setBurnModalOpen(false)}
          indexPrice={latestClose}
        />
      )}
    </>
  );
};

export default MintTab;