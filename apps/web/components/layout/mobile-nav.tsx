'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wrench, Building2, Users, Plus, Home, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mobileNavItems: Record<string, MobileNavItem[]> = {
  office: [
    { label: 'لوحة التحكم', href: '/office/dashboard', icon: LayoutDashboard },
    { label: 'الطلبات', href: '/office/requests', icon: Wrench },
    { label: 'المباني', href: '/office/buildings', icon: Building2 },
    { label: 'الخدمات', href: '/office/providers', icon: Users },
  ],
  tenant: [
    { label: 'الرئيسية', href: '/tenant/dashboard', icon: Home },
    { label: 'بلّغ', href: '/tenant/requests/new', icon: Plus },
    { label: 'طلباتي', href: '/tenant/requests', icon: Wrench },
    { label: 'عقدي', href: '/tenant/contract', icon: FileText },
  ],
  owner: [
    { label: 'الرئيسية', href: '/owner/dashboard', icon: Home },
    { label: 'عقاراتي', href: '/owner/properties', icon: Building2 },
    { label: 'الطلبات', href: '/owner/requests', icon: Wrench },
    { label: 'العقود', href: '/owner/contracts', icon: FileText },
  ],
  provider: [
    { label: 'الرئيسية', href: '/provider/dashboard', icon: Home },
  ],
};

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = mobileNavItems[role] || [];

  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-50 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-brand-500'
                  : 'text-[var(--muted-foreground)]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-brand-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
