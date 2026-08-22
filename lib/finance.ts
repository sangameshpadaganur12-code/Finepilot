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
  Budget,
  BudgetCategory,
  SIPAllocation,
  SIPProjection,
  GoalProjection,
  DecisionAction,
  CopilotContext,
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

/* =================== NEW CALCULATIONS =================== */

/**
 * Calculate monthly fixed vs variable expenses from transactions
 */
export function calculateMonthlyExpenses(transactions: Transaction[]): {
  fixed: number;
  variable: number;
  total: number;
} {
  if (transactions.length === 0) return { fixed: 0, variable: 0, total: 0 };
  const latest = [...transactions].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0];
  // Estimate: 60% fixed, 40% variable (can be refined with categorization)
  const fixed = Math.round(latest.expenses * 0.6);
  const variable = latest.expenses - fixed;
  return { fixed, variable, total: latest.expenses };
}

/**
 * Calculate monthly income from transactions
 */
export function calculateMonthlyIncome(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const latest = [...transactions].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0];
  return latest.income;
}

/**
 * Calculate monthly investable amount (income - expenses - emergency buffer)
 */
export function calculateMonthlyInvestable(
  income: number,
  expenses: number,
  emergencyMonthsTarget = 6
): number {
  const monthlySurplus = income - expenses;
  if (monthlySurplus <= 0) return 0;
  // Keep 10% as buffer, rest is investable
  return Math.round(monthlySurplus * 0.9);
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncome(
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) return 0;
  return (monthlyDebtPayments / monthlyIncome) * 100;
}

/**
 * Calculate current net worth
 */
export function calculateNetWorth(
  holdings: PortfolioHolding[],
  liabilities: number = 0
): number {
  const assets = netFinancialAssets(holdings);
  return assets - liabilities;
}

/**
 * Inflation-adjusted future value
 */
export function inflationAdjustedFutureValue(
  presentValue: number,
  annualReturn: number,
  inflationRate: number,
  years: number
): number {
  const realReturn = (1 + annualReturn) / (1 + inflationRate) - 1;
  return presentValue * Math.pow(1 + realReturn, years);
}

/**
 * SIP Future Value calculation
 * FV = P * [((1 + r)^n - 1) / r] * (1 + r) for monthly SIP
 */
