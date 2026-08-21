'use client';

import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';

interface ModulePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
}

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  highlights,
}: ModulePlaceholderProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav variant="app" />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            {description}
          </p>
        </motion.div>

        <motion.div
          className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            What you&rsquo;ll be able to do here
          </p>
          <ul className="mt-4 space-y-3">
            {highlights.map((h, i) => (
              <motion.li
                key={h}
                className="flex items-start gap-3 text-sm text-foreground"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
