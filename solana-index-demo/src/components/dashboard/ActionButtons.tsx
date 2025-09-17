'use client';

import { motion } from 'framer-motion';
import { DashboardButton } from '../common';

interface ActionButtonsProps {
  onBuyClick: () => void;
  onBurnClick: () => void;
}

export default function ActionButtons({ onBuyClick, onBurnClick }: ActionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-4 mb-12 justify-center" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <DashboardButton 
        onClick={onBuyClick} 
        variant="primary"
        size="lg"
      >
        Buy Index Token
      </DashboardButton>
      
      <DashboardButton 
        onClick={onBurnClick} 
        variant="outline"
        size="lg"
      >
        Burn Index Token
      </DashboardButton>
      
      <DashboardButton 
        href="https://muse-7.gitbook.io/axiswhitepaper/" 
        variant="outline"
        size="lg"
        external
      >
        Read WhitePaper
      </DashboardButton>
      
      <DashboardButton 
        href="/challenge" 
        variant="outline"
        size="lg"
      >
        Create Challenge Image
      </DashboardButton>
    </motion.div>
  );
}
