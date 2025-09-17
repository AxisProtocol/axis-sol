import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'Axis Index', href: '#why-win' },
  { name: 'Index Methodology', href: '#product' },
];

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* ---------- Desktop Header (Glass Panel) ---------- */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 lg:gap-8 px-4 lg:px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/30 shadow-white/10 relative isolate after:content-[''] after:absolute after:inset-0 after:bg-[url('/noise-8x8.png')] after:opacity-[var(--noise-opacity)] after:pointer-events-none after:animate-[drift_6s_infinite_alternate_ease-in-out] after:bg-repeat">
          <a href="#hero" className="block">
            <Image
              src="/logo.png"
              alt="Axis Protocol Logo"
              width={50}
              height={50}
              className="w-12 h-12 lg:w-[60px] lg:h-[60px]"
              priority
            />
          </a>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => (
              <a key={item.name} href={item.href}>
                <button className="bg-none border-none px-2 lg:px-2.5 py-1.5 text-xs lg:text-sm font-bold text-white cursor-pointer transition-colors duration-200 hover:bg-white/20 hover:rounded-lg whitespace-nowrap">
                  {item.name}
                </button>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ---------- Mobile Menu Button ---------- */}
      <button 
        className="fixed right-4 top-4 md:hidden bg-none border-none z-[110] cursor-pointer p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20" 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ---------- Mobile Drawer Menu ---------- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[104] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLinkClick}
            />
            
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm p-6 pt-20 bg-black/95 backdrop-blur-[calc(var(--blur-strength)+6px)] shadow-[-6px_0_20px_rgba(0,0,0,0.15)] flex flex-col gap-4 z-[105] md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Logo in drawer */}
              <div className="absolute top-6 left-6">
                <Image
                  src="/logo.png"
                  alt="Axis Protocol Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              
              {/* Navigation items */}
              {navItems.map((item) => (
                <a key={item.name} href={item.href} onClick={handleLinkClick}>
                  <button className="w-full text-left bg-none border-none text-lg font-medium text-white cursor-pointer py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    {item.name}
                  </button>
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};