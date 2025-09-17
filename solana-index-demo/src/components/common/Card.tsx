'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  const baseClasses = 'bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 transition-all duration-300';
  const hoverClasses = hoverEffect ? 'hover:bg-gray-800/60 hover:border-gray-700/60 hover:shadow-2xl hover:shadow-blue-500/10' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;
  
  if (onClick) {
    return (
      <motion.div
        className={classes}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className={classes}
      whileHover={hoverEffect ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
