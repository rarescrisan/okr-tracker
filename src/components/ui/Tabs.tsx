'use client';

import { cn } from '@/src/lib/utils';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-[#e8ecee]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'text-[#4573d2]'
              : 'text-[#6d6e6f] hover:text-[#1e1f21]'
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4573d2]" />
          )}
        </button>
      ))}
    </div>
  );
}
