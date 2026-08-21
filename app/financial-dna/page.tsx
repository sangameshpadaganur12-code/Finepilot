'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { FinancialDnaCard } from '@/components/financial-dna-card';
import { useFinPilotData } from '@/lib/use-finpilot-data';
import { formatINR } from '@/lib/format';

export default function FinancialDnaPage() {
  const { financialProfile, loading } = useFinPilotData();

  return (
    <div className="min-h-screen bg-background">
      <SiteNav variant="app" />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Today
          </Link>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your Profile
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Financial DNA
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Your Financial DNA is the foundation for every recommendation FinPilot makes.
            It captures your risk temperament, timeline, and goals — distilled from your
            onboarding answers.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-10 space-y-4">
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-secondary/40" />
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-secondary/40" />
          </div>
        ) : (
          <>
            <div className="mt-10">
              <FinancialDnaCard profile={financialProfile} />
            </div>

            <motion.div
              className="mt-6 grid gap-4 sm:grid-cols-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estimated Monthly Income
                  </span>
                </div>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {formatINR(financialProfile.monthlyIncomeEstimated)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on your selected band: {financialProfile.monthlyIncomeBand}
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    What This Means
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  As a {financialProfile.riskProfile.toLowerCase()} investor with a{' '}
                  {financialProfile.investmentHorizon.toLowerCase().replace('years', 'yr')}{' '}
                  horizon, FinPilot will favor {financialProfile.liquidityPreference.toLowerCase()}{' '}
                  strategies aligned with your {financialProfile.primaryGoal.toLowerCase()} goal.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Go to Today Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Retake Onboarding
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
