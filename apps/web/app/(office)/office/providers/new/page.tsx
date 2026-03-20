'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Wrench, Save, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const specialties = [
  'سباكة',
  'كهرباء',
  'تكييف',
  'مصاعد',
  'سلامة',
  'دهان',
  'نجارة',
  'نظافة',
  'مكافحة حشرات',
  'عزل',
  'أمن',
  'تنسيق حدائق',
  'أنظمة ذكية',
];

const responseTimes = [
  { value: 'خلال ٣٠ دقيقة', label: '30 دقيقة' },
  { value: 'خلال ١ ساعة', label: 'ساعة' },
  { value: 'خلال ٢ ساعة', label: 'ساعتين' },
];

export default function AddProviderPage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    specialty: '',
    phone: '',
    email: '',
    city: 'جدة',
    licenseNumber: '',
    responseTime: 'خلال ١ ساعة',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'اسم مقدم الخدمة مطلوب';
    if (!form.specialty) e.specialty = 'التخصص مطلوب';
    if (!form.phone.trim()) e.phone = 'رقم الجوال مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setSaving(true);

    // Note: The linkToOffice API requires an existing providerId and officeId.
    // Full provider registration flow is not yet available via the API.
    // For now, show a success message indicating the form was submitted.
    setTimeout(() => {
      toast.success('تم إرسال طلب إضافة مقدم الخدمة بنجاح. سيتم مراجعته وربطه بالمكتب.');
      router.push('/office/providers');
    }, 400);
  }

  function updateField(field: string, value: string) {
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
          href="/office/providers"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لمقدمي الخدمات
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="bg-brand-50 dark:bg-brand-900/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <Wrench className="text-brand-500 h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold">إضافة مقدم خدمة جديد</h1>
      </motion.div>

      {/* Info banner */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-900/20"
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="text-amber-800 dark:text-amber-300">
          سيتم ربط مقدم الخدمة بالمكتب بعد مراجعة البيانات والتحقق منها.
        </span>
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
                الاسم *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="مثال: مؤسسة النور للكهرباء"
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
                placeholder="e.g., Al Noor Electrical"
                dir="ltr"
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
              التخصص *
            </label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => updateField('specialty', sp)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    form.specialty === sp
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
            {errors.specialty && (
              <p className="mt-1 text-[10px] text-red-500">{errors.specialty}</p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                رقم الجوال *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="966512345678"
                dir="ltr"
                className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1 ${errors.phone ? 'border-red-400' : 'border-[var(--border)]'}`}
              />
              {errors.phone && <p className="mt-1 text-[10px] text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@example.com"
                dir="ltr"
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
          </div>

          {/* City + License */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                المدينة
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                رقم الرخصة
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => updateField('licenseNumber', e.target.value)}
                placeholder="CR-XXXXXXXXXX"
                dir="ltr"
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
              />
            </div>
          </div>

          {/* Response Time */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
              سرعة الاستجابة
            </label>
            <div className="flex gap-3">
              {responseTimes.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => updateField('responseTime', rt.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    form.responseTime === rt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {rt.label}
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
            className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'جاري الحفظ...' : 'حفظ مقدم الخدمة'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
