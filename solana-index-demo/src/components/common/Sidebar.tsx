"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Home,
  Coins,
  BarChart3,
  Zap,
  Briefcase,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SidebarWalletButton from "./SidebarWalletButton";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

interface SidebarProps {
  activeTab: string;

  onTabChange: (tabId: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      id: "portfolio",
      label: "Portfolio",
      icon: <Briefcase className="w-5 h-5" />,
    },
    { id: "dashboard", label: "Index", icon: <Zap className="w-5 h-5" /> },
    { id: "market", label: "Market", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* モバイル：ハンバーガー */}
      <button
        onClick={() => setIsMobileOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-base-200/80 backdrop-blur-xl border border-base-300 rounded-lg text-base-content hover:bg-base-300/80 transition-colors"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* モバイル：背面オーバーレイ */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-base-100/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 上ナビ本体（左/中/右） */}
      <motion.nav
        className="fixed top-0 left-0 w-full h-16 z-50
    flex items-center justify-between
    bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-4 sm:px-6
    overflow-visible "
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 左：ロゴ */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-20 h-20">
            <Image
              src="/logo.png"
              alt="AXIS"
              fill
              className="object-contain"
              sizes="52px"
            />
          </div>
        </Link>

        {/* 中：メニュー（PC表示） */}
        <div className="hidden lg:flex items-center gap-2 ml-[60px]">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-selected={activeTab === item.id}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* 右：テーマ & ウォレット */}
        <div className="flex items-center gap-2 align-middle">
          <ThemeSwitcher size="sm" className="shrink-0" />
          <SidebarWalletButton layout="inline" />
        </div>
      </motion.nav>

      {/* モバイル：メニュー展開（上ナビ直下） */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 w-full bg-base-100 border-b border-base-300 p-3 z-30"
          >
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`text-left px-3 py-2 rounded-md ${
                    activeTab === item.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-base-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {/* モバイルにもウォレット/Themeを出したいならここに追加してOK */}
              {/* <div className="mt-2 flex items-center gap-3">
                <ThemeSwitcher size="sm" className="shrink-0" />
                <SidebarWalletButton layout="inline" />
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
