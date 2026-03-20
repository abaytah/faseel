'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Droplets,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Home,
  Building2,
  Scale,
  Lightbulb,
  AlertTriangle,
  ArrowUpDown,
  ShieldAlert,
  Wrench,
  ImagePlus,
  X,
  MessageSquare,
  ChefHat,
  Bath,
  BedDouble,
  Sofa,
  DoorOpen,
  CarFront,
  Layers,
  CloudRain,
  Droplet,
} from 'lucide-react';
import {
  getCostRouterResult,
  getSelfHelpTip,
  costColors,
  type CostRouterResult,
  office,
} from '@/lib/mock-data';
import { trpc } from '@/lib/trpc';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { useToast } from '@/components/ui/toast-provider';

// ----- Categories (8 image-based cards) -----
const categories = [
  {
    id: 'hvac',
    label: 'تكييف',
    labelEn: 'AC',
    icon: Wind,
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    emoji: '',
  },
  {
    id: 'plumbing',
    label: 'سباكة',
    labelEn: 'Plumbing',
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    emoji: '',
  },
  {
    id: 'electrical',
    label: 'كهرباء',
    labelEn: 'Electrical',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    emoji: '',
  },
  {
    id: 'structural',
    label: 'هيكلي',
    labelEn: 'Structural',
    icon: Hammer,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    emoji: '',
  },
  {
    id: 'fire_safety',
    label: 'سلامة',
    labelEn: 'Fire Safety',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    emoji: '',
  },
  {
    id: 'elevator',
    label: 'مصاعد',
    labelEn: 'Elevator',
    icon: ArrowUpDown,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    emoji: '',
  },
  {
    id: 'cosmetic',
    label: 'تجميلي',
    labelEn: 'Cosmetic',
    icon: Paintbrush,
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    emoji: '',
  },
  {
    id: 'general',
    label: 'عام',
    labelEn: 'General',
    icon: Wrench,
    color: 'text-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    emoji: '',
  },
];

// ----- Subcategories (dynamic per category) -----
const subcategories: Record<string, Array<{ id: string; label: string; icon: typeof Wind }>> = {
  hvac: [
    { id: 'compressor_broken', label: 'كومبرسور لا يعمل', icon: Wind },
    { id: 'not_cooling', label: 'لا يبرد بشكل كافي', icon: Wind },
    { id: 'water_leak', label: 'تسريب ماء', icon: Droplet },
    { id: 'strange_noise', label: 'أصوات غير طبيعية', icon: Wind },
    { id: 'bad_smell', label: 'رائحة كريهة', icon: Wind },
  ],
  plumbing: [
    { id: 'water_leak', label: 'تسريب مياه', icon: Droplets },
    { id: 'clog', label: 'انسداد', icon: Droplets },
    { id: 'water_heater', label: 'سخان مياه', icon: Droplets },
    { id: 'faucet', label: 'خلاط / حنفية', icon: Droplets },
    { id: 'sewage', label: 'صرف صحي', icon: Droplets },
  ],
  electrical: [
    { id: 'power_outage', label: 'انقطاع كهرباء', icon: Zap },
    { id: 'switch_outlet', label: 'مفتاح / قابس', icon: Zap },
    { id: 'lighting', label: 'إضاءة', icon: Lightbulb },
    { id: 'exposed_wires', label: 'أسلاك مكشوفة', icon: AlertTriangle },
  ],
  structural: [
    { id: 'wall_cracks', label: 'شقوق جدران', icon: Hammer },
    { id: 'ceiling_leak', label: 'تسريب سقف', icon: CloudRain },
    { id: 'windows', label: 'زجاج / نوافذ', icon: Hammer },
    { id: 'doors', label: 'أبواب', icon: DoorOpen },
    { id: 'floors', label: 'أرضيات', icon: Layers },
  ],
  fire_safety: [
    { id: 'alarm', label: 'إنذار حريق', icon: ShieldAlert },
    { id: 'extinguisher', label: 'طفاية حريق', icon: ShieldAlert },
    { id: 'sprinkler', label: 'رشاشات مياه', icon: ShieldAlert },
    { id: 'fire_door', label: 'باب مقاوم للحريق', icon: ShieldAlert },
  ],
  elevator: [
    { id: 'stuck', label: 'المصعد عالق', icon: ArrowUpDown },
    { id: 'noise', label: 'أصوات غير طبيعية', icon: ArrowUpDown },
    { id: 'door', label: 'باب المصعد', icon: ArrowUpDown },
    { id: 'button', label: 'أزرار المصعد', icon: ArrowUpDown },
  ],
  cosmetic: [
    { id: 'paint', label: 'دهان', icon: Paintbrush },
    { id: 'tiles', label: 'سيراميك / بلاط', icon: Paintbrush },
    { id: 'wallpaper', label: 'ورق جدران', icon: Paintbrush },
    { id: 'decor', label: 'ديكور', icon: Paintbrush },
  ],
  general: [
    { id: 'locks', label: 'أقفال', icon: Wrench },
    { id: 'pest', label: 'مكافحة حشرات', icon: Wrench },
    { id: 'cleaning', label: 'تنظيف', icon: Wrench },
    { id: 'other', label: 'أخرى', icon: Wrench },
  ],
};

