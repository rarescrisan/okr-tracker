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
  if (value >= 100) return '#2DD4A8';
  if (value >= 70) return '#00C8FF';
  if (value >= 40) return '#FFB020';
  return '#FF4D6A';
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, color, showLabel = false, size = 'md', ...props }, ref) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const progressColor = getProgressColor(clampedValue, color);

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        <div className={cn('flex-1 bg-white/[0.10] rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${clampedValue}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-[#A0A8C8] min-w-[3rem] text-right">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
