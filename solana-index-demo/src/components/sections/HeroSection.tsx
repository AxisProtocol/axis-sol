// components/sections/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react'; 
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '../common';
import { Inter, Playfair_Display } from 'next/font/google';
import WaitlistForm from '../waitlist/WaitlistForm';
import { useRouter } from 'next/navigation';
import { usePhantom, useModal } from '@phantom/react-sdk';

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

  const router = useRouter();
  const { isConnected } = usePhantom();
  const { open } = useModal();
  const [isPendingRedirect, setIsPendingRedirect] = useState(false);

  const handleGetCap5Click = () => {
    if (isConnected) {
      router.push('/dashboard');
    } else {
      setIsPendingRedirect(true);
      open();
    }
  };

  useEffect(() => {
    if (isConnected && isPendingRedirect) {
      router.push('/dashboard');
      setIsPendingRedirect(false);
    }
  }, [isConnected, isPendingRedirect, router]);

  return (
    <section
      id="hero"
      className={`
        relative isolate w-full min-h-[100svh] md:min-h-screen overflow-hidden
        ${inter.variable} ${playfair.variable}
      `}
      // 背景（サイドの余白を自然に見せる下地）
      style={{
        background:
          'radial-gradient(120% 80% at 10% -10%, rgba(32,92,140,.25) 0%, rgba(5,10,18,0) 60%), linear-gradient(180deg, #050A12 0%, #0A1018 55%, #04070C 100%)',
      }}
    >
      {/* ===== 画像レイヤー（モバイルも cover ＝拡大したまま） ===== */}
      <Image
        src="/hero.png"
        alt="CaP5 index token hero"
        priority
        fetchPriority="high"
        fill
        sizes="100vw"
        className={`
          object-cover
          object-[center_90%] md:object-[center_top]   /* ← 見せたい位置を微調整 */
          select-none pointer-events-none
          [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]
        `}
      />

      {/* ===== ビネット（上下の締まり） ===== */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,rgba(0,0,0,0)_0%,rgba(0,0,0,.45)_70%),linear-gradient(to_bottom,rgba(0,0,0,.12),rgba(0,0,0,.55))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] md:h-[24vh] bg-gradient-to-t from-black/25 to-transparent" />
      <div
        className="
          pointer-events-none absolute inset-x-0 bottom-0
          h-[18vh] md:h-[24vh]
          md:backdrop-blur-[8px]
          [mask-image:linear-gradient(to_top,black_0%,transparent_90%)]
        "
      />

      {/* ===== サイドマスク（左右端をぼかして視覚的余白を作る） ===== */}
      <div
        className="
          pointer-events-none absolute inset-y-0 left-0
          w-[10vw] sm:w-[8vw] md:w-[7vw] lg:w-[6vw]
          backdrop-blur-[6px] bg-black/5
          [mask-image:linear-gradient(to_right,black_0%,transparent_85%)]
        "
      />
      <div
        className="
          pointer-events-none absolute inset-y-0 right-0
          w-[10vw] sm:w-[8vw] md:w-[7vw] lg:w-[6vw]
          backdrop-blur-[6px] bg-black/5
          [mask-image:linear-gradient(to_left,black_0%,transparent_85%)]
        "
      />

      {/* ===== テキスト：常に画像の上に重ねる（absolute） ===== */}
      <div className="absolute inset-0 z-10 flex items-end">
        <div
          className="
            w-full text-white px-6 md:px-10
            max-w-[1200px] mx-auto
            pb-[10vh] md:pb-[18vh]
            [padding-bottom:calc(env(safe-area-inset-bottom,0px)+8vh)]
          "
        >
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="
              mt-2 leading-[1.03]
              text-[clamp(2.6rem,11.5vw,12rem)]
              tracking-[-0.015em]
            "
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Index Token <span className="whitespace-nowrap">CaP5</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-5 max-w-[48ch] text-[clamp(1rem,1.9vw,1.25rem)] text-white/85"
          >
            A programmable, utility-driven index token that gives you diversified exposure
            to the top five crypto assets  rebalanced, verified, and ready to use on Solana.
          </motion.p>


              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8 flex flex-col gap-6 max-w-[820px]"
              >
                {/* ===== メイン CTA + Tooltip ===== */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Tooltip 用にラッパーを追加 */}
                  <div className="relative inline-flex items-center group">
                  <motion.button
                    onClick={handleGetCap5Click}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    className="
                      inline-flex items-center justify-center
                      w-full sm:w-auto
                      min-w-[220px] md:min-w-[260px]
                      px-8 md:px-12
                      py-4 md:py-4.5
                      rounded-3xl
                      text-[1rem] md:text-[1.1rem]
                      tracking-[0.22em] uppercase
                      font-semibold
                      text-white
                      border border-white/15
                      bg-black/10
                      backdrop-blur-xl
                      shadow-[0_22px_60px_rgba(0,0,0,0.85)]
                      hover:bg-white/15
                      transition-transform transition-shadow duration-200
                      hover:-translate-y-0.5 active:translate-y-[1px]
                      whitespace-nowrap
                      cursor-pointer
                    "
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Get CaP5
                  </motion.button>

                    {/* ===== Tooltip（PCのみ表示） ===== */}
                    <div
                      className="
                        pointer-events-none
                        hidden md:block
                        absolute left-1/2 -translate-x-1/2
                        -top-3 -translate-y-full
                        opacity-0 translate-y-1
                        group-hover:opacity-100 group-hover:translate-y-0
                        transition duration-150
                      "
                      role="tooltip"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      <div
                        className="
                          px-3.5 py-2 rounded-xl
                          text-[12px] leading-tight
                          text-white
                          bg-black/80 backdrop-blur-xl
                          shadow-[0_14px_40px_rgba(0,0,0,0.7)]
                          border border-white/15
                          whitespace-nowrap
                        "
                      >
                        Launch the CaP5 trading dashboard
                      </div>
                    </div>
                  </div>
                </div>


            <WaitlistForm />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