// ----- Location options -----
const locationTypes = [
  { id: 'unit', label: 'داخل الشقة', icon: Home, desc: 'المشكلة داخل شقتي / وحدتي' },
  { id: 'common_area', label: 'منطقة مشتركة', icon: Building2, desc: 'ممر، مدخل، سطح، مواقف' },
];

const unitRooms = [
  { id: 'kitchen', label: 'مطبخ', icon: ChefHat },
  { id: 'bathroom', label: 'حمام', icon: Bath },
  { id: 'bedroom', label: 'غرفة نوم', icon: BedDouble },
  { id: 'living', label: 'صالة', icon: Sofa },
  { id: 'entrance', label: 'مدخل', icon: DoorOpen },
];

const commonAreas = [
  { id: 'building_entrance', label: 'مدخل المبنى', icon: DoorOpen },
  { id: 'parking', label: 'موقف سيارات', icon: CarFront },
  { id: 'stairs', label: 'درج', icon: Layers },
  { id: 'roof', label: 'سطح', icon: Building2 },
  { id: 'water_tank', label: 'خزان مياه', icon: Droplets },
];

const steps = ['التصنيف', 'المشكلة', 'الموقع', 'التفاصيل', 'مراجعة'];

interface PhotoItem {
  dataUrl: string;
  name: string;
}

export default function NewRequestPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-sm text-[var(--muted-foreground)]">
            جاري التحميل...
          </div>
        </div>
      }
    >
      <NewRequestPage />
    </Suspense>
  );
}

