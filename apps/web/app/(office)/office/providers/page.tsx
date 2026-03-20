'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const specialtyColors: Record<string, string> = {
  PLUMBING: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ELECTRICAL: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HVAC: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  STRUCTURAL: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ELEVATOR: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  SECURITY: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  PAINTING: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  CARPENTRY: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  CLEANING: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  PEST_CONTROL: 'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const specialtyLabels: Record<string, string> = {
  PLUMBING: 'سباكة',
  ELECTRICAL: 'كهرباء',
  HVAC: 'تكييف',
  STRUCTURAL: 'هيكلي',
  ELEVATOR: 'مصاعد',
  SECURITY: 'أمن',
  PAINTING: 'دهان',
  CARPENTRY: 'نجارة',
  CLEANING: 'نظافة',
  PEST_CONTROL: 'مكافحة حشرات',
  OTHER: 'أخرى',
};

export default function OfficeProvidersPage() {
  const officeId = getOfficeId();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: allProviders, isLoading } = trpc.providers.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );

  const providers = allProviders ?? [];

  const filteredProviders = providers.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.nameAr?.includes(searchTerm) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.specialties?.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-lg font-bold">مقدمو الخدمات ({filteredProviders.length})</h2>
      </motion.div>

      {/* Search */}
      <motion.div variants={cardVariants} className="space-y-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مقدم خدمة..."
            className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-2.5 pe-4 ps-10 text-sm outline-none transition-colors focus:ring-1"
          />
        </div>
      </motion.div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredProviders.map((provider) => (
          <motion.div
            key={provider.id}
            variants={cardVariants}
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
                {(provider.nameAr ?? provider.nameEn ?? '?')[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{provider.nameAr}</h3>
                {provider.nameEn && (
                  <p className="text-xs text-[var(--muted-foreground)]">{provider.nameEn}</p>
                )}
              </div>
              {provider.specialties && provider.specialties.length > 0 && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${specialtyColors[provider.specialties[0]] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                >
                  {specialtyLabels[provider.specialties[0]] ?? provider.specialties[0]}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = parseFloat(provider.rating ?? '0');
                  return (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(rating)
                          ? 'fill-amber-400 text-amber-400'
                          : star <= rating
                            ? 'fill-amber-200 text-amber-400'
                            : 'text-gray-200 dark:text-gray-700'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm font-bold">{provider.rating}</span>
            </div>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{provider.completedJobs} مهمة مكتملة</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    provider.linkStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {provider.linkStatus === 'active' ? 'نشط' : provider.linkStatus}
                </span>
              </div>
            </div>

            {/* Phone info */}
            {provider.phone && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <Phone className="h-3 w-3" />
                <span dir="ltr">{provider.phone}</span>
              </div>
            )}

            {/* Contact */}
            {provider.phone && (
              <div className="mt-4 flex gap-2">
                <a
                  href={`tel:${provider.phone}`}
                  className="bg-brand-500 hover:bg-brand-600 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-white transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>اتصال</span>
                </a>
                <WhatsAppButton
                  phone={provider.phone.replace(/[^0-9]/g, '')}
                  message={`مرحبا ${provider.nameAr}, نود التواصل معكم بخصوص خدمات الصيانة.`}
                  label="واتساب"
                  variant="primary"
                  size="sm"
                  className="flex-1 rounded-xl py-2.5 text-xs"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredProviders.length === 0 && !isLoading && (
        <motion.div
          variants={cardVariants}
          className="flex flex-col items-center justify-center py-16"
        >
          <Search className="mb-3 h-8 w-8 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">لم يتم العثور على مقدمي خدمات</p>
        </motion.div>
      )}
    </motion.div>
  );
}
