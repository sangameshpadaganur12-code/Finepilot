'use client';

import { motion } from 'framer-motion';
import { scoreBand } from '@/lib/finance';
import { cn } from '@/lib/utils';

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  animate?: boolean;
}

const toneColor: Record<string, string> = {
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  critical: 'hsl(var(--destructive))',
};

/**
 * A radial gauge that visualizes the Financial Health Score (0-100).
 * Uses an SVG arc with a smooth animated fill.
 */
export function HealthScoreGauge({
  score,
  size = 200,
  label = 'Health Score',
  animate = true,
}: HealthScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const band = scoreBand(clamped);
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // 3/4 arc gauge — gap at the bottom
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const dashOffset = arcLength * (1 - clamped / 100);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} out of 100, ${band.label}`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-[225deg]"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneColor[band.tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={animate ? { strokeDashoffset: arcLength } : false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-5xl font-bold tracking-tight"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {clamped}
        </motion.span>
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {band.label}
        </span>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  delay?: number;
}

/**
 * A horizontal pillar bar (Cashflow, Safety, etc.)
 */
export function ScoreBar({ label, value, delay = 0 }: ScoreBarProps) {
  const band = scoreBand(value);
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-display text-sm font-semibold tabular-nums">
          {clamped}
          <span className="text-muted-foreground">/100</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn('h-full rounded-full')}
          style={{ backgroundColor: toneColor[band.tone] }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
        />
      </div>
    </div>
  );
}
