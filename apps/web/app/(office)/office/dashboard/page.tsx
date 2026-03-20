'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Building2,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  Wallet,
  FileText,
  Upload,
  CalendarClock,
  ShieldAlert,
  ArrowUpDown,
  Flame,
  Banknote,
  Percent,
  Timer,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  User,
  AlertCircle,
  CircleDollarSign,
  Zap,
  Droplets,
  Hammer,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import {
  getExtendedOfficeStats,
  getActivityFeed,
  maintenanceRequests,
  buildings,
  units,
  hoaFees,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  getRelativeTime,
  formatSAR,
  getBuildingById,
  getUnitById,
  getUserById,
  type ActivityEvent,
  type RequestCategory,
} from '@/lib/mock-data';
import { addToStorage, generateId, STORAGE_KEYS } from '@/lib/local-storage';
import { useToast } from '@/components/ui/toast-provider';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// --- Activity Icon Mapper ---

function ActivityIcon({ icon, color }: { icon: ActivityEvent['icon']; color: string }) {
  const cls = `h-4 w-4 ${color}`;
  switch (icon) {
    case 'wrench': return <Wrench className={cls} />;
    case 'check': return <CheckCircle2 className={cls} />;
    case 'alert': return <AlertTriangle className={cls} />;
    case 'wallet': return <Wallet className={cls} />;
    case 'user': return <User className={cls} />;
    case 'clock': return <Clock className={cls} />;
    default: return <Activity className={cls} />;
  }
}

// --- CSS Bar Chart Component ---

function BarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-2" style={{ height: 120 }}>
      {data.map((item, i) => {
        const height = maxValue > 0 ? Math.max(4, (item.value / maxValue) * 100) : 4;
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-medium text-[var(--muted-foreground)]">
              {formatSAR(item.value).replace(' ر.س', '')}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
              className={`w-full min-h-[4px] rounded-t-md ${item.color}`}
            />
            <span className="text-[9px] text-[var(--muted-foreground)] text-center leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// --- Revenue Mini Chart (dual bars) ---

function RevenueChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-3" style={{ height: 130 }}>
      {data.map((item, i) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 100 }}>
            {/* Revenue bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxVal) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              className="w-[45%] rounded-t-sm bg-emerald-500 dark:bg-emerald-400"
            />
            {/* Expenses bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.expenses / maxVal) * 100}%` }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
              className="w-[45%] rounded-t-sm bg-red-400 dark:bg-red-500/70"
            />
          </div>
          <span className="text-[9px] text-[var(--muted-foreground)]">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

// --- Circular Progress ---

function CircularProgress({ value, size = 56, stroke = 5, color = 'text-emerald-500' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-[var(--border)]"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        className={color}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
}

// ==========================================================================
// MAIN DASHBOARD
// ==========================================================================

export default function OfficeDashboardPage() {
  const stats = getExtendedOfficeStats();
  const activityFeed = getActivityFeed().slice(0, 12);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? activityFeed : activityFeed.slice(0, 6);
  const toast = useToast();

  // Batch maintenance dialog state
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchForm, setBatchForm] = useState({
    buildingId: '',
    category: 'general' as RequestCategory,
    date: '',
    description: '',
  });

  function handleBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchForm.buildingId || !batchForm.description.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setBatchSaving(true);

    const building = getBuildingById(batchForm.buildingId);

    const newRequest = {
      id: generateId('req'),
      title: `صيانة جماعية — ${categoryLabels[batchForm.category]}`,
      description: batchForm.description.trim(),
      category: batchForm.category,
      subcategory: 'صيانة دورية',
      buildingId: batchForm.buildingId,
      location: 'building_system' as const,
      locationLabel: building?.name || 'المبنى',
      status: 'submitted' as const,
      priority: 'medium' as const,
      costResponsibility: 'hoa' as const,
      costLegalBasis: 'صيانة دورية مشتركة — من صندوق اتحاد الملاك',
      reportedById: 'off-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusLog: [
        {
          status: 'submitted' as const,
          timestamp: new Date().toISOString(),
          note: 'تم إنشاء طلب صيانة جماعية من لوحة التحكم',
          userId: 'off-001',
        },
      ],
    };

    addToStorage(STORAGE_KEYS.REQUESTS, newRequest);

    setTimeout(() => {
      setBatchSaving(false);
      toast.success('تم جدولة الصيانة الجماعية بنجاح');
      setBatchDialogOpen(false);
      setBatchForm({ buildingId: '', category: 'general', date: '', description: '' });
    }, 400);
  }

  // --- KPI Cards Data ---
  const kpis = [
    {
      label: 'المباني المُدارة',
      value: stats.totalBuildings,
      icon: Building2,
      color: 'text-brand-500',
      bg: 'bg-brand-50 dark:bg-brand-900/20',
      sub: `${stats.occupancyRate}% إشغال`,
      subColor: stats.occupancyRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'طلبات نشطة',
      value: stats.activeRequests,
      icon: Wrench,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      sub: `${stats.urgentRequests} عاجل · ${stats.highRequests} عالي`,
      subColor: stats.urgentRequests > 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--muted-foreground)]',
    },
    {
      label: 'تحصيل الإيجارات',
      value: formatSAR(stats.collectedRent),
      icon: Banknote,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      sub: `${stats.collectionRate}% من ${formatSAR(stats.expectedRent)}`,
      subColor: stats.collectionRate >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'رسوم اتحاد الملاك',
      value: formatSAR(stats.hoaPaid),
      icon: Wallet,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      sub: `${formatSAR(stats.hoaOutstanding)} متبقي`,
      subColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'متوسط الحل',
      value: `${stats.avgResolutionDays} يوم`,
      icon: Timer,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
      sub: `${stats.completedThisMonth} مكتمل هذا الشهر`,
      subColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'تجديد عقود إيجار',
      value: stats.ejarExpiringContracts.length,
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      sub: 'خلال ٣٠ يوم',
      subColor: stats.ejarExpiringContracts.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600',
    },
  ];

  // Category expenses for chart
  const expenseEntries = Object.entries(stats.categoryExpenses).sort((a, b) => b[1] - a[1]);
  const maxExpense = expenseEntries.length > 0 ? expenseEntries[0][1] : 1;
  const expenseColors = ['bg-sky-500', 'bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-red-500', 'bg-teal-500'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* ============================================================ */}
      {/* SECTION 1: KPI Cards                                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft transition-shadow"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-lg font-bold leading-tight sm:text-xl">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{kpi.label}</p>
              {kpi.sub && (
                <p className={`mt-1 text-[10px] font-medium ${kpi.subColor || 'text-[var(--muted-foreground)]'}`}>
                  {kpi.sub}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: Quick Actions Bar                                 */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft sm:p-5">
        <h3 className="mb-3 text-sm font-bold">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {/* New request */}
          <Link href="/office/requests">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30">
                <Plus className="h-4 w-4 text-brand-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">طلب صيانة جديد</span>
            </motion.div>
          </Link>

          {/* Add building */}
          <Link href="/office/buildings/new">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                <Building2 className="h-4 w-4 text-sky-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">إضافة مبنى</span>
            </motion.div>
          </Link>

          {/* Owner report */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toast.info('جاري إعداد التقرير...')}
            className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
              <FileText className="h-4 w-4 text-violet-500" />
            </div>
            <span className="text-xs font-medium leading-tight sm:text-sm">تقرير الملّاك</span>
          </motion.div>

          {/* Upload contract */}
          <Link href="/office/contracts/upload">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <Upload className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-xs font-medium leading-tight sm:text-sm">رفع عقود إيجار</span>
            </motion.div>
          </Link>

          {/* Batch maintenance */}
          <Dialog.Root open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
            <Dialog.Trigger asChild>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <CalendarClock className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-xs font-medium leading-tight sm:text-sm">جدولة صيانة جماعية</span>
              </motion.div>
            </Dialog.Trigger>

            <AnimatePresence>
              {batchDialogOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:inset-x-auto sm:w-full"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <Dialog.Title className="text-lg font-bold">جدولة صيانة جماعية</Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="rounded-lg p-1.5 transition-colors hover:bg-[var(--secondary)]">
                            <X className="h-4 w-4" />
                          </button>
                        </Dialog.Close>
                      </div>

                      <form onSubmit={handleBatchSubmit} className="space-y-4">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">المبنى *</label>
                          <select
                            value={batchForm.buildingId}
                            onChange={(e) => setBatchForm({ ...batchForm, buildingId: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="">اختر المبنى</option>
                            {buildings.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">نوع الصيانة</label>
                          <select
                            value={batchForm.category}
                            onChange={(e) => setBatchForm({ ...batchForm, category: e.target.value as RequestCategory })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          >
                            {Object.entries(categoryLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">التاريخ المطلوب</label>
                          <input
                            type="date"
                            value={batchForm.date}
                            onChange={(e) => setBatchForm({ ...batchForm, date: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-[var(--muted-foreground)]">الوصف *</label>
                          <textarea
                            value={batchForm.description}
                            onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                            placeholder="مثال: صيانة دورية لأنظمة التكييف في جميع الوحدات"
                            rows={3}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={batchSaving}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                        >
                          {batchSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {batchSaving ? 'جاري الحفظ...' : 'جدولة الصيانة'}
                        </motion.button>
                      </form>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION 3: Activity Feed + Building Health (2-column)        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* --- Activity Feed (3 cols) --- */}
        <motion.div variants={itemVariants} className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-bold">آخر الأنشطة</h3>
            </div>
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="مباشر" />
          </div>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute start-[15px] top-2 bottom-2 w-px bg-[var(--border)]" />

            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {displayedActivity.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative flex items-start gap-3 rounded-lg p-2 ps-9 transition-colors hover:bg-[var(--secondary)]"
                  >
                    {/* Dot */}
                    <div className={`absolute start-[9px] top-3.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[var(--card)] ${
                      event.type === 'request_completed' ? 'bg-emerald-500' :
                      event.type === 'request_created' ? 'bg-blue-500' :
                      event.type === 'payment_received' ? 'bg-emerald-500' :
                      event.type === 'provider_assigned' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]">
                      <ActivityIcon icon={event.icon} color={event.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed line-clamp-1">{event.description}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                        {event.buildingName}{event.unitNumber ? ` — ${event.unitNumber}` : ''} · {getRelativeTime(event.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          {activityFeed.length > 6 && (
            <button
              onClick={() => setShowAllActivity(!showAllActivity)}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20"
            >
              {showAllActivity ? 'عرض أقل' : `عرض الكل (${activityFeed.length})`}
              {showAllActivity ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </motion.div>

        {/* --- Building Health Overview (2 cols) --- */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">صحة المباني</h3>
          </div>
          <div className="space-y-3">
            {stats.buildingProfitability.map((bp) => {
              const b = bp.building;
              const healthColor = bp.healthScore >= 80 ? 'text-emerald-500' : bp.healthScore >= 60 ? 'text-amber-500' : 'text-red-500';
              const occupancyColor = bp.occupancy >= 85 ? 'bg-emerald-500' : bp.occupancy >= 70 ? 'bg-amber-500' : 'bg-red-500';
              const occupancyBadgeColor = bp.occupancy >= 85
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : bp.occupancy >= 70
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';

              return (
                <Link key={b.id} href={`/office/buildings/${b.id}`}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{b.name}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{b.district}</p>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <CircularProgress value={bp.healthScore} size={44} stroke={4} color={healthColor} />
                        <span className={`absolute text-[10px] font-bold ${healthColor}`}>{bp.healthScore}</span>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                        <span>الإشغال</span>
                        <span className="font-medium">{bp.occupancy}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[var(--border)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bp.occupancy}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className={`h-full rounded-full ${occupancyColor}`}
                        />
                      </div>
                    </div>

                    {/* Mini stats row */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {bp.activeIssues > 0 && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                          {bp.activeIssues} طلب نشط
                        </span>
                      )}
                      <span className="text-[9px] text-[var(--muted-foreground)]">
                        {formatSAR(bp.revenue)}/شهر
                      </span>
                      {stats.ejarExpiringContracts.filter((c) => c.buildingName === b.name).length > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          تجديد عقد قريب
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: Financial Summary (3-column)                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Monthly Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-bold">الإيرادات والمصروفات</h3>
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)]">آخر ٦ أشهر</span>
          </div>
          {/* Legend */}
          <div className="mb-3 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-[10px] text-[var(--muted-foreground)]">إيرادات</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400 dark:bg-red-500/70" />
              <span className="text-[10px] text-[var(--muted-foreground)]">مصروفات</span>
            </div>
          </div>
          <RevenueChart data={stats.monthlyRevenue} />
        </motion.div>

        {/* Commission + Expense Breakdown */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Commission Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <CircleDollarSign className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold">العمولة المكتسبة</h3>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatSAR(stats.commissionEarned)}
            </p>
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">٥% من الإيجارات المحصّلة هذا الشهر</p>
            <div className="mt-3 h-1.5 rounded-full bg-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.collectionRate}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[var(--muted-foreground)]">
              <span>نسبة التحصيل</span>
              <span className="font-medium">{stats.collectionRate}%</span>
            </div>
          </div>

          {/* HOA Summary Compact */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-violet-500" />
              <h3 className="text-sm font-bold">اتحاد الملاك</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">محصّل</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(stats.hoaPaid)}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--secondary)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.hoaPaid / (stats.hoaPaid + stats.hoaOutstanding)) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full bg-violet-500"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">متبقي</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatSAR(stats.hoaOutstanding)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 5: Expense Breakdown + Per-Building Profitability    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Expense Breakdown by Category */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">المصروفات حسب الفئة</h3>
          </div>
          <div className="space-y-2.5">
            {expenseEntries.map(([label, value], i) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{label}</span>
                  <span className="text-[var(--muted-foreground)]">{formatSAR(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--secondary)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / maxExpense) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                    className={`h-full rounded-full ${expenseColors[i % expenseColors.length]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Per-Building Profitability Table */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-soft overflow-hidden">
          <div className="p-5 pb-3 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">ربحية المباني</h3>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-2 px-4 pb-4 sm:hidden">
            {stats.buildingProfitability.map((bp) => (
              <div key={bp.building.id} className="rounded-xl bg-[var(--secondary)] p-3">
                <p className="text-sm font-bold">{bp.building.name}</p>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                  <div>
                    <p className="text-[var(--muted-foreground)]">إيرادات</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(bp.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">مصروفات</p>
                    <p className="font-bold text-red-600 dark:text-red-400">{formatSAR(bp.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">صافي</p>
                    <p className={`font-bold ${bp.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatSAR(bp.net)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                  <th className="px-5 py-2.5 text-start font-medium">المبنى</th>
                  <th className="px-5 py-2.5 text-start font-medium">الإيرادات</th>
                  <th className="px-5 py-2.5 text-start font-medium">المصروفات</th>
                  <th className="px-5 py-2.5 text-start font-medium">الصافي</th>
                  <th className="px-5 py-2.5 text-start font-medium">الإشغال</th>
                </tr>
              </thead>
              <tbody>
                {stats.buildingProfitability.map((bp, index) => (
                  <motion.tr
                    key={bp.building.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-t border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <td className="px-5 py-2.5 font-medium">{bp.building.name}</td>
                    <td className="px-5 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">{formatSAR(bp.revenue)}</td>
                    <td className="px-5 py-2.5 text-red-600 dark:text-red-400">{formatSAR(bp.expenses)}</td>
                    <td className={`px-5 py-2.5 font-bold ${bp.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatSAR(bp.net)}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[var(--border)]">
                          <div
                            className={`h-full rounded-full ${bp.occupancy >= 85 ? 'bg-emerald-500' : bp.occupancy >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${bp.occupancy}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">{bp.occupancy}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 6: Compliance Alerts + Ejar Renewals                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Compliance Alerts */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-bold">تنبيهات الامتثال</h3>
          </div>
          <div className="space-y-2">
            {stats.complianceAlerts.map((alert, i) => {
              const AlertIcon = alert.type === 'ejar' ? FileText
                : alert.type === 'fire_safety' ? Flame
                : alert.type === 'elevator' ? ArrowUpDown
                : Wallet;
              const severityBg = alert.severity === 'danger'
                ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50';
              const severityIcon = alert.severity === 'danger' ? 'text-red-500' : 'text-amber-500';
              const severityBadge = alert.severity === 'danger'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${severityBg}`}
                >
                  <div className="mt-0.5 shrink-0">
                    <AlertIcon className={`h-4 w-4 ${severityIcon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${severityBadge}`}>
                    {alert.count}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Ejar Contract Renewals */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">عقود إيجار تحتاج تجديد</h3>
            <span className="text-[10px] text-[var(--muted-foreground)]">خلال ٣٠ يوم</span>
          </div>
          {stats.ejarExpiringContracts.length > 0 ? (
            <div className="space-y-2">
              {stats.ejarExpiringContracts.map((contract, i) => {
                const daysLeft = Math.ceil(
                  (new Date(contract.expiryDate).getTime() - new Date('2026-03-07').getTime()) / (1000 * 60 * 60 * 24)
                );
                const urgencyColor = daysLeft <= 14
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';

                return (
                  <motion.div
                    key={contract.unitId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
                  >
                    <div>
                      <p className="text-sm font-medium">{contract.tenantName}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        {contract.buildingName} — {contract.unitNumber}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyColor}`}>
                        {daysLeft} يوم متبقي
                      </span>
                      <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]" dir="ltr">
                        {contract.expiryDate}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">جميع العقود سارية</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 7: Recent Requests (full width)                      */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">آخر الطلبات</h3>
          </div>
          <Link href="/office/requests" className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
            عرض الكل
          </Link>
        </div>
        <div className="space-y-2">
          {[...maintenanceRequests]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map((request, index) => {
              const building = getBuildingById(request.buildingId);
              const unit = request.unitId ? getUnitById(request.unitId) : null;
              const reporter = getUserById(request.reportedById);
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.04 }}
                >
                  <div className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--secondary)]">
                    {/* Priority indicator */}
                    <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      request.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                      request.priority === 'high' ? 'bg-orange-500' :
                      request.priority === 'medium' ? 'bg-sky-500' :
                      'bg-slate-400'
                    }`} />

                    <Link href={`/office/requests/${request.id}`} className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[request.priority]}`}>
                          {priorityLabels[request.priority]}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {categoryLabels[request.category]}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{request.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {building?.name} {unit ? `— ${unit.unitNumber}` : ''}
                      </p>
                    </Link>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {request.estimatedCost && (
                        <span className="text-xs font-bold">{formatSAR(request.estimatedCost)}</span>
                      )}
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {getRelativeTime(request.updatedAt)}
                      </span>
                      {reporter && reporter.phone && (
                        <WhatsAppButton
                          phone={reporter.phone.replace(/[^0-9]/g, '')}
                          message={`مرحبا ${reporter.name}، بخصوص طلب الصيانة: ${request.title}`}
                          variant="icon"
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </motion.div>
  );
}
