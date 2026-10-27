import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus:outline-hidden disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#181212] text-white hover:bg-[#2D80FD] transition-colors shadow-xs',
    brand:
      'bg-[#2D80FD] text-white hover:bg-[#1A6FEF] shadow-xs shadow-blue-500/20',
    secondary:
      'bg-[#FAF8F8] text-[#181212] hover:bg-neutral-100 border border-[#EAEAEA]',
    outline:
      'bg-transparent text-[#181212] hover:bg-[#FAF8F8] border border-[#EAEAEA]',
    danger:
      'bg-[#FEECEF] text-[#C41C35] hover:bg-[#FCD8DD] border border-[#FAC3C9]',
    success:
      'bg-[#EBF9F0] text-[#0E7A36] hover:bg-[#D8F3E0] border border-[#BEE8CA]',
    ghost:
      'bg-transparent text-[#837D7D] hover:text-[#181212] hover:bg-[#FAF8F8]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
