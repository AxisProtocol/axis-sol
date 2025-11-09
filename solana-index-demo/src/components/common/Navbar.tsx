"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";

const WalletConnect = dynamic(() => import("../crypto/WalletConnect"), {
  ssr: false,
});

const Navbar = () => {
  const pathname = usePathname();

  const dashboardTabs = [
    { id: "buy", label: "Buy" },
    { id: "market", label: "Market" },
    { id: "dashboard", label: "Index" },
    { id: "portfolio", label: "Portfolio" },
    { id: "axis", label: "AXIS" },
    { id: "challenge", label: "Challenge", external: true },
  ];

  const isDashboard = pathname === "/dashboard";

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full h-16 z-50
  flex items-center justify-between
  bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-4 sm:px-6
  overflow-visible "
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              className="w-6 h-6 relative group-hover:scale-110 transition-transform duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo.png"
                alt="Axis"
                fill
                className="object-contain"
                sizes="24px"
              />
            </motion.div>
          </Link>

          {/* Dashboard Tabs */}
          {isDashboard && (
            <div className="hidden md:flex items-center space-x-1">
              {dashboardTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.external) {
                      window.location.href = "/challenge";
                    } else {
                      const event = new CustomEvent("dashboard-tab-change", {
                        detail: { tabId: tab.id },
                      });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium transition-all duration-200 text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Wallet Connect */}
          <div className="flex items-center space-x-2">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700/30 bg-black/50 backdrop-blur-sm">
        <div className="px-4 py-1.5 flex justify-around">
          {dashboardTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                if (tab.external) {
                  window.location.href = "/challenge";
                } else {
                  const event = new CustomEvent("dashboard-tab-change", {
                    detail: { tabId: tab.id },
                  });
                  window.dispatchEvent(event);
                }
              }}
              className="px-2 py-1.5 text-xs font-medium transition-all duration-200 text-gray-400 hover:text-white"
              whileTap={{ scale: 0.99 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
