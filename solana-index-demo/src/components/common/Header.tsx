// Header.tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'Core Engine', href: '#core-engine' },
  { name: 'CaP5', href: '#index-overview' },
  { name: 'Our Vision', href: '#vision-video' },
  { name: 'Our Partner', href: '#ecosystem' },
  { name: 'Join Axis', href: '#methodology' },
  
];

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleLinkClick = () => setIsDrawerOpen(false);

  return (
    <>
      {/* ---------- Glass Header (no border / fixed on top) ---------- */}
      <header
        className="
          fixed top-0 inset-x-0 z-[1000] italic
          bg-black/10 backdrop-blur-sm
        "
      >
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-4 lg:gap-8">
              <a href="#hero" className="block">
                <Image
                  src="/logo.png"
                  alt="Axis Protocol Logo"
                  width={60}
                  height={60}
                  className="w-24 h-24 lg:w-[100px] lg:h-[100px]"
                  priority
                />
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 lg:gap-4">
                {navItems.map((item) => (
                  <a key={item.name} href={item.href} onClick={handleLinkClick}>
                    <span className="px-2 lg:px-2.5 py-1.5 text-xs lg:text-sm font-bold text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap">
                      {item.name}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Right: X / Discord / small translucent Launch */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* X */}
              <a
                href="https://x.com/Axis__Solana"
                target="_blank"
                rel="noreferrer"
                aria-label="Open X (Twitter)"
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 3l7.5 9.5L3.8 21H6.9l5-6.3L16.8 21H21l-7.9-10.1L20.7 3h-3.1l-4.5 5.6L9 3H3z" fill="white"/>
                </svg>
              </a>

              {/* Discord（指定SVG） */}
              <a
                href="https://discord.gg/PTGVdd5KZQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Discord"
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <svg viewBox="0 0 126.644 96" width="22" height="22" aria-hidden>
                  <path fill="#fff" d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z"/>
                </svg>
              </a>

              {/* 半透明・小さめ Launch App（ヘッダー専用） */}
              <a
                href="/dashboard"
                className="
                  inline-flex items-center justify-center
                  h-9 lg:h-10 px-3.5
                  text-sm font-semibold text-white
                  rounded-lg
                  bg-white/10 hover:bg-white/20 active:bg-white/25
                  transition-colors
                "
              >
                Launch App
              </a>
            </div>

            {/* Mobile: Menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              aria-label="Open menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Mobile Drawer ---------- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200] md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleLinkClick}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm p-6 pt-24
                         bg-black/95 backdrop-blur-[12px]
                         shadow-[-6px_0_24px_rgba(0,0,0,0.25)]
                         flex flex-col gap-4 z-[1300] md:hidden"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Logo */}
              <div className="absolute top-6 left-6">
                <Image src="/logo.png" alt="Axis Protocol Logo" width={48} height={48} className="w-12 h-12" />
              </div>

              {/* Nav Items */}
              <div className="mt-2 flex flex-col">
                {navItems.map((item) => (
                  <a key={item.name} href={item.href} onClick={handleLinkClick}>
                    <span className="block w-full text-left text-lg font-medium text-white py-3 px-4 rounded-lg hover:bg-white/10">
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Socials + Launch App */}
              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <a href="https://x.com/your_handle" target="_blank" rel="noreferrer" aria-label="Open X" className="p-2 rounded-md hover:bg-white/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 3l7.5 9.5L3.8 21H6.9l5-6.3L16.8 21H21l-7.9-10.1L20.7 3h-3.1l-4.5 5.6L9 3H3z" fill="white"/>
                    </svg>
                  </a>
                  <a href="https://discord.gg/your_invite" target="_blank" rel="noreferrer" aria-label="Open Discord" className="p-2 rounded-md hover:bg-white/10">
                    <svg viewBox="0 0 126.644 96" width="24" height="24" aria-hidden>
                      <path fill="#fff" d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z"/>
                    </svg>
                  </a>
                </div>

                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-white rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={handleLinkClick}
                >
                  Launch App
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ヒーローと重ねたい場合はスペーサー不要。
         重なりを避けたい場合は以下を有効化 */}
      {/* <div className="h-16 lg:h-20" /> */}
    </>
  );
};
