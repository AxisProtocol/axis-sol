// CoreEngineSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    number: '01',
    title: 'Atomic Rebalancing via JitoBAM',
    description:
      'Rebalancing is safe, automated, and atomic. By using Jito bundles, we execute oracle updates, rebalancing, and swaps in one indivisible transaction, eliminating MEV risk.',
    visual: () => (
        <div className="flex items-center justify-center gap-6 md:gap-10 lg:gap-12">
        <motion.div className="scale-[1.1] md:scale-[1.2] lg:scale-[1.25]">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/jito-logo.png"
            alt="Jito Logo"
            className="h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56 rounded-lg object-contain"
            loading="lazy"
          />
        </motion.div>
      
        <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-500">
            
        </span>
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/BAM.png"
          alt="BAM Logo"
          className="h-24 w-24 md:h-32 md:w-32 rounded-lg object-contain"
          loading="lazy"
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
        className="w-full h-auto max-w-xl md:max-w-2xl rounded-lg object-cover"
        loading="lazy"
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
        className="w-full h-auto max-w-xl md:max-w-2xl rounded-lg object-cover"
        loading="lazy"
      />
    ),
  },
];

// animations
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const CoreEngineSection: React.FC = () => {
  return (
    <motion.section
      className="text-white py-24 lg:py-32" // ← 背景は透明（他セクションに合わせる）
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <motion.h2
          className="text-[clamp(2.2rem,6vw,7rem)]  text-center mb-6 italic"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVariants}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Institutional safety, retail simplicity.
        </motion.h2>

        <motion.p
          className="text-[clamp(1rem,3.2vw,1.5rem)] text-gray-400 text-center mb-20 lg:mb-28 max-w-3xl mx-auto leading-relaxed italic"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVariants}
          
        >
          Our infrastructure is built on three pillars
          of trust, combining Jito&apos;s speed with mathematical verification.
        </motion.p>

        <div>
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              className={`relative flex flex-col md:flex-row items-center gap-12 lg:gap-20 min-h-[70vh] lg:min-h-[80vh] py-16 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              <span
                className="pointer-events-none select-none absolute -top-8 md:-top-10 -left-2 md:-left-6
                           text-[clamp(6rem,14vw,16rem)] leading-[0.8]
                           font-extrabold text-white/10"
                aria-hidden="true"
              >
                {feature.number}
              </span>

              {/* Left: Text */}
              <div className="w-full md:w-1/2 relative">
                <h3 className="text-[clamp(1.8rem,4.5vw,2.8rem)]  mb-5 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-[clamp(1rem,2.6vw,1.2rem)] text-gray-300 leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </div>

              {/* Right: Visual */}
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <div className="scale-[1.05] md:scale-[1.12]">
                  {feature.visual()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CoreEngineSection;
