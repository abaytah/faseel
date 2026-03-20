'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Building2, Save, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';
import { useToast } from '@/components/ui/toast-provider';

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
  const officeId = getOfficeId();

  const createBuilding = trpc.buildings.create.useMutation({
    onSuccess: (data) => {
      toast.success('تم إضافة المبنى بنجاح');
      router.push(`/office/buildings/${data.id}`);
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        toast.error(parsed.messageAr || 'حدث خطأ أثناء إضافة المبنى');
      } catch {
        toast.error('حدث خطأ أثناء إضافة المبنى');
      }
    },
  });

  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    type: 'RESIDENTIAL' as 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED',
    address: '',
    district: '',
    city: 'جدة',
    totalUnits: '',
    floors: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'اسم المبنى مطلوب';
    if (!form.address.trim()) e.address = 'العنوان مطلوب';
    if (!form.district.trim()) e.district = 'الحي مطلوب';
    if (!form.city.trim()) e.city = 'المدينة مطلوبة';
    if (!form.totalUnits || Number(form.totalUnits) <= 0) e.totalUnits = 'عدد الوحدات مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!officeId) {
      toast.error('لم يتم تحديد المكتب. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    createBuilding.mutate({
      officeId,
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      type: form.type,
      totalUnits: Number(form.totalUnits),
      floors: form.floors ? Number(form.floors) : undefined,
    });
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

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
          href="/office/buildings"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمباني
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="bg-brand-50 dark:bg-brand-900/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <Building2 className="text-brand-500 h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold">إضافة مبنى جديد</h1>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <motion.div
          variants={itemVariants}
          className="shadow-soft space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                اسم المبنى *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="مثال: برج النخيل"
                className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.name ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => updateField('nameEn', e.target.value)}
                placeholder="e.g., Al Nakheel Tower"
                dir="ltr"
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
              نوع المبنى *
            </label>
            <div className="flex gap-3">
              {[
                { value: 'RESIDENTIAL', label: 'سكني' },
                { value: 'COMMERCIAL', label: 'تجاري' },
                { value: 'MIXED', label: 'مختلط' },
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

          {/* Address */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
              العنوان *
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="مثال: شارع الأمير سلطان"
              className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.address ? 'border-red-400' : 'border-[var(--border)]'}`}
            />
            {errors.address && <p className="mt-1 text-[10px] text-red-500">{errors.address}</p>}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                الحي *
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                placeholder="مثال: حي الصفا"
                className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.district ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.district && (
                <p className="mt-1 text-[10px] text-red-500">{errors.district}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                المدينة *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.city ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.city && <p className="mt-1 text-[10px] text-red-500">{errors.city}</p>}
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                عدد الوحدات *
              </label>
              <input
                type="number"
                min="1"
                value={form.totalUnits}
                onChange={(e) => updateField('totalUnits', e.target.value)}
                placeholder="مثال: 24"
                className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.totalUnits ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.totalUnits && (
                <p className="mt-1 text-[10px] text-red-500">{errors.totalUnits}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                عدد الطوابق
              </label>
              <input
                type="number"
                min="1"
                value={form.floors}
                onChange={(e) => updateField('floors', e.target.value)}
                placeholder="مثال: 8"
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="mt-4">
          <motion.button
            type="submit"
            disabled={createBuilding.isPending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-60"
          >
            {createBuilding.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {createBuilding.isPending ? 'جاري الحفظ...' : 'حفظ المبنى'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
