'use client';

import { Receipt } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function SpendingPage() {
  return (
    <ModulePlaceholder
      icon={Receipt}
      title="Spending"
      description="Understand where your money goes each month. Spot patterns, categorize expenses, and see how your spending trends over time."
      highlights={[
        'Monthly income vs. expenses with savings rate',
        'Spending trends across the last 6 months',
        'Category breakdowns to find areas to trim',
        'Compare your cashflow against your Financial DNA targets',
      ]}
    />
  );
}
