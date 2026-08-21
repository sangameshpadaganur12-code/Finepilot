'use client';

import { Settings } from 'lucide-react';
import { ModulePlaceholder } from '@/components/module-placeholder';

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Manage your FinPilot profile, update your Financial DNA, and control how the app works for you."
      highlights={[
        'Update your name and display preferences',
        'Retake the onboarding to refresh your Financial DNA',
        'Adjust currency and notification preferences',
        'Manage your data and privacy',
      ]}
    />
  );
}
