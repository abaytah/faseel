'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, MapPin, Zap, Car, ArrowUpDown, Plus, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OfficeBuildingsPage() {
  const officeId = getOfficeId();
  const { data: allBuildings, isLoading } = trpc.buildings.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  const buildings = allBuildings ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header with Add button */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-lg font-bold">المباني ({buildings.length})</h2>
        <Link href="/office/buildings/new">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-brand-500 hover:bg-brand-600 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة مبنى
          </motion.div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => {
          const typeLabel =
            building.type === 'RESIDENTIAL'
              ? 'سكني'
              : building.type === 'COMMERCIAL'
                ? 'تجاري'
                : 'مختلط';
          const typeStyle =
            building.type === 'RESIDENTIAL'
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
              : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

          return (
            <motion.div key={building.id} variants={cardVariants}>
              <Link href={`/office/buildings/${building.id}`}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="shadow-soft group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                >
                  {/* Building image placeholder */}
                  <div className="from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/10 relative h-36 bg-gradient-to-br">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="text-brand-300 dark:text-brand-700 h-12 w-12" />
                    </div>
                    <div className="absolute bottom-3 start-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${typeStyle}`}
                      >
                        {typeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold">{building.nameAr}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {building.district} — {building.city}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[var(--secondary)] p-2 text-center">
                        <p className="text-sm font-bold">
                          {building.unitCount ?? building.totalUnits}
                        </p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">وحدة</p>
                      </div>
                      {building.floors && (
                        <div className="rounded-lg bg-[var(--secondary)] p-2 text-center">
                          <p className="text-sm font-bold">{building.floors}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">طوابق</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {buildings.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
            <Building2 className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <p className="text-sm font-medium">لا توجد مباني</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">أضف مبنى جديد للبدء</p>
        </motion.div>
      )}
    </motion.div>
  );
}
