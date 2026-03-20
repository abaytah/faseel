'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="owner" title="لوحة المالك" subtitle="أحمد بن محمد العتيبي">
      {children}
    </AppShell>
  );
}
