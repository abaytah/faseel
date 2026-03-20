'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Loader2,
  User,
  Building2,
  Crown,
  Wrench,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { setTokens, setUser, setRoles, getDashboardPath } from '@/lib/auth';
import { SAUDI_CITIES } from '@/lib/cities';

// ============================================================
// Types
// ============================================================

type RoleType = 'TENANT' | 'OFFICE_ADMIN' | 'OWNER' | 'SERVICE_PROVIDER';

type Specialty =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'PAINTING'
  | 'CARPENTRY'
  | 'CLEANING'
  | 'OTHER';

interface OfficeData {
  nameAr: string;
  city: string;
  crNumber: string;
}

interface ProviderData {
  specialties: Specialty[];
  bio: string;
}

interface RoleCardConfig {
  role: RoleType;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderColor: string;
  title: string;
  description: string;
}

// ============================================================
// Constants
// ============================================================

const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: 'TENANT',
    icon: User,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-400',
    title: 'مستأجر',
    description: 'أسكن في وحدة وأريد تتبع طلبات الصيانة',
  },
  {
    role: 'OFFICE_ADMIN',
    icon: Building2,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-400',
    title: 'مكتب عقاري',
    description: 'أدير مكتباً يشرف على مبانٍ ووحدات',
  },
  {
    role: 'OWNER',
    icon: Crown,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-400',
    title: 'مالك عقار',
    description: 'أمتلك عقارات وأريد متابعة أدائها',
  },
  {
    role: 'SERVICE_PROVIDER',
    icon: Wrench,
    color: 'text-purple-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-400',
    title: 'مزود خدمة',
    description: 'أقدم خدمات صيانة وإصلاح',
  },
];

const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: 'PLUMBING', label: 'سباكة' },
  { value: 'ELECTRICAL', label: 'كهرباء' },
  { value: 'HVAC', label: 'تكييف' },
  { value: 'STRUCTURAL', label: 'إنشائي' },
  { value: 'PAINTING', label: 'دهانات' },
  { value: 'CARPENTRY', label: 'نجارة' },
  { value: 'CLEANING', label: 'نظافة' },
  { value: 'OTHER', label: 'عام' },
];

