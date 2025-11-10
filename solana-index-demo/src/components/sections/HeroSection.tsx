// components/sections/HeroSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '../common';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export default function HeroSection() {
  return (
    <section
      id="hero"
      className={`
        relative isolate w-screen min-h-[92vh] md:min-h-screen overflow-hidden
        ${inter.variable} ${playfair.variable}
      `}
      // うっすら青→黒のベースグラデ（背景画像とブレンド）
      style={{
        background:
          'radial-gradient(120% 80% at 10% -10%, rgba(32,92,140,.25) 0%, rgba(5,10,18,0) 60%), linear-gradient(180deg, #050A12 0%, #0A1018 55%, #04070C 100%)',
      }}
    >
      {/* 背景画像は全面表示 */}
      <Image
        src="/hero.png"
        alt="CaP5 index token hero"
        priority
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* ビネット（全体の締まり） */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,rgba(0,0,0,0)_0%,rgba(0,0,0,.45)_70%),linear-gradient(to_bottom,rgba(0,0,0,.12),rgba(0,0,0,.55))]" />

      {/* 下端の暗めフェード（任意・自然に沈ませる） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] md:h-[24vh] bg-gradient-to-t from-black/25 to-transparent" />

      {/* 下端ぼかし：画像そのまま・下だけ“とろける” */}
      <div
        className="
          pointer-events-none
          absolute inset-x-0 bottom-0
          h-[22vh] md:h-[24vh]
          backdrop-blur-[8px]
          [mask-image:linear-gradient(to_top,black_0%,transparent_90%)]
        "
      />

      {/* コンテンツ：左下寄せ */}
      <div
        className="
          relative z-10 mx-auto max-w-[1200px] px-6 md:px-10
          min-h-[92vh] md:min-h-screen
          flex items-end
          pb-[14vh] md:pb-[18vh]
        "
      >
        <div className="max-w-[100rem] text-white">
          {/* 見出し */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="
              mt-2 leading-[1.03]
              text-[clamp(2.8rem,13vw,12rem)]
              tracking-[-0.015em]
            "
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Index Token <span className="whitespace-nowrap">CaP5</span>
          </motion.h1>

          {/* 説明文 */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="
              mt-5 max-w-[48ch]
              text-[clamp(1rem,1.9vw,1.25rem)]
              text-white/85
            "
          >
            A programmable, utility-driven index token that gives you diversified exposure
            to the top five crypto assets — rebalanced, verified, and ready to use on Solana.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button href="/dashboard" variant="glass" size="lg" className="px-6">
              Get CaP5
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
