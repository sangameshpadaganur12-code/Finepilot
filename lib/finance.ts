/**
 * FinPilot deterministic financial engine.
 *
 * No LLM is involved in any numerical calculation. Every function here is
 * pure, deterministic, and explainable — given the same inputs it always
 * returns the same outputs, and each score can be traced back to its inputs.
 *
 * Scoring philosophy:
 *  - Financial Health Score (0-100) is a weighted blend of four pillars:
 *    Cashflow, Safety, Investing, Goals.
 *  - Each pillar produces a 0-100 subscore from transparent rules.
 */

import type {
  Goal,
  HealthScoreBreakdown,
  MoneySnapshot,
  PortfolioHolding,
  Transaction,
  UserProfile,
  FinancialProfile,
} from './types';

/**
 * Savings rate = savings / income, expressed as a percentage (0-100).
 * Deterministic: pure division.
 */
export function savingsRate(income: number, savings: number): number {
  if (income <= 0) return 0;
  return (savings / income) * 100;
}

/**
 * Average savings rate over a series of monthly transactions.
 */
export function averageSavingsRate(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const totalIncome = transactions.reduce((sum, t) => sum + t.income, 0);
  const totalSavings = transactions.reduce((sum, t) => sum + t.savings, 0);
  return savingsRate(totalIncome, totalSavings);
}

/**
 * Emergency fund coverage = liquid assets / monthly expenses (in months).
 * Uses debt + liquid holdings as the buffer and average monthly expenses.
 */
export function emergencyFundCoverage(
  holdings: PortfolioHolding[],
  transactions: Transaction[]
): number {
  const avgExpense =
    transactions.length > 0
      ? transactions.reduce((s, t) => s + t.expenses, 0) / transactions.length
      : 0;
  if (avgExpense <= 0) return 0;
  const liquidAssets = holdings
    .filter((h) => h.assetClass === 'Debt')
    .reduce((s, h) => s + h.currentValue, 0);
  return liquidAssets / avgExpense;
}

/**
 * Goal progress percentage for a single goal (0-100).
 */
export function goalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
}

/**
 * Overall goal progress across all goals, weighted by target size.
 */
export function overallGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  if (totalTarget <= 0) return 0;
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  return Math.min(100, (totalCurrent / totalTarget) * 100);
}

/**
 * Portfolio concentration: the share (0-100) of the largest single holding
 * within total portfolio value. Higher = more concentrated = riskier.
 */
export function topHoldingConcentration(holdings: PortfolioHolding[]): {
  share: number;
  name: string;
} {
  if (holdings.length === 0) return { share: 0, name: '—' };
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (total <= 0) return { share: 0, name: '—' };
  const top = holdings.reduce((max, h) =>
    h.currentValue > max.currentValue ? h : max
  );
  return { share: (top.currentValue / total) * 100, name: top.name };
}

/**
 * Asset class allocation breakdown (percentages summing to ~100).
 */
export function assetAllocation(
  holdings: PortfolioHolding[]
): { assetClass: string; value: number; share: number }[] {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (total <= 0) return [];
  const classes = ['Equity', 'Debt', 'Commodity'] as const;
  return classes
    .map((assetClass) => {
      const value = holdings
        .filter((h) => h.assetClass === assetClass)
        .reduce((s, h) => s + h.currentValue, 0);
      return { assetClass, value, share: (value / total) * 100 };
    })
    .filter((c) => c.value > 0);
}

/**
 * Equity segment concentration within equity holdings.
 * Groups equity funds into Large-cap, Mid/Small-cap, and Flexi-cap by name heuristics.
 */
