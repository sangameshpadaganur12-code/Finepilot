'use client';

import { PieChart } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function PortfolioPage() {
  return (
    <ModulePlaceholder
      icon={PieChart}
      title="Portfolio"
      description="See your full portfolio across every platform in one place. Understand allocation, spot concentration, and catch risks early."
      highlights={[
        'Unified view across Groww, Zerodha, Cred, and bank accounts',
        'Asset class and sector allocation breakdowns',
        'Concentration risk detection with clear explanations',
        'Rebalancing suggestions based on your Financial DNA',
      ]}
    />
  );
}
