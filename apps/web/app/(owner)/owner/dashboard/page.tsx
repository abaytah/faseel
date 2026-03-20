'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Building2,
  Wrench,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  BarChart3,
  CalendarClock,
  Receipt,
  Loader2,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
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

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'hoa' | 'contracts'>(
    'overview',
  );

  const { data: requestsData, isLoading } = trpc.maintenance.list.useQuery({
    page: 1,
    limit: 50,
  });

  const requests = requestsData?.items ?? [];
  const activeRequests = requests.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status));
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');

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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <p className="text-xs text-[var(--muted-foreground)]">بوابة المالك</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5"
      >
        {[
          { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { key: 'maintenance', label: 'الصيانة', icon: Wrench },
          { key: 'hoa', label: 'اتحاد الملاك', icon: Receipt },
          { key: 'contracts', label: 'العقود', icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
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

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
                <Wrench className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-xl font-bold">{requests.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">إجمالي الطلبات</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold">{activeRequests.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">طلب نشط</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold">{completedRequests.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">مكتمل</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                <Building2 className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-xl font-bold">
                {[...new Set(requests.map((r) => r.buildingId).filter(Boolean))].length}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">مبنى</p>
            </motion.div>
          </div>

          {/* Financial Overview - Coming Soon */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">الملخص المالي</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <AlertCircle className="h-2.5 w-2.5" />
                قريبا
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">--</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">إجمالي الدخل</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-center dark:bg-red-900/20">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">--</p>
                <p className="text-[10px] text-red-600 dark:text-red-400">إجمالي المصاريف</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3 text-center dark:bg-sky-900/20">
                <p className="text-sm font-bold text-sky-700 dark:text-sky-300">--</p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400">صافي الربح</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Link
              href="/owner/properties"
              className="text-brand-500 hover:text-brand-600 flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-xs font-medium transition-colors hover:bg-[var(--secondary)]"
            >
              <Building2 className="h-4 w-4" />
              <span>العقارات</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href="/owner/requests"
              className="text-brand-500 hover:text-brand-600 flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-xs font-medium transition-colors hover:bg-[var(--secondary)]"
            >
              <Wrench className="h-4 w-4" />
              <span>الصيانة</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href="/owner/contracts"
              className="text-brand-500 hover:text-brand-600 flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-xs font-medium transition-colors hover:bg-[var(--secondary)]"
            >
              <FileText className="h-4 w-4" />
              <span>العقود</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </motion.div>
        </>
      )}

      {/* === MAINTENANCE TAB === */}
      {activeTab === 'maintenance' && (
        <>
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-4 text-sm font-bold">طلبات الصيانة ({requests.length})</h3>
            {requests.length === 0 ? (
              <div className="py-8 text-center">
                <Wrench className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">لا توجد طلبات صيانة حاليا</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {request.titleAr || request.titleEn || 'طلب صيانة'}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {categoryLabels[request.category] ?? request.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
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

                    <div className="mt-1 text-end text-[10px] text-[var(--muted-foreground)]">
                      {getRelativeTime(request.createdAt)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* === HOA TAB === */}
      {activeTab === 'hoa' && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20">
              <Receipt className="h-8 w-8 text-violet-500" />
            </div>
          </div>
          <h3 className="mb-2 text-base font-bold">رسوم اتحاد الملاك</h3>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            قريبا ستتمكن من عرض ومتابعة رسوم اتحاد الملاك، حالة السداد، والمبالغ المستحقة لكل وحدة.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" />
            قريبا
          </div>
        </motion.div>
      )}

      {/* === CONTRACTS TAB === */}
      {activeTab === 'contracts' && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="bg-brand-50 dark:bg-brand-900/20 flex h-16 w-16 items-center justify-center rounded-2xl">
              <FileText className="text-brand-500 h-8 w-8" />
            </div>
          </div>
          <h3 className="mb-2 text-base font-bold">إدارة العقود</h3>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            قريبا ستتمكن من عرض جميع عقود الإيجار، تواريخ الانتهاء، وطلب التجديد إلكترونيا.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" />
            قريبا
          </div>
          <div className="mt-4">
            <Link
              href="/owner/contracts"
              className="text-brand-500 hover:text-brand-600 inline-flex items-center gap-1 text-xs font-medium"
            >
              <span>عرض صفحة العقود</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
