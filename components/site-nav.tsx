'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FinPilotLogo } from './finpilot-logo';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const [userName, setUserName] = useState<string | null>(null);

  // Fetch user name on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('greeting_name')
        .eq('id', user.id)
        .maybeSingle();
      setUserName(profile?.greeting_name || user.email?.split('@')[0] || 'User');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Trigger fetch on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    fetchUser();
  }, []);

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
                href="/auth/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{userName || 'User'}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex w-full items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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

import React from 'react';