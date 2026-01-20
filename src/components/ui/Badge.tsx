'use client';

import { cn } from '@/src/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  dot?: boolean;
}

const variantClasses = {
  default: 'bg-[#e8ecee] text-[#6d6e6f]',
  success: 'bg-[#e8f5e9] text-[#5da283]',
  warning: 'bg-[#fff8e1] text-[#f1bd6c]',
  danger: 'bg-[#ffebee] text-[#f06a6a]',
  info: 'bg-[#e3f2fd] text-[#4573d2]',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', color, dot, children, style, ...props }, ref) => {
    const customStyle = color
      ? { backgroundColor: `${color}20`, color, ...style }
      : style;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
          !color && variantClasses[variant],
          className
        )}
        style={customStyle}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={color ? { backgroundColor: color } : undefined}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
