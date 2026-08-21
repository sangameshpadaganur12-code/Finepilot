'use client';

import { Target } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function GoalsPage() {
  return (
    <ModulePlaceholder
      icon={Target}
      title="Goals"
      description="Set, simulate, and track every financial goal — from your first SIP to retirement. See exactly what it takes to reach each one."
      highlights={[
        'Create goals with target amounts and timelines',
        'Simulate different monthly contribution scenarios',
        'Track progress visually with real-time updates',
        'Get alerts when a goal is falling behind schedule',
      ]}
    />
  );
}
