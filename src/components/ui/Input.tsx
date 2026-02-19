'use client';

import { cn } from '@/src/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#A0A8C8] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 text-sm rounded-md border transition-colors',
            'bg-[#1A1F36] text-white placeholder-[#6B7394]',
            'focus:outline-none focus:ring-2 focus:ring-[#00C8FF] focus:border-transparent',
            'disabled:bg-[#2A3152] disabled:cursor-not-allowed',
            error ? 'border-[#FF4D6A]' : 'border-white/[0.12]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[#FF4D6A]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
