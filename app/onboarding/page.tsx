'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Home,
  TrendingUp,
  TrendingDown,
  Target,
  GraduationCap,
  Shield,
  PiggyBank,
  MoreHorizontal,
  Clock,
  Wallet,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { deriveFinancialDna } from '@/lib/finance';
import type {
  IncomeBand,
  InvestmentHorizon,
  Experience,
  PrimaryGoal,
  RiskReaction,
} from '@/lib/types';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface Option<T> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

const goalOptions: Option<PrimaryGoal>[] = [
  { value: 'Build Wealth', label: 'Build Wealth', icon: TrendingUp },
  { value: 'Buy a Home', label: 'Buy a Home', icon: Home },
  { value: 'Retirement', label: 'Retirement', icon: PiggyBank },
  { value: 'Education', label: 'Education', icon: GraduationCap },
  { value: 'Emergency Fund', label: 'Emergency Fund', icon: Shield },
  { value: 'Other', label: 'Other', icon: MoreHorizontal },
];

const reactionOptions: Option<RiskReaction>[] = [
  { value: 'sell', label: 'I would sell immediately', description: 'Protect what I have' },
  { value: 'wait', label: 'I would wait and observe', description: 'Let the dust settle' },
  { value: 'invest-more', label: 'I would invest more', description: 'Buy the dip' },
];

const horizonOptions: Option<InvestmentHorizon>[] = [
  { value: 'Less than 1 year', label: 'Less than 1 year' },
  { value: '1-3 years', label: '1–3 years' },
  { value: '3-7 years', label: '3–7 years' },
  { value: '7+ years', label: '7+ years' },
];

const incomeOptions: Option<IncomeBand>[] = [
  { value: 'Under ₹25,000', label: 'Under ₹25,000' },
  { value: '₹25,000 - ₹50,000', label: '₹25,000 – ₹50,000' },
  { value: '₹50,000 - ₹1,00,000', label: '₹50,000 – ₹1,00,000' },
  { value: '₹1,00,000 - ₹2,00,000', label: '₹1,00,000 – ₹2,00,000' },
  { value: 'Above ₹2,00,000', label: 'Above ₹2,00,000' },
];

const experienceOptions: Option<Experience>[] = [
  { value: 'Beginner', label: 'Beginner', description: 'New to investing' },
  { value: 'Intermediate', label: 'Intermediate', description: 'I invest regularly' },
  { value: 'Experienced', label: 'Experienced', description: 'I know my portfolio well' },
];

const stepMeta = [
  { title: 'What is your primary financial goal?', icon: Target },
  { title: 'How would you react if your portfolio fell 20%?', icon: TrendingDown },
  { title: 'When will you need the money?', icon: Clock },
  { title: 'What best describes your monthly income?', icon: Wallet },
  { title: 'What is your investment experience?', icon: Briefcase },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<{
    primaryGoal: PrimaryGoal | null;
    riskReaction: RiskReaction | null;
    horizon: InvestmentHorizon | null;
    incomeBand: IncomeBand | null;
    experience: Experience | null;
  }>({
    primaryGoal: null,
    riskReaction: null,
    horizon: null,
    incomeBand: null,
    experience: null,
  });

  const totalSteps = 5;
  const isResult = step === 5;
  const currentAnswer = isResult
    ? null
    : [
        answers.primaryGoal,
        answers.riskReaction,
        answers.horizon,
        answers.incomeBand,
        answers.experience,
      ][step];

  const canProceed = isResult || currentAnswer !== null;

  function handleNext() {
    if (!canProceed) return;
    if (step < 5) setStep((s) => (s + 1) as Step);
  }

  function handleBack() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function select<T>(key: keyof typeof answers, value: T) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const dna = isResult
    ? deriveFinancialDna({
        primaryGoal: answers.primaryGoal!,
        riskReaction: answers.riskReaction!,
        horizon: answers.horizon!,
        incomeBand: answers.incomeBand!,
        experience: answers.experience!,
      })
    : null;

  function goToDna() {
    router.push('/financial-dna');
  }

  function renderOptions<T extends string>(
    options: Option<T>[],
    selected: T | null,
    onSelect: (v: T) => void,
    layout: 'grid' | 'list' = 'grid'
  ) {
    return (
      <div
        className={cn(
          'gap-3',
          layout === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col'
        )}
      >
        {options.map((opt) => {
          const active = selected === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'group flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                active
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-border/70 hover:bg-secondary/40'
              )}
              aria-pressed={active}
            >
              {Icon && (
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground group-hover:bg-secondary/80'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              )}
              <span className="flex-1">
                <span className="block text-sm font-semibold">{opt.label}</span>
                {opt.description && (
                  <span className="block text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                )}
              </span>
              {active && (
                <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav variant="landing" />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-20">
        {/* Progress */}
        {!isResult && (
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Step {step + 1} of {totalSteps}
              </span>
              <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {stepMeta[step].title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === 0 && 'This shapes your recommendations and goal tracking.'}
                {step === 1 && 'There&rsquo;s no right answer — be honest with yourself.'}
                {step === 2 && 'Your timeline determines how much risk makes sense.'}
                {step === 3 && 'Ranges are fine. Pick the band that fits best.'}
                {step === 4 && 'We&rsquo;ll tailor the depth of insights accordingly.'}
              </p>

              <div className="mt-8">
                {step === 0 &&
                  renderOptions(
                    goalOptions,
                    answers.primaryGoal,
                    (v) => select('primaryGoal', v)
                  )}
                {step === 1 &&
                  renderOptions(
                    reactionOptions,
                    answers.riskReaction,
                    (v) => select('riskReaction', v),
                    'list'
                  )}
                {step === 2 &&
                  renderOptions(
                    horizonOptions,
                    answers.horizon,
                    (v) => select('horizon', v),
                    'list'
                  )}
                {step === 3 &&
                  renderOptions(
                    incomeOptions,
                    answers.incomeBand,
                    (v) => select('incomeBand', v),
                    'list'
                  )}
                {step === 4 &&
                  renderOptions(
                    experienceOptions,
                    answers.experience,
                    (v) => select('experience', v),
                    'list'
                  )}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="gap-1.5"
                >
                  {step === totalSteps - 1 ? 'See My Financial DNA' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center">
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-7 w-7 text-success" />
                </span>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Your Financial DNA is ready
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Here&rsquo;s the profile we built from your answers.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <DnaPreview label="Risk Profile" value={dna!.riskProfile} accent />
                <DnaPreview
                  label="Risk Score"
                  value={`${dna!.riskScore} / 100`}
                />
                <DnaPreview label="Investment Horizon" value={answers.horizon!} />
                <DnaPreview label="Primary Goal" value={answers.primaryGoal!} />
                <DnaPreview label="Experience" value={answers.experience!} />
                <DnaPreview
                  label="Liquidity Preference"
                  value={dna!.liquidityPreference}
                />
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={goToDna} className="gap-1.5" size="lg">
                  View My Financial DNA
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Today Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DnaPreview({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        accent ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