export function sipFutureValue(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): number {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyInvestment * months;
  return monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

/**
 * Required SIP for a target goal
 */
export function requiredSipForGoal(
  targetAmount: number,
  currentAmount: number,
  annualReturn: number,
  years: number
): number {
  const futureValueOfCurrent = currentAmount * Math.pow(1 + annualReturn, years);
  const shortfall = targetAmount - futureValueOfCurrent;
  if (shortfall <= 0) return 0;
  
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (monthlyRate === 0) return shortfall / months;
  
  return shortfall / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
}

/**
 * Goal completion probability based on current trajectory
 */
export function goalCompletionProbability(
  goal: Goal,
  monthlyContribution: number,
  annualReturn: number
): number {
  const yearsLeft = goal.targetYear - new Date().getFullYear();
  if (yearsLeft <= 0) return goal.currentAmount >= goal.targetAmount ? 100 : 0;
  
  const projected = sipFutureValue(monthlyContribution, annualReturn, yearsLeft) + 
    goal.currentAmount * Math.pow(1 + annualReturn, yearsLeft);
  
  const probability = Math.min(100, (projected / goal.targetAmount) * 100);
  return Math.round(probability);
}

/**
 * Emergency fund requirement
 */
export function emergencyFundRequirement(
  monthlyExpenses: number,
  monthsTarget = 6
): number {
  return monthlyExpenses * monthsTarget;
}

/**
 * Emergency fund gap
 */
export function emergencyFundGap(
  holdings: PortfolioHolding[],
  transactions: Transaction[],
  monthsTarget = 6
): number {
  const avgExpense = transactions.length > 0
    ? transactions.reduce((s, t) => s + t.expenses, 0) / transactions.length
    : 0;
  
  if (avgExpense <= 0) return 0;
  
  const liquidAssets = holdings
    .filter((h) => h.assetClass === 'Debt')
    .reduce((s, h) => s + h.currentValue, 0);
  
  const target = emergencyFundRequirement(avgExpense, monthsTarget);
  return Math.max(0, target - liquidAssets);
}

/**
 * Generate SIP allocation based on Financial DNA
 */
export function generateSipAllocation(
  monthlyInvestable: number,
  riskProfile: string,
  investmentHorizon: string,
  primaryGoal: string
): SIPAllocation[] {
  const allocations: Record<string, SIPAllocation[]> = {
    'Conservative': [
      { category: 'Debt Funds', percentage: 50, monthlyAmount: 0, rationale: 'Capital preservation with stable returns' },
      { category: 'Large Cap Index Funds', percentage: 30, monthlyAmount: 0, rationale: 'Low volatility equity exposure' },
      { category: 'Gold ETF', percentage: 10, monthlyAmount: 0, rationale: 'Hedge against inflation and uncertainty' },
      { category: 'Liquid Funds', percentage: 10, monthlyAmount: 0, rationale: 'Emergency buffer and liquidity' },
    ],
    'Moderate': [
      { category: 'Flexi Cap Funds', percentage: 35, monthlyAmount: 0, rationale: 'Dynamic allocation across market caps' },
      { category: 'Large Cap Index Funds', percentage: 25, monthlyAmount: 0, rationale: 'Core stable equity foundation' },
      { category: 'Mid Cap Funds', percentage: 15, monthlyAmount: 0, rationale: 'Growth potential with moderate risk' },
      { category: 'Debt Funds', percentage: 15, monthlyAmount: 0, rationale: 'Stability and downside protection' },
      { category: 'Gold ETF', percentage: 10, monthlyAmount: 0, rationale: 'Portfolio diversifier' },
    ],
    'Aggressive': [
      { category: 'Small Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'High growth potential for long horizon' },
      { category: 'Mid Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'Strong growth with reasonable liquidity' },
      { category: 'Flexi Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'Adaptive allocation across caps' },
      { category: 'Large Cap Index Funds', percentage: 15, monthlyAmount: 0, rationale: 'Core stability anchor' },
      { category: 'Gold ETF', percentage: 5, monthlyAmount: 0, rationale: 'Minimal hedge' },
      { category: 'Debt Funds', percentage: 5, monthlyAmount: 0, rationale: 'Minimal stability' },
    ],
  };

  const baseAllocation = allocations[riskProfile] || allocations['Moderate'];
  
  // Adjust for horizon
  const adjusted = baseAllocation.map(a => {
    let percentage = a.percentage;
    if (investmentHorizon === 'Less than 1 year' || investmentHorizon === '1-3 years') {
      // Shift to more conservative
      if (a.category.includes('Debt') || a.category.includes('Liquid')) percentage += 10;
      if (a.category.includes('Small Cap')) percentage -= 10;
      if (a.category.includes('Mid Cap')) percentage -= 5;
    }
    if (investmentHorizon === '7+ years') {
      // Can take more risk
      if (a.category.includes('Small Cap')) percentage += 5;
      if (a.category.includes('Mid Cap')) percentage += 5;
      if (a.category.includes('Debt')) percentage -= 5;
    }
    return { ...a, percentage: Math.max(0, percentage) };
  });

  // Normalize to 100%
  const totalPct = adjusted.reduce((sum, a) => sum + a.percentage, 0);
  return adjusted.map(a => ({
    ...a,
    percentage: Math.round((a.percentage / totalPct) * 100),
    monthlyAmount: Math.round(monthlyInvestable * (a.percentage / totalPct)),
  }));
}

/**
 * SIP Projection over time
 */
export function generateSipProjection(
  monthlyInvestable: number,
  allocation: SIPAllocation[],
  annualReturns: Record<string, number>,
  years: number
): SIPProjection[] {
  const projections: SIPProjection[] = [];
  
  for (let year = 1; year <= years; year++) {
    let yearValue = 0;
    const breakdown: Record<string, number> = {};
    
    for (const alloc of allocation) {
      const ret = annualReturns[alloc.category] || 0.12;
      const value = sipFutureValue(alloc.monthlyAmount, ret, year);
      breakdown[alloc.category] = Math.round(value);
      yearValue += value;
    }
    
    projections.push({
      year,
      totalValue: Math.round(yearValue),
      breakdown,
      totalInvested: monthlyInvestable * 12 * year,
    });
  }
  
  return projections;
}

/**
 * Generate goal projections
 */
export function generateGoalProjections(
  goals: Goal[],
  monthlyInvestable: number,
  allocation: SIPAllocation[],
  annualReturns: Record<string, number>
): GoalProjection[] {
  return goals.map(goal => {
    const yearsLeft = goal.targetYear - new Date().getFullYear();
    if (yearsLeft <= 0) {
      return {
        goal,
        projectedValue: goal.currentAmount,
        shortfall: Math.max(0, goal.targetAmount - goal.currentAmount),
        probability: goal.currentAmount >= goal.targetAmount ? 100 : 0,
        requiredMonthly: 0,
        onTrack: goal.currentAmount >= goal.targetAmount,
      };
    }

    // Estimate portfolio return based on allocation
    let weightedReturn = 0;
    let totalPct = 0;
    for (const alloc of allocation) {
      const ret = annualReturns[alloc.category] || 0.12;
      weightedReturn += ret * alloc.percentage;
      totalPct += alloc.percentage;
    }
    const portfolioReturn = totalPct > 0 ? weightedReturn / totalPct : 0.12;

    const projectedValue = sipFutureValue(monthlyInvestable, portfolioReturn, yearsLeft) +
      goal.currentAmount * Math.pow(1 + portfolioReturn, yearsLeft);
    
    const requiredMonthly = requiredSipForGoal(
      goal.targetAmount,
      goal.currentAmount,
      portfolioReturn,
      yearsLeft
    );
    
    const probability = goalCompletionProbability(goal, monthlyInvestable, portfolioReturn);
    
    return {
      goal,
      projectedValue: Math.round(projectedValue),
      shortfall: Math.max(0, Math.round(goal.targetAmount - projectedValue)),
      probability,
      requiredMonthly: Math.round(requiredMonthly),
      onTrack: probability >= 80,
    };
  });
}

/**
 * Build smart budget from transactions and financial profile
 */
export function buildSmartBudget(
  transactions: Transaction[],
  financialProfile: FinancialProfile,
  holdings: PortfolioHolding[]
): Budget {
  const income = calculateMonthlyIncome(transactions);
  const { fixed, variable, total: expenses } = calculateMonthlyExpenses(transactions);
  const monthlyInvestable = calculateMonthlyInvestable(income, expenses);
  const emergencyGap = emergencyFundGap(holdings, transactions);
  
  // 50/30/20 rule adjusted for Indian context
  const needsLimit = Math.round(income * 0.5);
  const wantsLimit = Math.round(income * 0.3);
  const investmentsLimit = Math.round(income * 0.15);
  const savingsLimit = Math.round(income * 0.05);
  
  const needsActual = fixed;
  const wantsActual = variable;
  const investmentsActual = transactions.length > 0 
    ? [...transactions].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0].investments
    : 0;
  const savingsActual = transactions.length > 0
    ? [...transactions].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0].savings
    : 0;
  
  const remaining = income - (needsActual + wantsActual + investmentsActual + savingsActual);
  
  const categories: BudgetCategory[] = [
    {
      name: 'Income',
      budgeted: income,
      actual: income,
      type: 'income',
      essential: true,
    },
    {
      name: 'Needs (Essential)',
      budgeted: needsLimit,
      actual: needsActual,
      type: 'expense',
      essential: true,
      overspent: needsActual > needsLimit,
    },
    {
      name: 'Wants (Discretionary)',
      budgeted: wantsLimit,
      actual: wantsActual,
      type: 'expense',
      essential: false,
      overspent: wantsActual > wantsLimit,
    },
    {
      name: 'Investments',
      budgeted: investmentsLimit,
      actual: investmentsActual,
      type: 'investment',
      essential: true,
      overspent: false,
    },
    {
      name: 'Savings / Emergency',
      budgeted: savingsLimit + emergencyGap / 12, // Spread emergency gap over 12 months
      actual: savingsActual,
      type: 'savings',
      essential: true,
      overspent: false,
    },
  ];
  
  return {
    income,
    categories,
    totalBudgeted: needsLimit + wantsLimit + investmentsLimit + savingsLimit,
    totalActual: needsActual + wantsActual + investmentsActual + savingsActual,
    remaining,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    overspendingAlerts: categories
      .filter(c => c.type === 'expense' && c.overspent)
      .map(c => `${c.name} exceeded by ₹${Math.abs(c.budgeted - c.actual).toLocaleString('en-IN')}`),
  };
}

/**
 * Decision Engine - generates actionable recommendations
 */
export function generateDecisionActions(
  transactions: Transaction[],
  holdings: PortfolioHolding[],
  goals: Goal[],
  financialProfile: FinancialProfile,
  budget: Budget
): DecisionAction[] {
  const actions: DecisionAction[] = [];
  const health = financialHealthScore(transactions, holdings, goals);
  const { fixed, variable, total: expenses } = calculateMonthlyExpenses(transactions);
  const income = calculateMonthlyIncome(transactions);
  const monthlyInvestable = calculateMonthlyInvestable(income, expenses);
  const emergencyGap = emergencyFundGap(holdings, transactions);
  const netWorth = calculateNetWorth(holdings);
  const savingsRate = averageSavingsRate(transactions);
  
  // Emergency fund action
  if (emergencyGap > 0) {
    actions.push({
      id: 'emergency-fund',
      title: 'Build Emergency Fund',
      description: `You're short ₹${emergencyGap.toLocaleString('en-IN')} for a 6-month emergency fund.`,
      category: 'Safety',
      priority: 1,
      impact: 'High',
      effort: 'Medium',
      action: `Redirect ₹${Math.round(emergencyGap / 12).toLocaleString('en-IN')}/month to liquid funds until gap closes.`,
      metric: `₹${emergencyGap.toLocaleString('en-IN')} short`,
    });
  }
  
  // Savings rate action
  if (savingsRate < 20) {
    actions.push({
      id: 'savings-rate',
      title: 'Improve Savings Rate',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Target: 20%+.`,
      category: 'Cashflow',
      priority: 2,
      impact: 'High',
      effort: 'Medium',
      action: 'Review "Wants" spending; automate savings on salary day.',
      metric: `${savingsRate.toFixed(1)}% current`,
    });
  }
  
  // Portfolio concentration
  const { share, name } = topHoldingConcentration(holdings);
  if (share > 30) {
    actions.push({
      id: 'concentration',
      title: 'Reduce Portfolio Concentration',
      description: `Top holding "${name}" is ${share.toFixed(1)}% of portfolio.`,
      category: 'Investing',
      priority: 3,
      impact: 'Medium',
      effort: 'Low',
      action: 'Redirect new SIPs to diversified funds; avoid selling existing.',
      metric: `${share.toFixed(1)}% in single holding`,
    });
  }
  
  // Goal tracking
  const offTrackGoals = goals.filter(g => {
    const yearsLeft = g.targetYear - new Date().getFullYear();
    if (yearsLeft <= 0) return g.currentAmount < g.targetAmount;
    const proj = g.currentAmount * Math.pow(1.12, yearsLeft) + g.monthlyContribution * 12 * yearsLeft;
    return proj < g.targetAmount * 0.8;
  });
  
  if (offTrackGoals.length > 0) {
    actions.push({
      id: 'goals-off-track',
      title: 'Goals Off Track',
      description: `${offTrackGoals.length} goal(s) may miss target without changes.`,
      category: 'Goals',
      priority: 4,
      impact: 'High',
      effort: 'High',
      action: `Increase SIP for "${offTrackGoals[0].name}" by ₹${Math.round(offTrackGoals[0].monthlyContribution * 0.2).toLocaleString('en-IN')}/month.`,
      metric: `${offTrackGoals.length} goal(s) at risk`,
    });
  }
  
  // Debt to income
  const dti = calculateDebtToIncome(0, income); // Assuming no debt payments tracked yet
  if (dti > 40) {
    actions.push({
      id: 'debt-income',
      title: 'High Debt-to-Income Ratio',
      description: `DTI is ${dti.toFixed(1)}%. Above 40% limits financial flexibility.`,
      category: 'Cashflow',
      priority: 5,
      impact: 'Medium',
      effort: 'High',
      action: 'Prioritize high-interest debt repayment before new investments.',
      metric: `${dti.toFixed(1)}% DTI`,
    });
  }
  
  // Health score actions
  if (health.total < 60) {
    actions.push({
      id: 'health-score',
      title: 'Financial Health Needs Attention',
      description: `Overall score: ${health.total}/100. Focus on lowest pillar.`,
      category: 'Overall',
      priority: 6,
      impact: 'High',
      effort: 'Medium',
      action: health.safety < 50 
        ? 'Prioritize emergency fund and insurance.' 
        : health.cashflow < 50
          ? 'Increase savings rate by cutting discretionary spend.'
          : 'Diversify portfolio and increase goal contributions.',
      metric: `Score: ${health.total}/100`,
    });
  }
  
  // Sort by priority
  return actions.sort((a, b) => a.priority - b.priority);
}

/**
 * Build copilot context for AI
 */
export function buildCopilotContext(
  transactions: Transaction[],
  holdings: PortfolioHolding[],
  goals: Goal[],
  financialProfile: FinancialProfile,
  budget: Budget,
  health: HealthScoreBreakdown,
  actions: DecisionAction[],
  allocation: SIPAllocation[]
): CopilotContext {
  const income = calculateMonthlyIncome(transactions);
  const { fixed, variable, total: expenses } = calculateMonthlyExpenses(transactions);
  const monthlyInvestable = calculateMonthlyInvestable(income, expenses);
  const netWorth = calculateNetWorth(holdings);
  const savingsRate = averageSavingsRate(transactions);
  
  return {
    income,
    expenses,
    fixedExpenses: fixed,
    variableExpenses: variable,
    monthlyInvestable,
    savingsRate,
    netWorth,
    emergencyMonths: emergencyFundCoverage(holdings, transactions),
    financialHealthScore: health.total,
    riskProfile: financialProfile.riskProfile,
    investmentHorizon: financialProfile.investmentHorizon,
    primaryGoal: financialProfile.primaryGoal,
    goals: goals.map(g => ({
      name: g.name,
      target: g.targetAmount,
      current: g.currentAmount,
      targetYear: g.targetYear,
      monthlyContribution: g.monthlyContribution,
    })),
    portfolio: holdings.map(h => ({
      name: h.name,
      assetClass: h.assetClass,
      value: h.currentValue,
      platform: h.platform,
    })),
    portfolioAllocation: assetAllocation(holdings),
    budget: budget.categories,
    sipAllocation: allocation,
    topActions: actions.slice(0, 3).map(a => ({
      title: a.title,
      action: a.action,
      category: a.category,
    })),
  };
}

/**
 * Default annual return assumptions for asset categories
 */
export const DEFAULT_ANNUAL_RETURNS: Record<string, number> = {
  'Large Cap Index Funds': 0.12,
  'Flexi Cap Funds': 0.13,
  'Mid Cap Funds': 0.14,
  'Small Cap Funds': 0.15,
  'Debt Funds': 0.07,
  'Liquid Funds': 0.06,
  'Gold ETF': 0.08,
  'Equity': 0.12,
  'Debt': 0.07,
  'Commodity': 0.08,
};
