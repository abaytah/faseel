'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Home,
  Wrench,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OfficeReportsPage() {
  const officeId = getOfficeId();
  const { data: buildingsData, isLoading: buildingsLoading } = trpc.buildings.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );
  const { data: requestsData, isLoading: requestsLoading } = trpc.maintenance.list.useQuery({
    page: 1,
    limit: 500,
  });

  const isLoading = buildingsLoading || requestsLoading;

  const buildings = Array.isArray(buildingsData) ? buildingsData : [];
  const requests = requestsData?.items ?? [];

  const totalBuildings = buildings.length;
  const totalUnits = buildings.reduce((sum, b) => sum + (b.unitCount ?? b.totalUnits ?? 0), 0);

  const submittedCount = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'REVIEWED',
  ).length;
  const inProgressCount = requests.filter(
    (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS',
  ).length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
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
      <motion.div variants={itemVariants}>
        <Link
          href="/office/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold">التقارير</h1>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">ملخص بيانات المباني والطلبات</p>
      </motion.div>

      {/* Property Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/20">
            <Building2 className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold">{totalBuildings}</p>
          <p className="text-xs text-[var(--muted-foreground)]">إجمالي المباني</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-900/20">
            <Home className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-2xl font-bold">{totalUnits}</p>
          <p className="text-xs text-[var(--muted-foreground)]">إجمالي الوحدات</p>
        </motion.div>
      </div>

      {/* Requests by Status */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h3 className="mb-4 text-sm font-bold">الطلبات حسب الحالة</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800/40">
              <Send className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{submittedCount}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">مقدمة</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-900/20">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-800/40">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
              {inProgressCount}
            </p>
            <p className="text-[10px] text-orange-600 dark:text-orange-400">قيد التنفيذ</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-800/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {completedCount}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">مكتملة</p>
          </div>
        </div>
      </motion.div>

      {/* Total requests summary */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Wrench className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{requests.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">إجمالي طلبات الصيانة</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
