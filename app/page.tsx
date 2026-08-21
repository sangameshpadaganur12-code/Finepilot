'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Target,
  TrendingUp,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { HeroVisual } from '@/components/hero-visual';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Understand your financial health',
    description:
      'A single score from 0–100, broken into cashflow, safety, investing, and goals — so you always know where you stand.',
  },
  {
    icon: Target,
    title: 'Simulate goals before you commit',
    description:
      'Set a home, retirement, or education goal and see exactly what it takes to get there. No guesswork.',
  },
  {
    icon: TrendingUp,
    title: 'Catch portfolio risks early',
    description:
      'FinPilot spots concentration, gaps, and imbalances across all your platforms — and tells you what to do next.',
  },
  {
    icon: MessageSquare,
    title: 'Ask your financial copilot',
    description:
      'Ask questions in plain English. Get clear, numbers-backed answers grounded in your own financial data.',
  },
];

const flow = [
  { label: 'Data', sub: 'Your money, organized' },
  { label: 'Understanding', sub: 'Clear, personalized' },
  { label: 'Simulation', sub: 'Test before you act' },
  { label: 'Decision', sub: 'Know what to do' },
  { label: 'Action', sub: 'Move with confidence' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav variant="landing" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 grid-bg fade-mask-b opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <motion.div
            className="flex flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered financial decision engine
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tightest text-balance sm:text-5xl lg:text-6xl">
              Your money is complicated.
              <br />
              <span className="text-primary">Your decisions shouldn&rsquo;t be.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              FinPilot turns your financial data into clear, personalized actions so you
              can make better money decisions with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                Build My Financial Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-7 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore Demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Built for the Indian market. Indian Rupee throughout.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            {flow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.sub}</p>
                </div>
                {i < flow.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground/40 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your money needs, in one place
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Not just another expense tracker. FinPilot is a decision engine that turns
            complexity into clarity.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <p.icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hype check highlight */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertCircle className="h-6 w-6 text-warning" />
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Cut through the social-media investment hype
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Paste any investment claim or reel you saw online. FinPilot&rsquo;s Hype Check
              breaks down whether the numbers hold up — so you decide with your head, not
              your feed.
            </p>
            <Link
              href="/hype-check"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Try Hype Check
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center sm:p-16">
          <div
            className="pointer-events-none absolute inset-0 grid-bg opacity-40"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Start with your Financial DNA
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
              Answer five quick questions and get a personalized financial profile, a
              health score, and three prioritized actions — in minutes.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Build My Financial Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            FinPilot &mdash; Your money is complicated. Your decisions shouldn&rsquo;t be.
          </p>
          <p className="text-xs text-muted-foreground">
            Demo data shown. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
