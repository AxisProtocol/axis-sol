'use client';

import { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  dark?: boolean;
  onClick?: () => void;
}

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  dark = false,
  onClick 
}: ModernCardProps) => {
  const baseClasses = `
    relative rounded-lg p-3 sm:p-4
    ${gradient 
      ? dark 
        ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50' 
        : 'bg-gradient-to-br from-gray-800/50 to-gray-700/50'
      : dark 
        ? 'bg-gray-800/30' 
        : 'bg-gray-800/30'
    }
    ${dark 
      ? 'border border-gray-700/30' 
      : 'border border-gray-700/30'
    }
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const hoverClasses = hover 
    ? dark 
      ? 'hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-900/20' 
      : 'hover:border-gray-300 hover:shadow-lg' 
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ModernCard;
