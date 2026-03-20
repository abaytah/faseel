'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Upload, FileText, CheckCircle2, Brain, Link2, Shield } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const upcomingFeatures = [
  {
    icon: Upload,
    label: 'رفع ملفات PDF أو صور العقود',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
  },
  {
    icon: Brain,
    label: 'استخراج تلقائي لبيانات المستأجر والوحدة بالذكاء الاصطناعي',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: FileText,
    label: 'التعرف على رقم إيجار المرجعي',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Link2,
    label: 'ربط العقد بالوحدة والمستأجر تلقائيا',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Shield,
    label: 'دعم عقود المنصة الوطنية للتأجير (إيجار)',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
];

export default function ContractUploadPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl space-y-4"
    >
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link
          href="/office/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold">رفع العقود</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          ميزة رفع العقود وتحليلها بالذكاء الاصطناعي قادمة قريبا
        </p>
      </motion.div>

      {/* Features List */}
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
