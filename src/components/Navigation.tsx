'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/people', label: 'People' },
  { href: '/blog', label: 'Blog' },
  { href: '/research', label: 'Research' },
  { href: '/contact', label: 'Contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--cloud)] bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm tracking-tight text-[var(--black)] uppercase hover:text-[var(--pro-indigo)] transition-colors cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]">
          Data Lab by Protege
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-mono text-xs uppercase tracking-wide transition-colors hover:text-[var(--pro-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)] ${
                pathname.startsWith(item.href) ? 'text-[var(--pro-indigo)]' : 'text-[var(--muted)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden p-3 -mr-1 text-[var(--muted)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[var(--cloud)] bg-white animate-slide-down">
          <div className="mx-auto max-w-5xl px-6 py-2 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-mono text-sm uppercase tracking-wide transition-colors hover:text-[var(--pro-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)] py-3 ${
                  pathname.startsWith(item.href) ? 'text-[var(--pro-indigo)]' : 'text-[var(--muted)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
