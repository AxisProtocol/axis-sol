'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  cols = 2,
  gap = 'md',
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5'
  };

  const gridGap = {
    sm: 'gap-4',
    md: 'gap-8',
    lg: 'gap-12'
  };

  const classes = `grid ${gridCols[cols]} ${gridGap[gap]} ${className}`;

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

export default DashboardGrid;
