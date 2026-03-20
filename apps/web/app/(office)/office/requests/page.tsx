'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

type StatusFilter =
  | 'all'
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'تم الإرسال', value: 'SUBMITTED' },
  { label: 'قيد المراجعة', value: 'REVIEWED' },
  { label: 'تم التعيين', value: 'ASSIGNED' },
  { label: 'قيد التنفيذ', value: 'IN_PROGRESS' },
  { label: 'مكتمل', value: 'COMPLETED' },
];

const statusLabels: Record<string, string> = {
  SUBMITTED: 'تم الإرسال',
  REVIEWED: 'قيد المراجعة',
  ASSIGNED: 'تم التعيين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  REVIEWED: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  ASSIGNED: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const priorityLabels: Record<string, string> = {
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'عالي',
  URGENT: 'عاجل',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-sky-50 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const categoryLabels: Record<string, string> = {
  PLUMBING: 'سباكة',
  ELECTRICAL: 'كهرباء',
  HVAC: 'تكييف',
  STRUCTURAL: 'هيكلي',
  APPLIANCE: 'أجهزة',
  COSMETIC: 'تجميلي',
  PAINTING: 'دهان',
  CARPENTRY: 'نجارة',
  PEST_CONTROL: 'مكافحة حشرات',
  ELEVATOR: 'مصاعد',
  SECURITY: 'أمن',
  CLEANING: 'نظافة',
  OTHER: 'أخرى',
};

function getRelativeTime(dateStr: Date | string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-SA');
}

export default function OfficeRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const officeId = getOfficeId();

  const { data: requestsData, isLoading: requestsLoading } = trpc.maintenance.list.useQuery({
    status:
      statusFilter !== 'all'
        ? (statusFilter as
            | 'SUBMITTED'
            | 'REVIEWED'
            | 'ASSIGNED'
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'CANCELLED')
        : undefined,
    buildingId: buildingFilter !== 'all' ? buildingFilter : undefined,
    limit: 50,
  });

  const { data: buildingsData } = trpc.buildings.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );

  const requests = requestsData?.items ?? [];
  const buildings = buildingsData ?? [];

  // Client-side search filter
  const filtered = searchQuery
    ? requests.filter(
        (r) =>
          r.titleAr?.includes(searchQuery) ||
          r.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : requests;

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
          className="focus:border-brand-500 focus:ring-brand-500/20 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pe-4 ps-10 text-sm outline-none transition-colors focus:ring-2"
        />
      </div>

      {/* Status filter pills */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`flex min-h-[44px] shrink-0 items-center rounded-full px-4 py-2.5 text-xs font-medium transition-all ${
              statusFilter === filter.value
                ? 'bg-brand-500 shadow-soft text-white'
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
            <option key={b.id} value={b.id}>
              {b.nameAr}
            </option>
          ))}
        </select>
        <span className="ms-auto text-xs text-[var(--muted-foreground)]">
          {filtered.length} طلب
        </span>
      </div>

      {/* Loading */}
      {requestsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Request Cards */}
      {!requestsLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((request) => {
              const building = buildings.find((b) => b.id === request.buildingId);
              return (
                <motion.div
                  key={request.id}
                  variants={cardVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Link href={`/office/requests/${request.id}`}>
                    <motion.div
                      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                      className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
                            >
                              {statusLabels[request.status] ?? request.status}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${priorityColors[request.priority] ?? ''}`}
                            >
                              {priorityLabels[request.priority] ?? request.priority}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold">
                            {request.titleAr ?? request.titleEn}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {building?.nameAr ?? ''}{' '}
                            {request.category
                              ? ` · ${categoryLabels[request.category] ?? request.category}`
                              : ''}
                          </p>
                        </div>
                        <div className="shrink-0 text-end">
                          <p className="text-[10px] text-[var(--muted-foreground)]">
                            {getRelativeTime(request.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && !requestsLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
                <Search className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-sm font-medium">لا توجد نتائج</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">حاول تغيير الفلتر</p>
              {(statusFilter !== 'all' || buildingFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setBuildingFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-brand-500 hover:text-brand-600 mt-3 text-sm font-medium transition-colors"
                >
                  إزالة الفلتر
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
