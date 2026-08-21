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
