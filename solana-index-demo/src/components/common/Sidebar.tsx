'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Home, Coins, BarChart3, Zap, Briefcase, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import SidebarWalletButton from './SidebarWalletButton';
import Link from 'next/link';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'mint', label: 'Mint', icon: <Coins className="w-5 h-5" /> },
    { id: 'market', label: 'Market', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Index', icon: <Zap className="w-5 h-5" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'challenge', label: 'Challenge', icon: <Target className="w-5 h-5" />, external: true },
  ];

  const handleTabClick = (tabId: string, external?: boolean) => {
    if (external) {
      window.location.href = '/challenge';
    } else {
      onTabChange(tabId);
      setIsMobileOpen(false); // Close mobile menu when tab is selected
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800/80 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white hover:bg-gray-700/80 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`bg-black/80 backdrop-blur-xl border-r border-gray-700/30 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-20 relative">
                <Link href="/">
                <Image
                  src="/logo.png"
                  alt="AXIS"
                  fill
                  className="object-contain"
                  sizes="20px"
                /></Link>
              </div>
              {!isCollapsed && (
                <motion.span
                  className="text-white font-bold text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                </motion.span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleTabClick(item.id, item.external)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeTab === item.id
                  ? 'bg-gray-700/50 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Connect Wallet Button */}
          <div className="p-4 border-t border-gray-700/30">
            <div className="space-y-3">
              <div className="w-full">
                <SidebarWalletButton />
              </div>
              {!isCollapsed && (
                <motion.div
                  className="text-xs text-gray-500 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  https://axis-protocol.xyz
                </motion.div>
              )}
            </div>
          </div>

          {/* Collapse Toggle - Hidden on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
