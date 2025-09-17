'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  gradient = false,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props 
}: ModernButtonProps) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-colors duration-150 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
      : 'bg-white text-black hover:bg-gray-50',
    secondary: 'bg-gray-800/50 text-white border border-gray-700/30 hover:bg-gray-700/50 hover:border-gray-600/50',
    outline: 'bg-transparent text-white border border-gray-600/50 hover:bg-gray-800/30 hover:border-gray-500/50',
    ghost: 'bg-transparent text-gray-400 hover:bg-gray-800/30 hover:text-white'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2 animate-spin" />
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default ModernButton;
