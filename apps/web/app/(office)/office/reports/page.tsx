'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Construction } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OfficeReportsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={itemVariants}>
        <Link href="/office/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20 shadow-soft"
      >
        <Construction className="mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
        <h1 className="mb-2 text-xl font-bold">التقارير</h1>
        <p className="text-sm text-[var(--muted-foreground)]">قيد التطوير — ستتوفر تقارير الملاك والمباني قريبا</p>
      </motion.div>
    </motion.div>
  );
}
