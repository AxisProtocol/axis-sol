'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }: TabNavigationProps) => {
  return (
    <div className={`flex bg-gray-800/30 rounded-xl p-1 backdrop-blur-xl border border-gray-700/30 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex-1 ${
              isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/50"
                layoutId="activeTab"
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            )}
            <span className="relative z-10 text-lg">{tab.icon}</span>
            <span className="relative z-10 hidden sm:block">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
