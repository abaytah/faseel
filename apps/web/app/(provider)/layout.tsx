'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="provider" title="لوحة مقدم الخدمة" subtitle="مؤسسة الفيصل للتكييف والتبريد">
      {children}
    </AppShell>
  );
}
