'use client';

import { cn } from '@/src/lib/utils';
import { ReactNode, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  maxHeight?: number;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', footer, maxHeight }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full mx-4 bg-white rounded-lg shadow-xl flex flex-col',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size]
        )}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ecee] shrink-0">
            <h2 className="text-lg font-semibold text-[#1e1f21]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={cn('px-6 py-4', maxHeight && 'overflow-y-auto flex-1')}>{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e8ecee] bg-[#f6f8f9] rounded-b-lg shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
