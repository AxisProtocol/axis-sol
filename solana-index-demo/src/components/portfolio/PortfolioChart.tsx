'use client';

import { motion } from 'framer-motion';

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
}

interface PortfolioChartProps {
  tokens: TokenData[];
}

const PortfolioChart = ({ tokens }: PortfolioChartProps) => {
  const sortedTokens = [...tokens].sort((a, b) => b.allocation - a.allocation);
  const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-3">
      {sortedTokens.map((token, index) => (
        <motion.div
          key={token.symbol}
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="font-medium text-white">{token.symbol}</span>
            </div>
            <span className="text-white/70">{token.allocation.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${token.allocation}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
      
      {tokens.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-white/70 text-sm">No portfolio data available</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioChart;
