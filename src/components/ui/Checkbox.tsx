'use client';

import { cn } from '@/src/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={cn('flex items-center gap-2 cursor-pointer', className)}
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            'w-4 h-4 rounded border-white/[0.15] text-[#00C8FF]',
            'focus:ring-2 focus:ring-[#00C8FF] focus:ring-offset-0 focus:ring-offset-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-white">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
