'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: React.ReactNode;
  id: string;
}

const Section = ({ children, id }: SectionProps) => (
  <section
    id={id}
    className="w-full min-h-screen flex justify-center items-center py-32 px-6 relative"
    style={{ minHeight: '100vh' }}
  >
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-[1200px]"
    >
      {children}
    </motion.div>
  </section>
);

export default Section;
