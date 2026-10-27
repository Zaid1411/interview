import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#837D7D] tracking-wider uppercase">
            {label}
          </label>
        )}
        <div className="relative rounded-2xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#837D7D]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-2xl border bg-[#FAF8F8] px-4 py-2.5 text-sm text-[#181212] placeholder-[#837D7D] transition-all duration-200 focus:outline-hidden focus:border-[#2D80FD] focus:bg-white disabled:bg-neutral-100 disabled:text-neutral-400 ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-[#EAEAEA] hover:border-[#D5D5D5]'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-[#837D7D] mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
