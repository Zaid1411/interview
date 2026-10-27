import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'medium' | 'hard' | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  glow = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-normal',
    md: 'text-xs px-3 py-1 rounded-full font-medium tracking-normal',
  };

  const variantStyles = {
    easy: 'bg-[#EBF9F0] text-[#0E7A36] border border-[#BEE8CA]',
    medium: 'bg-[#FFF7E6] text-[#A36600] border border-[#FFE3A8]',
    hard: 'bg-[#FEECEF] text-[#C41C35] border border-[#FAC3C9]',
    success: 'bg-[#EBF9F0] text-[#0E7A36] border border-[#BEE8CA]',
    warning: 'bg-[#FFF7E6] text-[#A36600] border border-[#FFE3A8]',
    danger: 'bg-[#FEECEF] text-[#C41C35] border border-[#FAC3C9]',
    info: 'bg-[#EDF5FF] text-[#2D80FD] border border-[#D5E5FC]',
    brand: 'bg-[#EDF5FF] text-[#2D80FD] border border-[#D5E5FC]',
    default: 'bg-[#FAF8F8] text-[#837D7D] border border-[#EAEAEA]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors font-mono ${sizeStyles[size]} ${variantStyles[variant]} ${
        glow ? 'shadow-xs' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty?: string; className?: string }> = ({
  difficulty = 'Easy',
  className = '',
}) => {
  const safeDifficulty = difficulty || 'Easy';
  const lower = safeDifficulty.toLowerCase();
  const variant = lower === 'easy' ? 'easy' : lower === 'medium' ? 'medium' : 'hard';
  return (
    <Badge variant={variant} className={className}>
      {safeDifficulty}
    </Badge>
  );
};