// ============================================================
// Animations
// ============================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ============================================================
// Main Component
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1 data
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 data
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);

  // Step 3 data
  const [officeData, setOfficeData] = useState<OfficeData>({
    nameAr: '',
    city: '',
    crNumber: '',
  });
  const [providerData, setProviderData] = useState<ProviderData>({
    specialties: [],
    bio: '',
  });

  const [error, setError] = useState('');

  const completeOnboarding = trpc.profile.completeOnboardingWithRoles.useMutation({
    onSuccess: (data: {
      accessToken?: string;
      refreshToken?: string;
      user?: { id: string; phone: string; nameAr: string | null; nameEn: string | null };
      roles?: { role: string; officeId: string | null }[];
    }) => {
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      if (data.user) {
        setUser(data.user);
      }
      if (data.roles) {
        setRoles(data.roles);
      }

      const roles = data.roles ?? [];
      if (roles.length > 1) {
        router.push('/role-select');
        return;
      }

      const primaryRole = roles[0]?.role ?? 'TENANT';
      const sessionRole = mapDbRoleToSession(primaryRole);
      router.push(getDashboardPath(sessionRole));
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.messageAr ?? parsed.message ?? 'حدث خطأ');
      } catch {
        setError('حدث خطأ في حفظ البيانات');
      }
    },
  });

  // ---- Navigation ----

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
    setError('');
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    setError('');
  };

  // ---- Step 1 validation ----

  const handleStep1Next = () => {
    if (!nameAr.trim()) {
      setError('الاسم بالعربي مطلوب');
      return;
    }
    goNext();
  };

  // ---- Step 2 validation ----

  const toggleRole = (role: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleStep2Next = () => {
    if (selectedRoles.length === 0) {
      setError('اختر دوراً واحداً على الأقل');
      return;
    }
    goNext();
  };

  // ---- Step 3 ----

  const needsOfficeForm = selectedRoles.includes('OFFICE_ADMIN');
  const needsProviderForm = selectedRoles.includes('SERVICE_PROVIDER');
  const needsAnyForm = needsOfficeForm || needsProviderForm;

  const handleSubmit = () => {
    // Validate office form
    if (needsOfficeForm) {
      if (!officeData.nameAr.trim()) {
        setError('اسم المكتب مطلوب');
        return;
      }
      if (!officeData.city) {
        setError('المدينة مطلوبة');
        return;
      }
    }

    // Validate provider form
    if (needsProviderForm) {
      if (providerData.specialties.length === 0) {
        setError('اختر تخصصاً واحداً على الأقل');
        return;
      }
    }

    setError('');

    completeOnboarding.mutate({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || undefined,
      email: email.trim() || undefined,
      roles: selectedRoles,
      officeData: needsOfficeForm
        ? {
            nameAr: officeData.nameAr.trim(),
            city: officeData.city,
            crNumber: officeData.crNumber.trim() || undefined,
          }
        : undefined,
      providerData: needsProviderForm
        ? {
            specialties: providerData.specialties,
            bio: providerData.bio.trim() || undefined,
          }
        : undefined,
    });
  };

  const toggleSpecialty = (s: Specialty) => {
    setProviderData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };

  // ---- Render ----

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="from-brand-500 to-brand-600 shadow-card mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br"
        >
          <Home className="h-8 w-8 text-white" />
        </motion.div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'bg-brand-500 w-8'
                  : s < step
                    ? 'bg-brand-300 w-2'
                    : 'w-2 bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {/* Steps with AnimatePresence */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Step1NameEmail
                  nameAr={nameAr}
                  setNameAr={setNameAr}
                  nameEn={nameEn}
                  setNameEn={setNameEn}
                  email={email}
                  setEmail={setEmail}
                  error={error}
                  onNext={handleStep1Next}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Step2RoleSelection
                  selectedRoles={selectedRoles}
                  toggleRole={toggleRole}
                  error={error}
                  onNext={handleStep2Next}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Step3Setup
                  selectedRoles={selectedRoles}
                  needsAnyForm={needsAnyForm}
                  needsOfficeForm={needsOfficeForm}
                  needsProviderForm={needsProviderForm}
                  officeData={officeData}
                  setOfficeData={setOfficeData}
                  providerData={providerData}
                  toggleSpecialty={toggleSpecialty}
                  setProviderData={setProviderData}
                  error={error}
                  isPending={completeOnboarding.isPending}
                  onSubmit={handleSubmit}
                  onBack={goBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 1: Name & Email
// ============================================================

function Step1NameEmail({
  nameAr,
  setNameAr,
  nameEn,
  setNameEn,
  email,
  setEmail,
  error,
  onNext,
}: {
  nameAr: string;
  setNameAr: (v: string) => void;
  nameEn: string;
  setNameEn: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  error: string;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold">أهلاً وسهلاً</h1>
        <p className="text-sm text-[var(--muted-foreground)]">أكمل بياناتك للبدء</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Name Arabic */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            الاسم بالعربي <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: عبدالله محمد"
            className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
            dir="rtl"
          />
        </div>

        {/* Name English */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">الاسم بالإنجليزي</label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Abdullah Mohammed"
            className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
            dir="ltr"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
            dir="ltr"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {/* Next */}
        <button
          type="button"
          onClick={onNext}
          className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <span>التالي</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Step 2: Role Selection
// ============================================================

function Step2RoleSelection({
  selectedRoles,
  toggleRole,
  error,
  onNext,
  onBack,
}: {
  selectedRoles: RoleType[];
  toggleRole: (role: RoleType) => void;
  error: string;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold">كيف ستستخدم فسيل؟</h1>
        <p className="text-sm text-[var(--muted-foreground)]">يمكنك اختيار أكثر من دور</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {ROLE_CARDS.map((card) => {
          const isSelected = selectedRoles.includes(card.role);
          const Icon = card.icon;

          return (
            <motion.button
              key={card.role}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleRole(card.role)}
              className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all ${
                isSelected
                  ? `${card.borderColor} ${card.bgLight}`
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute start-2 top-2 flex h-5 w-5 items-center justify-center rounded-full ${card.bgLight}`}
                >
                  <Check className={`h-3.5 w-3.5 ${card.color}`} />
                </motion.div>
              )}

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgLight}`}
              >
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold">{card.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={selectedRoles.length === 0}
          className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
        >
          <span>التالي</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ChevronRight className="h-4 w-4" />
          <span>رجوع</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Step 3: Role-Specific Setup
// ============================================================

function Step3Setup({
  selectedRoles,
  needsAnyForm,
  needsOfficeForm,
  needsProviderForm,
  officeData,
  setOfficeData,
  providerData,
  toggleSpecialty,
  setProviderData,
  error,
  isPending,
  onSubmit,
  onBack,
}: {
  selectedRoles: RoleType[];
  needsAnyForm: boolean;
  needsOfficeForm: boolean;
  needsProviderForm: boolean;
  officeData: OfficeData;
  setOfficeData: React.Dispatch<React.SetStateAction<OfficeData>>;
  providerData: ProviderData;
  toggleSpecialty: (s: Specialty) => void;
  setProviderData: React.Dispatch<React.SetStateAction<ProviderData>>;
  error: string;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const hasTenant = selectedRoles.includes('TENANT');
  const hasOwner = selectedRoles.includes('OWNER');

  return (
    <div>
      {needsAnyForm ? (
        <div className="flex flex-col gap-6">
          {/* Office form */}
          {needsOfficeForm && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">بيانات المكتب</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    أدخل بيانات مكتبك العقاري
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Office name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    اسم المكتب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officeData.nameAr}
                    onChange={(e) => setOfficeData((prev) => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: مكتب النخبة العقاري"
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    المدينة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={officeData.city}
                    onChange={(e) => setOfficeData((prev) => ({ ...prev, city: e.target.value }))}
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  >
                    <option value="">اختر المدينة</option>
                    {SAUDI_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CR Number */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">رقم السجل التجاري</label>
                  <input
                    type="text"
                    value={officeData.crNumber}
                    onChange={(e) =>
                      setOfficeData((prev) => ({ ...prev, crNumber: e.target.value }))
                    }
                    placeholder="1010XXXXXX"
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Divider if both forms */}
          {needsOfficeForm && needsProviderForm && (
            <div className="border-t border-[var(--border)]" />
          )}

          {/* Provider form */}
          {needsProviderForm && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40">
                  <Wrench className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">بيانات مزود الخدمة</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">حدد تخصصاتك</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Specialties */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    التخصصات <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALTIES.map((s) => {
                      const isChecked = providerData.specialties.includes(s.value);
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => toggleSpecialty(s.value)}
                          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition-all ${
                            isChecked
                              ? 'border-purple-400 bg-purple-50 font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]'
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-[var(--border)]'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 text-white" />}
                          </div>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">نبذة مختصرة</label>
                  <textarea
                    value={providerData.bio}
                    onChange={(e) => setProviderData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="صف خدماتك وخبراتك باختصار..."
                    rows={3}
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Confirmation screen for tenant/owner only */
        <div className="py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <h2 className="mb-3 text-2xl font-bold">حسابك جاهز!</h2>
          <div className="flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
            {hasTenant && <p>سيتم ربطك بالمبنى الخاص بك عندما يدعوك المكتب العقاري</p>}
            {hasOwner && <p>سيتم ربط عقاراتك عندما يضيفك المكتب العقاري كمالك</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <span>ابدأ الآن</span>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
          <span>رجوع</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function mapDbRoleToSession(dbRole: string): string {
  switch (dbRole) {
    case 'OFFICE_ADMIN':
      return 'office';
    case 'OWNER':
      return 'owner';
    case 'TENANT':
      return 'tenant';
    case 'SERVICE_PROVIDER':
      return 'provider';
    default:
      return 'tenant';
  }
}
