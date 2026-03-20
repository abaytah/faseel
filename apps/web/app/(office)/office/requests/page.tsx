'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import {
  maintenanceRequests,
  buildings,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  costLabels,
  costColors,
  getRelativeTime,
  formatSAR,
  getBuildingById,
  getUnitById,
  categoryLabels,
  type RequestStatus,
} from '@/lib/mock-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const statusFilters: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'تم الإرسال', value: 'submitted' },
  { label: 'قيد المراجعة', value: 'reviewed' },
  { label: 'تم التعيين', value: 'assigned' },
  { label: 'قيد التنفيذ', value: 'in_progress' },
  { label: 'مكتمل', value: 'completed' },
];

export default function OfficeRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = maintenanceRequests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (buildingFilter !== 'all' && r.buildingId !== buildingFilter) return false;
    if (searchQuery && !r.title.includes(searchQuery) && !r.description.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="بحث في الطلبات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] ps-10 pe-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              statusFilter === filter.value
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Building filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none"
        >
          <option value="all">جميع المباني</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <span className="ms-auto text-xs text-[var(--muted-foreground)]">
          {filtered.length} طلب
        </span>
      </div>

      {/* Request Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((request) => {
            const building = getBuildingById(request.buildingId);
            const unit = request.unitId ? getUnitById(request.unitId) : null;
            return (
              <motion.div key={request.id} variants={cardVariants} exit={{ opacity: 0, scale: 0.95 }} layout>
                <Link href={`/office/requests/${request.id}`}>
                  <motion.div
                    whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft transition-colors sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                            {statusLabels[request.status]}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${priorityColors[request.priority]}`}>
                            {priorityLabels[request.priority]}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${costColors[request.costResponsibility]}`}>
                            {costLabels[request.costResponsibility]}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold">{request.title}</h3>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {building?.name} {unit ? `— ${unit.unitNumber}` : ''} · {categoryLabels[request.category]}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        {request.estimatedCost && (
                          <p className="text-sm font-bold">{formatSAR(request.estimatedCost)}</p>
                        )}
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {getRelativeTime(request.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                      {request.description}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
              <Search className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-sm font-medium">لا توجد طلبات</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">جرب تغيير معايير البحث</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
