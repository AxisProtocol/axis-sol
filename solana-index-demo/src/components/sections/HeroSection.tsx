// HeroSection.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '../common';
import WaitlistForm from '../waitlist/WaitlistForm';

const HeroSection = () => (
  <section
  className="relative isolate left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen
             min-h-screen object-center overflow-hidden">
  <div className="absolute inset-0 -z-10 
  [mask-image:linear-gradient(to_bottom,transparent,black_4%,black_4%,transparent)]
  [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_8%,black_4%,transparent)]">
  <Image
    src="/hero-bg.png"
    alt=""
    fill
    priority
    sizes="100vw"
    className="object-cover w-full h-full"
    aria-hidden
  />
  <div className="absolute inset-0 bg-black/40" aria-hidden />
  </div>

    {/* コンテンツは中央寄せ＋幅制限 */}
    <div className="relative z-10 flex min-h-screen items-center justify-center">
      <div className="container italic mx-auto px-6 text-center">
        <motion.h1 className="text-white font-bold tracking-tight leading-tight text-[clamp(2rem,10vw,4rem)] mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Axis is solana’s first on-chain index
        </motion.h1>

        <motion.p className="text-gray-300 mb-12 max-w-[600px] mx-auto text-[clamp(1rem,4vw,1.25rem)] leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          Your smartest move? Do nothing. <br /> Own the top five cryptos with one token
        </motion.p>

        <motion.div className="flex gap-6 justify-center flex-wrap"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
          <Button href="/dashboard" variant="primary" size="lg">Launch App</Button>
        </motion.div>

        <WaitlistForm />
      </div>
    </div>
  </section>
);

export default HeroSection;
