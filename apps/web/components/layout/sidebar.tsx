'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Wrench,
  Building2,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Home,
  Plus,
  FileText,
  Settings,
  UserCircle,
  Globe,
  MessageCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUser, getRoles, setTokens } from '@/lib/auth';
import { trpc } from '@/lib/trpc';

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
  provider: [{ label: 'لوحة التحكم', href: '/provider/dashboard', icon: LayoutDashboard }],
};

/** Shared links that appear for all roles */
const sharedNavItems: NavItem[] = [
  { label: 'الموارد والمنصات', href: '/resources', icon: Globe },
  { label: 'الملف الشخصي', href: '/profile', icon: User },
];

const defaultRoleLabels: Record<string, string> = {
  office: 'مكتب عقاري',
  tenant: 'مستأجر',
  owner: 'مالك',
  provider: 'مزود خدمة',
};

const roleDisplayNames: Record<string, string> = {
  office: 'مكتب عقاري',
  tenant: 'مستأجر',
  owner: 'مالك',
  provider: 'مزود خدمة',
};

function getRoleLabel(role: string): string {
  const user = getUser();
  if (role === 'office') {
    // For office, show office name from user data or fallback
    return user?.nameAr && user.nameAr !== user.phone
      ? user.nameAr
      : (defaultRoleLabels[role] ?? role);
  }
  // For other roles, show user's Arabic name or fallback
  return user?.nameAr && user.nameAr !== user.phone
    ? user.nameAr
    : (defaultRoleLabels[role] ?? role);
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed start-0 top-0 z-40 hidden h-screen flex-col border-e border-[var(--border)] bg-[var(--sidebar)] lg:flex"
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
            <div className="bg-brand-500 flex h-9 w-9 items-center justify-center rounded-xl">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold">فسيل</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="bg-brand-500 mx-auto flex h-9 w-9 items-center justify-center rounded-xl">
            <Home className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="bg-brand-50 dark:bg-brand-900/30 absolute inset-0 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('relative z-10 h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && <span className="relative z-10">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Shared Links (Resources, Profile) */}
        {!collapsed && (
          <div className="mt-3 border-t border-[var(--sidebar-border)] pt-3">
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              روابط عامة
            </p>
          </div>
        )}
        <ul className={cn('flex flex-col gap-1', !collapsed && 'mt-0', collapsed && 'mt-3')}>
          {sharedNavItems.map((item) => {
            const isActive =
              pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                  )}
                >
                  <Icon className={cn('relative z-10 h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && <span className="relative z-10">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Switcher + User */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        {!collapsed && <RoleSwitcher currentRole={role} />}
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--sidebar-accent)] px-3 py-2">
            <div className="bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <span className="text-xs font-bold">{getRoleLabel(role)?.[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{getRoleLabel(role)}</p>
            </div>
            <Link
              href="/profile"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Settings className="h-4 w-4" />
            </Link>
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

function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const roles = getRoles();
  const switchRole = trpc.auth.switchRole.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, localStorage.getItem('faseel-refresh-token') ?? '');
      const token = data.accessToken;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]!));
        const newRole = payload.role as string;
        const dashPaths: Record<string, string> = {
          office: '/office/dashboard',
          tenant: '/tenant/dashboard',
          owner: '/owner/dashboard',
          provider: '/provider/dashboard',
        };
        router.push(dashPaths[newRole] ?? '/');
      } catch {
        router.push('/');
      }
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!roles || roles.length <= 1) return null;

  const otherRoles = roles.filter((r) => {
    const sessionRole = mapDbRoleToSession(r.role);
    return sessionRole !== currentRole;
  });

  if (otherRoles.length === 0) return null;

  return (
    <div ref={ref} className="relative mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
      >
        <span>{roleDisplayNames[currentRole] ?? currentRole}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute bottom-full start-0 mb-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 shadow-lg">
          {otherRoles.map((r) => {
            const sessionRole = mapDbRoleToSession(r.role);
            return (
              <button
                key={r.role + (r.officeId ?? '')}
                onClick={() => {
                  setOpen(false);
                  switchRole.mutate({
                    role: sessionRole as 'tenant' | 'office' | 'provider' | 'owner',
                    officeId: r.officeId ?? undefined,
                  });
                }}
                disabled={switchRole.isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                <UserCircle className="h-4 w-4" />
                <span>{roleDisplayNames[sessionRole] ?? sessionRole}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function mapDbRoleToSession(dbRole: string): string {
  switch (dbRole) {
    case 'OFFICE_ADMIN':
      return 'office';
    case 'OWNER':
      return 'owner';
    case 'TENANT':
      return 'tenant';
    case 'SERVICE_PROVIDER':
      return 'provider';
    default:
      return 'tenant';
  }
}
