'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  Phone,
  Camera,
  CircleDot,
  Droplets,
  Zap,
  Wind,
  Hammer,
  ShieldAlert,
  ArrowUpDown,
  Power,
  Paintbrush,
  DollarSign,
  BadgeCheck,
  Trophy,
  Navigation,
  Play,
  Flag,
  X,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  formatSAR,
  formatDate,
  getRelativeTime,
} from '@/lib/format-utils';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

// Map category to icon component
const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  const cls = className || 'h-7 w-7';
  switch (category) {
    case 'PLUMBING':
      return <Droplets className={cls} />;
    case 'ELECTRICAL':
      return <Zap className={cls} />;
    case 'HVAC':
      return <Wind className={cls} />;
    case 'STRUCTURAL':
      return <Hammer className={cls} />;
    case 'SECURITY':
      return <ShieldAlert className={cls} />;
    case 'ELEVATOR':
      return <ArrowUpDown className={cls} />;
    case 'COSMETIC':
    case 'PAINTING':
      return <Paintbrush className={cls} />;
    default:
      return <Wrench className={cls} />;
  }
};

const categoryBgColors: Record<string, string> = {
  PLUMBING: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  ELECTRICAL: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  HVAC: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  STRUCTURAL: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  SECURITY: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  ELEVATOR: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  COSMETIC: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  PAINTING: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  APPLIANCE: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  OTHER: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

// Progress steps for provider workflow
const PROGRESS_STEPS = [
  { key: 'IN_PROGRESS', label: 'جاري العمل', icon: Play },
  { key: 'COMPLETED', label: 'مكتمل', icon: Flag },
] as const;

export default function ProviderDashboardPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'profile'>('active');
  const [completionDialogJob, setCompletionDialogJob] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Fetch maintenance requests assigned to this provider
  const {
    data: requestsData,
    isLoading,
    refetch,
  } = trpc.maintenance.list.useQuery({
    page: 1,
    limit: 50,
  });

  const updateStatusMutation = trpc.maintenance.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });

  const allJobs = requestsData?.items ?? [];

  // Split into active and completed
  const activeJobs = allJobs.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status));
  const completedJobs = allJobs.filter((r) => r.status === 'COMPLETED');

  // Priority sort for active jobs
  const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedActiveJobs = [...activeJobs].sort(
    (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3),
  );

  // Handlers
  function handleStartWork(jobId: string) {
    updateStatusMutation.mutate({ id: jobId, status: 'IN_PROGRESS' });
    toast.success('تم تحديث الحالة: جاري العمل');
  }

  function openCompletionDialog(jobId: string) {
    setCompletionNotes('');
    setCompletionDialogJob(jobId);
  }

  function handleComplete(jobId: string) {
    updateStatusMutation.mutate({
      id: jobId,
      status: 'COMPLETED',
      notes: completionNotes || undefined,
    });
    toast.success('تم إتمام المهمة بنجاح');
    setCompletionDialogJob(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton Provider Header */}
        <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
        {/* Skeleton Tabs */}
        <div className="shadow-soft h-12 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
        {/* Skeleton Job Cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
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
      {/* Onboarding tip when zero jobs */}
      {allJobs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/30"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40">
              <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-purple-900 dark:text-purple-100">
                لا توجد مهام حالياً
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                ستظهر هنا عندما يتم تعيينك لبلاغ صيانة. ستتلقى إشعاراً فور وصول مهمة جديدة.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Provider Header */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex items-start gap-4">
          <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold">
            <Wrench className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">لوحة مقدم الخدمة</h2>
            <p className="text-xs text-[var(--muted-foreground)]">إدارة المهام والطلبات</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {activeJobs.length}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">نشطة</p>
          </div>
          <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {completedJobs.length}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">مكتملة</p>
          </div>
          <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
            <p className="text-lg font-bold">{allJobs.length}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">إجمالي</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5"
      >
        {[
          { key: 'active', label: `نشطة (${activeJobs.length})`, icon: CircleDot },
          { key: 'completed', label: `مكتملة (${completedJobs.length})`, icon: CheckCircle2 },
          { key: 'profile', label: 'الملف', icon: BadgeCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              activeTab === key
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </motion.div>

      {/* === ACTIVE JOBS TAB === */}
      {activeTab === 'active' && (
        <>
          {sortedActiveJobs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
            >
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
              <h3 className="mb-1 text-base font-bold">لا توجد مهام نشطة</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                جميع المهام مكتملة. ستصلك إشعارات عند تعيين مهام جديدة.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {sortedActiveJobs.map((job) => {
                const isInProgress = job.status === 'IN_PROGRESS';
                const isAssigned = job.status === 'ASSIGNED';
                const isSubmitted = job.status === 'SUBMITTED' || job.status === 'REVIEWED';

                return (
                  <motion.div
                    key={job.id}
                    variants={itemVariants}
                    className="shadow-soft overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                  >
                    {/* Job Header */}
                    <div className="p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${categoryBgColors[job.category] ?? categoryBgColors.OTHER}`}
                        >
                          <CategoryIcon category={job.category} className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">
                            {job.titleAr || job.titleEn || 'طلب صيانة'}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {categoryLabels[job.category] ?? job.category}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[job.priority] ?? ''}`}
                        >
                          {priorityLabels[job.priority] ?? job.priority}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[job.status] ?? ''}`}
                        >
                          {statusLabels[job.status] ?? job.status}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {getRelativeTime(job.createdAt)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {(isAssigned || isSubmitted) && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStartWork(job.id)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-brand-500 flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-white disabled:opacity-60"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            بدء العمل
                          </motion.button>
                        )}

                        {isInProgress && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openCompletionDialog(job.id)}
                            disabled={updateStatusMutation.isPending}
                            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-medium text-white disabled:opacity-60"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            إتمام المهمة
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === COMPLETED JOBS TAB === */}
      {activeTab === 'completed' && (
        <>
          {completedJobs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
            >
              <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
              <h3 className="mb-1 text-base font-bold">لا توجد مهام مكتملة بعد</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                ستظهر المهام المكتملة هنا بعد إتمامها.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${categoryBgColors[job.category] ?? categoryBgColors.OTHER}`}
                    >
                      <CategoryIcon category={job.category} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {job.titleAr || job.titleEn || 'طلب صيانة'}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {categoryLabels[job.category] ?? job.category}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      مكتمل
                    </span>
                  </div>
                  <div className="text-end text-[10px] text-[var(--muted-foreground)]">
                    {getRelativeTime(job.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* === PROFILE TAB === */}
      {activeTab === 'profile' && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <BadgeCheck className="text-brand-500 h-5 w-5" />
            <h3 className="text-sm font-bold">ملخص الأداء</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {completedJobs.length}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">مهمة مكتملة</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {activeJobs.length}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">مهمة نشطة</p>
            </div>
          </div>

          {/* Category breakdown */}
          {allJobs.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">
                التوزيع حسب التصنيف
              </p>
              <div className="space-y-2">
                {Object.entries(
                  allJobs.reduce(
                    (acc, job) => {
                      acc[job.category] = (acc[job.category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-lg bg-[var(--secondary)] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={cat} className="h-4 w-4" />
                      <span className="text-xs">{categoryLabels[cat] ?? cat}</span>
                    </div>
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Completion Dialog */}
      <AnimatePresence>
        {completionDialogJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => setCompletionDialogJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base font-bold">إتمام المهمة</h3>
                </div>
                <button
                  onClick={() => setCompletionDialogJob(null)}
                  className="rounded-lg p-1 hover:bg-[var(--secondary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="أي ملاحظات عن العمل المنجز..."
                  rows={3}
                  className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3 text-sm outline-none focus:ring-1"
                />
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleComplete(completionDialogJob)}
                  disabled={updateStatusMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  تأكيد الإتمام
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCompletionDialogJob(null)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
