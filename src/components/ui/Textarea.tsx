'use client';

import { cn } from '@/src/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[#A0A8C8] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-md border transition-colors resize-y min-h-[80px]',
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

Textarea.displayName = 'Textarea';

export { Textarea };
