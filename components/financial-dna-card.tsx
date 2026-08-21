'use client';

import { motion } from 'framer-motion';
import {
  Gauge,
  Clock,
  Target,
  TrendingUp,
  Droplets,
  ShieldCheck,
} from 'lucide-react';
import type { FinancialProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DnaTraitProps {
  label: string;
  value: string;
  icon: typeof Gauge;
  delay?: number;
  accent?: boolean;
}

function DnaTrait({ label, value, icon: Icon, delay = 0, accent }: DnaTraitProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-4',
        accent ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'
      )}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', accent ? 'text-primary' : 'text-muted-foreground')} />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="font-display text-lg font-semibold leading-tight">{value}</span>
    </motion.div>
  );
}

export function FinancialDnaCard({
  profile,
  compact = false,
}: {
  profile: FinancialProfile;
  compact?: boolean;
}) {
  const traits: DnaTraitProps[] = [
    { label: 'Risk Profile', value: profile.riskProfile, icon: Gauge, accent: true },
    { label: 'Investment Horizon', value: profile.investmentHorizon, icon: Clock },
    { label: 'Primary Goal', value: profile.primaryGoal, icon: Target },
    { label: 'Experience', value: profile.experience, icon: TrendingUp },
    { label: 'Liquidity Preference', value: profile.liquidityPreference, icon: Droplets },
  ];

  return (
    <div className={cn(compact ? '' : 'rounded-2xl border border-border bg-card p-6 sm:p-8')}>
      {!compact && (
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Your Financial DNA</h2>
        </div>
      )}
      <div className={cn('grid gap-3', compact ? '' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {traits.map((t, i) => (
          <DnaTrait key={t.label} {...t} delay={i * 0.07} />
        ))}
        {!compact && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Risk Tolerance Score
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold tabular-nums">
                {profile.riskScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${profile.riskScore}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
