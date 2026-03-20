'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { addToStorage, generateId, STORAGE_KEYS } from '@/lib/local-storage';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

// Simulated extracted data
function generateExtractedData() {
  const names = ['محمد بن أحمد العتيبي', 'خالد بن سعود المالكي', 'فيصل بن عبدالله الحربي', 'ياسر بن سعد القحطاني'];
  const buildings = ['برج النخيل', 'عمارة الياسمين', 'مجمع الواحة التجاري', 'برج الياقوت'];
  const rent = [3500, 4200, 5000, 6500, 2800, 3000];
  const idx = Math.floor(Math.random() * names.length);
  const rentIdx = Math.floor(Math.random() * rent.length);
  const unitNum = `${Math.floor(Math.random() * 4) + 1}0${Math.floor(Math.random() * 9) + 1}`;
  const monthlyRent = rent[rentIdx];
  const ejarRef = `EJ-1446-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  return {
    tenantName: names[idx],
    tenantPhone: `96655${Math.floor(Math.random() * 9000000) + 1000000}`,
    nationalId: `10${Math.floor(Math.random() * 90) + 10}XXXXXX`,
    unitNumber: unitNum,
    building: buildings[idx],
    monthlyRent,
    annualRent: monthlyRent * 12,
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    ejarNumber: ejarRef,
  };
}

type ExtractedData = ReturnType<typeof generateExtractedData>;

export default function ContractUploadPage() {
  const router = useRouter();
  const toast = useToast();

  const [stage, setStage] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [saving, setSaving] = useState(false);

  function handleUploadClick() {
    setStage('analyzing');
    setProgress(0);

    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    // After 2.5 seconds, show extracted data
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const data = generateExtractedData();
      setExtractedData(data);
      setTimeout(() => setStage('review'), 500);
    }, 2500);
  }

  function updateField(field: keyof ExtractedData, value: string | number) {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, [field]: value });
  }

  function handleSave() {
    if (!extractedData) return;
    setSaving(true);

    const contract = {
      id: generateId('contract'),
      tenantName: extractedData.tenantName,
      tenantPhone: extractedData.tenantPhone,
      nationalId: extractedData.nationalId,
      unitNumber: extractedData.unitNumber,
      building: extractedData.building,
      monthlyRent: Number(extractedData.monthlyRent),
      annualRent: Number(extractedData.annualRent),
      startDate: extractedData.startDate,
      endDate: extractedData.endDate,
      ejarNumber: extractedData.ejarNumber,
      uploadedAt: new Date().toISOString(),
    };

    addToStorage(STORAGE_KEYS.CONTRACTS, contract);

    setTimeout(() => {
      toast.success('تم رفع العقد بنجاح وتحديث بيانات الوحدة');
      router.push('/office/dashboard');
    }, 500);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-4">
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link href="/office/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
          <Upload className="h-5 w-5 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold">رفع عقد إيجار</h1>
      </motion.div>

      {/* Upload Stage */}
      <AnimatePresence mode="wait">
        {stage === 'upload' && (
          <motion.div
            key="upload"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              whileHover={{ scale: 1.01, borderColor: 'var(--brand-500)' }}
              whileTap={{ scale: 0.99 }}
              onClick={handleUploadClick}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-soft transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
            >
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FileText className="mx-auto mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
              </motion.div>
              <p className="text-base font-bold">اضغط لرفع عقد إيجار</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                PDF, صورة, أو مستند — سيتم تحليل العقد تلقائيا بالذكاء الاصطناعي
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                يدعم عقود إيجار المنصة الوطنية للتأجير
              </p>
            </motion.div>
          </motion.div>
        )}

        {stage === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-soft"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4"
              >
                <Loader2 className="h-12 w-12 text-brand-500" />
              </motion.div>
              <p className="text-base font-bold mb-2">جاري تحليل العقد...</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">استخراج البيانات بالذكاء الاصطناعي</p>

              {/* Progress bar */}
              <div className="mx-auto max-w-sm">
                <div className="h-2 rounded-full bg-[var(--secondary)]">
                  <motion.div
                    className="h-full rounded-full bg-brand-500"
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                  {progress < 30 ? 'قراءة المستند...' :
                   progress < 60 ? 'استخراج بيانات المستأجر...' :
                   progress < 90 ? 'التحقق من بيانات إيجار...' :
                   'اكتمال التحليل'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'review' && extractedData && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Success indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-950/30 dark:border-emerald-800"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">تم استخراج البيانات بنجاح — تحقق وعدّل إذا لزم الأمر</span>
            </motion.div>

            {/* Editable extracted data */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft space-y-4"
            >
              <h3 className="text-sm font-bold mb-2">بيانات المستأجر</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">اسم المستأجر</label>
                  <input
                    type="text"
                    value={extractedData.tenantName}
                    onChange={(e) => updateField('tenantName', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">رقم الجوال</label>
                  <input
                    type="text"
                    value={extractedData.tenantPhone}
                    onChange={(e) => updateField('tenantPhone', e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">رقم الهوية</label>
                  <input
                    type="text"
                    value={extractedData.nationalId}
                    onChange={(e) => updateField('nationalId', e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft space-y-4"
            >
              <h3 className="text-sm font-bold mb-2">بيانات الوحدة والعقد</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">رقم الوحدة</label>
                  <input
                    type="text"
                    value={extractedData.unitNumber}
                    onChange={(e) => updateField('unitNumber', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">المبنى</label>
                  <input
                    type="text"
                    value={extractedData.building}
                    onChange={(e) => updateField('building', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الإيجار الشهري (ر.س)</label>
                  <input
                    type="number"
                    value={extractedData.monthlyRent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('monthlyRent', val);
                      updateField('annualRent', val * 12);
                    }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الإيجار السنوي (ر.س)</label>
                  <input
                    type="number"
                    value={extractedData.annualRent}
                    onChange={(e) => updateField('annualRent', Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">تاريخ البداية</label>
                  <input
                    type="date"
                    value={extractedData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={extractedData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">رقم إيجار المرجعي</label>
                  <input
                    type="text"
                    value={extractedData.ejarNumber}
                    onChange={(e) => updateField('ejarNumber', e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'جاري الحفظ...' : 'تأكيد وحفظ'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
