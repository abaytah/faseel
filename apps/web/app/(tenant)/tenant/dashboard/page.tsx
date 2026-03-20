'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Building2,
  Plus,
  Wrench,
  MapPin,
  Megaphone,
  ChevronDown,
  Droplets,
  Zap,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  categoryLabels,
  getRelativeTime,
  progressMap,
  getPriorityDotColor,
} from '@/lib/format-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

type RequestFilter = 'active' | 'completed' | 'all';

export default function TenantDashboardPage() {
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('active');
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  // Fetch maintenance requests for the current tenant
  const requestsQuery = trpc.maintenance.list.useQuery(
    { page: 1, limit: 50 },
    { staleTime: 30_000 },
  );

  // Fetch announcements for the tenant
  const announcementsQuery = trpc.announcements.list.useQuery(
    { page: 1, limit: 20 },
    { staleTime: 60_000 },
  );

  const myRequests = requestsQuery.data?.items ?? [];
  const announcements = announcementsQuery.data?.items ?? [];

  const filteredRequests = myRequests.filter((r) => {
    if (requestFilter === 'active') return !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (requestFilter === 'completed') return r.status === 'COMPLETED';
    return true;
  });

  const activeCount = myRequests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const completedCount = myRequests.filter((r) => r.status === 'COMPLETED').length;

  const isLoading = requestsQuery.isLoading;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Quick Report FAB */}
      <motion.div variants={itemVariants}>
        <Link href="/tenant/requests/new">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="from-brand-500 to-brand-600 shadow-card relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-l p-6 text-white"
          >
            <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -end-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h3 className="text-lg font-bold">بلّغ عن مشكلة</h3>
              <p className="mt-1 text-sm opacity-80">أخبرنا بالمشكلة وسنتولى الباقي خلال ساعة</p>
            </div>
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Plus className="h-7 w-7" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Emergency Shortcuts */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <Link href="/tenant/requests/new?category=PLUMBING&priority=URGENT">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-center transition-all dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
              <Droplets className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-[11px] font-medium text-red-700 dark:text-red-300">
              تسريب مياه عاجل
            </span>
          </motion.div>
        </Link>
        <Link href="/tenant/requests/new?category=ELECTRICAL&priority=URGENT">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center transition-all dark:border-amber-800 dark:bg-amber-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              انقطاع كهرباء
            </span>
          </motion.div>
        </Link>
        <Link href="/tenant/requests/new?category=ELEVATOR&priority=URGENT">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center transition-all dark:border-orange-800 dark:bg-orange-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40">
              <ArrowUpDown className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-[11px] font-medium text-orange-700 dark:text-orange-300">
              مصعد عالق
            </span>
          </motion.div>
        </Link>
      </motion.div>

      {/* My Requests */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">طلباتي</h3>
          <div className="flex items-center gap-1 rounded-lg bg-[var(--secondary)] p-0.5">
            {[
              { key: 'active' as const, label: 'نشطة', count: activeCount },
              { key: 'completed' as const, label: 'مكتملة', count: completedCount },
              { key: 'all' as const, label: 'الكل', count: myRequests.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRequestFilter(tab.key)}
                className={`relative rounded-md px-3 py-1 text-[10px] font-medium transition-all ${
                  requestFilter === tab.key
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-brand-500 h-6 w-6 animate-spin" />
          </div>
        ) : requestsQuery.isError ? (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-red-400" />
            <p className="text-sm text-red-500">حدث خطأ في تحميل الطلبات</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredRequests.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
                  <Wrench className="h-7 w-7 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {requestFilter === 'active'
                    ? 'لا توجد طلبات نشطة حالياً'
                    : requestFilter === 'completed'
                      ? 'لا توجد طلبات مكتملة'
                      : 'لا توجد طلبات'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={requestFilter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                {filteredRequests.map((request, index) => {
                  const progress = progressMap[request.status] ?? 0;
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/tenant/requests/${request.id}`}>
                        <div className="group rounded-xl border border-transparent p-3 transition-all hover:border-[var(--border)] hover:bg-[var(--secondary)] hover:shadow-sm">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getPriorityDotColor(request.priority)}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{request.titleAr}</p>
                              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                {categoryLabels[request.category] ?? request.category}
                              </p>
                              {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--secondary)] group-hover:bg-[var(--background)]">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                                      className="bg-brand-500 h-full rounded-full"
                                    />
                                  </div>
                                  <span className="text-[10px] text-[var(--muted-foreground)]">
                                    {progress}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
                              >
                                {statusLabels[request.status] ?? request.status}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)]">
                                {getRelativeTime(request.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Building Announcements */}
      {announcementsQuery.isLoading
        ? null
        : announcements.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <Megaphone className="text-brand-500 h-4 w-4" />
                <h3 className="text-sm font-bold">إعلانات المبنى</h3>
              </div>

              <div className="space-y-2">
                {announcements.map((ann, index) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <button
                      onClick={() =>
                        setExpandedAnnouncement(expandedAnnouncement === ann.id ? null : ann.id)
                      }
                      className="w-full text-start"
                    >
                      <div className="rounded-xl bg-[var(--secondary)] p-3 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                            <Megaphone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium">{ann.titleAr}</p>
                            <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                              {getRelativeTime(ann.createdAt)}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${
                              expandedAnnouncement === ann.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>

                        <AnimatePresence>
                          {expandedAnnouncement === ann.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-3 ps-10 text-xs leading-relaxed text-[var(--muted-foreground)]">
                                {ann.bodyAr}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

      {/* Floating Action Button */}
      <div className="fixed bottom-20 start-4 z-40 lg:hidden">
        <Link href="/tenant/requests/new">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-500 shadow-elevated flex h-14 w-14 items-center justify-center rounded-full text-white"
          >
            <Plus className="h-7 w-7" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
