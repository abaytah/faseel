'use client';

import { AppShell } from '@/components/layout/app-shell';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/office/dashboard': { title: 'لوحة التحكم', subtitle: 'مكتب الجزيرة العقاري' },
  '/office/requests': { title: 'طلبات الصيانة', subtitle: 'جميع الطلبات' },
  '/office/buildings': { title: 'المباني', subtitle: 'إدارة المباني والوحدات' },
  '/office/providers': { title: 'مقدمي الخدمات', subtitle: 'شركات الصيانة المعتمدة' },
};

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Find matching title - exact match or starts with
  const pageInfo = (pathname ? pageTitles[pathname] : undefined) ||
    Object.entries(pageTitles).find(([key]) => pathname?.startsWith(key))?.[1] ||
    { title: 'مكتب الجزيرة العقاري' };

  return (
    <AppShell role="office" title={pageInfo.title} subtitle={pageInfo.subtitle}>
      {children}
    </AppShell>
  );
}
