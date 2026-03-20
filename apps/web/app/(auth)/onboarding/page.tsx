'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { setUser, getRoles, getDashboardPath } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const completeOnboarding = trpc.profile.completeOnboarding.useMutation({
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
      }

      const roles = getRoles();
      if (roles.length > 1) {
        router.push('/role-select');
        return;
      }

      // Single role, go to dashboard
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nameAr.trim()) {
      setError('الاسم بالعربي مطلوب');
      return;
    }

    completeOnboarding.mutate({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || undefined,
      email: email.trim() || undefined,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="from-brand-500 to-brand-600 shadow-card mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br"
        >
          <Home className="h-8 w-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-2xl font-bold">أهلاً وسهلاً</h1>
          <p className="text-sm text-[var(--muted-foreground)]">أكمل بياناتك للبدء</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
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
            <label className="mb-1.5 block text-sm font-medium">الاسم بالإنجليزي (اختياري)</label>
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
            <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              dir="ltr"
            />
          </div>

          {/* Role display */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">الدور الأساسي</label>
            <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              {getRoleDisplay()}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={completeOnboarding.isPending || !nameAr.trim()}
            className="from-brand-500 to-brand-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          >
            {completeOnboarding.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <span>ابدأ</span>
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

function getRoleDisplay(): string {
  const roles = getRoles();
  if (!roles.length) return 'مستأجر';

  const roleLabels: Record<string, string> = {
    TENANT: 'مستأجر',
    OFFICE_ADMIN: 'مكتب عقاري',
    OWNER: 'مالك',
    SERVICE_PROVIDER: 'مزود خدمة',
  };

  return roles.map((r) => roleLabels[r.role] ?? r.role).join('، ');
}

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