export function equitySegmentConcentration(holdings: PortfolioHolding[]): {
  segment: string;
  value: number;
  share: number;
}[] {
  const equity = holdings.filter((h) => h.assetClass === 'Equity');
  const total = equity.reduce((s, h) => s + h.currentValue, 0);
  if (total <= 0) return [];

  const classify = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('mid-cap') || n.includes('mid cap') || n.includes('small cap') || n.includes('small-cap')) {
      return 'Mid & Small Cap';
    }
    if (n.includes('flexi') || n.includes('flexicap')) {
      return 'Flexi Cap';
    }
    if (n.includes('bluechip') || n.includes('nifty 50') || n.includes('index') || n.includes('large')) {
      return 'Large Cap';
    }
    return 'Other Equity';
  };

  const segments = new Map<string, number>();
  for (const h of equity) {
    const seg = classify(h.name);
    segments.set(seg, (segments.get(seg) ?? 0) + h.currentValue);
  }
  return Array.from(segments.entries())
    .map(([segment, value]) => ({ segment, value, share: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Net financial assets = total portfolio value (all holdings).
 */
export function netFinancialAssets(holdings: PortfolioHolding[]): number {
  return holdings.reduce((s, h) => s + h.currentValue, 0);
}

/**
 * Build a Money Snapshot from the latest month's transaction + portfolio.
 */
export function buildMoneySnapshot(
  transactions: Transaction[],
  holdings: PortfolioHolding[]
): MoneySnapshot {
  const latest =
    transactions.length > 0
      ? [...transactions].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0]
      : { income: 0, expenses: 0, savings: 0, investments: 0 };
  return {
    income: latest.income,
    expenses: latest.expenses,
    savings: latest.savings,
    investments: latest.investments,
    netFinancialAssets: netFinancialAssets(holdings),
  };
}

/* ---------------- Pillar sub-scores (0-100 each) ---------------- */

/**
 * Cashflow score: based on savings rate.
 *  >= 40% savings rate => 100; scales linearly down; < 10% => floor of 20.
 */
export function cashflowScore(transactions: Transaction[]): number {
  const rate = averageSavingsRate(transactions);
  if (rate >= 40) return 100;
  if (rate >= 25) return 60 + ((rate - 25) / 15) * 40;
  if (rate >= 10) return 30 + ((rate - 10) / 15) * 30;
  return Math.max(10, rate * 3);
}

/**
 * Safety score: based on emergency fund coverage in months.
 *  >= 6 months => 100; scales linearly; < 3 months drops sharply.
 */
export function safetyScore(
  holdings: PortfolioHolding[],
  transactions: Transaction[]
): number {
  const months = emergencyFundCoverage(holdings, transactions);
  if (months >= 6) return 100;
  if (months >= 3) return 55 + ((months - 3) / 3) * 45;
  if (months >= 1) return 25 + ((months - 1) / 2) * 30;
  return Math.max(0, months * 25);
}

/**
 * Investing score: rewards diversification and penalizes concentration.
 *  Starts at 80; -1.2 per % of top-holding concentration above 25%;
 *  bonus for having 3+ asset classes; clamped 0-100.
 */
export function investingScore(holdings: PortfolioHolding[]): number {
  if (holdings.length === 0) return 0;
  const { share } = topHoldingConcentration(holdings);
  let score = 82;
  if (share > 25) score -= (share - 25) * 1.2;
  const classes = new Set(holdings.map((h) => h.assetClass));
  if (classes.size >= 3) score += 8;
  else if (classes.size >= 2) score += 4;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Goals score: weighted overall progress across all goals.
 */
export function goalsScore(goals: Goal[]): number {
  return Math.round(overallGoalProgress(goals));
}

/**
 * Financial Health Score: weighted blend of the four pillars.
 * Weights: Cashflow 25%, Safety 30%, Investing 25%, Goals 20%.
 */
export function financialHealthScore(
  transactions: Transaction[],
  holdings: PortfolioHolding[],
  goalList: Goal[]
): HealthScoreBreakdown {
  const cashflow = Math.round(cashflowScore(transactions));
  const safety = Math.round(safetyScore(holdings, transactions));
  const investing = Math.round(investingScore(holdings));
  const goals = Math.round(goalsScore(goalList));
  const total = Math.round(
    cashflow * 0.25 + safety * 0.3 + investing * 0.25 + goals * 0.2
  );
  return { cashflow, safety, investing, goals, total };
}

/**
 * Score band label for display.
 */
export function scoreBand(score: number): {
  label: string;
  tone: 'success' | 'warning' | 'critical';
} {
  if (score >= 80) return { label: 'Excellent', tone: 'success' };
  if (score >= 60) return { label: 'Healthy', tone: 'success' };
  if (score >= 40) return { label: 'Fair', tone: 'warning' };
  return { label: 'Needs Attention', tone: 'critical' };
}

/**
 * Derive Financial DNA from onboarding answers.
 * Deterministic mapping: same answers => same DNA.
 */
export function deriveFinancialDna(answers: {
  primaryGoal: string;
  riskReaction: string;
  horizon: string;
  incomeBand: string;
  experience: string;
}): {
  riskProfile: string;
  riskScore: number;
  liquidityPreference: string;
  estimatedIncome: number;
} {
  // Risk score from risk reaction (0-100)
  const reactionScore =
    answers.riskReaction === 'invest-more'
      ? 80
      : answers.riskReaction === 'wait'
      ? 55
      : 25;

  // Horizon contribution
  const horizonScore =
    answers.horizon === '7+ years'
      ? 85
      : answers.horizon === '3-7 years'
      ? 60
      : answers.horizon === '1-3 years'
      ? 40
      : 20;

  const riskScore = Math.round((reactionScore * 0.6 + horizonScore * 0.4));

  let riskProfile: string;
  if (riskScore >= 65) riskProfile = 'Aggressive';
  else if (riskScore >= 40) riskProfile = 'Moderate';
  else riskProfile = 'Conservative';

  const liquidityPreference =
    answers.horizon === 'Less than 1 year' || answers.horizon === '1-3 years'
      ? 'High Liquidity'
      : riskProfile === 'Aggressive'
      ? 'Growth-Focused'
      : 'Balanced';

  const incomeMap: Record<string, number> = {
    'Under ₹25,000': 20000,
    '₹25,000 - ₹50,000': 37500,
    '₹50,000 - ₹1,00,000': 75000,
    '₹1,00,000 - ₹2,00,000': 150000,
    'Above ₹2,00,000': 250000,
  };

  return {
    riskProfile,
    riskScore,
    liquidityPreference,
    estimatedIncome: incomeMap[answers.incomeBand] ?? 50000,
  };
}

/**
 * Greeting based on current hour ("Good morning/afternoon/evening").
 */
export function timeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function greetingFor(profile: UserProfile | null): string {
  const g = timeGreeting();
  return profile?.greetingName ? `${g}, ${profile.greetingName}` : g;
}
