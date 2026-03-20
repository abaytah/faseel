'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  titleAr: string;
  descriptionAr: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  titleAr,
  descriptionAr,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="shadow-soft flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
        <Icon className="h-8 w-8 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="mb-1.5 text-base font-bold">{titleAr}</h3>
      <p className="mb-5 max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
        {descriptionAr}
      </p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
