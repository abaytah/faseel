'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Filter, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  getRelativeTime,
} from '@/lib/format-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

type FilterTab = 'all' | 'active' | 'completed';

export default function OwnerRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const { data, isLoading } = trpc.maintenance.list.useQuery({
    page: 1,
    limit: 50,
  });

  const allRequests = data?.items ?? [];

  // Filter logic
  const filteredRequests = allRequests.filter((r) => {
    switch (activeFilter) {
      case 'active':
        return !['COMPLETED', 'CANCELLED'].includes(r.status);
      case 'completed':
        return r.status === 'COMPLETED';
      default:
        return true;
    }
  });

  // Counts for tabs
  const activeCount = allRequests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const completedCount = allRequests.filter((r) => r.status === 'COMPLETED').length;

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: allRequests.length },
    { key: 'active', label: 'نشطة', count: activeCount },
    { key: 'completed', label: 'مكتملة', count: completedCount },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">طلبات الصيانة</h1>
          <p className="text-xs text-[var(--muted-foreground)]">{allRequests.length} طلب</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5"
      >
        {filterTabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              activeFilter === key
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
            }`}
          >
            <span>{label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                activeFilter === key
                  ? 'bg-[var(--background)]/20 text-[var(--background)]'
                  : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Request List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
          >
            <Filter className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">لا توجد طلبات في هذا التصنيف</p>
          </motion.div>
        )}

        {filteredRequests.map((request) => (
          <motion.div
            key={request.id}
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {request.titleAr || request.titleEn || 'طلب صيانة'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {categoryLabels[request.category] ?? request.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
                >
                  {statusLabels[request.status] ?? request.status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[request.priority] ?? ''}`}
                >
                  {priorityLabels[request.priority] ?? request.priority}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                <Clock className="ml-0.5 inline h-2.5 w-2.5" />
                {getRelativeTime(request.createdAt)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
