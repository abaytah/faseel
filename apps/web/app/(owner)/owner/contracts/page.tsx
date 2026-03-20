'use client';

import { motion } from 'framer-motion';
import { FileText, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OwnerContractsPage() {
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
          <h1 className="text-lg font-bold">العقود</h1>
          <p className="text-xs text-[var(--muted-foreground)]">عقود إيجار الوحدات المملوكة</p>
        </div>
      </motion.div>

      {/* Coming Soon */}
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
          قريبا ستتمكن من عرض وإدارة جميع عقود إيجار الوحدات المملوكة، بما في ذلك حالة العقود
          وتواريخ الانتهاء ورقم إيجار المرجعي.
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="h-3.5 w-3.5" />
          قريبا
        </div>
      </motion.div>

      {/* Expected Features */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h3 className="mb-4 text-sm font-bold">المزايا القادمة</h3>
        <div className="space-y-3">
          {[
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
              icon: CheckCircle2,
              label: 'طلب تجديد العقود إلكترونيا',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon className={`h-4 w-4 ${feature.color}`} />
              </div>
              <p className="text-xs font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
