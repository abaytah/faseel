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
} from 'lucide-react';
import {
  serviceProviders as seedProviders,
  type ServiceProvider,
} from '@/lib/mock-data';
import { useLocalStorageState, STORAGE_KEYS } from '@/lib/local-storage';
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
  'تكييف': 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'سباكة': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'كهرباء': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'صيانة عامة': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'مصاعد': 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'سلامة': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'دهان': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'نجارة': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'نظافة': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'مكافحة حشرات': 'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  'عزل': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'أمن': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'تنسيق حدائق': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'أنظمة ذكية': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const allSpecialties = [
  'الكل',
  'سباكة',
  'كهرباء',
  'تكييف',
  'صيانة عامة',
  'مصاعد',
  'سلامة',
  'دهان',
  'نجارة',
  'نظافة',
  'مكافحة حشرات',
  'عزل',
  'أمن',
  'تنسيق حدائق',
  'أنظمة ذكية',
];

export default function OfficeProvidersPage() {
  const [allProviders] = useLocalStorageState<ServiceProvider>(STORAGE_KEYS.SERVICE_PROVIDERS, seedProviders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');

  const filteredProviders = allProviders.filter((p) => {
    const matchesSearch = !searchTerm || p.name.includes(searchTerm) || p.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'الكل' || p.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-lg font-bold">مقدمو الخدمات ({filteredProviders.length})</h2>
        <Link href="/office/providers/new">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            إضافة مقدم خدمة
          </motion.div>
        </Link>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={cardVariants} className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مقدم خدمة..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-2.5 pe-4 ps-10 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Specialty filter chips */}
        <div className="flex flex-wrap gap-2">
          {allSpecialties.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSpecialty(sp)}
              className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${
                selectedSpecialty === sp
                  ? 'bg-brand-500 text-white'
                  : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredProviders.map((provider) => (
          <motion.div
            key={provider.id}
            variants={cardVariants}
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 font-bold text-lg">
                {provider.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{provider.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{provider.nameEn}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${specialtyColors[provider.specialty] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                {provider.specialty}
              </span>
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(provider.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : star <= provider.rating
                          ? 'fill-amber-200 text-amber-400'
                          : 'text-gray-200 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{provider.rating}</span>
            </div>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{provider.completedJobs} مهمة</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <Clock className="h-3.5 w-3.5 text-sky-500" />
                <span>{provider.responseTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                <span>{provider.city}</span>
              </div>
            </div>

            {/* Phone info */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Phone className="h-3 w-3" />
              <span dir="ltr">{provider.phone}</span>
            </div>

            {/* Contact */}
            <div className="mt-4 flex gap-2">
              <a
                href={`tel:${provider.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>اتصال</span>
              </a>
              <WhatsAppButton
                phone={provider.phone.replace(/[^0-9]/g, '')}
                message={`مرحبا ${provider.name}، نود التواصل معكم بخصوص خدمات الصيانة.`}
                label="واتساب"
                variant="primary"
                size="sm"
                className="flex-1 rounded-xl py-2.5 text-xs"
              />
              <a
                href={`mailto:${provider.email}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--secondary)] py-2.5 text-xs font-medium transition-colors hover:bg-[var(--accent)]"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>بريد</span>
              </a>
            </div>

            {/* License */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
              <Award className="h-3 w-3" />
              <span>رخصة: {provider.licenseNumber || '—'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <motion.div variants={cardVariants} className="flex flex-col items-center justify-center py-16">
          <Search className="mb-3 h-8 w-8 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">لم يتم العثور على مقدمي خدمات</p>
        </motion.div>
      )}
    </motion.div>
  );
}
