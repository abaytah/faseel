'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  Save,
  LogOut,
  Plus,
  User,
  Building2,
  Crown,
  Wrench,
  Check,
  X,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { isAuthenticated, setUser, setRoles, clearTokens, getUserRole, getRoles } from '@/lib/auth';
import { useToast } from '@/components/ui/toast-provider';
import { SAUDI_CITIES } from '@/lib/cities';

// ============================================================
// Types & Constants
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

interface RoleConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderColor: string;
  chipBg: string;
  chipText: string;
}

const ROLE_CONFIG: Record<RoleType, RoleConfig> = {
  TENANT: {
    label: 'مستأجر',
    icon: User,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-400',
    chipBg: 'bg-blue-100 dark:bg-blue-900/50',
    chipText: 'text-blue-700 dark:text-blue-300',
  },
  OFFICE_ADMIN: {
    label: 'مكتب عقاري',
    icon: Building2,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-400',
    chipBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    chipText: 'text-emerald-700 dark:text-emerald-300',
  },
  OWNER: {
    label: 'مالك عقار',
    icon: Crown,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-400',
    chipBg: 'bg-amber-100 dark:bg-amber-900/50',
    chipText: 'text-amber-700 dark:text-amber-300',
  },
  SERVICE_PROVIDER: {
    label: 'مزود خدمة',
    icon: Wrench,
    color: 'text-purple-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-400',
    chipBg: 'bg-purple-100 dark:bg-purple-900/50',
    chipText: 'text-purple-700 dark:text-purple-300',
  },
};

