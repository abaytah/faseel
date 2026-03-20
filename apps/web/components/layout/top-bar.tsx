'use client';

import { Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { notificationCount } from '@/lib/mock-data';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-[var(--muted-foreground)]">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--secondary)] transition-colors hover:bg-[var(--accent)]">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -start-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
