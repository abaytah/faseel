'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileNav } from './mobile-nav';
import { TrialBannerUI } from './trial-banner';
import { trpc } from '@/lib/trpc';

interface AppShellProps {
  children: React.ReactNode;
  role: 'office' | 'tenant' | 'owner' | 'provider';
  title: string;
  subtitle?: string;
}

export function AppShell({ children, role, title, subtitle }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  // Trial banner: fetch current subscription for office role
  const subscriptionQuery = trpc.subscriptions.getCurrent.useQuery(undefined, {
    enabled: role === 'office',
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const trialDaysRemaining =
    subscriptionQuery.data?.isTrial && subscriptionQuery.data.daysRemaining !== null
      ? subscriptionQuery.data.daysRemaining
      : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar — desktop only, fixed on the end (right in RTL) */}
      <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Scoped style for responsive margin */}
      <style>{`
        @media (min-width: 1024px) {
          #app-main { margin-inline-start: ${sidebarWidth}px; }
        }
      `}</style>

      {/* Main content */}
      <div id="app-main" className="transition-[margin] duration-300">
        {/* Trial Banner for office users */}
        {role === 'office' && trialDaysRemaining !== null && (
          <TrialBannerUI daysRemaining={trialDaysRemaining} />
        )}
        <TopBar title={title} subtitle={subtitle} />
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 pb-24 sm:px-6 lg:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav role={role} />
    </div>
  );
}
