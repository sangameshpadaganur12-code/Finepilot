'use client';

import { AlertCircle } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function HypeCheckPage() {
  return (
    <ModulePlaceholder
      icon={AlertCircle}
      title="Hype Check"
      description="Paste any investment claim, reel, or “guaranteed return” post you saw online. FinPilot breaks down whether the numbers actually hold up."
      highlights={[
        'Paste a claim and get a clear verdict: credible, exaggerated, or misleading',
        'See the math behind the claim, explained step by step',
        'Flag common manipulation tactics like cherry-picked timeframes',
        'Make decisions with your head, not your feed',
      ]}
    />
  );
}
