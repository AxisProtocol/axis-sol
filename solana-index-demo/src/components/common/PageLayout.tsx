'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import ModernFooter from './ModernFooter';
import Particles from 'react-tsparticles';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { particlesOptions } from '../../utils/particles';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showParticles?: boolean;
}

const PageLayout = ({ 
  children, 
  title, 
  description, 
  showParticles = true 
}: PageLayoutProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <Navbar />
      
      {showParticles && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        />
      )}

      <motion.main 
        className="pt-14 min-h-screen relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      
      <ModernFooter />
    </div>
  );
};

export default PageLayout;
