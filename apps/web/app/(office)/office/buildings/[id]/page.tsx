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
import {
  buildings as seedBuildings,
  units as seedUnits,
  maintenanceRequests as seedRequests,
  hoaFees as seedHoaFees,
  owners,
  tenants,
  formatSAR,
  type Building,
  type Unit,
  type MaintenanceRequest,
  type HOAFee,
} from '@/lib/mock-data';
import {
  useLocalStorageState,
  addToStorage,
  generateId,
  STORAGE_KEYS,
} from '@/lib/local-storage';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function BuildingDetailPage() {
  const params = useParams();
  const toast = useToast();

  const [allBuildings] = useLocalStorageState<Building>(STORAGE_KEYS.BUILDINGS, seedBuildings);
  const [allUnits, setAllUnits] = useLocalStorageState<Unit>(STORAGE_KEYS.UNITS, seedUnits);
  const [allRequests] = useLocalStorageState<MaintenanceRequest>(STORAGE_KEYS.REQUESTS, seedRequests);
  const [allHoaFees] = useLocalStorageState<HOAFee>(STORAGE_KEYS.HOA_FEES, seedHoaFees);

  const buildingId = params?.id as string | undefined;
  const building = allBuildings.find((b) => b.id === buildingId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unitNumber: '',
    floor: '',
    area: '',
    rooms: '',
    bathrooms: '',
    monthlyRent: '',
    status: 'vacant' as 'occupied' | 'vacant' | 'maintenance',
    ownerId: '',
    tenantId: '',
  });
  const [unitErrors, setUnitErrors] = useState<Record<string, string>>({});

  if (!building) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-[var(--muted-foreground)]">المبنى غير موجود</p>
        <Link href="/office/buildings" className="mt-4 text-sm text-brand-500">
          ← العودة للمباني
        </Link>
      </div>
    );
  }

  const units = allUnits.filter((u) => u.buildingId === building.id);
  const requests = allRequests.filter((r) => r.buildingId === building.id);
  const hoaFees = allHoaFees.filter((f) => f.buildingId === building.id);
  const activeRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const occupancyRate = building.unitCount > 0 ? Math.round((building.occupiedUnits / building.unitCount) * 100) : 0;
  const totalHOA = hoaFees.reduce((sum, f) => sum + f.amount, 0);
  const paidHOA = hoaFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

  function getUserById(id: string) {
    return [...owners, ...tenants].find((u) => u.id === id);
  }

  function validateUnit(): boolean {
    const e: Record<string, string> = {};
    if (!unitForm.unitNumber.trim()) e.unitNumber = 'رقم الوحدة مطلوب';
    if (!unitForm.floor || Number(unitForm.floor) < 0) e.floor = 'الطابق مطلوب';
    if (!unitForm.area || Number(unitForm.area) <= 0) e.area = 'المساحة مطلوبة';
    if (!unitForm.monthlyRent || Number(unitForm.monthlyRent) <= 0) e.monthlyRent = 'الإيجار مطلوب';
    if (!unitForm.ownerId) e.ownerId = 'المالك مطلوب';
    setUnitErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateUnit()) return;

    setSaving(true);

    const newUnit: Unit = {
      id: generateId('unit'),
      buildingId: building!.id,
      unitNumber: unitForm.unitNumber.trim(),
      floor: Number(unitForm.floor),
      area: Number(unitForm.area),
      rooms: Number(unitForm.rooms) || 1,
      bathrooms: Number(unitForm.bathrooms) || 1,
      monthlyRent: Number(unitForm.monthlyRent),
      status: unitForm.status,
      ownerId: unitForm.ownerId,
      tenantId: unitForm.tenantId || undefined,
    };

    addToStorage(STORAGE_KEYS.UNITS, newUnit);

    // Refresh units list
    setAllUnits((prev) => [...prev, newUnit]);

    setTimeout(() => {
      setSaving(false);
      toast.success('تم إضافة الوحدة بنجاح');
      setDialogOpen(false);
      setUnitForm({
        unitNumber: '',
        floor: '',
        area: '',
        rooms: '',
        bathrooms: '',
        monthlyRent: '',
        status: 'vacant',
        ownerId: '',
        tenantId: '',
      });
      setUnitErrors({});
    }, 400);
  }

  function updateUnitField(field: string, value: string) {
    setUnitForm((prev) => ({ ...prev, [field]: value }));
    if (unitErrors[field]) setUnitErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link href="/office/buildings" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للمباني
        </Link>
      </motion.div>

      {/* Building Info Card */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                building.type === 'residential'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                  : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
              }`}>
                {building.type === 'residential' ? 'سكني' : 'تجاري'}
              </span>
            </div>
            <h2 className="text-xl font-bold">{building.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{building.nameEn}</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
              <MapPin className="h-4 w-4" />
              <span>{building.district} — {building.city}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
              <Calendar className="h-4 w-4" />
              <span>سنة البناء: {building.yearBuilt}</span>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-2 sm:text-end">
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center sm:text-end">
              <p className="text-lg font-bold">{occupancyRate}%</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">نسبة الإشغال</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center sm:text-end">
              <p className="text-lg font-bold">{activeRequests}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">طلب نشط</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5" />
            <span>{building.floors} طوابق</span>
          </div>
          {building.hasElevator && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>مصعد</span>
            </div>
          )}
          {building.hasParking && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs">
              <Car className="h-3.5 w-3.5" />
              <span>مواقف سيارات</span>
            </div>
          )}
          {building.hasGenerator && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs">
              <Zap className="h-3.5 w-3.5" />
              <span>مولد احتياطي</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* HOA Summary */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-bold">رسوم اتحاد الملاك</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted-foreground)]">المحصّل: {formatSAR(paidHOA)}</span>
          <span className="text-xs text-[var(--muted-foreground)]">الإجمالي: {formatSAR(totalHOA)}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--secondary)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalHOA > 0 ? (paidHOA / totalHOA) * 100 : 0}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
      </motion.div>

      {/* Units Table */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-soft overflow-hidden">
        <div className="p-5 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">الوحدات ({units.length})</h3>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
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
                      className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:inset-x-auto sm:w-full max-h-[90vh] overflow-y-auto"
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
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">رقم الوحدة *</label>
                            <input
                              type="text"
                              value={unitForm.unitNumber}
                              onChange={(e) => updateUnitField('unitNumber', e.target.value)}
                              placeholder="مثال: 101"
                              className={`w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${unitErrors.unitNumber ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.unitNumber && <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.unitNumber}</p>}
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الطابق *</label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.floor}
                              onChange={(e) => updateUnitField('floor', e.target.value)}
                              placeholder="1"
                              className={`w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${unitErrors.floor ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.floor && <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.floor}</p>}
                          </div>
                        </div>

                        {/* Area + Rent */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">المساحة (م²) *</label>
                            <input
                              type="number"
                              min="1"
                              value={unitForm.area}
                              onChange={(e) => updateUnitField('area', e.target.value)}
                              placeholder="120"
                              className={`w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${unitErrors.area ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.area && <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.area}</p>}
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الإيجار الشهري (ر.س) *</label>
                            <input
                              type="number"
                              min="1"
                              value={unitForm.monthlyRent}
                              onChange={(e) => updateUnitField('monthlyRent', e.target.value)}
                              placeholder="3500"
                              className={`w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${unitErrors.monthlyRent ? 'border-red-400' : 'border-[var(--border)]'}`}
                            />
                            {unitErrors.monthlyRent && <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.monthlyRent}</p>}
                          </div>
                        </div>

                        {/* Rooms + Bathrooms */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الغرف</label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.rooms}
                              onChange={(e) => updateUnitField('rooms', e.target.value)}
                              placeholder="3"
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">دورات المياه</label>
                            <input
                              type="number"
                              min="0"
                              value={unitForm.bathrooms}
                              onChange={(e) => updateUnitField('bathrooms', e.target.value)}
                              placeholder="2"
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الحالة</label>
                          <select
                            value={unitForm.status}
                            onChange={(e) => updateUnitField('status', e.target.value)}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="vacant">شاغرة</option>
                            <option value="occupied">مشغولة</option>
                            <option value="maintenance">صيانة</option>
                          </select>
                        </div>

                        {/* Owner */}
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">المالك *</label>
                          <select
                            value={unitForm.ownerId}
                            onChange={(e) => updateUnitField('ownerId', e.target.value)}
                            className={`w-full rounded-xl border bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${unitErrors.ownerId ? 'border-red-400' : 'border-[var(--border)]'}`}
                          >
                            <option value="">اختر المالك</option>
                            {owners.map((o) => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                          {unitErrors.ownerId && <p className="mt-0.5 text-[10px] text-red-500">{unitErrors.ownerId}</p>}
                        </div>

                        {/* Tenant */}
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">المستأجر</label>
                          <select
                            value={unitForm.tenantId}
                            onChange={(e) => updateUnitField('tenantId', e.target.value)}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="">بدون مستأجر</option>
                            {tenants.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          disabled={saving}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {saving ? 'جاري الحفظ...' : 'حفظ الوحدة'}
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
          {units.map((unit, index) => {
            const owner = getUserById(unit.ownerId);
            const tenant = unit.tenantId ? getUserById(unit.tenantId) : null;
            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.04 }}
                className="rounded-xl bg-[var(--secondary)] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">{unit.unitNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    unit.status === 'occupied' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                    unit.status === 'vacant' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                    'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                    {unit.status === 'occupied' ? 'مشغولة' : unit.status === 'vacant' ? 'شاغرة' : 'صيانة'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[var(--muted-foreground)]">
                  <span>المساحة: {unit.area} م²</span>
                  <span>الإيجار: {formatSAR(unit.monthlyRent)}</span>
                  {owner && <span>المالك: {owner.name.split(' ').slice(0, 2).join(' ')}</span>}
                  {tenant && <span>المستأجر: {tenant.name.split(' ').slice(0, 2).join(' ')}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop: table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <th className="px-5 py-3 text-start font-medium">الوحدة</th>
                <th className="px-5 py-3 text-start font-medium">الطابق</th>
                <th className="px-5 py-3 text-start font-medium">المساحة</th>
                <th className="px-5 py-3 text-start font-medium">الإيجار</th>
                <th className="px-5 py-3 text-start font-medium">المالك</th>
                <th className="px-5 py-3 text-start font-medium">المستأجر</th>
                <th className="px-5 py-3 text-start font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => {
                const owner = getUserById(unit.ownerId);
                const tenant = unit.tenantId ? getUserById(unit.tenantId) : null;
                return (
                  <motion.tr
                    key={unit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="border-t border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium">{unit.unitNumber}</td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">{unit.floor}</td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">{unit.area} م²</td>
                    <td className="px-5 py-3 font-medium">{formatSAR(unit.monthlyRent)}</td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {owner ? owner.name.split(' ').slice(0, 2).join(' ') : '—'}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {tenant ? tenant.name.split(' ').slice(0, 2).join(' ') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        unit.status === 'occupied' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                        unit.status === 'vacant' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }`}>
                        {unit.status === 'occupied' ? 'مشغولة' : unit.status === 'vacant' ? 'شاغرة' : 'صيانة'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
