'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Save, LogOut } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { isAuthenticated, setUser, clearTokens, getUserRole } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

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
      // Update localStorage user data
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

  const role = getUserRole();
  const dashboardPath = role ? `/${role}/dashboard` : '/';

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
    </div>
  );
}
