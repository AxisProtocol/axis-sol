'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PoweredBySection() {
  return (
    <motion.div 
      className="flex items-center gap-2 mb-12 text-sm justify-center" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <p className="text-gray-400">Powered by&nbsp;</p>
      <Image src="/magicblock-logo.png" alt="MagicBlock" width={180} height={32} />
    </motion.div>
  );
}
