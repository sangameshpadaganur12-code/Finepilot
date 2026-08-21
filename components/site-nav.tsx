'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FinPilotLogo } from './finpilot-logo';

const navItems = [
  { href: '/dashboard', label: 'Today' },
  { href: '/goals', label: 'Goals' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/spending', label: 'Spending' },
  { href: '/decision-lab', label: 'Decision Lab' },
  { href: '/copilot', label: 'Copilot' },
  { href: '/hype-check', label: 'Hype Check' },
];

export function SiteNav({ variant = 'app' }: { variant?: 'landing' | 'app' }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={variant === 'landing' ? '/' : '/dashboard'}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="FinPilot home"
        >
          <FinPilotLogo className="h-7 w-7" />
          <span className="font-display text-lg font-bold tracking-tight">
            FinPilot
          </span>
        </Link>

        {variant === 'app' && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {variant === 'landing' ? (
            <>
              <Link
                href="/onboarding"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Explore Demo
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              href="/settings"
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Settings
            </Link>
          )}
        </div>
      </div>

      {variant === 'app' && (
        <nav
          className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden"
          aria-label="Mobile"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
