'use client';

import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Target,
  TrendingUp,
} from 'lucide-react';
import { formatINRShort } from '@/lib/format';

/**
 * A premium, self-contained fintech hero visual.
 * Shows a financial health score, money flow, and goal progress
 * in a layered card composition — no external images required.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Soft ambient glow */}
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Main health score card */}
      <motion.div
        className="relative rounded-2xl border border-border bg-card p-6 shadow-xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Financial Health
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold tracking-tight">78</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div
            className="relative flex h-20 w-20 items-center justify-center"
            aria-hidden="true"
          >
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - 0.78) }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-success">78%</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { label: 'Cashflow', value: 82, color: 'bg-success' },
            { label: 'Safety', value: 64, color: 'bg-warning' },
            { label: 'Investing', value: 79, color: 'bg-primary' },
            { label: 'Goals', value: 73, color: 'bg-primary' },
          ].map((bar, i) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">{bar.label}</span>
                <span className="font-semibold tabular-nums">{bar.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={`h-full rounded-full ${bar.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ duration: 0.9, delay: 0.6 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating: Money flow card */}
      <motion.div
        className="absolute -right-4 -top-6 w-44 rounded-xl border border-border bg-card p-4 shadow-lg sm:-right-12"
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-success/10">
            <ArrowDownLeft className="h-4 w-4 text-success" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Income</span>
        </div>
        <p className="mt-2 font-display text-base font-bold tabular-nums">
          {formatINRShort(88000)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10">
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Expenses</span>
        </div>
        <p className="mt-2 font-display text-base font-bold tabular-nums">
          {formatINRShort(40000)}
        </p>
      </motion.div>

      {/* Floating: Goal card */}
      <motion.div
        className="absolute -bottom-8 -left-4 w-48 rounded-xl border border-border bg-card p-4 shadow-lg sm:-left-12"
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </span>
          <span className="text-xs font-semibold">Home Goal</span>
        </div>
        <p className="mt-2 font-display text-base font-bold tabular-nums">
          {formatINRShort(3200000)}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            / {formatINRShort(5000000)}
          </span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: '64%' }}
            transition={{ duration: 0.9, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Target 2031</p>
      </motion.div>

      {/* Floating: Net assets chip */}
      <motion.div
        className="absolute -right-2 bottom-12 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <Wallet className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold tabular-nums">
          {formatINRShort(1390000)} net
        </span>
      </motion.div>

      {/* Floating: trend chip */}
      <motion.div
        className="absolute -left-2 top-16 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <TrendingUp className="h-3.5 w-3.5 text-success" />
        <span className="text-xs font-semibold">Savings rate 54%</span>
      </motion.div>
    </div>
  );
}
