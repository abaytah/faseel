'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  Building2,
  Users,
  ChevronRight,
  ChevronLeft,
  Home,
  Plus,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: 'office' | 'tenant' | 'owner' | 'provider';
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: Record<string, NavItem[]> = {
  office: [
    { label: 'لوحة التحكم', href: '/office/dashboard', icon: LayoutDashboard },
    { label: 'طلبات الصيانة', href: '/office/requests', icon: Wrench },
    { label: 'المباني', href: '/office/buildings', icon: Building2 },
    { label: 'مقدمي الخدمات', href: '/office/providers', icon: Users },
  ],
  tenant: [
    { label: 'لوحة التحكم', href: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'بلّغ عن مشكلة', href: '/tenant/requests/new', icon: Plus },
    { label: 'طلباتي', href: '/tenant/requests', icon: Wrench },
    { label: 'عقدي', href: '/tenant/contract', icon: FileText },
  ],
  owner: [
    { label: 'لوحة التحكم', href: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'عقاراتي', href: '/owner/properties', icon: Building2 },
    { label: 'طلبات الصيانة', href: '/owner/requests', icon: Wrench },
    { label: 'العقود', href: '/owner/contracts', icon: FileText },
  ],
  provider: [
    { label: 'لوحة التحكم', href: '/provider/dashboard', icon: LayoutDashboard },
  ],
};

const roleLabels: Record<string, string> = {
  office: 'مكتب الجزيرة العقاري',
  tenant: 'خالد بن سعود المالكي',
  owner: 'أحمد بن محمد العتيبي',
  provider: 'مؤسسة الفيصل للتكييف',
};

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 start-0 z-40 hidden h-screen flex-col border-e border-[var(--border)] bg-[var(--sidebar)] lg:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold">بروبتك ١</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <Home className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-900/30"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('relative z-10 h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && (
                    <span className="relative z-10">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--sidebar-accent)] px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400">
              <span className="text-xs font-bold">{roleLabels[role]?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl py-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Link back home */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span>الرئيسية</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
