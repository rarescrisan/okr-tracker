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
          <label htmlFor={textareaId} className="block text-sm font-medium text-[#1e1f21] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-md border transition-colors resize-y min-h-[80px]',
            'bg-white text-[#1e1f21] placeholder-[#9ca0a4]',
            'focus:outline-none focus:ring-2 focus:ring-[#4573d2] focus:border-transparent',
            'disabled:bg-[#f6f8f9] disabled:cursor-not-allowed',
            error ? 'border-[#f06a6a]' : 'border-[#e8ecee]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[#f06a6a]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
