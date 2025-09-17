'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  typewriterText: string;
}

const LoadingScreen = ({ typewriterText }: LoadingScreenProps) => (
  <motion.div
    className="fixed inset-0 bg-black flex items-center justify-center z-[1000]"
    exit={{ opacity: 0, filter: 'blur(20px)' }}
    transition={{ duration: 1.2, ease: 'circOut' }}
  >
    <div className="text-white text-center p-4 text-[clamp(2rem,10vw,6rem)] font-bold">
      {typewriterText}
      <span className="inline-block w-[0.1em] ml-[0.1em] bg-white animate-blink-cursor"></span>
    </div>
  </motion.div>
);

export default LoadingScreen;
