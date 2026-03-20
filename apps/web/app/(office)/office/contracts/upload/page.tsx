'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Upload, FileText, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

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
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
          <Upload className="h-5 w-5 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold">رفع عقد إيجار</h1>
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
      >
        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FileText className="h-16 w-16 text-[var(--muted-foreground)]" />
          </motion.div>
        </div>
        <h3 className="mb-2 text-base font-bold">رفع وتحليل العقود بالذكاء الاصطناعي</h3>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          قريبا ستتمكن من رفع عقود الإيجار بصيغة PDF أو صورة، وسيتم تحليلها واستخراج البيانات
          تلقائيا باستخدام الذكاء الاصطناعي.
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="h-3.5 w-3.5" />
          قريبا
        </div>

        <div className="mt-6 rounded-xl bg-[var(--secondary)] p-4 text-xs text-[var(--muted-foreground)]">
          <p className="mb-2 font-medium text-[var(--foreground)]">المزايا القادمة:</p>
          <ul className="mr-4 list-disc space-y-1 text-start">
            <li>رفع ملفات PDF أو صور العقود</li>
            <li>استخراج تلقائي لبيانات المستأجر والوحدة</li>
            <li>التعرف على رقم إيجار المرجعي</li>
            <li>ربط العقد بالوحدة والمستأجر تلقائيا</li>
            <li>دعم عقود المنصة الوطنية للتأجير</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