const ALL_ROLES: RoleType[] = ['TENANT', 'OFFICE_ADMIN', 'OWNER', 'SERVICE_PROVIDER'];

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
// Main Component
// ============================================================

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Add role modal
  const [showAddRole, setShowAddRole] = useState(false);
  const [currentRoles, setCurrentRoles] = useState<RoleType[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  // Load current roles from localStorage
  useEffect(() => {
    const stored = getRoles();
    setCurrentRoles(stored.map((r) => r.role as RoleType));
  }, []);

  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    staleTime: 0,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setNameAr(profileQuery.data.nameAr ?? '');
      setNameEn(profileQuery.data.nameEn ?? '');
      setEmail(profileQuery.data.email ?? '');
      setPhone(profileQuery.data.phone ?? '');
    }
  }, [profileQuery.data]);

  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (profileQuery.data) {
        setUser({
          id: profileQuery.data.id,
          phone: profileQuery.data.phone,
          nameAr: nameAr || null,
          nameEn: nameEn || null,
        });
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    updateProfile.mutate({
      nameAr: nameAr.trim() || undefined,
      nameEn: nameEn.trim() || undefined,
      email: email.trim() || null,
    });
  };

  const handleLogout = () => {
    clearTokens();
    router.replace('/login');
  };

  const handleRoleAdded = (newRoles: { role: string; officeId: string | null }[]) => {
    setRoles(newRoles);
    setCurrentRoles(newRoles.map((r) => r.role as RoleType));
    setShowAddRole(false);
    toast.success('تم إضافة الدور بنجاح');
  };

  const role = getUserRole();
  const dashboardPath = role ? `/${role}/dashboard` : '/';
  const availableRoles = ALL_ROLES.filter((r) => !currentRoles.includes(r));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background)]/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(dashboardPath)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--secondary)] transition-colors hover:bg-[var(--accent)]"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">الملف الشخصي</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        {profileQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* Phone (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">رقم الجوال</label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--muted-foreground)]"
                dir="ltr"
              />
            </div>

            {/* Name Arabic */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">الاسم بالعربي</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="الاسم بالعربي"
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
                placeholder="Name in English"
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

            {/* ============================================================ */}
            {/* Your Roles Section */}
            {/* ============================================================ */}
            <div className="border-t border-[var(--border)] pt-5">
              <label className="mb-3 block text-sm font-medium">أدوارك</label>
              <div className="flex flex-wrap items-center gap-2">
                {currentRoles.map((r) => {
                  const config = ROLE_CONFIG[r];
                  const Icon = config.icon;
                  return (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${config.chipBg} ${config.chipText}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                  );
                })}

                {availableRoles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddRole(true)}
                    className="text-brand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 inline-flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    أضف دور جديد
                  </button>
                )}
              </div>
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

            {/* Success */}
            {saved && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-green-600"
              >
                تم حفظ التغييرات
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </motion.form>
        )}
      </main>

      {/* Add Role Modal */}
      <AnimatePresence>
        {showAddRole && (
          <AddRoleModal
            availableRoles={availableRoles}
            onClose={() => setShowAddRole(false)}
            onSuccess={handleRoleAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Add Role Modal
// ============================================================

function AddRoleModal({
  availableRoles,
  onClose,
  onSuccess,
}: {
  availableRoles: RoleType[];
  onClose: () => void;
  onSuccess: (roles: { role: string; officeId: string | null }[]) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [error, setError] = useState('');

  // Office form
  const [officeName, setOfficeName] = useState('');
  const [city, setCity] = useState('');
  const [crNumber, setCrNumber] = useState('');

  // Provider form
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [bio, setBio] = useState('');

  const addRole = trpc.profile.addRole.useMutation({
    onSuccess: (data: { roles?: { role: string; officeId: string | null }[] }) => {
      if (data.roles) {
        onSuccess(data.roles);
      }
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.messageAr ?? parsed.message ?? 'حدث خطأ');
      } catch {
        setError('حدث خطأ في إضافة الدور');
      }
    },
  });

  const toggleSpecialty = (s: Specialty) => {
    setSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = () => {
    if (!selectedRole) return;
    setError('');

    if (selectedRole === 'OFFICE_ADMIN') {
      if (!officeName.trim()) {
        setError('اسم المكتب مطلوب');
        return;
      }
      if (!city) {
        setError('المدينة مطلوبة');
        return;
      }
    }

    if (selectedRole === 'SERVICE_PROVIDER') {
      if (specialties.length === 0) {
        setError('اختر تخصصاً واحداً على الأقل');
        return;
      }
    }

    addRole.mutate({
      role: selectedRole,
      officeData:
        selectedRole === 'OFFICE_ADMIN'
          ? {
              nameAr: officeName.trim(),
              city,
              crNumber: crNumber.trim() || undefined,
            }
          : undefined,
      providerData:
        selectedRole === 'SERVICE_PROVIDER'
          ? {
              specialties,
              bio: bio.trim() || undefined,
            }
          : undefined,
    });
  };

  const needsForm = selectedRole === 'OFFICE_ADMIN' || selectedRole === 'SERVICE_PROVIDER';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-md overflow-y-auto rounded-2xl bg-[var(--background)] p-5 shadow-2xl sm:inset-x-auto"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">أضف دور جديد</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary)] transition-colors hover:bg-[var(--accent)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Role selection */}
        {!selectedRole ? (
          <div className="flex flex-col gap-3">
            {availableRoles.map((r) => {
              const config = ROLE_CONFIG[r];
              const Icon = config.icon;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] p-4 text-start transition-all hover:border-[var(--accent)] hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bgLight}`}
                  >
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{config.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Selected role header */}
            <div className="flex items-center gap-3">
              {(() => {
                const config = ROLE_CONFIG[selectedRole];
                const Icon = config.icon;
                return (
                  <>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bgLight}`}
                    >
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <p className="font-bold">{config.label}</p>
                  </>
                );
              })()}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setError('');
                }}
                className="mr-auto text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                تغيير
              </button>
            </div>

            {/* Office form */}
            {selectedRole === 'OFFICE_ADMIN' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    اسم المكتب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    placeholder="مثال: مكتب النخبة العقاري"
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    المدينة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  >
                    <option value="">اختر المدينة</option>
                    {SAUDI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">رقم السجل التجاري</label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    placeholder="1010XXXXXX"
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="ltr"
                  />
                </div>
              </>
            )}

            {/* Provider form */}
            {selectedRole === 'SERVICE_PROVIDER' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    التخصصات <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALTIES.map((s) => {
                      const isChecked = specialties.includes(s.value);
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium">نبذة مختصرة</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="صف خدماتك وخبراتك باختصار..."
                    rows={3}
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    dir="rtl"
                  />
                </div>
              </>
            )}

            {/* Tenant/Owner confirmation */}
            {selectedRole === 'TENANT' && (
              <p className="text-center text-sm text-[var(--muted-foreground)]">
                سيتم ربطك بالمبنى الخاص بك عندما يدعوك المكتب العقاري
              </p>
            )}
            {selectedRole === 'OWNER' && (
              <p className="text-center text-sm text-[var(--muted-foreground)]">
                سيتم ربط عقاراتك عندما يضيفك المكتب العقاري كمالك
              </p>
            )}

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

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={addRole.isPending}
              className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {addRole.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <span>إضافة الدور</span>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
