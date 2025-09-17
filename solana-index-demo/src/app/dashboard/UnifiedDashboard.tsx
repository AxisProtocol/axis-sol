'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, ModernCard, ModernButton, GridLayout } from '../../components/common';
import Sidebar from '../../components/common/Sidebar';
import dynamic from 'next/dynamic';

const BuyModal = dynamic(() => import('../../components/dashboard/Modal/BuyModal'), { ssr: false });
const BurnModal = dynamic(() => import('../../components/dashboard/Modal/BurnModal'), { ssr: false });
const WalletBar = dynamic(() => import('../../components/crypto/WalletBar'), { ssr: false });

// Import tab components
import HomeTab from './tabs/HomeTab';
import MintTab from './tabs/MintTab';
import MarketTab from './tabs/MarketTab';
import DashboardTab from './tabs/DashboardTab';
import PortfolioTab from './tabs/PortfolioTab';
import ChallengeTab from './tabs/ChallengeTab';

interface UnifiedDashboardProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}



const UnifiedDashboard = ({ 
  initialLatestEntry, 
  echartsData, 
  initialDailyChange, 
  events, 
  error 
}: UnifiedDashboardProps) => {
  const [activeTab, setActiveTab] = useState('home');

  // Listen for tab changes from navbar
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tabId);
    };

    window.addEventListener('dashboard-tab-change', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('dashboard-tab-change', handleTabChange as EventListener);
    };
  }, []);

  const renderTabContent = () => {
    const commonProps = {
      initialLatestEntry,
      echartsData,
      initialDailyChange,
      events,
      error
    };

    switch (activeTab) {
      case 'home':
        return <HomeTab {...commonProps} />;
      case 'mint':
        return <MintTab {...commonProps} />;
      case 'market':
        return <MarketTab {...commonProps} />;
      case 'dashboard':
        return <DashboardTab {...commonProps} />;
      case 'portfolio':
        return <PortfolioTab {...commonProps} />;
      case 'challenge':
        return <ChallengeTab {...commonProps} />;
      default:
        return <HomeTab {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
