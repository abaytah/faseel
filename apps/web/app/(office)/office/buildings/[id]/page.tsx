'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  ArrowUpDown,
  Car,
  Zap,
  Plus,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

function formatSAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}

export default function BuildingDetailPage() {
  const params = useParams();
  const toast = useToast();
  const buildingId = params?.id as string | undefined;

  const { data: buildingData, isLoading: buildingLoading } = trpc.buildings.getById.useQuery(
    { id: buildingId! },
    { enabled: !!buildingId },
  );

  const utils = trpc.useUtils();

  const createUnit = trpc.buildings.createUnit.useMutation({
    onSuccess: () => {
      toast.success('تم إضافة الوحدة بنجاح');
      setDialogOpen(false);
      resetUnitForm();
      utils.buildings.getById.invalidate({ id: buildingId! });
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        toast.error(parsed.messageAr || 'حدث خطأ أثناء إضافة الوحدة');
      } catch {
        toast.error('حدث خطأ أثناء إضافة الوحدة');
      }
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unitNumber: '',
    floor: '',
    area: '',
    rooms: '',
    bathrooms: '',
    monthlyRent: '',
  });
  const [unitErrors, setUnitErrors] = useState<Record<string, string>>({});

  function resetUnitForm() {
    setUnitForm({
      unitNumber: '',
      floor: '',
      area: '',
      rooms: '',
      bathrooms: '',
      monthlyRent: '',
    });
    setUnitErrors({});
  }

  if (buildingLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!buildingData) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-[var(--muted-foreground)]">المبنى غير موجود</p>
        <Link href="/office/buildings" className="text-brand-500 mt-4 text-sm">
          ← العودة للمباني
        </Link>
      </div>
    );
  }

  const building = buildingData;
  const units = building.units ?? [];
  const typeLabel =
    building.type === 'RESIDENTIAL' ? 'سكني' : building.type === 'COMMERCIAL' ? 'تجاري' : 'مختلط';
  const typeStyle =
    building.type === 'RESIDENTIAL'
      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
      : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;

  function validateUnit(): boolean {
    const e: Record<string, string> = {};
    if (!unitForm.unitNumber.trim()) e.unitNumber = 'رقم الوحدة مطلوب';
    if (!unitForm.floor || Number(unitForm.floor) < 0) e.floor = 'الطابق مطلوب';
    setUnitErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateUnit()) return;

    createUnit.mutate({
      buildingId: building.id,
      unitNumber: unitForm.unitNumber.trim(),
      floor: Number(unitForm.floor),
      bedrooms: Number(unitForm.rooms) || 0,
      bathrooms: Number(unitForm.bathrooms) || 0,
      areaSqm: unitForm.area ? Number(unitForm.area) : undefined,
      monthlyRent: unitForm.monthlyRent ? Number(unitForm.monthlyRent) : undefined,
    });
  }

  function updateUnitField(field: string, value: string) {
    setUnitForm((prev) => ({ ...prev, [field]: value }));
    if (unitErrors[field]) setUnitErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link
          href="/office/buildings"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمباني
        </Link>
      </motion.div>

      {/* Building Info Card */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${typeStyle}`}>
                {typeLabel}
              </span>
            </div>
            <h2 className="text-xl font-bold">{building.nameAr}</h2>
            {building.nameEn && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{building.nameEn}</p>
            )}
            <div className="mt-2 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
              <MapPin className="h-4 w-4" />
              <span>
                {building.district} — {building.city}
              </span>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2 sm:text-end">
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center sm:text-end">
              <p className="text-lg font-bold">{occupancyRate}%</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">نسبة الإشغال</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center sm:text-end">
              <p className="text-lg font-bold">{units.length}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">وحدات</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {building.floors && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              <span>{building.floors} طوابق</span>
            </div>
          )}
        </div>

        {/* Owner info */}
        {building.owner && (
          <div className="mt-4 rounded-xl bg-[var(--secondary)] p-3">
            <p className="text-xs text-[var(--muted-foreground)]">المالك</p>
            <p className="text-sm font-medium">{building.owner.nameAr}</p>
            {building.owner.phone && (
              <p className="text-xs text-[var(--muted-foreground)]" dir="ltr">
                {building.owner.phone}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Units Table */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-bold">الوحدات ({units.length})</h3>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-brand-500 hover:bg-brand-600 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة وحدة
              </motion.button>
            </Dialog.Trigger>

            <AnimatePresence>
              {dialogOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:inset-x-auto sm:w-full"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <Dialog.Title className="text-lg font-bold">إضافة وحدة جديدة</Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="rounded-lg p-1.5 transition-colors hover:bg-[var(--secondary)]">
                            <X className="h-4 w-4" />
                          </button>
                        </Dialog.Close>
                      </div>

                      <form onSubmit={handleAddUnit} className="space-y-4">
                        {/* Unit number + Floor */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              رقم الوحدة *
                            </label>
                            <input
                              type="text"
                              value={unitForm.unitNumber}
                              onChange={(e) => updateUnitField('unitNumber', e.target.value)}
                              placeholder="مثال: 101"
                              className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1 ${unitErrors.unitNumber ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.unitNumber && (
                              <p className="mt-0.5 text-[10px] text-red-500">
                                {unitErrors.unitNumber}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              الطابق *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.floor}
                              onChange={(e) => updateUnitField('floor', e.target.value)}
                              placeholder="1"
                              className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1 ${unitErrors.floor ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.floor && (
                              <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.floor}</p>
                            )}
                          </div>
                        </div>

                        {/* Area + Rent */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              المساحة (م²)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={unitForm.area}
                              onChange={(e) => updateUnitField('area', e.target.value)}
                              placeholder="120"
                              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              الإيجار الشهري (ر.س)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={unitForm.monthlyRent}
                              onChange={(e) => updateUnitField('monthlyRent', e.target.value)}
                              placeholder="3500"
                              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1"
                            />
                          </div>
                        </div>

                        {/* Rooms + Bathrooms */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              الغرف
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.rooms}
                              onChange={(e) => updateUnitField('rooms', e.target.value)}
                              placeholder="3"
                              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">
                              دورات المياه
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.bathrooms}
                              onChange={(e) => updateUnitField('bathrooms', e.target.value)}
                              placeholder="2"
                              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:ring-1"
                            />
                          </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          disabled={createUnit.isPending}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
                        >
                          {createUnit.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {createUnit.isPending ? 'جاري الحفظ...' : 'حفظ الوحدة'}
                        </motion.button>
                      </form>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>

        {/* Mobile: cards view */}
        <div className="space-y-2 px-4 pb-4 sm:hidden">
          {units.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.04 }}
              className="rounded-xl bg-[var(--secondary)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">{unit.unitNumber}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    unit.status === 'OCCUPIED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : unit.status === 'VACANT'
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  }`}
                >
                  {unit.status === 'OCCUPIED'
                    ? 'مشغولة'
                    : unit.status === 'VACANT'
                      ? 'شاغرة'
                      : 'صيانة'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-[var(--muted-foreground)]">
                {unit.areaSqm && <span>المساحة: {unit.areaSqm} م²</span>}
                {unit.monthlyRent && <span>الإيجار: {formatSAR(Number(unit.monthlyRent))}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: table view */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <th className="px-5 py-3 text-start font-medium">الوحدة</th>
                <th className="px-5 py-3 text-start font-medium">الطابق</th>
                <th className="px-5 py-3 text-start font-medium">المساحة</th>
                <th className="px-5 py-3 text-start font-medium">الإيجار</th>
                <th className="px-5 py-3 text-start font-medium">الغرف</th>
                <th className="px-5 py-3 text-start font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => (
                <motion.tr
                  key={unit.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="border-t border-[var(--border)] transition-colors hover:bg-[var(--secondary)]"
                >
                  <td className="px-5 py-3 font-medium">{unit.unitNumber}</td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">{unit.floor}</td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {unit.areaSqm ? `${unit.areaSqm} م²` : '—'}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {unit.monthlyRent ? formatSAR(Number(unit.monthlyRent)) : '—'}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {unit.bedrooms ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        unit.status === 'OCCUPIED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : unit.status === 'VACANT'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {unit.status === 'OCCUPIED'
                        ? 'مشغولة'
                        : unit.status === 'VACANT'
                          ? 'شاغرة'
                          : 'صيانة'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {units.length === 0 && (
          <div className="px-5 pb-5 text-center text-sm text-[var(--muted-foreground)]">
            لا توجد وحدات مسجلة. أضف وحدة جديدة.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
