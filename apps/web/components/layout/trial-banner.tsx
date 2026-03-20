'use client';

import { Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

/**
 * Trial banner: shown when an office has a subscription with no stripeSubscriptionId (= trial).
 * Displays remaining days and an upgrade CTA.
 */
export function TrialBanner() {
  const usageQuery = trpc.subscriptions.getUsage.useQuery(
    { officeId: '' },
    {
      enabled: false, // Disabled by default; enabled when we have an officeId
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  );

  // We use a lightweight approach: the subscription data is included in the usage response.
  // If the query isn't enabled or hasn't loaded, we try a simpler check.
  // For the trial banner, we check if the subscription has no stripeSubscriptionId.
  // Since we can't easily get the subscription from the client without an officeId,
  // we'll use the plans endpoint + a dedicated check in the layout.

  // For now, this component is designed to be rendered conditionally by the parent
  // when trial data is available.
  return null;
}

interface TrialBannerUIProps {
  daysRemaining: number;
}

/**
 * Pure UI component for the trial banner.
 * Parent is responsible for passing the correct days remaining.
 */
export function TrialBannerUI({ daysRemaining }: TrialBannerUIProps) {
  if (daysRemaining <= 0) {
    return (
      <div className="flex items-center justify-between gap-3 bg-red-500 px-4 py-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-medium">انتهت الفترة التجريبية. اشترك الآن للاستمرار.</span>
        </div>
        <Link
          href="/office/subscription"
          className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-[10px] font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <span>اشترك</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const isUrgent = daysRemaining <= 7;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 text-xs ${
        isUrgent
          ? 'bg-amber-500 text-white'
          : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-medium">
          لديك {daysRemaining} {daysRemaining === 1 ? 'يوم' : daysRemaining <= 10 ? 'أيام' : 'يوم'}{' '}
          متبقية في الفترة التجريبية
        </span>
        <span className="hidden text-[10px] opacity-80 sm:inline">
          / {daysRemaining} days left in your free trial
        </span>
      </div>
      <Link
        href="/office/subscription"
        className={`flex items-center gap-1 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors ${
          isUrgent
            ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
            : 'bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700'
        }`}
      >
        <span>ترقية</span>
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
