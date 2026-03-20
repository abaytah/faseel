'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Zap,
  Car,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import {
  buildings as seedBuildings,
  maintenanceRequests as seedRequests,
  type Building,
  type MaintenanceRequest,
} from '@/lib/mock-data';
import { useLocalStorageState, STORAGE_KEYS } from '@/lib/local-storage';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OfficeBuildingsPage() {
  const [allBuildings] = useLocalStorageState<Building>(STORAGE_KEYS.BUILDINGS, seedBuildings);
  const [allRequests] = useLocalStorageState<MaintenanceRequest>(STORAGE_KEYS.REQUESTS, seedRequests);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header with Add button */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-lg font-bold">المباني ({allBuildings.length})</h2>
        <Link href="/office/buildings/new">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            إضافة مبنى
          </motion.div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allBuildings.map((building) => {
          const requests = allRequests.filter((r) => r.buildingId === building.id);
          const activeRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
          const occupancyRate = building.unitCount > 0 ? Math.round((building.occupiedUnits / building.unitCount) * 100) : 0;

          return (
            <motion.div key={building.id} variants={cardVariants}>
              <Link href={`/office/buildings/${building.id}`}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-soft overflow-hidden"
                >
                  {/* Building image placeholder */}
                  <div className="relative h-36 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-brand-300 dark:text-brand-700" />
                    </div>
                    <div className="absolute bottom-3 start-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        building.type === 'residential'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                          : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                      }`}>
                        {building.type === 'residential' ? 'سكني' : 'تجاري'}
                      </span>
                    </div>
                    {activeRequests > 0 && (
                      <div className="absolute top-3 start-3">
                        <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                          {activeRequests} طلب نشط
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold">{building.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <MapPin className="h-3 w-3" />
                      <span>{building.district} — {building.city}</span>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-[var(--secondary)] p-2 text-center">
                        <p className="text-sm font-bold">{building.unitCount}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">وحدة</p>
                      </div>
                      <div className="rounded-lg bg-[var(--secondary)] p-2 text-center">
                        <p className="text-sm font-bold">{occupancyRate}%</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">إشغال</p>
                      </div>
                      <div className="rounded-lg bg-[var(--secondary)] p-2 text-center">
                        <p className="text-sm font-bold">{building.floors}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">طوابق</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mt-3 flex gap-2">
                      {building.hasElevator && (
                        <div className="flex items-center gap-1 rounded-md bg-[var(--secondary)] px-2 py-1 text-[10px]">
                          <ArrowUpDown className="h-3 w-3" />
                          <span>مصعد</span>
                        </div>
                      )}
                      {building.hasParking && (
                        <div className="flex items-center gap-1 rounded-md bg-[var(--secondary)] px-2 py-1 text-[10px]">
                          <Car className="h-3 w-3" />
                          <span>مواقف</span>
                        </div>
                      )}
                      {building.hasGenerator && (
                        <div className="flex items-center gap-1 rounded-md bg-[var(--secondary)] px-2 py-1 text-[10px]">
                          <Zap className="h-3 w-3" />
                          <span>مولد</span>
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
    </motion.div>
  );
}
