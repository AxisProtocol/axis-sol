// src/components/sections/CoreEngineSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Feature = {
  number: string;
  title: string;
  description: string;
  visual: () => React.ReactNode;
};

const features: Feature[] = [
  {
    number: '01',
    title: 'Atomic Rebalancing via JitoBAM',
    description:
      'Rebalancing is safe, automated, and atomic. By using Jito bundles, we execute oracle updates, rebalancing, and swaps in one indivisible transaction, eliminating MEV risk.',
    visual: () => (
      <div className="flex items-center justify-center gap-6 md:gap-8 lg:gap-10">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/jito-logo.png"
          alt="Jito Logo"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-lg object-contain"
        />
        <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-500" />
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/BAM.png"
          alt="BAM Logo"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-lg object-contain"
        />
      </div>
    ),
  },
  {
    number: '02',
    title: 'On-Chain Proof of Reserves',
    description:
      'Weekly BAM bundles sync the ledger based on verifiable Proof of Reserves. Every asset is accounted for, ensuring full transparency and proving solvency at all times.',
    visual: () => (
      <img
        src="/PoR.png"
        alt="Proof of Reserves Illustration"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="w-full h-auto object-contain rounded-lg"
      />
    ),
  },
  {
    number: '03',
    title: 'Native Asset Custody',
    description:
      'We minimize counterparty risk by holding underlying assets in their native form. No complex bridges or wrapped tokens, just secure, on-chain custody.',
    visual: () => (
      <img
        src="/assets.png"
        alt="Native Asset Custody Illustration"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="w-full h-auto object-contain rounded-lg"
      />
    ),
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const CoreEngineSection: React.FC = () => {
  return (
    <motion.section
      className="text-white py-16 md:py-20 lg:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
    >
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <motion.h2
          className="text-[clamp(2rem,6vw,4.5rem)] text-center mb-4 italic"
          variants={itemVariants}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Institutional safety, retail simplicity.
        </motion.h2>

        <motion.p
          className="text-[clamp(1rem,3.2vw,1.25rem)] text-gray-400 text-center mb-10 md:mb-14 max-w-3xl mx-auto leading-relaxed italic"
          variants={itemVariants}
        >
          Our infrastructure is built on three pillars of trust, combining Jito&apos;s speed with
          mathematical verification.
        </motion.p>

        <div>
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              variants={itemVariants}
              viewport={{ once: true, amount: 0.22 }}
              style={{ fontFamily: 'var(--font-serif)' }}
              className={[
                // 常時2カラム（スマホでもPCと同じ構図）
                'relative grid grid-cols-2 items-start',
                // 余白をタイトに
                'gap-4 md:gap-10 lg:gap-16',
                // 行の高さも短めに
                'min-h-[32vh] md:min-h-[32vh] lg:min-h-[32vh]',
                'py-8 md:py-12',
                'overflow-visible', // 番号のはみ出しを許容
              ].join(' ')}
            >
              {/* Left: Visual（偶数/奇数で左右入替） */}
              <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                <div className="mx-auto w-[40vw] max-w-[380px]">
                  <div className="
                    [&>img]:w-full [&>img]:h-auto [&>img]:object-contain [&>img]:rounded-lg
                    [&>img]:max-h-[50vh]
                  ">
                    {feature.visual()}
                  </div>
                </div>
              </div>

              {/* Right: Text */}
              <div className={['relative', index % 2 === 0 ? 'order-2' : 'order-1'].join(' ')}>
                {/* ★ 番号：さらに上へ & やや濃くして視認性UP */}
                <span
                  className={[
                    'pointer-events-none select-none',
                    'absolute -top-16 md:-top-25 left-1 md:left-2',
                    'text-white/15',                 // ちょい濃く
                    'text-[clamp(6.5rem,30vw,13rem)] md:text-[clamp(4.5rem,12vw,10rem)]',
                    'leading-[0.8] font-extrabold',
                    'z-0',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {feature.number}
                </span>

                <h3 className="relative z-10 text-[clamp(1.25rem,3.2vw,2rem)] mb-3">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-[clamp(0.95rem,2.2vw,1.1rem)] text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CoreEngineSection;
