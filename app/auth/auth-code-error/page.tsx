'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { FinPilotLogo } from '@/components/finpilot-logo';

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
        <p className="mt-3 text-muted-foreground">
          The sign-up link has expired or is invalid. This can happen if the link was already
          used or if it&apos;s been more than 24 hours since the email was sent.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Sign Up Again
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Sign In Instead
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}