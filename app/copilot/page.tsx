'use client';

import { MessageSquare } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function CopilotPage() {
  return (
    <ModulePlaceholder
      icon={MessageSquare}
      title="Financial Copilot"
      description="Ask questions about your money in plain English. Get clear, numbers-backed answers grounded in your own financial data."
      highlights={[
        'Ask things like “How much can I safely invest this month?”',
        'Get explanations grounded in your real transactions and holdings',
        'Understand why a recommendation was made, not just what to do',
        'Every number is computed deterministically — no AI guessing the math',
      ]}
    />
  );
}
