'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernButton } from '../../../components/common';
import { Target, Coins, XCircle, PlusCircle, RefreshCcw } from 'lucide-react';

interface ChallengeTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const ChallengeTab = ({}: ChallengeTabProps) => {
  const [constituents, setConstituents] = useState<string[]>(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'SUI']);
  const [removedTokens, setRemovedTokens] = useState<string[]>([]);
  const [addedTokens, setAddedTokens] = useState<string[]>([]);

  const handleRemove = (symbol: string) => {
    if (removedTokens.length >= 3) return;
    setConstituents(constituents.filter(s => s !== symbol));
    setRemovedTokens([...removedTokens, symbol]);
  };

  const handleRevertRemove = (symbol: string) => {
    setRemovedTokens(removedTokens.filter(s => s !== symbol));
    setConstituents([...constituents, symbol].sort());
  };

  return (
    <div className="space-y-6">
      {/* Challenge Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ModernCard className="p-6 text-center" gradient>
          <Target className="w-10 h-10 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-4">Axis Index Challenge</h2>
          <p className="text-gray-400 mb-6">Remove up to 3 tokens and add up to 3 new ones</p>
          
          <ModernButton
            variant="primary"
            size="lg"
            gradient
            className="min-w-[200px]"
          >
            Start Challenge
          </ModernButton>
        </ModernCard>
      </motion.div>

      {/* Current Constituents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Current Index</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {constituents.map((symbol) => (
              <motion.button
                key={symbol}
                onClick={() => handleRemove(symbol)}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{symbol}</div>
                  <div className="text-xs text-gray-400">Click to remove</div>
                </div>
              </motion.button>
            ))}
          </div>
        </ModernCard>
      </motion.div>

      {/* Removed Tokens */}
      {removedTokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Removed Tokens</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {removedTokens.map((symbol) => (
                <motion.div
                  key={symbol}
                  className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-between"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-white font-semibold">{symbol}</span>
                  <button
                    onClick={() => handleRevertRemove(symbol)}
                    className="text-red-400 hover:text-white transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      )}

      {/* Add New Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5" />
            <span>Add New Tokens</span>
          </h3>
          
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Token Symbol (e.g., MATIC)"
                className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400"
              />
              <ModernButton
                variant="primary"
                size="sm"
                disabled={addedTokens.length >= 3}
              >
                Add
              </ModernButton>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              You can add up to 3 new tokens
            </div>
          </div>
        </ModernCard>
      </motion.div>

      {/* Generate Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <ModernButton
          variant="primary"
          size="lg"
          gradient
          disabled={removedTokens.length === 0 && addedTokens.length === 0}
        >
          Generate Challenge Image
        </ModernButton>
      </motion.div>
    </div>
  );
};

export default ChallengeTab;
