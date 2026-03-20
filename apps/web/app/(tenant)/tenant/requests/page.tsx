'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Wrench,
  Plus,
} from 'lucide-react';
import {
  tenants,
  getRequestsByTenant,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  getRelativeTime,
} from '@/lib/mock-data';

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
  const tenant = tenants[0];
  const myRequests = getRequestsByTenant(tenant.id);

  const filteredRequests = myRequests.filter((r) => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(r.status);
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  const activeCount = myRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const completedCount = myRequests.filter((r) => r.status === 'completed').length;

  const progressMap: Record<string, number> = {
    submitted: 15,
    reviewed: 30,
    assigned: 50,
    in_progress: 75,
    completed: 100,
    cancelled: 0,
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
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
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-medium text-white shadow-soft transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            <span>بلاغ جديد</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 rounded-lg bg-[var(--secondary)] p-0.5">
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
              {filter === 'active' ? 'لا توجد طلبات نشطة' : filter === 'completed' ? 'لا توجد طلبات مكتملة' : 'لا توجد طلبات'}
            </p>
            <Link href="/tenant/requests/new" className="mt-3 text-sm text-brand-500 hover:underline">
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
              const progress = progressMap[request.status] || 0;
              return (
                <motion.div
                  key={request.id}
                  variants={itemVariants}
                >
                  <Link href={`/tenant/requests/${request.id}`}>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft transition-all hover:shadow-card hover:border-brand-200">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          request.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                          request.priority === 'high' ? 'bg-orange-500' :
                          request.priority === 'medium' ? 'bg-sky-500' :
                          'bg-slate-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{request.title}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                            {categoryLabels[request.category]} · {request.locationLabel}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                            {getRelativeTime(request.updatedAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                            {statusLabels[request.status]}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${priorityColors[request.priority]}`}>
                            {priorityLabels[request.priority]}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar for active requests */}
                      {request.status !== 'completed' && request.status !== 'cancelled' && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full bg-brand-500"
                            />
                          </div>
                          <span className="text-[10px] text-[var(--muted-foreground)]">{progress}%</span>
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
    </motion.div>
  );
}
