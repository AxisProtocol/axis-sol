// src/components/sections/EcosystemSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function EcosystemSection() {
  return (
    <motion.section
      // 背景は透明に（bg系クラスを付けない）
      className="py-20 lg:py-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* ヘッダー（指定レイアウト） */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="flex items-baseline gap-6 flex-wrap md:flex-nowrap">
          <motion.h1
            className="leading-[0.98] font-bold text-white text-[clamp(2.6rem,7vw,7rem)]"
            variants={itemVariants}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Our Partners
          </motion.h1>
        </div>

        {/* 単一ロゴを中央に大きく配置 */}
        <motion.div
          className="mt-10 md:mt-12 flex items-center justify-center"
          variants={itemVariants}
        >
          <a
            href="https://superteamjp.fun/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Superteam Japan"
            className="group"
          >
            <Image
                src="/superteamJapan.png"
                alt="Superteam Japan logo"
                width={1600}
                height={600}
                className="w-auto h-14 md:h-24 lg:h-30 xl:h-32 object-contain
                            grayscale-[35%] opacity-90 transition
                            group-hover:grayscale-0 group-hover:opacity-100"
                priority
                />
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
