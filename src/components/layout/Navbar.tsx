'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';

const navItems = [
  { href: '/okr', label: 'OKR Dashboard' },
  { href: '/work', label: 'Work Tracker' },
  { href: '/gantt', label: 'Timeline' },
];

export function Navbar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdmin = role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#e8ecee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4573d2] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OKR</span>
              </div>
              <span className="font-semibold text-[#1e1f21]">Tracker</span>
            </Link>

            {!isAdminPath && (
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-[#f6f8f9] text-[#4573d2]'
                          : 'text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9]'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              isAdminPath ? (
                <Link
                  href="/okr"
                  className="px-3 py-2 text-sm font-medium text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded-md transition-colors"
                >
                  View Dashboard
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded-md transition-colors"
                >
                  Admin
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
