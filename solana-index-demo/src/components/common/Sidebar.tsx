"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Briefcase, Zap } from "lucide-react";
import SidebarWalletButton from "./SidebarWalletButton";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      id: "portfolio",
      label: "Portfolio",
      icon: <Briefcase className="w-5 h-5" />,
    },
    { id: "dashboard", label: "Index", icon: <Zap className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* モバイル：背面オーバーレイ */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-base-100/50 backdrop-blur-sm z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 上ナビ本体 */}
      <motion.nav
        className="fixed top-0 left-0 w-full h-16 z-50
          flex items-center justify-between
          bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-4 sm:px-6
          overflow-visible"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 左：ハンバーガー + ロゴ */}
        <div className="flex items-center gap-3">
          {/* 一番左のハンバーガー */}
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center
                       w-9 h-9 rounded-lg border border-base-300
                       bg-base-200/80 backdrop-blur-xl text-base-content
                       hover:bg-base-300/80 transition-colors"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-5 h-5"
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

          {/* その右にロゴ */}
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16 lg:w-20 lg:h-20">
              <Image
                src="/logo.png"
                alt="AXIS"
                fill
                className="object-contain"
                sizes="52px"
              />
            </div>
          </Link>
        </div>

        {/* 中：メニュー（PCのみ） */}
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

      {/* モバイル：メニュー展開 */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 w-full bg-base-100 border-b border-base-300 p-3 z-40 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                    activeTab === item.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <span className="w-5 h-5">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
