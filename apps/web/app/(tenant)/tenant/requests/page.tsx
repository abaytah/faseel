'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Wrench, Plus, Loader2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  getRelativeTime,
  progressMap,
  getPriorityDotColor,
} from '@/lib/format-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

type RequestFilter = 'all' | 'active' | 'completed';

export default function TenantRequestsListPage() {
  const [filter, setFilter] = useState<RequestFilter>('all');

  const requestsQuery = trpc.maintenance.list.useQuery(
    { page: 1, limit: 50 },
    { staleTime: 30_000 },
  );

  const myRequests = requestsQuery.data?.items ?? [];

  const filteredRequests = myRequests.filter((r) => {
    if (filter === 'active') return !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'completed') return r.status === 'COMPLETED';
    return true;
  });

  const activeCount = myRequests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const completedCount = myRequests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header with new request button */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">طلباتي</h2>
          <p className="text-xs text-[var(--muted-foreground)]">{myRequests.length} طلب اجمالي</p>
        </div>
        <Link href="/tenant/requests/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-brand-500 shadow-soft hover:bg-brand-600 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>بلاغ جديد</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-1 rounded-lg bg-[var(--secondary)] p-0.5"
      >
        {[
          { key: 'all' as const, label: 'الكل', count: myRequests.length },
          { key: 'active' as const, label: 'نشطة', count: activeCount },
          { key: 'completed' as const, label: 'مكتملة', count: completedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </motion.div>

      {/* Request list */}
      {requestsQuery.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-brand-500 h-6 w-6 animate-spin" />
        </div>
      ) : requestsQuery.isError ? (
        <div className="flex flex-col items-center py-16 text-center">
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
              className="flex flex-col items-center py-16 text-center"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
                <Wrench className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {filter === 'active'
                  ? 'لا توجد طلبات نشطة'
                  : filter === 'completed'
                    ? 'لا توجد طلبات مكتملة'
                    : 'لا توجد طلبات'}
              </p>
              <Link
                href="/tenant/requests/new"
                className="text-brand-500 mt-3 text-sm hover:underline"
              >
                أنشئ أول طلب صيانة
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {filteredRequests.map((request) => {
                const progress = progressMap[request.status] ?? 0;
                return (
                  <motion.div key={request.id} variants={itemVariants}>
                    <Link href={`/tenant/requests/${request.id}`}>
                      <div className="shadow-soft hover:shadow-card hover:border-brand-200 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getPriorityDotColor(request.priority)}`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{request.titleAr}</p>
                            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                              {categoryLabels[request.category] ?? request.category}
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                              {getRelativeTime(request.createdAt)}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
                            >
                              {statusLabels[request.status] ?? request.status}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${priorityColors[request.priority] ?? ''}`}
                            >
                              {priorityLabels[request.priority] ?? request.priority}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar for active requests */}
                        {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]">
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
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
