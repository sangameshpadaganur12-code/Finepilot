'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { HealthScoreGauge, ScoreBar } from '@/components/health-score-gauge';
import { ActionCard } from '@/components/action-card';
import { GoalProgressList } from '@/components/goal-progress-card';
import { MoneySnapshotCard } from '@/components/money-snapshot-card';
import { useFinPilotData } from '@/lib/use-finpilot-data';
import {
  financialHealthScore,
  greetingFor,
  buildMoneySnapshot,
  averageSavingsRate,
} from '@/lib/finance';
import { formatPercent } from '@/lib/format';

export default function DashboardPage() {
  const {
    profile,
    transactions,
    holdings,
    goals,
    recommendations,
    loading,
  } = useFinPilotData();

  const health = financialHealthScore(transactions, holdings, goals);
  const snapshot = buildMoneySnapshot(transactions, holdings);
  const savingsRate = averageSavingsRate(transactions);
  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav variant="app" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Greeting */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {greetingFor(profile)}
            <span className="ml-1.5" aria-hidden="true">
              👋
            </span>
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Here&rsquo;s what matters about your money today.
          </p>
        </motion.header>

        {loading ? (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-secondary/40" />
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-secondary/40 lg:col-span-2" />
            </div>
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-secondary/40" />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {/* Health Score + Pillars */}
            <section
              aria-label="Financial Health Score"
              className="grid gap-6 lg:grid-cols-3"
            >
              <motion.div
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 sm:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <HealthScoreGauge score={health.total} />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Financial Health Score
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Savings rate {formatPercent(savingsRate)}
                </div>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Score Breakdown</h2>
                  <span className="text-xs text-muted-foreground">
                    Weighted across 4 pillars
                  </span>
                </div>
                <div className="space-y-5">
                  <ScoreBar label="Cashflow" value={health.cashflow} delay={0.2} />
                  <ScoreBar label="Safety" value={health.safety} delay={0.3} />
                  <ScoreBar label="Investing" value={health.investing} delay={0.4} />
                  <ScoreBar label="Goals" value={health.goals} delay={0.5} />
                </div>
              </motion.div>
            </section>

            {/* Prioritized Actions */}
            <section aria-label="Prioritized Financial Actions">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    What to focus on
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Three prioritized actions, ranked by impact.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {sortedRecs.slice(0, 3).map((rec, i) => (
                  <ActionCard key={rec.id} recommendation={rec} index={i} />
                ))}
              </div>
            </section>

            {/* Goal Progress */}
            <section aria-label="Goal Progress">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    Goal Progress
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tracking {goals.length} active goals.
                  </p>
                </div>
                <Link
                  href="/goals"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <GoalProgressList goals={goals} />
            </section>

            {/* Money Snapshot */}
            <section aria-label="Money Snapshot">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    Money Snapshot
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This month, at a glance.
                  </p>
                </div>
                <Link
                  href="/spending"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <MoneySnapshotCard snapshot={snapshot} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
