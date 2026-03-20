'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/auth-guard';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRole="provider">
      <AppShell role="provider" title="لوحة مقدم الخدمة">
        {children}
      </AppShell>
    </AuthGuard>
  );
}
