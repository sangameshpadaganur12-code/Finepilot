'use client';

import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/lib/types';

const severityConfig = {
  warning: {
    icon: AlertTriangle,
    ring: 'ring-warning/20',
    badge: 'bg-warning/10 text-warning',
    iconColor: 'text-warning',
  },
  info: {
    icon: Info,
    ring: 'ring-primary/20',
    badge: 'bg-primary/10 text-primary',
    iconColor: 'text-primary',
  },
  critical: {
    icon: ShieldAlert,
    ring: 'ring-destructive/20',
    badge: 'bg-destructive/10 text-destructive',
    iconColor: 'text-destructive',
  },
} as const;

interface ActionCardProps {
  recommendation: Recommendation;
  index?: number;
  onAction?: () => void;
}

export function ActionCard({ recommendation, index = 0, onAction }: ActionCardProps) {
  const config = severityConfig[recommendation.severity];
  const Icon = config.icon;

  return (
    <motion.article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 ring-1 ring-transparent transition-all hover:border-border/80 hover:shadow-md sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1',
              config.ring,
              config.badge
            )}
          >
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </span>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {recommendation.category}
            </span>
            <h3 className="font-display text-base font-semibold leading-tight">
              {recommendation.title}
            </h3>
          </div>
        </div>
        {recommendation.metricValue && (
          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-bold tabular-nums">
              {recommendation.metricValue}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {recommendation.metricLabel}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p className="text-foreground">{recommendation.whatHappened}</p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground/80">Why it matters: </span>
          {recommendation.whyItMatters}
        </p>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        {recommendation.ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.article>
  );
}
