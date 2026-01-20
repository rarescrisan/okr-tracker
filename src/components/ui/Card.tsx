'use client';

import { cn } from '@/src/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', shadow = true, border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg',
          paddingClasses[padding],
          shadow && 'shadow-sm',
          border && 'border border-[#e8ecee]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
