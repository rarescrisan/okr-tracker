'use client';

import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1e1f21]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#6d6e6f]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
