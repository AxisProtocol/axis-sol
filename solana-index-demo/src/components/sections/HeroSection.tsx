'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common';
import WaitlistForm from '../waitlist/WaitlistForm';

const HeroSection = () => (
  <div className="text-center">
    <motion.h1
      className="text-white font-extrabold tracking-tight leading-tight text-[clamp(2rem,10vw,4rem)] mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      Axis is building the S&P 500 of Solana
    </motion.h1>

    <motion.p
      className="text-gray-300 mb-12 max-w-[600px] mx-auto text-[clamp(1rem,4vw,1.25rem)] leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      a trusted crypto index that lets investors gain diversified exposure to the digital asset market with a single token.
    </motion.p>

    <motion.div
      className="flex gap-6 justify-center flex-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <Button
        href="/dashboard"
        variant="primary"
        size="lg"
      >
        Launch App
      </Button>

      <Button
        href="https://acrobat.adobe.com/id/urn:aaid:sc:AP:576b9b2d-51bb-4c45-9dae-82d78bf332e6"
        variant="outline"
        size="lg"
        external
      >
        Pitch Deck →
      </Button>
    </motion.div>
    <motion.p
      className="text-white font-extrabold tracking-tight leading-tight text-[clamp(1rem,5vw,2rem)] mt-15 mb-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      Join the waitlist
    </motion.p>
    <WaitlistForm />
  </div>
);

export default HeroSection;
