'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Home,
  Wrench,
  Percent,
  MapPin,
  Layers,
  Maximize2,
  BedDouble,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { statusLabels, statusColors, formatSAR } from '@/lib/format-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OwnerPropertiesPage() {
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);

  // Fetch maintenance requests for the owner
  const { data: requestsData, isLoading: requestsLoading } = trpc.maintenance.list.useQuery({
    page: 1,
    limit: 50,
  });

  const requests = requestsData?.items ?? [];
  const activeRequests = requests.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status));

  // Since buildings.list requires officeId (office role), and we are an owner,
  // we derive building info from the maintenance requests.
  // For now, show a "coming soon" property overview based on available data.
  const buildingIds = [...new Set(requests.map((r) => r.buildingId).filter(Boolean))];

  if (requestsLoading) {
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
          <h1 className="text-lg font-bold">عقاراتي</h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            نظرة عامة على العقارات وطلبات الصيانة
          </p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
            <Building2 className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold">{buildingIds.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">مبنى</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <Home className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold">{requests.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">طلب صيانة</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <Wrench className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold">{activeRequests.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">طلب نشط</p>
        </motion.div>
      </div>

      {/* Coming Soon: Full Property Details */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="bg-brand-50 dark:bg-brand-900/20 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Building2 className="text-brand-500 h-8 w-8" />
          </div>
        </div>
        <h3 className="mb-2 text-base font-bold">تفاصيل العقارات</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          قريبا ستتمكن من مشاهدة تفاصيل كل وحدة، نسبة الإشغال، والإيجارات الشهرية من هنا.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="h-3.5 w-3.5" />
          قريبا
        </div>
      </motion.div>

      {/* Active Requests List */}
      {activeRequests.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="mb-3 text-sm font-bold">طلبات الصيانة النشطة</h3>
          <div className="space-y-2">
            {activeRequests.map((request) => (
              <div
                key={request.id}
                className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="mb-1 flex items-start justify-between">
                  <p className="text-sm font-bold">
                    {request.titleAr || request.titleEn || 'طلب صيانة'}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
                  >
                    {statusLabels[request.status] ?? request.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {request.category} · {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
