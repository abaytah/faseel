'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => router.push('/office/dashboard'), 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((d) => d === '');
      inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
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
          <h1 className="mb-2 text-2xl font-bold">تأكيد رقم الجوال</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            أدخل رمز التحقق المرسل إلى
          </p>
          <p className="mt-1 font-semibold" dir="ltr">+966 5X XXX XX90</p>
        </motion.div>

        {/* OTP Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex justify-center gap-3"
          dir="ltr"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="h-14 w-12 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-center text-2xl font-bold outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          ))}
        </motion.div>

        {/* Countdown / Resend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 text-center"
        >
          {countdown > 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              إعادة الإرسال خلال{' '}
              <span className="font-bold text-brand-500">{countdown}</span>{' '}
              ثانية
            </p>
          ) : (
            <button
              onClick={() => setCountdown(60)}
              className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span>إعادة إرسال الرمز</span>
            </button>
          )}
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-brand-500 transition-colors">
            ← تغيير رقم الجوال
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
