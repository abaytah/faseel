'use client';

import { motion } from 'framer-motion';
import { FileText, CalendarClock, CheckCircle2, RefreshCw } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const upcomingFeatures = [
  {
    icon: FileText,
    label: 'عرض جميع العقود ورقم إيجار المرجعي',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
  },
  {
    icon: CalendarClock,
    label: 'تنبيهات العقود المنتهية والتي ستنتهي قريبا',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: RefreshCw,
    label: 'طلب تجديد العقود إلكترونيا',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
];

export default function OwnerContractsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-lg font-bold">العقود</h1>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          إدارة عقود إيجار الوحدات المملوكة
        </p>
      </motion.div>

      {/* Info Card */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand-50 dark:bg-brand-900/20 flex h-12 w-12 items-center justify-center rounded-2xl">
            <FileText className="text-brand-500 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">إدارة العقود</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              ستتمكن من عرض وإدارة جميع عقود إيجار الوحدات المملوكة، بما في ذلك حالة العقود وتواريخ
              الانتهاء ورقم إيجار المرجعي.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h3 className="mb-4 text-sm font-bold">المزايا القادمة</h3>
        <div className="space-y-3">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon className={`h-4 w-4 ${feature.color}`} />
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <p className="text-xs font-medium">{feature.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
