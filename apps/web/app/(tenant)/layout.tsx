'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/tenant/dashboard': { title: 'الرئيسية', subtitle: 'مرحباً' },
  '/tenant/requests/new': { title: 'بلّغ عن مشكلة', subtitle: 'أخبرنا بالمشكلة وسنتولى الباقي' },
  '/tenant/requests': { title: 'طلباتي', subtitle: 'جميع طلبات الصيانة' },
  '/tenant/contract': { title: 'تفاصيل العقد', subtitle: 'عقد الإيجار الخاص بك' },
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const pageInfo =
    (pathname ? pageTitles[pathname] : undefined) ||
    (pathname?.startsWith('/tenant/requests/')
      ? { title: 'تفاصيل الطلب' }
      : pathname?.startsWith('/tenant/contract')
        ? { title: 'تفاصيل العقد' }
        : { title: 'الرئيسية' });

  return (
    <AuthGuard allowedRole="tenant">
      <AppShell role="tenant" title={pageInfo.title} subtitle={pageInfo.subtitle}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
