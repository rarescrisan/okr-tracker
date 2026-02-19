'use client';

import { cn } from '@/src/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  color?: string;
  dot?: boolean;
}

const variantClasses = {
  default: 'bg-white/[0.08] text-[#A0A8C8]',
  success: 'bg-[#2DD4A8]/[0.15] text-[#2DD4A8]',
  warning: 'bg-[#FFB020]/[0.15] text-[#FFB020]',
  danger: 'bg-[#FF4D6A]/[0.15] text-[#FF4D6A]',
  info: 'bg-[#00C8FF]/[0.12] text-[#00C8FF]',
  outline: 'bg-transparent border border-white/[0.15] text-[#A0A8C8]',
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
