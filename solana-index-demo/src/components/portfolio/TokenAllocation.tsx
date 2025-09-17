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

interface TokenAllocationProps {
  tokens: TokenData[];
}

const TokenAllocation = ({ tokens }: TokenAllocationProps) => {
  const sortedTokens = [...tokens].sort((a, b) => b.allocation - a.allocation);

  return (
    <div className="space-y-4">
      {sortedTokens.map((token, index) => (
        <motion.div
          key={token.symbol}
          className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {token.symbol[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{token.symbol}</div>
              <div className="text-white/70 text-xs">{token.name}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white font-semibold">{token.allocation.toFixed(1)}%</div>
            <div className="text-white/70 text-xs">${token.currentPrice.toFixed(4)}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TokenAllocation;
