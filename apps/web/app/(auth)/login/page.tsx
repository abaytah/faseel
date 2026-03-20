'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 9) {
      router.push('/verify');
    }
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
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-card"
        >
          <Home className="h-8 w-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-2xl font-bold">تسجيل الدخول</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            أدخل رقم جوالك لتسجيل الدخول
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="relative">
            <label className="mb-2 block text-sm font-medium">رقم الجوال</label>
            <div className="flex gap-2">
              {/* Country code */}
              <div className="flex h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 text-sm">
                <span className="text-lg">🇸🇦</span>
                <span className="font-medium" dir="ltr">+966</span>
              </div>
              {/* Phone input */}
              <div className="relative flex-1">
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="5X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  autoFocus
                />
                <Phone className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={phone.length < 9}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-base font-semibold text-white shadow-soft transition-all hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>متابعة</span>
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-[var(--muted-foreground)]"
        >
          بالمتابعة أنت توافق على{' '}
          <span className="text-brand-500">الشروط والأحكام</span>
          {' '}و{' '}
          <span className="text-brand-500">سياسة الخصوصية</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Link href="/" className="text-sm text-[var(--muted-foreground)] hover:text-brand-500 transition-colors">
            ← العودة للرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