function NewRequestPage() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get('category') ?? null;
  const urlPriority = searchParams?.get('priority') ?? null;

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [priority] = useState<string>(urlPriority || 'medium');
  const [locationType, setLocationType] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showSelfHelp, setShowSelfHelp] = useState(true);
  const [ticketNumber, setTicketNumber] = useState('');
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Handle URL params for emergency shortcuts — pre-fill category and skip to step 1
  useEffect(() => {
    if (initializedRef.current) return;
    if (urlCategory && categories.some((c) => c.id === urlCategory)) {
      setCategory(urlCategory);
      setStep(1); // Skip to subcategory selection
      initializedRef.current = true;
    }
  }, [urlCategory]);

  const canNext = useCallback(() => {
    if (step === 0) return !!category;
    if (step === 1) return !!subcategory;
    if (step === 2) return !!locationType && !!specificLocation;
    if (step === 3) return description.length >= 10;
    return true;
  }, [step, category, subcategory, locationType, specificLocation, description]);

  const costResult: CostRouterResult | null =
    category && subcategory && locationType
      ? getCostRouterResult(
          category,
          subcategories[category]?.find((s) => s.id === subcategory)?.label || '',
          locationType,
        )
      : null;

  const selfHelpTip =
    category && subcategory
      ? getSelfHelpTip(
          category,
          subcategories[category]?.find((s) => s.id === subcategory)?.label || '',
        )
      : null;

  const selectedCategory = categories.find((c) => c.id === category);
  const selectedSubcategory = subcategories[category]?.find((s) => s.id === subcategory);
  const selectedLocationType = locationTypes.find((l) => l.id === locationType);
  const selectedRoom =
    locationType === 'unit'
      ? unitRooms.find((r) => r.id === specificLocation)
      : commonAreas.find((a) => a.id === specificLocation);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= 4) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotos((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, { dataUrl, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const createMutation = trpc.maintenance.create.useMutation({
    onSuccess: (data) => {
      setTicketNumber(data.id.slice(0, 8).toUpperCase());
      setSubmitted(true);
      toast.success('تم إرسال البلاغ بنجاح!');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
    },
  });

  const handleSubmit = () => {
    // Map the UI category to the API category enum
    const categoryMap: Record<string, string> = {
      hvac: 'HVAC',
      plumbing: 'PLUMBING',
      electrical: 'ELECTRICAL',
      structural: 'STRUCTURAL',
      fire_safety: 'SECURITY',
      elevator: 'ELEVATOR',
      cosmetic: 'COSMETIC',
      general: 'OTHER',
    };

    const apiCategory = categoryMap[category] ?? 'OTHER';
    const title = `${selectedCategory?.label ?? ''} — ${selectedSubcategory?.label ?? ''}`;
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      urgent: 'URGENT',
    };

    // For now, use a placeholder unitId. In production the tenant's unit is known from auth context.
    // The API requires a valid unitId; if the user is authenticated, the backend resolves this.
    createMutation.mutate({
      // TODO: replace with actual unitId from tenant's auth session
      unitId: '00000000-0000-0000-0000-000000000000',
      title,
      description,
      priority: priorityMap[priority] ?? 'MEDIUM',
      category: apiCategory as
        | 'PLUMBING'
        | 'ELECTRICAL'
        | 'HVAC'
        | 'STRUCTURAL'
        | 'APPLIANCE'
        | 'COSMETIC'
        | 'PAINTING'
        | 'CARPENTRY'
        | 'PEST_CONTROL'
        | 'ELEVATOR'
        | 'SECURITY'
        | 'CLEANING'
        | 'OTHER',
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // ----- Submitted success screen -----
  if (submitted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        {/* Confetti effect - decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                y: '50%',
                x: `${20 + Math.random() * 60}%`,
                scale: 0,
              }}
              animate={{
                opacity: 0,
                y: `${-20 + Math.random() * 40}%`,
                scale: 1,
              }}
              transition={{
                delay: 0.1 + i * 0.08,
                duration: 1.2,
                ease: 'easeOut',
              }}
              className={`absolute h-3 w-3 rounded-full ${
                [
                  'bg-brand-400',
                  'bg-sky-400',
                  'bg-amber-400',
                  'bg-emerald-400',
                  'bg-violet-400',
                  'bg-pink-400',
                ][i % 6]
              }`}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-xl font-bold"
        >
          تم إرسال البلاغ بنجاح!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 space-y-1"
        >
          <p className="text-sm text-[var(--muted-foreground)]">رقم التذكرة</p>
          <p className="text-brand-500 text-2xl font-bold tracking-wider">{ticketNumber}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20"
        >
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">سنرد عليك خلال ساعة واحدة</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
            سيتم إشعارك عبر واتساب عند أي تحديث
          </p>
        </motion.div>

        {/* WhatsApp confirmation to office */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <WhatsAppButton
            phone={office.phone.replace(/-/g, '')}
            message={`تم إرسال بلاغ صيانة جديد: ${selectedCategory?.label} — ${selectedSubcategory?.label}، رقم البلاغ: ${ticketNumber}`}
            label="إرسال تأكيد للمكتب عبر واتساب"
            variant="secondary"
            size="md"
          />
        </motion.div>

        {/* Cost router animation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="shadow-soft w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Scale className="text-brand-500 h-5 w-5" />
            <span className="text-sm font-bold">تحديد المسؤولية المالية</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 1.5 }}
            className="bg-brand-500 mb-3 h-1.5 rounded-full"
          />
          {costResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <div
                className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${costColors[costResult.responsibility]}`}
              >
                المسؤول: {costResult.label}
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)]">{costResult.article}</p>
            </motion.div>
          )}
          {!costResult && (
            <p className="text-xs text-[var(--muted-foreground)]">
              جاري تحليل الطلب وتحديد المسؤولية المالية وفقاً للنظام...
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6"
        >
          <button
            onClick={() => router.push('/tenant/dashboard')}
            className="rounded-xl bg-[var(--secondary)] px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--accent)]"
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  // ----- Step content -----
  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Priority badge for emergency shortcuts */}
      {urlPriority === 'urgent' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30"
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            بلاغ عاجل — سيتم التعامل معه بأولوية قصوى
          </span>
        </motion.div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
              <motion.div
                initial={false}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-brand-500 absolute inset-y-0 start-0 rounded-full"
              />
            </div>
            <span
              className={`text-[10px] ${i === step ? 'text-brand-500 font-medium' : 'text-[var(--muted-foreground)]'}`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Category Selection — image-based cards */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <h2 className="text-base font-bold">ما نوع المشكلة؟</h2>
            <p className="text-xs text-[var(--muted-foreground)]">اختر التصنيف الأقرب لمشكلتك</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setCategory(cat.id);
                      setSubcategory('');
                      setLocationType('');
                      setSpecificLocation('');
                    }}
                    className={`flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-card'
                        : 'hover:border-brand-200 hover:shadow-soft border-[var(--border)] bg-[var(--card)]'
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.bg} transition-transform ${isSelected ? 'scale-110' : ''}`}
                    >
                      <Icon className={`h-7 w-7 ${cat.color}`} />
                    </div>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 1: Subcategory */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <h2 className="text-base font-bold">حدد المشكلة بالتفصيل</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {selectedCategory?.label} — اختر المشكلة المحددة
            </p>
            <div className="space-y-2">
              {(subcategories[category] || []).map((sub) => {
                const Icon = sub.icon;
                const isSelected = subcategory === sub.id;
                return (
                  <motion.button
                    key={sub.id}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSubcategory(sub.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-start transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-[var(--secondary)]'
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${isSelected ? 'text-brand-500' : 'text-[var(--muted-foreground)]'}`}
                      />
                    </div>
                    <span className="text-sm font-medium">{sub.label}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mr-auto">
                        <CheckCircle2 className="text-brand-500 h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-base font-bold">أين المشكلة؟</h2>

            {/* Location type */}
            <div className="space-y-2">
              {locationTypes.map((loc) => {
                const Icon = loc.icon;
                const isSelected = locationType === loc.id;
                return (
                  <motion.button
                    key={loc.id}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setLocationType(loc.id);
                      setSpecificLocation('');
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-start transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-[var(--secondary)]'}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${isSelected ? 'text-brand-500' : 'text-[var(--muted-foreground)]'}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{loc.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{loc.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Specific location — dynamic based on type */}
            <AnimatePresence mode="wait">
              {locationType && (
                <motion.div
                  key={locationType}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    {locationType === 'unit' ? 'أي غرفة؟' : 'أي منطقة؟'}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {(locationType === 'unit' ? unitRooms : commonAreas).map((room) => {
                      const Icon = room.icon;
                      const isSelected = specificLocation === room.id;
                      return (
                        <motion.button
                          key={room.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSpecificLocation(room.id)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-[var(--border)] bg-[var(--card)]'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${isSelected ? 'text-brand-500' : 'text-[var(--muted-foreground)]'}`}
                          />
                          <span className="text-[10px] font-medium">{room.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Step 3: Description + Photos + Self-help tip */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-base font-bold">وصف المشكلة</h2>

            {/* Self-help tip */}
            {selfHelpTip && showSelfHelp && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
              >
                <button
                  onClick={() => setShowSelfHelp(false)}
                  className="absolute end-2 top-2 rounded-lg p-1 text-amber-600/50 hover:text-amber-600 dark:text-amber-400/50 dark:hover:text-amber-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                      نصيحة سريعة قبل الإرسال
                    </p>
                    <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      {selfHelpTip.tip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل... مثل: متى بدأت؟ هل تتكرر؟ ما الذي جربته؟"
              rows={5}
              className="focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm outline-none transition-colors focus:ring-2"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {description.length < 10
                  ? `أدخل ${10 - description.length} حرف على الأقل`
                  : 'ممتاز!'}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{description.length} حرف</p>
            </div>

            {/* Photo upload area — real preview */}
            <div>
              <p className="mb-2 text-sm font-medium">صور (اختياري)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative h-20 w-20 overflow-hidden rounded-xl bg-[var(--secondary)]"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
                {photos.length < 4 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:border-brand-500 flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--secondary)] transition-colors"
                  >
                    <ImagePlus className="h-5 w-5 text-[var(--muted-foreground)]" />
                    <span className="text-[9px] text-[var(--muted-foreground)]">إضافة صورة</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review + Cost Preview */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-base font-bold">مراجعة الطلب</h2>

            {/* Summary card */}
            <div className="shadow-soft space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">التصنيف</span>
                <div className="flex items-center gap-2">
                  {selectedCategory && (
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg ${selectedCategory.bg}`}
                    >
                      <selectedCategory.icon className={`h-3.5 w-3.5 ${selectedCategory.color}`} />
                    </div>
                  )}
                  <span className="text-sm font-medium">{selectedCategory?.label}</span>
                </div>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">المشكلة</span>
                <span className="text-sm font-medium">{selectedSubcategory?.label}</span>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">الموقع</span>
                <span className="text-sm font-medium">
                  {selectedLocationType?.label} — {selectedRoom?.label}
                </span>
              </div>
              {urlPriority === 'urgent' && (
                <>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted-foreground)]">الأولوية</span>
                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                      عاجل
                    </span>
                  </div>
                </>
              )}
              <div className="h-px bg-[var(--border)]" />
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">الوصف</span>
                <p className="mt-1 text-sm leading-relaxed">{description}</p>
              </div>
              {photos.length > 0 && (
                <>
                  <div className="h-px bg-[var(--border)]" />
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      الصور ({photos.length})
                    </span>
                    <div className="mt-2 flex gap-2">
                      {photos.map((photo, i) => (
                        <div key={i} className="h-12 w-12 overflow-hidden rounded-lg">
                          <img
                            src={photo.dataUrl}
                            alt={photo.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cost Router Result */}
            {costResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Scale className="text-brand-500 h-5 w-5" />
                  <h3 className="text-sm font-bold">المسؤولية المالية</h3>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${costColors[costResult.responsibility]}`}
                  >
                    المسؤول: {costResult.label}
                  </span>
                </div>

                <div className="mb-3 flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                  <span className="text-xs text-[var(--muted-foreground)]">التكلفة المتوقعة</span>
                  <span className="text-sm font-bold">{costResult.estimatedRange}</span>
                </div>

                <div className="rounded-xl bg-[var(--secondary)] p-3">
                  <p className="text-[10px] font-medium text-[var(--muted-foreground)]">
                    {costResult.article}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                    {costResult.legalBasis}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 pb-4">
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="flex h-12 items-center gap-2 rounded-xl bg-[var(--secondary)] px-6 text-sm font-medium transition-colors hover:bg-[var(--accent)]"
          >
            <ArrowRight className="h-4 w-4" />
            <span>السابق</span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: canNext() ? 1.01 : 1 }}
          whileTap={{ scale: canNext() ? 0.98 : 1 }}
          onClick={handleNext}
          disabled={!canNext()}
          className="bg-brand-500 shadow-soft hover:bg-brand-600 flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{step === 4 ? 'إرسال البلاغ' : 'التالي'}</span>
          {step < 4 && <ArrowLeft className="h-4 w-4" />}
          {step === 4 && <CheckCircle2 className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  );
}
