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
            'w-4 h-4 rounded border-[#e8ecee] text-[#4573d2]',
            'focus:ring-2 focus:ring-[#4573d2] focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-[#1e1f21]">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
