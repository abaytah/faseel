'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Home,
  Wrench,
  Users,
  DollarSign,
  Percent,
  MapPin,
  Layers,
  Maximize2,
  BedDouble,
  AlertCircle,
} from 'lucide-react';
import {
  owners,
  units,
  getRequestsByOwner,
  getBuildingById,
  getUserById,
  formatSAR,
  office,
  type Unit,
  type Building,
} from '@/lib/mock-data';
import { trpc } from '@/lib/trpc';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

interface BuildingGroup {
  building: Building;
  units: Unit[];
  occupiedCount: number;
  totalRent: number;
  activeRequestsCount: number;
}

export default function OwnerPropertiesPage() {
  const owner = owners[0];
  const ownerUnits = units.filter((u) => u.ownerId === owner.id);
  const requests = getRequestsByOwner(owner.id);
  const activeRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status));

  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);

  // Group units by building
  const buildingGroups: BuildingGroup[] = (() => {
    const grouped: Record<string, Unit[]> = {};
    ownerUnits.forEach((unit) => {
      if (!grouped[unit.buildingId]) grouped[unit.buildingId] = [];
      grouped[unit.buildingId].push(unit);
    });

    return Object.entries(grouped)
      .map(([buildingId, bUnits]) => {
        const building = getBuildingById(buildingId);
        if (!building) return null;
        const occupiedCount = bUnits.filter((u) => u.status === 'occupied').length;
        const totalRent = bUnits
          .filter((u) => u.status === 'occupied')
          .reduce((sum, u) => sum + u.monthlyRent, 0);
        const activeRequestsCount = requests.filter(
          (r) => r.buildingId === buildingId && !['completed', 'cancelled'].includes(r.status),
        ).length;

        return { building, units: bUnits, occupiedCount, totalRent, activeRequestsCount };
      })
      .filter(Boolean) as BuildingGroup[];
  })();

  // Totals
  const totalUnits = ownerUnits.length;
  const totalOccupied = ownerUnits.filter((u) => u.status === 'occupied').length;
  const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

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
            {buildingGroups.length} مبنى · {totalUnits} وحدة
          </p>
        </div>
        <WhatsAppButton
          phone={office.phone.replace(/-/g, '')}
          message={`السلام عليكم، أنا المالك ${owner.name}، أرغب بالاستفسار عن عقاراتي`}
          label="تواصل مع المكتب"
          size="sm"
        />
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
            <Building2 className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold">{buildingGroups.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">مبنى</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <Home className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold">{totalUnits}</p>
          <p className="text-xs text-[var(--muted-foreground)]">وحدة</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
            <Percent className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-xl font-bold">{occupancyRate}%</p>
          <p className="text-xs text-[var(--muted-foreground)]">نسبة الإشغال</p>
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

      {/* Building Cards */}
      <div className="space-y-3">
        {buildingGroups.map((group) => {
          const isExpanded = expandedBuilding === group.building.id;
          const occupancyPct =
            group.units.length > 0
              ? Math.round((group.occupiedCount / group.units.length) * 100)
              : 0;

          return (
            <motion.div
              key={group.building.id}
              variants={itemVariants}
              layout
              className="shadow-soft overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            >
              {/* Building Header — clickable */}
              <button
                onClick={() => setExpandedBuilding(isExpanded ? null : group.building.id)}
                className="hover:bg-[var(--secondary)]/50 w-full p-4 text-start transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-50 dark:bg-brand-900/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                      <Building2 className="text-brand-500 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{group.building.name}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <MapPin className="h-3 w-3" />
                        <span>{group.building.district}</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                  )}
                </div>

                {/* Stats Row */}
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs font-bold">
                      {group.occupiedCount}/{group.units.length}
                    </p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">مشغولة</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">{formatSAR(group.totalRent)}</p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">الإيجار الشهري</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      {occupancyPct}%
                    </p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">الإشغال</p>
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${group.activeRequestsCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                    >
                      {group.activeRequestsCount}
                    </p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">طلبات صيانة</p>
                  </div>
                </div>
              </button>

              {/* Expanded: Unit Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-[var(--border)] px-4 pb-4"
                  >
                    <div className="mt-3 space-y-2">
                      {group.units.map((unit) => {
                        const tenant = unit.tenantId ? getUserById(unit.tenantId) : null;
                        const unitActiveReqs = requests.filter(
                          (r) =>
                            r.unitId === unit.id && !['completed', 'cancelled'].includes(r.status),
                        );

                        return (
                          <div
                            key={unit.id}
                            className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">{unit.unitNumber}</p>
                                {unitActiveReqs.length > 0 && (
                                  <span className="flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-medium text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    {unitActiveReqs.length} طلب
                                  </span>
                                )}
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                                  unit.status === 'occupied'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                    : unit.status === 'vacant'
                                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                }`}
                              >
                                {unit.status === 'occupied'
                                  ? 'مشغولة'
                                  : unit.status === 'vacant'
                                    ? 'شاغرة'
                                    : 'صيانة'}
                              </span>
                            </div>

                            {/* Unit Details */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[var(--muted-foreground)] sm:grid-cols-4">
                              <div className="flex items-center gap-1">
                                <Layers className="h-2.5 w-2.5" />
                                <span>الطابق {unit.floor}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Maximize2 className="h-2.5 w-2.5" />
                                <span>{unit.area} م²</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BedDouble className="h-2.5 w-2.5" />
                                <span>{unit.rooms > 0 ? `${unit.rooms} غرف` : 'مساحة مفتوحة'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-2.5 w-2.5" />
                                <span className="font-medium text-[var(--foreground)]">
                                  {formatSAR(unit.monthlyRent)}
                                </span>
                              </div>
                            </div>

                            {/* Tenant info + WhatsApp */}
                            {tenant ? (
                              <div className="mt-2 flex items-center justify-between">
                                <p className="text-[10px] text-[var(--muted-foreground)]">
                                  <Users className="ml-1 inline h-2.5 w-2.5" />
                                  المستأجر:{' '}
                                  <span className="font-medium text-[var(--foreground)]">
                                    {tenant.name.split(' ').slice(0, 3).join(' ')}
                                  </span>
                                </p>
                                <WhatsAppButton
                                  phone={tenant.phone.replace(/-/g, '')}
                                  message={`السلام عليكم ${tenant.name.split(' ')[0]}، بخصوص الوحدة ${unit.unitNumber}`}
                                  variant="icon"
                                  size="sm"
                                />
                              </div>
                            ) : (
                              <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                                شاغرة — لا يوجد مستأجر
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
