'use client';

import { motion } from 'framer-motion';

interface PortfolioStatsProps {
  totalValue: number;
  totalChange: number;
  mintDate: string;
}

const PortfolioStats = ({ totalValue, totalChange, mintDate }: PortfolioStatsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-3xl font-bold text-white mb-2">
          {formatCurrency(totalValue)}
        </div>
        <div className="text-white/70">Total Portfolio Value</div>
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`text-3xl font-bold mb-2 ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
        </div>
        <div className="text-white/70">Total Change</div>
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-3xl font-bold text-white mb-2">
          {formatDate(mintDate)}
        </div>
        <div className="text-white/70">Mint Date</div>
      </motion.div>
    </div>
  );
};

export default PortfolioStats;
