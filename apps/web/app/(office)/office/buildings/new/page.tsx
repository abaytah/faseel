'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Save,
  Loader2,
} from 'lucide-react';
import { addToStorage, generateId, STORAGE_KEYS } from '@/lib/local-storage';
import { useToast } from '@/components/ui/toast-provider';
import type { Building } from '@/lib/mock-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function AddBuildingPage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    type: 'residential' as 'residential' | 'commercial',
    district: '',
    city: 'جدة',
    unitCount: '',
    floors: '',
    hasElevator: false,
    hasParking: false,
    hasGenerator: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'اسم المبنى مطلوب';
    if (!form.district.trim()) e.district = 'الحي مطلوب';
    if (!form.unitCount || Number(form.unitCount) <= 0) e.unitCount = 'عدد الوحدات مطلوب';
    if (!form.floors || Number(form.floors) <= 0) e.floors = 'عدد الطوابق مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const newBuilding: Building = {
      id: generateId('bld'),
      officeId: 'off-001',
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || form.name.trim(),
      type: form.type,
      district: form.district.trim(),
      city: form.city.trim(),
      unitCount: Number(form.unitCount),
      occupiedUnits: 0,
      yearBuilt: new Date().getFullYear(),
      floors: Number(form.floors),
      hasElevator: form.hasElevator,
      hasParking: form.hasParking,
      hasGenerator: form.hasGenerator,
    };

    addToStorage(STORAGE_KEYS.BUILDINGS, newBuilding);

    setTimeout(() => {
      toast.success('تم إضافة المبنى بنجاح');
      router.push('/office/buildings');
    }, 400);
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-4">
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link href="/office/buildings" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للمباني
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
          <Building2 className="h-5 w-5 text-brand-500" />
        </div>
        <h1 className="text-xl font-bold">إضافة مبنى جديد</h1>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">اسم المبنى *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="مثال: برج النخيل"
                className={`w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${errors.name ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => updateField('nameEn', e.target.value)}
                placeholder="e.g., Al Nakheel Tower"
                dir="ltr"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">نوع المبنى *</label>
            <div className="flex gap-3">
              {[
                { value: 'residential', label: 'سكني' },
                { value: 'commercial', label: 'تجاري' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('type', opt.value)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    form.type === opt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">الحي *</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                placeholder="مثال: حي الصفا"
                className={`w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${errors.district ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.district && <p className="mt-1 text-[10px] text-red-500">{errors.district}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">المدينة</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">عدد الوحدات *</label>
              <input
                type="number"
                min="1"
                value={form.unitCount}
                onChange={(e) => updateField('unitCount', e.target.value)}
                placeholder="مثال: 24"
                className={`w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${errors.unitCount ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.unitCount && <p className="mt-1 text-[10px] text-red-500">{errors.unitCount}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">عدد الطوابق *</label>
              <input
                type="number"
                min="1"
                value={form.floors}
                onChange={(e) => updateField('floors', e.target.value)}
                placeholder="مثال: 8"
                className={`w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${errors.floors ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.floors && <p className="mt-1 text-[10px] text-red-500">{errors.floors}</p>}
            </div>
          </div>

          {/* Amenities toggles */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">المرافق</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'hasElevator', label: 'مصعد' },
                { key: 'hasParking', label: 'مواقف سيارات' },
                { key: 'hasGenerator', label: 'مولد احتياطي' },
              ].map((amenity) => (
                <button
                  key={amenity.key}
                  type="button"
                  onClick={() => updateField(amenity.key, !form[amenity.key as keyof typeof form])}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    form[amenity.key as keyof typeof form]
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {form[amenity.key as keyof typeof form] ? '✓ ' : ''}{amenity.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="mt-4">
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'جاري الحفظ...' : 'حفظ المبنى'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
