'use client';

import { cn, getInitials } from '@/src/lib/utils';
import { COLORS } from '@/src/lib/constants';
import { HTMLAttributes, forwardRef } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS.avatars[Math.abs(hash) % COLORS.avatars.length];
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'md', ...props }, ref) => {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded-full font-medium text-white overflow-hidden',
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: bgColor }}
        title={name}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
