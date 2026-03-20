'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Building2,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  Wallet,
  FileText,
  Upload,
  CalendarClock,
  ShieldAlert,
  ArrowUpDown,
  Flame,
  Banknote,
  Percent,
  Timer,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  User,
  AlertCircle,
  CircleDollarSign,
  Zap,
  Droplets,
  Hammer,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';
import { useToast } from '@/components/ui/toast-provider';

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

function formatSAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}

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

// ==========================================================================
// MAIN DASHBOARD
// ==========================================================================

export default function OfficeDashboardPage() {
  const toast = useToast();
  const officeId = getOfficeId();

  // Fetch buildings
  const { data: buildingsData, isLoading: buildingsLoading } = trpc.buildings.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );

  // Fetch all requests (for stats)
  const { data: allRequestsData, isLoading: requestsLoading } = trpc.maintenance.list.useQuery({
    limit: 50,
  });

  // Fetch recent requests (sorted by creation, limit 5)
  const { data: recentRequestsData } = trpc.maintenance.list.useQuery({
    limit: 5,
  });

  const buildings = buildingsData ?? [];
  const allRequests = allRequestsData?.items ?? [];
  const recentRequests = recentRequestsData?.items ?? [];

  const isLoading = buildingsLoading || requestsLoading;

  // Compute stats from API data
  const totalBuildings = buildings.length;
  const totalUnits = buildings.reduce((sum, b) => sum + (b.unitCount ?? b.totalUnits ?? 0), 0);
  const activeRequests = allRequests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const urgentRequests = allRequests.filter(
    (r) => r.priority === 'URGENT' && !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const highRequests = allRequests.filter(
    (r) => r.priority === 'HIGH' && !['COMPLETED', 'CANCELLED'].includes(r.status),
  ).length;
  const completedThisMonth = allRequests.filter((r) => {
    if (r.status !== 'COMPLETED') return false;
    const created = new Date(r.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  // --- KPI Cards Data ---
  const kpis = [
    {
      label: 'المباني المُدارة',
      value: totalBuildings,
      icon: Building2,
      color: 'text-brand-500',
      bg: 'bg-brand-50 dark:bg-brand-900/20',
      sub: `${totalUnits} وحدة`,
      subColor: 'text-[var(--muted-foreground)]',
    },
    {
      label: 'طلبات نشطة',
      value: activeRequests,
      icon: Wrench,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      sub: `${urgentRequests} عاجل · ${highRequests} عالي`,
      subColor:
        urgentRequests > 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--muted-foreground)]',
    },
    {
      label: 'مكتمل هذا الشهر',
      value: completedThisMonth,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      sub: `من ${allRequests.length} طلب إجمالي`,
      subColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-3 h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="mb-2 h-6 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        {/* Skeleton Quick Actions */}
        <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
        {/* Skeleton List */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2">
            <div className="mb-4 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          </div>
          <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-3">
            <div className="mb-4 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ============================================================ */}
      {/* ONBOARDING: Welcome card when zero buildings                 */}
      {/* ============================================================ */}
      {totalBuildings === 0 && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50 p-6 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                مرحباً بك في فسيل!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                ابدأ بإعداد منصتك في 3 خطوات بسيطة
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-900/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                ١
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  أضف مبناك الأول
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  أدخل بيانات المبنى والعنوان
                </p>
              </div>
              <Link
                href="/office/buildings/new"
                className="ms-auto rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
              >
                إضافة
              </Link>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/40 p-3 dark:bg-gray-900/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white dark:bg-gray-600">
                ٢
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  أضف الوحدات والمستأجرين
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  حدد الشقق وأضف بيانات المستأجرين
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/40 p-3 dark:bg-gray-900/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white dark:bg-gray-600">
                ٣
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ابدأ استقبال بلاغات الصيانة
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  المستأجرون يمكنهم الإبلاغ عن المشاكل مباشرة
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: KPI Cards                                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}
              >
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-lg font-bold leading-tight sm:text-xl">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{kpi.label}</p>
              {kpi.sub && (
                <p
                  className={`mt-1 text-[10px] font-medium ${kpi.subColor || 'text-[var(--muted-foreground)]'}`}
                >
                  {kpi.sub}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: Quick Actions Bar                                 */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
      >
        <h3 className="mb-3 text-sm font-bold">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* New request */}
          <Link href="/office/requests">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="bg-brand-50 dark:bg-brand-900/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Wrench className="text-brand-500 h-4 w-4" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">طلبات الصيانة</span>
            </motion.div>
          </Link>

          {/* Add building */}
          <Link href="/office/buildings/new">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                <Building2 className="h-4 w-4 text-sky-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">إضافة مبنى</span>
            </motion.div>
          </Link>

          {/* Buildings */}
          <Link href="/office/buildings">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
                <Building2 className="h-4 w-4 text-violet-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">المباني</span>
            </motion.div>
          </Link>

          {/* Providers */}
          <Link href="/office/providers">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <User className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">مقدمو الخدمات</span>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION 3: Buildings Overview + Recent Requests              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* --- Buildings Overview (2 cols) --- */}
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="text-brand-500 h-4 w-4" />
              <h3 className="text-sm font-bold">المباني</h3>
            </div>
            <Link
              href="/office/buildings"
              className="text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
            >
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {buildings.slice(0, 5).map((b) => (
              <Link key={b.id} href={`/office/buildings/${b.id}`}>
                <motion.div
                  whileHover={{ y: -1 }}
                  className="rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{b.nameAr}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{b.district}</p>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {b.unitCount ?? b.totalUnits} وحدة
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
            {buildings.length === 0 && (
              <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                لا توجد مباني. أضف مبنى للبدء.
              </div>
            )}
          </div>
        </motion.div>

        {/* --- Recent Requests (3 cols) --- */}
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="text-brand-500 h-4 w-4" />
              <h3 className="text-sm font-bold">آخر الطلبات</h3>
            </div>
            <Link
              href="/office/requests"
              className="text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
            >
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {recentRequests.map((request, index) => {
              const building = buildings.find((b) => b.id === request.buildingId);
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.04 }}
                >
                  <Link href={`/office/requests/${request.id}`}>
                    <div className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--secondary)]">
                      {/* Priority indicator */}
                      <div
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                          request.priority === 'URGENT'
                            ? 'animate-pulse bg-red-500'
                            : request.priority === 'HIGH'
                              ? 'bg-orange-500'
                              : request.priority === 'MEDIUM'
                                ? 'bg-sky-500'
                                : 'bg-slate-400'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
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
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {categoryLabels[request.category] ?? request.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{request.titleAr ?? request.titleEn}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                          {building?.nameAr ?? ''}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {getRelativeTime(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {recentRequests.length === 0 && (
              <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                لا توجد طلبات صيانة حتى الآن.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
