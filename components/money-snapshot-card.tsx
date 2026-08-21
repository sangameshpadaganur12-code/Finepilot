'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  LineChart,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { formatINR, formatINRShort } from '@/lib/format';
import type { MoneySnapshot } from '@/lib/types';

interface SnapshotItemProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'positive' | 'negative' | 'neutral' | 'accent';
  delay?: number;
  isShort?: boolean;
}

const toneStyles: Record<SnapshotItemProps['tone'], { iconBg: string; iconColor: string }> = {
  positive: { iconBg: 'bg-success/10', iconColor: 'text-success' },
  negative: { iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
  neutral: { iconBg: 'bg-secondary', iconColor: 'text-foreground' },
  accent: { iconBg: 'bg-primary/10', iconColor: 'text-primary' },
};

function SnapshotItem({ label, value, icon: Icon, tone, delay = 0, isShort }: SnapshotItemProps) {
  const style = toneStyles[tone];
  return (
    <motion.div
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.iconBg}`}>
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="font-display text-base font-bold tabular-nums sm:text-lg">
        {isShort ? formatINRShort(value) : formatINR(value)}
      </span>
    </motion.div>
  );
}

export function MoneySnapshotCard({ snapshot }: { snapshot: MoneySnapshot }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SnapshotItem
        label="Income"
        value={snapshot.income}
        icon={ArrowDownLeft}
        tone="positive"
        delay={0}
      />
      <SnapshotItem
        label="Expenses"
        value={snapshot.expenses}
        icon={ArrowUpRight}
        tone="negative"
        delay={0.06}
      />
      <SnapshotItem
        label="Savings"
        value={snapshot.savings}
        icon={PiggyBank}
        tone="accent"
        delay={0.12}
      />
      <SnapshotItem
        label="Investments"
        value={snapshot.investments}
        icon={LineChart}
        tone="accent"
        delay={0.18}
      />
      <motion.div
        className="sm:col-span-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </span>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Net Financial Assets
              </span>
              <p className="text-xs text-muted-foreground/70">Across all platforms</p>
            </div>
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-primary sm:text-2xl">
            {formatINRShort(snapshot.netFinancialAssets)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
