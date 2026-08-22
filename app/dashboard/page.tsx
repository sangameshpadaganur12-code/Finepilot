'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart3, Sparkles, Target, Shield, DollarSign, RotateCcw, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { HealthScoreGauge, ScoreBar } from '@/components/health-score-gauge';
import { ActionCard } from '@/components/action-card';
import { GoalProgressList } from '@/components/goal-progress-card';
import { MoneySnapshotCard } from '@/components/money-snapshot-card';
import { SmartBudget } from '@/components/smart-budget';
import { SIPAdvisor } from '@/components/sip-advisor';
import { AICopilot } from '@/components/ai-copilot';
import { DecisionEngine } from '@/components/decision-engine';
import { useFinPilotData } from '@/lib/use-finpilot-data';
import {
  financialHealthScore,
  greetingFor,
  buildMoneySnapshot,
  averageSavingsRate,
  buildSmartBudget,
  generateSipAllocation,
  generateSipProjection,
  generateDecisionActions,
  buildCopilotContext,
  calculateMonthlyInvestable,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  DEFAULT_ANNUAL_RETURNS,
} from '@/lib/finance';
import { formatPercent, formatINRShort } from '@/lib/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const {
    profile,
    financialProfile,
    transactions,
    holdings,
    goals,
    recommendations,
    loading,
    usingDemo,
  } = useFinPilotData();

  const health = financialHealthScore(transactions, holdings, goals);
  const snapshot = buildMoneySnapshot(transactions, holdings);
  const savingsRate = averageSavingsRate(transactions);
  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority);

  const monthlyIncome = calculateMonthlyIncome(transactions);
  const { total: monthlyExpenses } = calculateMonthlyExpenses(transactions);
  const monthlyInvestable = calculateMonthlyInvestable(monthlyIncome, monthlyExpenses);

  const budget = buildSmartBudget(transactions, financialProfile, holdings);
  const sipAllocation = generateSipAllocation(
    monthlyInvestable,
    financialProfile.riskProfile,
    financialProfile.investmentHorizon,
    financialProfile.primaryGoal
  );
  const sipProjections = generateSipProjection(
    monthlyInvestable,
    sipAllocation,
    DEFAULT_ANNUAL_RETURNS,
    10
  );
  const actions = generateDecisionActions(transactions, holdings, goals, financialProfile, budget);
  const copilotContext = buildCopilotContext(
    transactions,
    holdings,
    goals,
    financialProfile,
    budget,
    health,
    actions,
    sipAllocation
  );

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {greetingFor(profile)}
                <span className="ml-1.5" aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1.5 text-muted-foreground">
                Here&rsquo;s what matters about your money today.
              </p>
            </div>
            {usingDemo && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                <Sparkles className="h-3 w-3" />
                Demo Mode
              </span>
            )}
          </div>
        </motion.header>

        {loading ? (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-secondary/40" />
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-secondary/40 lg:col-span-2" />
            </div>
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-secondary/40" />
            <div className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/40" />
            <div className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/40" />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {/* Health Score + Pillars */}
            <section aria-label="Financial Health Score" className="grid gap-6 lg:grid-cols-3">
              <motion.div
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 sm:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <HealthScoreGauge score={health.total} />
                <p className="mt-4 text-center text-sm text-muted-foreground">Financial Health Score</p>
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
                  <span className="text-xs text-muted-foreground">Weighted across 4 pillars</span>
                </div>
                <div className="space-y-5">
                  <ScoreBar label="Cashflow" value={health.cashflow} delay={0.2} />
                  <ScoreBar label="Safety" value={health.safety} delay={0.3} />
                  <ScoreBar label="Investing" value={health.investing} delay={0.4} />
                  <ScoreBar label="Goals" value={health.goals} delay={0.5} />
                </div>
              </motion.div>
            </section>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="budget">Smart Budget</TabsTrigger>
                <TabsTrigger value="sip">SIP Advisor</TabsTrigger>
                <TabsTrigger value="copilot">AI Copilot</TabsTrigger>
                <TabsTrigger value="actions">Action Plan</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-10">
                {/* Prioritized Actions */}
                <section aria-label="Prioritized Financial Actions">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight">What to focus on</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Three prioritized actions, ranked by impact.</p>
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
                      <h2 className="font-display text-xl font-semibold tracking-tight">Goal Progress</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Tracking {goals.length} active goals.</p>
                    </div>
                    <Link href="/goals" className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <GoalProgressList goals={goals} />
                </section>

                {/* Money Snapshot */}
                <section aria-label="Money Snapshot">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight">Money Snapshot</h2>
                      <p className="mt-1 text-sm text-muted-foreground">This month, at a glance.</p>
                    </div>
                    <Link href="/spending" className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <MoneySnapshotCard snapshot={snapshot} />
                </section>

                {/* Quick Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <QuickStatCard title="Monthly Income" value={formatINRShort(monthlyIncome)} icon={DollarSign} color="text-green-600" />
                  <QuickStatCard title="Monthly Expenses" value={formatINRShort(monthlyExpenses)} icon={DollarSign} color="text-red-600" />
                  <QuickStatCard title="Investable Surplus" value={formatINRShort(monthlyInvestable)} icon={TrendingUp} color="text-primary" />
                  <QuickStatCard title="Net Worth" value={formatINRShort(snapshot.netFinancialAssets)} icon={Target} color="text-purple-600" />
                </div>
              </TabsContent>

              {/* Smart Budget Tab */}
              <TabsContent value="budget">
                <SmartBudget budget={budget} editable={!usingDemo} />
              </TabsContent>

              {/* SIP Advisor Tab */}
              <TabsContent value="sip">
                <SIPAdvisor
                  monthlyInvestable={monthlyInvestable}
                  financialProfile={financialProfile}
                  projections={sipProjections}
                />
              </TabsContent>

              {/* AI Copilot Tab */}
              <TabsContent value="copilot">
                <AICopilot context={copilotContext} actions={actions} />
              </TabsContent>

              {/* Action Plan Tab */}
              <TabsContent value="actions">
                <DecisionEngine actions={actions} health={health} goals={goals} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 font-display text-2xl font-bold">{value}</p>
          </div>
          <div className={cn('p-3 rounded-xl', color + '/10')}>
            <Icon className={cn('h-6 w-6', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';