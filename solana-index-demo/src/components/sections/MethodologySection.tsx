// components/sections/GetInvolvedSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, BookOpen } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

export default function GetInvolvedSection() {
  return (
    <section className="py-24 lg:py-32 text-white">
      <div className="container mx-auto max-w-6xl px-4">
        {/* ===== 上：見出し & CTA（透明カードで軽く持ち上げ） ===== */}
        <motion.div
          {...fadeIn(0)}
          className="
            relative overflow-hidden rounded-3xl
            border border-white/10 bg-white/[0.03] backdrop-blur-sm
            px-6 md:px-10 py-12 md:py-16 text-center
          "
        >
          {/* 上面の微細なハイライト */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(255,255,255,0.22),transparent_60%)]" />

          <motion.h2
            {...fadeIn(0.05)}
            className="text-[clamp(2.2rem,5.2vw,7rem)] leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Join the Axis Community
          </motion.h2>

          {/* ボタン行：Discord が主導線 / Docs は副導線 */}
          <motion.div
            {...fadeIn(0.15)}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            {/* Discord（主）＋ツールチップ */}
            <a
              href="https://discord.gg/PTGVdd5KZQ"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative inline-flex items-center gap-2
                rounded-full border border-white/20 bg-white/10
                px-6 py-3 text-[15px] font-semibold
                hover:bg-white/20 hover:border-white/30
                transition-colors
              "
            >
              <MessageCircle className="w-5 h-5" />
              Join our Discord
              {/* tooltip */}
              <span
                className="
                  pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2
                  rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0
                  shadow-md ring-1 ring-white/10
                  transition-opacity group-hover:opacity-100
                "
              >
                Join Discord
              </span>
            </a>

            {/* Docs（副） */}
            <a
              href="https://muse-7.gitbook.io/axiswhitepaper/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 rounded-full
                border border-white/15 bg-white/5
                px-5 py-3 text-[15px] font-medium text-white/90
                hover:bg-white/10 hover:text-white
                transition-colors
              "
            >
              <BookOpen className="w-5 h-5" />
              Read the Docs
            </a>
          </motion.div>
        </motion.div>

        {/* ===== 中：タートル（中心）＋上側ブレンド用マスク ===== */}
        <div className="relative mt-14 md:mt-16">
          {/* 上に向かって透明になるグラデ（黒ベタ感を消す） */}
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-24 [mask-image:linear-gradient(to_bottom,black,transparent)] bg-black/70" />

          <motion.div
            {...fadeIn(0.05)}
            whileHover={{ scale: 1.04, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex items-center justify-center"
          >
            <Image
              src="/turtle.png" // 置いてあるタートル画像
              alt="Axis Turtle"
              width={420}
              height={420}
              className="opacity-85 select-none"
              priority
            />
          </motion.div>
        </div>

        {/* ===== 下：キャッチコピー（サングリフ / 強めの余白） ===== */}
        <motion.div {...fadeIn(0.1)} className="mt-8 md:mt-10 text-center">
          <h3
            className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.15]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Stop overthinking.
            <br className="hidden sm:block" />
            <span className="sm:ml-1">Just Buy the Index.</span>
          </h3>
        </motion.div>
      </div>
    </section>
  );
}
