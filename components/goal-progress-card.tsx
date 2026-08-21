'use client';

import { motion } from 'framer-motion';
import {
  Home,
  Shield,
  PiggyBank,
  GraduationCap,
  Plane,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { formatINR, formatINRShort } from '@/lib/format';
import { goalProgress } from '@/lib/finance';
import { cn } from '@/lib/utils';
import type { Goal } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  shield: Shield,
  'piggy-bank': PiggyBank,
  education: GraduationCap,
  travel: Plane,
  default: Target,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? iconMap.default;
}

export function GoalProgressCard({
  goal,
  index = 0,
}: {
  goal: Goal;
  index?: number;
}) {
  const Icon = getIcon(goal.icon);
  const progress = Math.max(0, Math.min(100, goalProgress(goal)));
  const yearsLeft = Math.max(0, goal.targetYear - new Date().getFullYear());

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{goal.name}</h3>
            <p className="text-xs text-muted-foreground">Target {goal.targetYear}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {yearsLeft > 0 ? `${yearsLeft} yrs left` : 'Due now'}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-display text-xl font-bold tabular-nums">
            {formatINRShort(goal.currentAmount)}
          </span>
          <span className="text-sm text-muted-foreground">
            / {formatINRShort(goal.targetAmount)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className={cn('h-full rounded-full bg-primary')}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.08 }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatINR(goal.monthlyContribution)}/mo
          </span>
          <span className="font-semibold tabular-nums">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function GoalProgressList({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal, i) => (
        <GoalProgressCard key={goal.id} goal={goal} index={i} />
      ))}
    </div>
  );
}
