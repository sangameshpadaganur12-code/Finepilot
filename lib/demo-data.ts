/**
 * Deterministic demo data — mirrors the seeded Supabase rows.
 * Used as an instant fallback so the UI renders before/without a DB round-trip,
 * and as the source of truth when network requests are in-flight or fail.
 */

import type {
  Goal,
  PortfolioHolding,
  Recommendation,
  Transaction,
  UserProfile,
  FinancialProfile,
} from './types';

export const DEMO_PROFILE: UserProfile = {
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  name: 'Aarav Sharma',
  greetingName: 'Aarav',
  avatarUrl: null,
};

export const DEMO_FINANCIAL_PROFILE: FinancialProfile = {
  id: 'f1e2d3c4-0000-0000-0000-000000000001',
  profileId: 'a1b2c3d4-0000-0000-0000-000000000001',
  riskProfile: 'Moderate',
  riskScore: 52,
  investmentHorizon: '3-7 years',
  primaryGoal: 'Buy a Home',
  experience: 'Intermediate',
  liquidityPreference: 'Balanced',
  monthlyIncomeBand: '₹50,000 - ₹1,00,000',
  monthlyIncomeEstimated: 85000,
};

export const DEMO_GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Home Down Payment',
    targetAmount: 5000000,
    currentAmount: 3200000,
    targetYear: 2031,
    monthlyContribution: 25000,
    icon: 'home',
  },
  {
    id: 'g2',
    name: 'Emergency Fund',
    targetAmount: 510000,
    currentAmount: 436000,
    targetYear: 2026,
    monthlyContribution: 10000,
    icon: 'shield',
  },
  {
    id: 'g3',
    name: 'Retirement Corpus',
    targetAmount: 20000000,
    currentAmount: 1400000,
    targetYear: 2055,
    monthlyContribution: 15000,
    icon: 'piggy-bank',
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 't1', month: '2026-03', income: 85000, expenses: 42000, savings: 43000, investments: 28000 },
  { id: 't2', month: '2026-04', income: 85000, expenses: 38000, savings: 47000, investments: 30000 },
  { id: 't3', month: '2026-05', income: 92000, expenses: 51000, savings: 41000, investments: 25000 },
  { id: 't4', month: '2026-06', income: 85000, expenses: 39000, savings: 46000, investments: 32000 },
  { id: 't5', month: '2026-07', income: 85000, expenses: 44000, savings: 41000, investments: 28000 },
  { id: 't6', month: '2026-08', income: 88000, expenses: 40000, savings: 48000, investments: 30000 },
];

export const DEMO_HOLDINGS: PortfolioHolding[] = [
  { id: 'p1', name: 'HDFC Mid-Cap Opportunities Fund', assetClass: 'Equity', platform: 'Groww', currentValue: 285000, units: 12500 },
  { id: 'p2', name: 'Parag Parikh Flexi Cap Fund', assetClass: 'Equity', platform: 'Zerodha Coin', currentValue: 210000, units: 9800 },
  { id: 'p3', name: 'Nippon India Nifty 50 ETF', assetClass: 'Equity', platform: 'Zerodha Coin', currentValue: 165000, units: 4200 },
  { id: 'p4', name: 'SBI Small Cap Fund', assetClass: 'Equity', platform: 'Groww', currentValue: 142000, units: 6100 },
  { id: 'p5', name: 'ICICI Prudential Liquid Fund', assetClass: 'Debt', platform: 'Cred', currentValue: 95000, units: null },
  { id: 'p6', name: 'PPF Account', assetClass: 'Debt', platform: 'SBI Bank', currentValue: 310000, units: null },
  { id: 'p7', name: 'Axis Bluechip Fund', assetClass: 'Equity', platform: 'Groww', currentValue: 118000, units: 5200 },
  { id: 'p8', name: 'Gold ETF', assetClass: 'Commodity', platform: 'Zerodha Coin', currentValue: 65000, units: 1800 },
];

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    slug: 'emergency-fund',
    title: 'Emergency Fund',
    category: 'Safety',
    priority: 1,
    whatHappened:
      'Your emergency fund is at 4.3 months of expenses, below the recommended 6 months.',
    whyItMatters:
      'A 6-month buffer protects you from job loss, medical emergencies, or sudden large expenses without having to sell investments at a loss.',
    whatToDo:
      'Top up your emergency fund by ₹74,000 to reach your 6-month target. Consider redirecting part of your monthly savings until the gap closes.',
    ctaLabel: 'See how to fix this',
    metricValue: '₹74,000',
    metricLabel: 'below target',
    severity: 'warning',
  },
  {
    id: 'r2',
    slug: 'portfolio-concentration',
    title: 'Portfolio Concentration',
    category: 'Investing',
    priority: 2,
    whatHappened:
      '65% of your equity portfolio is concentrated in mid and small-cap funds, creating concentration risk.',
    whyItMatters:
      'When too much of your portfolio sits in one segment, a downturn in that segment can drag down your overall returns more than necessary.',
    whatToDo:
      'Rebalance by redirecting new SIPs toward large-cap or index funds for the next 3-4 months. No need to sell existing holdings.',
    ctaLabel: 'See how to fix this',
    metricValue: '65%',
    metricLabel: 'single-segment exposure',
    severity: 'warning',
  },
  {
    id: 'r3',
    slug: 'goal-optimization',
    title: 'Goal Optimization',
    category: 'Goals',
    priority: 3,
    whatHappened:
      'Your Home Down Payment goal is on track, but increasing your monthly SIP by ₹4,000 could close it 7 months earlier.',
    whyItMatters:
      'Even a small increase in your monthly contribution, compounded over time, meaningfully shortens your timeline to the goal.',
    whatToDo:
      'Increase your home-goal SIP from ₹25,000 to ₹29,000. The extra amount fits within your current monthly surplus.',
    ctaLabel: 'See how to fix this',
    metricValue: '7 months',
    metricLabel: 'earlier possible',
    severity: 'info',
  },
];

export const DEMO_HEALTH_SCORE = 78;
