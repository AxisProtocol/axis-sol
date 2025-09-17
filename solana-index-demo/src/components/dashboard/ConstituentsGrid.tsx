'use client';

import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';
import { DashboardCard, DashboardGrid } from '../common';

interface RealTimeAsset {
  symbol: string;
  currentPrice: number;
  change24h: number | null;
}

interface ConstituentsGridProps {
  assets?: RealTimeAsset[];
  loading?: boolean;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

const defaultAssets: RealTimeAsset[] = [
  { symbol: 'BTC', currentPrice: 43520.50, change24h: 2.5 },
  { symbol: 'ETH', currentPrice: 2640.75, change24h: -1.2 },
  { symbol: 'SOL', currentPrice: 98.45, change24h: 5.8 },
  { symbol: 'BNB', currentPrice: 305.20, change24h: 1.1 },
  { symbol: 'XRP', currentPrice: 0.6245, change24h: -0.8 },
  { symbol: 'ADA', currentPrice: 0.4825, change24h: 3.2 },
  { symbol: 'DOGE', currentPrice: 0.0845, change24h: -2.1 },
  { symbol: 'AVAX', currentPrice: 35.67, change24h: 4.5 },
  { symbol: 'TRX', currentPrice: 0.1045, change24h: 1.8 },
  { symbol: 'SUI', currentPrice: 1.85, change24h: 7.2 },
];

export default function ConstituentsGrid({ assets = defaultAssets, loading = false }: ConstituentsGridProps) {
  return (
    <motion.div 
      className="w-full mb-8 sm:mb-12"
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-4 sm:mb-6 text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold m-0 text-white">Index Constituents</h2>
        <p className="text-gray-400 max-w-[450px] mx-auto mt-2 text-sm sm:text-base">
          Each asset is equally weighted at 10% to ensure a balanced market representation.
        </p>
        <p className="text-gray-500 text-xs sm:text-sm max-w-[450px] mx-auto mt-2 sm:mt-4 italic">
          Prices are updated every five seconds via Pyth oracle feeds.
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
          <p className="mt-4 text-sm sm:text-lg text-gray-300">Loading real-time prices…</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {assets.map(asset => (
            <DashboardCard key={asset.symbol} className="p-3 sm:p-4 hover:-translate-y-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">{asset.symbol}</span>
                <div className="bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">10%</div>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-medium text-left text-gray-300">
                <CountUp 
                  key={`${asset.symbol}-price`} 
                  end={asset.currentPrice} 
                  decimals={asset.currentPrice < 1 ? 5 : 2} 
                  duration={0.5} 
                  separator="," 
                  prefix="$" 
                />
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
