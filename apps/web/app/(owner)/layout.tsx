'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/auth-guard';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRole="owner">
      <AppShell role="owner" title="لوحة المالك">
        {children}
      </AppShell>
    </AuthGuard>
  );
}
