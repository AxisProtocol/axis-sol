'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  title: string;
  description: string;
  logoSrc: string;
}

export default function DashboardHeader({ title, description, logoSrc }: DashboardHeaderProps) {
  return (
    <div className="text-center mb-12">
      <motion.h1 
        className="m-0 leading-tight text-4xl md:text-6xl font-bold tracking-tighter flex items-center justify-center gap-4 md:gap-6 mb-6" 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
      >
        <Image src={logoSrc} alt="Logo" width={250} height={200} priority />
      </motion.h1>

      <motion.p 
        className="my-4 mb-8 leading-relaxed text-lg md:text-xl text-gray-400 text-center max-w-[600px] mx-auto" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {description}
      </motion.p>
    </div>
  );
}
