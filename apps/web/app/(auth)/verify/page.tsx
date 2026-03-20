'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, RotateCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { setTokens, setUser, getDashboardPath } from '@/lib/auth';

export default function VerifyPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams?.get('phone') ?? '';

  // Mask phone for display
  const maskedPhone = phone
    ? phone.replace(/(\+966)(\d{2})\d{3}\d{2}(\d{2})/, '$1 $2X XXX XX$3')
    : '+966 5X XXX XX90';

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);

      // Determine redirect based on primary role
      const primaryRole = data.roles[0]?.role ?? 'TENANT';
      let sessionRole: string;
      switch (primaryRole) {
        case 'OFFICE_ADMIN':
          sessionRole = 'office';
          break;
        case 'OWNER':
          sessionRole = 'owner';
          break;
        case 'SERVICE_PROVIDER':
          sessionRole = 'provider';
          break;
        default:
          sessionRole = 'tenant';
      }

      const path = getDashboardPath(sessionRole);
      router.push(path);
    },
    onError: (err) => {
      setVerifying(false);
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.messageAr || parsed.message || 'رمز التحقق غير صحيح');
      } catch {
        setError('رمز التحقق غير صحيح');
      }
    },
  });

  const resendOtp = trpc.auth.sendOtp.useMutation({
    onSuccess: () => {
      setCountdown(60);
      setError('');
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.messageAr || parsed.message || 'حدث خطأ في إعادة الإرسال');
      } catch {
        setError('حدث خطأ في إعادة الإرسال');
      }
    },
  });

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      setVerifying(true);
      verifyOtp.mutate({ phone, code: newOtp.join('') });
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

      // Auto-verify if all 6 digits pasted
      if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
        setVerifying(true);
        verifyOtp.mutate({ phone, code: newOtp.join('') });
      }
    }
  };

  const handleResend = () => {
    if (!phone) return;
    resendOtp.mutate({ phone });
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
          <h1 className="mb-2 text-2xl font-bold">تأكيد رقم الجوال</h1>
          <p className="text-sm text-[var(--muted-foreground)]">أدخل رمز التحقق المرسل إلى</p>
          <p className="mt-1 font-semibold" dir="ltr">
            {maskedPhone}
          </p>
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
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={verifying}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="focus:border-brand-500 focus:ring-brand-500/20 h-14 w-12 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-center text-2xl font-bold outline-none transition-all focus:ring-2 disabled:opacity-50"
            />
          ))}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {/* Loading state */}
        {verifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 flex items-center justify-center gap-2"
          >
            <Loader2 className="text-brand-500 h-4 w-4 animate-spin" />
            <span className="text-sm text-[var(--muted-foreground)]">جاري التحقق...</span>
          </motion.div>
        )}

        {/* Countdown / Resend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 text-center"
        >
          {countdown > 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              إعادة الإرسال خلال <span className="text-brand-500 font-bold">{countdown}</span> ثانية
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendOtp.isPending}
              className="text-brand-500 hover:text-brand-600 mx-auto flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {resendOtp.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
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
          <Link
            href="/login"
            className="hover:text-brand-500 text-sm text-[var(--muted-foreground)] transition-colors"
          >
            ← تغيير رقم الجوال
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
