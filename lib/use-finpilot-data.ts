'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase-client';
import {
  DEMO_FINANCIAL_PROFILE,
  DEMO_GOALS,
  DEMO_HOLDINGS,
  DEMO_PROFILE,
  DEMO_RECOMMENDATIONS,
  DEMO_TRANSACTIONS,
} from './demo-data';
import type {
  FinancialProfile,
  Goal,
  PortfolioHolding,
  Recommendation,
  Transaction,
  UserProfile,
} from './types';

export interface FinPilotData {
  profile: UserProfile;
  financialProfile: FinancialProfile;
  goals: Goal[];
  transactions: Transaction[];
  holdings: PortfolioHolding[];
  recommendations: Recommendation[];
  loading: boolean;
  usingDemo: boolean;
}

/**
 * Maps a DB row (snake_case) to our camelCase domain types.
 */
function rowToProfile(r: any): UserProfile {
  return {
    id: r.id,
    name: r.name,
    greetingName: r.greeting_name,
    avatarUrl: r.avatar_url ?? null,
  };
}

function rowToFinancialProfile(r: any): FinancialProfile {
  return {
    id: r.id,
    profileId: r.profile_id,
    riskProfile: r.risk_profile,
    riskScore: r.risk_score,
    investmentHorizon: r.investment_horizon,
    primaryGoal: r.primary_goal,
    experience: r.experience,
    liquidityPreference: r.liquidity_preference,
    monthlyIncomeBand: r.monthly_income_band,
    monthlyIncomeEstimated: r.monthly_income_estimated,
  };
}

function rowToGoal(r: any): Goal {
  return {
    id: r.id,
    name: r.name,
    targetAmount: r.target_amount,
    currentAmount: r.current_amount,
    targetYear: r.target_year,
    monthlyContribution: r.monthly_contribution,
    icon: r.icon,
  };
}

function rowToTransaction(r: any): Transaction {
  return {
    id: r.id,
    month: r.month,
    income: r.income,
    expenses: r.expenses,
    savings: r.savings,
    investments: r.investments,
  };
}

function rowToHolding(r: any): PortfolioHolding {
  return {
    id: r.id,
    name: r.name,
    assetClass: r.asset_class,
    platform: r.platform,
    currentValue: r.current_value,
    units: r.units ?? null,
  };
}

function rowToRecommendation(r: any): Recommendation {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    priority: r.priority,
    whatHappened: r.what_happened,
    whyItMatters: r.why_it_matters,
    whatToDo: r.what_to_do,
    ctaLabel: r.cta_label,
    metricValue: r.metric_value,
    metricLabel: r.metric_label,
    severity: r.severity,
  };
}

/**
 * Loads the full FinPilot dataset for the authenticated user from Supabase,
 * falling back to deterministic demo data when not authenticated or on error.
 */
export function useFinPilotData(): FinPilotData {
  const [data, setData] = useState<FinPilotData>({
    profile: DEMO_PROFILE,
    financialProfile: DEMO_FINANCIAL_PROFILE,
    goals: DEMO_GOALS,
    transactions: DEMO_TRANSACTIONS,
    holdings: DEMO_HOLDINGS,
    recommendations: DEMO_RECOMMENDATIONS,
    loading: true,
    usingDemo: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // First, get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // No authenticated user - use demo data
          if (cancelled) return;
          setData({
            profile: DEMO_PROFILE,
            financialProfile: DEMO_FINANCIAL_PROFILE,
            goals: DEMO_GOALS,
            transactions: DEMO_TRANSACTIONS,
            holdings: DEMO_HOLDINGS,
            recommendations: DEMO_RECOMMENDATIONS,
            loading: false,
            usingDemo: true,
          });
          return;
        }

        const userId = user.id;

        const [
          { data: profileRow },
          { data: fpRow },
          { data: goalRows },
          { data: txRows },
          { data: holdingRows },
          { data: recRows },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase
            .from('financial_profiles')
            .select('*')
            .eq('profile_id', userId)
            .maybeSingle(),
          supabase.from('goals').select('*').eq('profile_id', userId).order('target_year'),
          supabase
            .from('transactions')
            .select('*')
            .eq('profile_id', userId)
            .order('month'),
          supabase
            .from('portfolio_holdings')
            .select('*')
            .eq('profile_id', userId)
            .order('current_value', { ascending: false }),
          supabase
            .from('recommendations')
            .select('*')
            .eq('profile_id', userId)
            .order('priority'),
        ]);

        if (cancelled) return;

        // Use DB rows when present; otherwise keep demo data.
        const usingDemo = !profileRow && !fpRow;
        setData({
          profile: profileRow ? rowToProfile(profileRow) : DEMO_PROFILE,
          financialProfile: fpRow ? rowToFinancialProfile(fpRow) : DEMO_FINANCIAL_PROFILE,
          goals: goalRows?.length ? goalRows.map(rowToGoal) : DEMO_GOALS,
          transactions: txRows?.length ? txRows.map(rowToTransaction) : DEMO_TRANSACTIONS,
          holdings: holdingRows?.length ? holdingRows.map(rowToHolding) : DEMO_HOLDINGS,
          recommendations: recRows?.length
            ? recRows.map(rowToRecommendation)
            : DEMO_RECOMMENDATIONS,
          loading: false,
          usingDemo,
        });
      } catch {
        if (cancelled) return;
        setData((prev) => ({ ...prev, loading: false, usingDemo: true }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
