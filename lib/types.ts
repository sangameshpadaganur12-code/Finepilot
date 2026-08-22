export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';
export type InvestmentHorizon =
  | 'Less than 1 year'
  | '1-3 years'
  | '3-7 years'
  | '7+ years';
export type PrimaryGoal =
  | 'Build Wealth'
  | 'Buy a Home'
  | 'Retirement'
  | 'Education'
  | 'Emergency Fund'
  | 'Other';
export type Experience = 'Beginner' | 'Intermediate' | 'Experienced';
export type LiquidityPreference = 'High Liquidity' | 'Balanced' | 'Growth-Focused';

export type RiskReaction = 'sell' | 'wait' | 'invest-more';
export type IncomeBand =
  | 'Under ₹25,000'
  | '₹25,000 - ₹50,000'
  | '₹50,000 - ₹1,00,000'
  | '₹1,00,000 - ₹2,00,000'
  | 'Above ₹2,00,000';

export interface OnboardingAnswers {
  primaryGoal: PrimaryGoal;
  riskReaction: RiskReaction;
  horizon: InvestmentHorizon;
  incomeBand: IncomeBand;
  experience: Experience;
}

export interface FinancialProfile {
  id: string;
  profileId: string;
  riskProfile: RiskProfile;
  riskScore: number;
  investmentHorizon: InvestmentHorizon;
  primaryGoal: PrimaryGoal;
  experience: Experience;
  liquidityPreference: LiquidityPreference;
  monthlyIncomeBand: IncomeBand | string;
  monthlyIncomeEstimated: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetYear: number;
  monthlyContribution: number;
  icon: string;
}

export interface Transaction {
  id: string;
  month: string;
  income: number;
  expenses: number;
  savings: number;
  investments: number;
}

export interface PortfolioHolding {
  id: string;
  name: string;
  assetClass: 'Equity' | 'Debt' | 'Commodity';
  platform: string;
  currentValue: number;
  units: number | null;
}

export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  category: 'Safety' | 'Investing' | 'Goals' | 'Cashflow';
  priority: number;
  whatHappened: string;
  whyItMatters: string;
  whatToDo: string;
  ctaLabel: string;
  metricValue: string;
  metricLabel: string;
  severity: 'warning' | 'info' | 'critical';
}

export interface UserProfile {
  id: string;
  name: string;
  greetingName: string;
  avatarUrl: string | null;
}

export interface HealthScoreBreakdown {
  cashflow: number;
  safety: number;
  investing: number;
  goals: number;
  total: number;
}

export interface MoneySnapshot {
  income: number;
  expenses: number;
  savings: number;
  investments: number;
  netFinancialAssets: number;
}

/* =================== NEW TYPES =================== */

export interface BudgetCategory {
  name: string;
  budgeted: number;
  actual: number;
  type: 'income' | 'expense' | 'investment' | 'savings';
  essential: boolean;
  overspent?: boolean;
}

export interface Budget {
  income: number;
  categories: BudgetCategory[];
  totalBudgeted: number;
  totalActual: number;
  remaining: number;
  savingsRate: number;
  overspendingAlerts: string[];
}

export interface SIPAllocation {
  category: string;
  percentage: number;
  monthlyAmount: number;
  rationale: string;
}

export interface SIPProjection {
  year: number;
  totalValue: number;
  breakdown: Record<string, number>;
  totalInvested: number;
}

export interface GoalProjection {
  goal: Goal;
  projectedValue: number;
  shortfall: number;
  probability: number;
  requiredMonthly: number;
  onTrack: boolean;
}

export interface DecisionAction {
  id: string;
  title: string;
  description: string;
  category: 'Safety' | 'Investing' | 'Goals' | 'Cashflow' | 'Overall';
  priority: number;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  action: string;
  metric: string;
}

export interface CopilotContext {
  income: number;
  expenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  monthlyInvestable: number;
  savingsRate: number;
  netWorth: number;
  emergencyMonths: number;
  financialHealthScore: number;
  riskProfile: string;
  investmentHorizon: string;
  primaryGoal: string;
  goals: Array<{
    name: string;
    target: number;
    current: number;
    targetYear: number;
    monthlyContribution: number;
  }>;
  portfolio: Array<{
    name: string;
    assetClass: string;
    value: number;
    platform: string;
  }>;
  portfolioAllocation: Array<{
    assetClass: string;
    value: number;
    share: number;
  }>;
  budget: BudgetCategory[];
  sipAllocation: SIPAllocation[];
  topActions: Array<{
    title: string;
    action: string;
    category: string;
  }>;
}
