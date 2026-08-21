'use client';

import { FlaskConical } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function DecisionLabPage() {
  return (
    <ModulePlaceholder
      icon={FlaskConical}
      title="Decision Lab"
      description="Test financial decisions before you make them. Simulate lump-sum investments, SIP changes, and goal adjustments to see their long-term impact."
      highlights={[
        'Simulate lump-sum vs. SIP for any amount',
        'Compare goal timelines under different contribution levels',
        'Model the impact of reallocating your monthly surplus',
        'See projected outcomes with clear, deterministic math',
      ]}
    />
  );
}
