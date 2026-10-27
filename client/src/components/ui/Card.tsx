import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#EAEAEA] rounded-[32px] p-6 text-[#181212] transition-all duration-200 ${
        hover ? 'hover:border-[#2D80FD] hover:shadow-xs' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
