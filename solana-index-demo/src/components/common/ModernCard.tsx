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
      ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10' 
      : 'bg-base-200/40'
    }
    border border-base-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const hoverClasses = hover 
    ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20' 
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
