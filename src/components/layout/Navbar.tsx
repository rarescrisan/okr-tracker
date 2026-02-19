'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';

const navItems = [
  { href: '/okr', label: 'OKR' },
  { href: '/work', label: 'Work' },
  { href: '/gantt', label: 'Timeline' },
  { href: '/discussions', label: 'Discussions' },
];

export function Navbar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdmin = role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#e8ecee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4573d2] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OKR</span>
              </div>
              <span className="font-semibold text-[#1e1f21] hidden sm:inline">Tracker</span>
            </Link>

            {/* Desktop Navigation */}
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
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="hidden sm:block px-3 py-2 text-sm font-medium text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded-md transition-colors"
                >
                  Admin
                </Link>
              )
            )}

            {/* Mobile menu button */}
            {!isAdminPath && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {!isAdminPath && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8ecee] bg-white">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-[#f6f8f9] text-[#4573d2]'
                      : 'text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded-md transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
