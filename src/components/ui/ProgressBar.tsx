'use client';

import { cn } from '@/src/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

function getProgressColor(value: number, customColor?: string): string {
  if (customColor) return customColor;
  if (value >= 100) return '#5da283';
  if (value >= 70) return '#4573d2';
  if (value >= 40) return '#f1bd6c';
  return '#f06a6a';
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, color, showLabel = false, size = 'md', ...props }, ref) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const progressColor = getProgressColor(clampedValue, color);

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        <div className={cn('flex-1 bg-[#e8ecee] rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${clampedValue}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-[#6d6e6f] min-w-[3rem] text-right">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
