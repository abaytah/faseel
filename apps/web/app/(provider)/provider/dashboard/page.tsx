'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  Phone,
  Calendar,
  Camera,
  CircleDot,
  Droplets,
  Zap,
  Wind,
  Hammer,
  ShieldAlert,
  ArrowUpDown,
  Power,
  Paintbrush,
  DollarSign,
  BadgeCheck,
  Trophy,
  Navigation,
  Play,
  Flag,
  CreditCard,
  Banknote,
  User,
  MessageCircle,
  X,
  FileText,
  Download,
  CalendarDays,
} from 'lucide-react';
import {
  statusLabels as mockStatusLabels,
  statusColors as mockStatusColors,
  priorityLabels as mockPriorityLabels,
  priorityColors as mockPriorityColors,
  categoryLabels as mockCategoryLabels,
  formatSAR as mockFormatSAR,
  formatDate as mockFormatDate,
  getRelativeTime as mockGetRelativeTime,
  getBuildingById,
  getUnitById,
  getUserById,
  office,
  serviceProviders,
  getRequestsByProvider,
  type MaintenanceRequest,
  type RequestCategory,
} from '@/lib/mock-data';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  formatSAR,
  formatDate,
  getRelativeTime,
} from '@/lib/format-utils';

// Use API labels, fall back to mock labels for lowercase statuses
const getStatusLabel = (s: string) =>
  statusLabels[s] ?? (mockStatusLabels as Record<string, string>)[s] ?? s;
const getStatusColor = (s: string) =>
  statusColors[s] ?? (mockStatusColors as Record<string, string>)[s] ?? '';
const getPriorityLabel = (s: string) =>
  priorityLabels[s] ?? (mockPriorityLabels as Record<string, string>)[s] ?? s;
const getPriorityColor = (s: string) =>
  priorityColors[s] ?? (mockPriorityColors as Record<string, string>)[s] ?? '';
const getCategoryLabel = (s: string) =>
  categoryLabels[s] ?? (mockCategoryLabels as Record<string, string>)[s] ?? s;
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

// Map category to icon component for the provider
const CategoryIcon = ({
  category,
  className,
}: {
  category: RequestCategory;
  className?: string;
}) => {
  const cls = className || 'h-7 w-7';
  switch (category) {
    case 'plumbing':
      return <Droplets className={cls} />;
    case 'electrical':
      return <Zap className={cls} />;
    case 'hvac':
      return <Wind className={cls} />;
    case 'structural':
      return <Hammer className={cls} />;
    case 'fire_safety':
      return <ShieldAlert className={cls} />;
    case 'elevator':
      return <ArrowUpDown className={cls} />;
    case 'generator':
      return <Power className={cls} />;
    case 'cosmetic':
      return <Paintbrush className={cls} />;
    default:
      return <Wrench className={cls} />;
  }
};

const categoryBgColors: Record<string, string> = {
  plumbing: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  electrical: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  hvac: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  structural: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  fire_safety: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  elevator: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  generator: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  cosmetic: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  appliance: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  general: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

// ============================================================
// Types for enhanced state
// ============================================================

type ProviderJobStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'working'
  | 'completed'
  | 'declined';

interface ProviderJobState {
  status: ProviderJobStatus;
  declineReason?: string;
  completionPhoto?: string; // base64 preview
  actualCost?: number;
  completionNotes?: string;
  completedAt?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  providerName: string;
  licenseNumber: string;
  buildingName: string;
  unitNumber: string;
  serviceDescription: string;
  category: string;
  laborCost: number;
  partsCost: number;
  total: number;
  date: string;
  jobId: string;
}

// Decline reasons
const DECLINE_REASONS = [
  { key: 'busy', label: 'مشغول' },
  { key: 'out_of_range', label: 'خارج النطاق' },
  { key: 'no_equipment', label: 'لا أملك المعدات المطلوبة' },
  { key: 'other', label: 'أخرى' },
] as const;

// Progress steps
const PROGRESS_STEPS = [
  { key: 'accepted', label: 'مقبول', icon: CheckCircle2 },
  { key: 'on_the_way', label: 'في الطريق', icon: Navigation },
  { key: 'arrived', label: 'وصلت', icon: MapPin },
  { key: 'working', label: 'جاري العمل', icon: Play },
  { key: 'completed', label: 'مكتمل', icon: Flag },
] as const;

// Arabic day names (Saturday first — Saudi week)
const ARABIC_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// Storage keys
const PROVIDER_JOBS_KEY = 'faseel-provider-job-states';
const PROVIDER_INVOICES_KEY = 'faseel-provider-invoices';

// ============================================================
// Main Component
// ============================================================

export default function ProviderDashboardPage() {
  const provider = serviceProviders[0];
  const myJobs = getRequestsByProvider(provider.id);
  const toast = useToast();

  // Wire status updates to the API when available
  const updateStatusMutation = trpc.maintenance.updateStatus.useMutation({
    onError: () => {
      // Silently fail; local state is already updated for demo
    },
  });

  // Provider-level job states (persisted)
  const [jobStates, setJobStates] = useState<Record<string, ProviderJobState>>({});
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [activeTab, setActiveTab] = useState<
    'active' | 'completed' | 'earnings' | 'schedule' | 'profile'
  >('active');

  // UI state
  const [declineDialogJob, setDeclineDialogJob] = useState<string | null>(null);
  const [invoiceDialogJob, setInvoiceDialogJob] = useState<string | null>(null);
  const [completionDialogJob, setCompletionDialogJob] = useState<string | null>(null);
  const [whatsappNotifJob, setWhatsappNotifJob] = useState<string | null>(null);
  const [invoiceGenerating, setInvoiceGenerating] = useState(false);

  // Completion form state
  const [completionCost, setCompletionCost] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState<string | null>(null);

  // Invoice form state
  const [invoiceLaborCost, setInvoiceLaborCost] = useState(0);
  const [invoicePartsCost, setInvoicePartsCost] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem(PROVIDER_JOBS_KEY);
      if (savedStates) setJobStates(JSON.parse(savedStates));
      const savedInvoices = localStorage.getItem(PROVIDER_INVOICES_KEY);
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist job states
  const updateJobState = useCallback((jobId: string, update: Partial<ProviderJobState>) => {
    setJobStates((prev) => {
      const next = { ...prev, [jobId]: { ...prev[jobId], ...update } };
      localStorage.setItem(PROVIDER_JOBS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Save invoice
  const saveInvoice = useCallback((invoice: InvoiceData) => {
    setInvoices((prev) => {
      const next = [...prev, invoice];
      localStorage.setItem(PROVIDER_INVOICES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Derive job lists based on provider state
  const getEffectiveStatus = (job: MaintenanceRequest): ProviderJobStatus => {
    return jobStates[job.id]?.status || (job.status === 'in_progress' ? 'accepted' : 'pending');
  };

  const activeJobs = myJobs.filter((r) => {
    const s = getEffectiveStatus(r);
    return (
      !['completed', 'declined'].includes(s) && r.status !== 'completed' && r.status !== 'cancelled'
    );
  });

  const completedJobs = myJobs.filter((r) => {
    const s = getEffectiveStatus(r);
    return r.status === 'completed' || s === 'completed';
  });

  // Earnings
  const totalEarnings = completedJobs.reduce((sum, r) => {
    const state = jobStates[r.id];
    return sum + (state?.actualCost || r.actualCost || r.estimatedCost || 0);
  }, 0);
  const pendingPayments = activeJobs.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const paidOut = completedJobs.reduce((sum, r) => {
    const state = jobStates[r.id];
    return sum + (state?.actualCost || r.actualCost || 0);
  }, 0);

  const avgRating = provider.rating;

  // Priority sort for active jobs
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedActiveJobs = [...activeJobs].sort(
    (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3),
  );

  // ============================================================
  // Handlers
  // ============================================================

  function handleAccept(jobId: string) {
    const job = myJobs.find((j) => j.id === jobId);
    if (!job) return;
    updateJobState(jobId, { status: 'accepted' });
    toast.success('تم قبول المهمة');
    setWhatsappNotifJob(jobId);
    setTimeout(() => setWhatsappNotifJob(null), 3000);
  }

  function handleDecline(jobId: string, reason: string) {
    updateJobState(jobId, { status: 'declined', declineReason: reason });
    toast.info('تم رفض المهمة');
    setDeclineDialogJob(null);
  }

  function handleOnTheWay(jobId: string) {
    updateJobState(jobId, { status: 'on_the_way' });
    toast.success('تم تحديث الحالة: في الطريق');
  }

  function handleArrived(jobId: string) {
    updateJobState(jobId, { status: 'arrived' });
    toast.success('تم تحديث الحالة: وصلت الموقع');
  }

  function handleStartWork(jobId: string) {
    updateJobState(jobId, { status: 'working' });
    toast.success('تم تحديث الحالة: جاري العمل');
    // Also update via API
    updateStatusMutation.mutate({ id: jobId, status: 'IN_PROGRESS' });
  }

  function openCompletionDialog(jobId: string) {
    const job = myJobs.find((j) => j.id === jobId);
    setCompletionCost(job?.estimatedCost?.toString() || '');
    setCompletionNotes('');
    setCompletionPhoto(null);
    setCompletionDialogJob(jobId);
  }

  function handleComplete(jobId: string) {
    const cost = parseFloat(completionCost) || 0;
    updateJobState(jobId, {
      status: 'completed',
      actualCost: cost,
      completionNotes: completionNotes,
      completionPhoto: completionPhoto || undefined,
      completedAt: new Date().toISOString(),
    });
    toast.success('تم إتمام المهمة بنجاح');
    // Also update via API
    updateStatusMutation.mutate({
      id: jobId,
      status: 'COMPLETED',
      notes: completionNotes || undefined,
    });
    setCompletionDialogJob(null);
    setWhatsappNotifJob(jobId);
    setTimeout(() => setWhatsappNotifJob(null), 3000);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompletionPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function openInvoiceDialog(jobId: string) {
    const job = myJobs.find((j) => j.id === jobId);
    const state = jobStates[jobId];
    const cost = state?.actualCost || job?.actualCost || job?.estimatedCost || 0;
    setInvoiceLaborCost(Math.round(cost * 0.6));
    setInvoicePartsCost(Math.round(cost * 0.4));
    setInvoiceDialogJob(jobId);
  }

  function handleGenerateInvoice(jobId: string) {
    const job = myJobs.find((j) => j.id === jobId);
    if (!job) return;
    const building = getBuildingById(job.buildingId);
    const unit = job.unitId ? getUnitById(job.unitId) : null;

    setInvoiceGenerating(true);
    setTimeout(() => {
      const invoiceNumber = `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const invoice: InvoiceData = {
        invoiceNumber,
        providerName: provider.name,
        licenseNumber: provider.licenseNumber,
        buildingName: building?.name || '',
        unitNumber: unit?.unitNumber || '',
        serviceDescription: job.title,
        category: categoryLabels[job.category] || job.category,
        laborCost: invoiceLaborCost,
        partsCost: invoicePartsCost,
        total: invoiceLaborCost + invoicePartsCost,
        date: new Date().toLocaleDateString('ar-SA'),
        jobId,
      };
      saveInvoice(invoice);
      setInvoiceGenerating(false);
      setInvoiceDialogJob(null);
      toast.success(`تم إصدار الفاتورة رقم ${invoiceNumber}`);
    }, 1000);
  }

  function getInvoiceForJob(jobId: string): InvoiceData | undefined {
    return invoices.find((inv) => inv.jobId === jobId);
  }

  // ============================================================
  // Schedule helpers
  // ============================================================

  function getWeekDates(): Date[] {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    // Saudi week starts Saturday (6)
    const saturdayOffset = dayOfWeek === 6 ? 0 : -(dayOfWeek + 1);
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + saturdayOffset);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(saturday);
      d.setDate(saturday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  function getJobsForDate(date: Date): MaintenanceRequest[] {
    const dateStr = date.toISOString().split('T')[0];
    return myJobs.filter((job) => {
      const status = getEffectiveStatus(job);
      if (status === 'declined') return false;
      const created = job.createdAt.split('T')[0];
      const updated = job.updatedAt.split('T')[0];
      return created === dateStr || updated === dateStr;
    });
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // ============================================================
  // WhatsApp message builders
  // ============================================================

  function getTenantWhatsAppMessage(job: MaintenanceRequest): string {
    const building = getBuildingById(job.buildingId);
    const unit = job.unitId ? getUnitById(job.unitId) : null;
    return `مرحباً، أنا الفني ${provider.name} من ${provider.specialty}. بخصوص طلب الصيانة رقم ${job.id} في ${building?.name || ''} - وحدة ${unit?.unitNumber || ''}. متى يناسبك الموعد؟`;
  }

  function getOfficeWhatsAppMessage(job: MaintenanceRequest, statusMsg: string): string {
    const building = getBuildingById(job.buildingId);
    return `مرحباً، بخصوص المهمة #${job.id} في ${building?.name || ''}. ${statusMsg}`;
  }

  function getStatusMessage(job: MaintenanceRequest): string {
    const status = getEffectiveStatus(job);
    switch (status) {
      case 'accepted':
        return 'تم قبول المهمة.';
      case 'on_the_way':
        return 'أنا في الطريق للموقع.';
      case 'arrived':
        return 'وصلت الموقع.';
      case 'working':
        return 'جاري العمل حالياً.';
      case 'completed':
        return 'تم إنجاز المهمة بنجاح.';
      default:
        return 'تحديث على حالة المهمة.';
    }
  }

  function getGoogleMapsUrl(job: MaintenanceRequest): string {
    const building = getBuildingById(job.buildingId);
    const query = encodeURIComponent(`${building?.district || ''} جدة السعودية`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  // Clean phone for WhatsApp (remove dashes, spaces)
  function cleanPhone(phone: string): string {
    return phone.replace(/[-\s]/g, '').replace(/^0/, '966');
  }

  // ============================================================
  // Get step index for progress indicator
  // ============================================================

  function getStepIndex(job: MaintenanceRequest): number {
    const status = getEffectiveStatus(job);
    switch (status) {
      case 'pending':
        return -1;
      case 'accepted':
        return 0;
      case 'on_the_way':
        return 1;
      case 'arrived':
        return 2;
      case 'working':
        return 3;
      case 'completed':
        return 4;
      default:
        return -1;
    }
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Provider Profile Card */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex items-start gap-4">
          <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold">
            {provider.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{provider.name}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{provider.specialty}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-bold text-[var(--foreground)]">{provider.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-emerald-500" />
                <span>{provider.completedJobs} مهمة</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{provider.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{provider.responseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation — 5 tabs with large touch targets */}
      <motion.div variants={itemVariants} className="grid grid-cols-5 gap-1.5">
        {[
          {
            key: 'active',
            label: 'المهام',
            icon: Wrench,
            count: activeJobs.length,
            color: 'text-orange-500',
          },
          {
            key: 'completed',
            label: 'المكتملة',
            icon: CheckCircle2,
            count: completedJobs.length,
            color: 'text-emerald-500',
          },
          { key: 'earnings', label: 'الأرباح', icon: Banknote, count: null, color: 'text-sky-500' },
          {
            key: 'schedule',
            label: 'جدولي',
            icon: CalendarDays,
            count: null,
            color: 'text-indigo-500',
          },
          { key: 'profile', label: 'ملفي', icon: User, count: null, color: 'text-violet-500' },
        ].map(({ key, label, icon: Icon, count, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 transition-all ${
              activeTab === key
                ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
            }`}
          >
            <Icon className={`h-5 w-5 ${activeTab === key ? '' : color}`} />
            <span className="text-[9px] font-medium">{label}</span>
            {count !== null && (
              <span className={`text-xs font-bold ${activeTab === key ? '' : color}`}>{count}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* WhatsApp Notification Popup */}
      <AnimatePresence>
        {whatsappNotifJob && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-white shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm font-bold">تم إرسال إشعار واتساب للمستأجر والمكتب</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === ACTIVE JOBS TAB === */}
      {activeTab === 'active' && (
        <>
          {sortedActiveJobs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-base font-bold">لا توجد مهام نشطة</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  سيتم إشعارك عند وصول مهمة جديدة
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {sortedActiveJobs.map((job) => {
                const building = getBuildingById(job.buildingId);
                const reporter = getUserById(job.reportedById);
                const effectiveStatus = getEffectiveStatus(job);
                const stepIndex = getStepIndex(job);

                return (
                  <motion.div
                    key={job.id}
                    variants={itemVariants}
                    layout
                    className={`shadow-soft overflow-hidden rounded-2xl border-2 ${
                      job.priority === 'urgent'
                        ? 'border-red-400 dark:border-red-600'
                        : job.priority === 'high'
                          ? 'border-orange-300 dark:border-orange-700'
                          : 'border-[var(--border)]'
                    } bg-[var(--card)]`}
                  >
                    {/* Priority indicator bar */}
                    <div
                      className={`h-1.5 ${
                        job.priority === 'urgent'
                          ? 'animate-pulse bg-red-500'
                          : job.priority === 'high'
                            ? 'bg-orange-500'
                            : job.priority === 'medium'
                              ? 'bg-sky-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />

                    <div className="p-4">
                      {/* Header: Building + Unit */}
                      <div className="mb-3 flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${categoryBgColors[job.category] || categoryBgColors.general}`}
                        >
                          <CategoryIcon category={job.category} className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold leading-tight">{building?.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {job.locationLabel}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityColors[job.priority]}`}
                        >
                          {priorityLabels[job.priority]}
                        </span>
                      </div>

                      {/* Issue description */}
                      <p className="mb-3 text-sm font-medium">{job.title}</p>
                      <p className="mb-3 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                        {job.description}
                      </p>

                      {/* Meta row */}
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-medium ${statusColors[job.status]}`}
                        >
                          {statusLabels[job.status]}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {categoryLabels[job.category]}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {getRelativeTime(job.updatedAt)}
                        </span>
                      </div>

                      {/* Contact (tenant) — phone call */}
                      {reporter && (
                        <a
                          href={`tel:${reporter.phone}`}
                          className="mb-3 flex min-h-[44px] items-center gap-3 rounded-xl bg-[var(--secondary)] p-3 transition-colors active:bg-[var(--accent)]"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium">
                              {reporter.name.split(' ').slice(0, 3).join(' ')}
                            </p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">
                              {reporter.phone}
                            </p>
                          </div>
                          <Phone className="h-5 w-5 text-emerald-500" />
                        </a>
                      )}

                      {/* WhatsApp + Maps buttons row */}
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        {/* WhatsApp to tenant */}
                        {reporter && (
                          <WhatsAppButton
                            phone={cleanPhone(reporter.phone)}
                            message={getTenantWhatsAppMessage(job)}
                            label="المستأجر"
                            size="sm"
                            className="min-h-[48px] text-xs"
                          />
                        )}
                        {/* WhatsApp to office */}
                        <WhatsAppButton
                          phone={cleanPhone(office.phone)}
                          message={getOfficeWhatsAppMessage(job, getStatusMessage(job))}
                          label="المكتب"
                          variant="secondary"
                          size="sm"
                          className="min-h-[48px] text-xs"
                        />
                        {/* Google Maps */}
                        <a
                          href={getGoogleMapsUrl(job)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-blue-500 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>الاتجاهات</span>
                        </a>
                      </div>

                      {/* Cost info */}
                      {job.estimatedCost && (
                        <div className="mb-3 flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
                            <span className="text-[var(--muted-foreground)]">التكلفة المتوقعة</span>
                          </div>
                          <span className="text-sm font-bold">{formatSAR(job.estimatedCost)}</span>
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* Action Buttons — Accept/Decline or Progress workflow */}
                      {/* ============================================================ */}
                      <div className="space-y-2">
                        {/* Pending — Accept/Decline */}
                        {effectiveStatus === 'pending' &&
                          (job.status === 'assigned' || job.status === 'in_progress') && (
                            <div className="grid grid-cols-2 gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleAccept(job.id)}
                                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-sm"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>قبول</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setDeclineDialogJob(job.id)}
                                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-sm"
                              >
                                <X className="h-5 w-5" />
                                <span>رفض</span>
                              </motion.button>
                            </div>
                          )}

                        {/* Accepted — On my way button */}
                        {effectiveStatus === 'accepted' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleOnTheWay(job.id)}
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white shadow-sm"
                          >
                            <Navigation className="h-5 w-5" />
                            <span>في الطريق</span>
                          </motion.button>
                        )}

                        {/* On the way — Arrived button */}
                        {effectiveStatus === 'on_the_way' && (
                          <>
                            <div className="flex items-center gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                              <Navigation className="h-4 w-4 animate-pulse" />
                              <span className="font-medium">في الطريق للموقع...</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleArrived(job.id)}
                              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3.5 text-sm font-bold text-white shadow-sm"
                            >
                              <MapPin className="h-5 w-5" />
                              <span>وصلت الموقع</span>
                            </motion.button>
                          </>
                        )}

                        {/* Arrived — Start work button */}
                        {effectiveStatus === 'arrived' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleStartWork(job.id)}
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-sm"
                          >
                            <Play className="h-5 w-5" />
                            <span>بدأت العمل</span>
                          </motion.button>
                        )}

                        {/* Working — Complete button */}
                        {effectiveStatus === 'working' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                              <Clock className="h-4 w-4 animate-pulse" />
                              <span className="font-medium">جاري العمل...</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => openCompletionDialog(job.id)}
                              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-sm"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                              <span>إتمام المهمة</span>
                            </motion.button>
                          </div>
                        )}

                        {/* Completed */}
                        {effectiveStatus === 'completed' && (
                          <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                              تم إنهاء المهمة
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Steps Visual */}
                      <div className="mt-3 flex items-center gap-1">
                        {PROGRESS_STEPS.map((step, i) => {
                          const filled = i <= stepIndex;
                          const isCurrent = i === stepIndex;
                          return (
                            <div
                              key={step.key}
                              className="flex flex-1 flex-col items-center gap-0.5"
                            >
                              <div
                                className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                                  filled ? 'bg-emerald-500' : 'bg-[var(--border)]'
                                } ${isCurrent ? 'animate-pulse' : ''}`}
                              />
                              <span
                                className={`text-[8px] ${filled ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted-foreground)]'}`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === DECLINE DIALOG === */}
      <AnimatePresence>
        {declineDialogJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setDeclineDialogJob(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            >
              <h3 className="mb-4 text-base font-bold">سبب الرفض</h3>
              <div className="space-y-2">
                {DECLINE_REASONS.map((reason) => (
                  <motion.button
                    key={reason.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDecline(declineDialogJob, reason.label)}
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-[var(--secondary)] p-4 text-sm font-medium transition-colors hover:bg-[var(--accent)]"
                  >
                    <CircleDot className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{reason.label}</span>
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDeclineDialogJob(null)}
                className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
              >
                إلغاء
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === COMPLETION DIALOG === */}
      <AnimatePresence>
        {completionDialogJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setCompletionDialogJob(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            >
              <h3 className="mb-4 text-base font-bold">إتمام المهمة</h3>

              {/* Photo Upload */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">
                  صورة بعد الإنجاز
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {completionPhoto ? (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={completionPhoto}
                      alt="صورة الإنجاز"
                      className="h-48 w-full rounded-xl object-cover"
                    />
                    <button
                      onClick={() => setCompletionPhoto(null)}
                      className="absolute end-2 top-2 rounded-full bg-black/50 p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
                  >
                    <Camera className="h-6 w-6" />
                    <span>رفع صورة</span>
                  </motion.button>
                )}
              </div>

              {/* Cost entry */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">
                  التكلفة الفعلية (ر.س)
                </label>
                <input
                  type="number"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                  placeholder="0"
                  className="focus:ring-brand-500 min-h-[48px] w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-center text-lg font-bold focus:outline-none focus:ring-2"
                  dir="ltr"
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">
                  ملاحظات (وصف العمل)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="وصف مختصر للعمل المنجز..."
                  rows={3}
                  className="focus:ring-brand-500 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCompletionDialogJob(null)}
                  className="flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleComplete(completionDialogJob)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>إتمام المهمة</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === COMPLETED JOBS TAB === */}
      {activeTab === 'completed' && (
        <>
          {/* Completed Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Trophy className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{completedJobs.length}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">مهمة مكتملة</p>
            </div>
            <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">التقييم</p>
            </div>
            <div className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30">
                <DollarSign className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-lg font-bold">{formatSAR(totalEarnings)}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">إجمالي الأرباح</p>
            </div>
          </motion.div>

          {/* Completed Jobs List */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-4 text-sm font-bold">سجل المهام المكتملة ({completedJobs.length})</h3>
            {completedJobs.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                لا توجد مهام مكتملة بعد
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job, index) => {
                  const building = getBuildingById(job.buildingId);
                  const state = jobStates[job.id];
                  const jobCost = state?.actualCost || job.actualCost || job.estimatedCost || 0;
                  const existingInvoice = getInvoiceForJob(job.id);
                  const jobRating = 4 + Math.random() * 1;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.04 }}
                      className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${categoryBgColors[job.category] || categoryBgColors.general}`}
                        >
                          <CategoryIcon category={job.category} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{job.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{building?.name}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {state?.completedAt
                                ? formatDate(state.completedAt)
                                : job.completedAt
                                  ? formatDate(job.completedAt)
                                  : '-'}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Wrench className="h-3 w-3" />
                              {categoryLabels[job.category]}
                            </span>
                            <span className="flex items-center gap-0.5 font-medium text-[var(--foreground)]">
                              <DollarSign className="h-3 w-3" />
                              {formatSAR(jobCost)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-amber-500" />
                              <span className="font-medium">{jobRating.toFixed(1)}</span>
                            </span>
                          </div>

                          {/* Completion notes */}
                          {state?.completionNotes && (
                            <p className="mt-2 text-[10px] italic text-[var(--muted-foreground)]">
                              {state.completionNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Invoice button */}
                      <div className="mt-3 flex gap-2">
                        {existingInvoice ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">
                              فاتورة: {existingInvoice.invoiceNumber}
                            </span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openInvoiceDialog(job.id)}
                            className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 flex min-h-[48px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            <span>إصدار فاتورة</span>
                          </motion.button>
                        )}

                        {existingInvoice && (
                          <WhatsAppButton
                            phone={cleanPhone(office.phone)}
                            message={`فاتورة رقم ${existingInvoice.invoiceNumber} - ${existingInvoice.serviceDescription} - المبلغ: ${formatSAR(existingInvoice.total)}`}
                            label="إرسال عبر واتساب"
                            variant="secondary"
                            size="sm"
                            className="min-h-[40px]"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* === INVOICE DIALOG === */}
      <AnimatePresence>
        {invoiceDialogJob &&
          (() => {
            const job = myJobs.find((j) => j.id === invoiceDialogJob);
            if (!job) return null;
            const building = getBuildingById(job.buildingId);
            const unit = job.unitId ? getUnitById(job.unitId) : null;

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
                onClick={() => setInvoiceDialogJob(null)}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-brand-50 dark:bg-brand-900/20 flex h-10 w-10 items-center justify-center rounded-xl">
                      <FileText className="text-brand-500 h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold">إصدار فاتورة</h3>
                  </div>

                  {/* Invoice Preview */}
                  <div className="mb-4 space-y-3">
                    <div className="rounded-xl bg-[var(--secondary)] p-3">
                      <p className="text-[10px] text-[var(--muted-foreground)]">المزود</p>
                      <p className="text-sm font-bold">{provider.name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        سجل: {provider.licenseNumber}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--secondary)] p-3">
                      <p className="text-[10px] text-[var(--muted-foreground)]">العميل</p>
                      <p className="text-sm font-bold">{building?.name}</p>
                      {unit && (
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          وحدة {unit.unitNumber}
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl bg-[var(--secondary)] p-3">
                      <p className="text-[10px] text-[var(--muted-foreground)]">الخدمة</p>
                      <p className="text-sm font-bold">{job.title}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        {categoryLabels[job.category]}
                      </p>
                    </div>

                    {/* Cost breakdown — editable */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                        <span className="text-xs">أجور العمل</span>
                        <input
                          type="number"
                          value={invoiceLaborCost}
                          onChange={(e) => setInvoiceLaborCost(parseInt(e.target.value) || 0)}
                          className="focus:ring-brand-500 w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-end text-sm font-bold focus:outline-none focus:ring-2"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                        <span className="text-xs">قطع غيار</span>
                        <input
                          type="number"
                          value={invoicePartsCost}
                          onChange={(e) => setInvoicePartsCost(parseInt(e.target.value) || 0)}
                          className="focus:ring-brand-500 w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-end text-sm font-bold focus:outline-none focus:ring-2"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          الإجمالي
                        </span>
                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                          {formatSAR(invoiceLaborCost + invoicePartsCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setInvoiceDialogJob(null)}
                      className="flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleGenerateInvoice(invoiceDialogJob)}
                      disabled={invoiceGenerating}
                      className="bg-brand-500 flex min-h-[48px] items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                    >
                      {invoiceGenerating ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>جاري الإصدار...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>إصدار الفاتورة</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* === EARNINGS TAB === */}
      {activeTab === 'earnings' && (
        <>
          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Banknote className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)]">هذا الشهر</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatSAR(paidOut)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)]">مستحقات معلقة</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {formatSAR(pendingPayments)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30">
                  <CreditCard className="h-6 w-6 text-sky-500" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)]">تم الصرف</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">
                    {formatSAR(paidOut)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment History */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">سجل المدفوعات</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toast.success('تم تصدير كشف الحساب')}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2 text-[10px] font-medium transition-colors hover:bg-[var(--accent)]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تصدير كشف حساب</span>
              </motion.button>
            </div>
            <div className="space-y-2">
              {completedJobs.map((job) => {
                const building = getBuildingById(job.buildingId);
                const state = jobStates[job.id];
                const cost = state?.actualCost || job.actualCost || job.estimatedCost || 0;
                return (
                  <div
                    key={job.id}
                    className="flex min-h-[48px] items-center justify-between rounded-xl bg-[var(--secondary)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryBgColors[job.category] || categoryBgColors.general}`}
                      >
                        <CategoryIcon category={job.category} className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{job.title}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {building?.name} ·{' '}
                          {state?.completedAt
                            ? formatDate(state.completedAt)
                            : job.completedAt
                              ? formatDate(job.completedAt)
                              : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatSAR(cost)}
                      </p>
                      <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        مدفوع
                      </span>
                    </div>
                  </div>
                );
              })}
              {activeJobs
                .filter((j) => j.estimatedCost)
                .map((job) => {
                  const building = getBuildingById(job.buildingId);
                  return (
                    <div
                      key={job.id}
                      className="flex min-h-[48px] items-center justify-between rounded-xl bg-[var(--secondary)] p-3 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryBgColors[job.category] || categoryBgColors.general}`}
                        >
                          <CategoryIcon category={job.category} className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{job.title}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">
                            {building?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          {formatSAR(job.estimatedCost || 0)}
                        </p>
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                          معلق
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </>
      )}

      {/* === SCHEDULE TAB === */}
      {activeTab === 'schedule' && (
        <>
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              جدول الأسبوع
            </h3>

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {ARABIC_DAYS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[10px] font-bold text-[var(--muted-foreground)]"
                >
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {getWeekDates().map((date, idx) => {
                const dayJobs = getJobsForDate(date);
                const today = isToday(date);
                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] rounded-xl border p-1.5 transition-colors ${
                      today
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                        : 'border-[var(--border)] bg-[var(--secondary)]'
                    }`}
                  >
                    <p
                      className={`mb-1 text-center text-xs font-bold ${
                        today ? 'text-brand-600 dark:text-brand-400' : ''
                      }`}
                    >
                      {date.getDate()}
                    </p>
                    {dayJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className={`mb-0.5 truncate rounded-lg px-1 py-0.5 text-[7px] font-medium ${
                          job.priority === 'urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : job.priority === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                        }`}
                        title={job.title}
                      >
                        <CategoryIcon
                          category={job.category}
                          className="me-0.5 inline-block h-2.5 w-2.5"
                        />
                        {getBuildingById(job.buildingId)?.name?.split(' ').slice(0, 2).join(' ')}
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <p className="text-center text-[7px] text-[var(--muted-foreground)]">
                        +{dayJobs.length - 3}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Today's Jobs Detail */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-3 text-sm font-bold">مهام اليوم</h3>
            {(() => {
              const todayJobs = getJobsForDate(new Date());
              if (todayJobs.length === 0) {
                return (
                  <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                    لا توجد مهام مجدولة لهذا اليوم
                  </div>
                );
              }
              return (
                <div className="space-y-2">
                  {todayJobs.map((job) => {
                    const building = getBuildingById(job.buildingId);
                    const status = getEffectiveStatus(job);
                    return (
                      <div
                        key={job.id}
                        className="flex min-h-[48px] items-center gap-3 rounded-xl bg-[var(--secondary)] p-3"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${categoryBgColors[job.category] || categoryBgColors.general}`}
                        >
                          <CategoryIcon category={job.category} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold">{building?.name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{job.title}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                            status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : status === 'working'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                          }`}
                        >
                          {PROGRESS_STEPS.find((s) => s.key === status)?.label ||
                            statusLabels[job.status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        </>
      )}

      {/* === PROFILE TAB === */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Details */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-4 text-sm font-bold">بيانات المزود</h3>
            <div className="space-y-3">
              {[
                {
                  icon: Wrench,
                  label: 'التخصص',
                  value: provider.specialty,
                  color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
                },
                {
                  icon: Star,
                  label: 'التقييم',
                  value: `${provider.rating} / ٥`,
                  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                },
                {
                  icon: Clock,
                  label: 'وقت الاستجابة',
                  value: provider.responseTime,
                  color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
                },
                {
                  icon: MapPin,
                  label: 'منطقة الخدمة',
                  value: provider.city,
                  color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
                },
                {
                  icon: BadgeCheck,
                  label: 'رقم السجل',
                  value: provider.licenseNumber,
                  color:
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                },
                {
                  icon: Phone,
                  label: 'الهاتف',
                  value: provider.phone,
                  color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex min-h-[48px] items-center gap-3 rounded-xl bg-[var(--secondary)] p-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
                    <p className="text-sm font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-4 text-sm font-bold">الأداء</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">{provider.completedJobs}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">مهمة مكتملة (إجمالي)</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{provider.rating}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">متوسط التقييم</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
                <p className="text-2xl font-bold text-sky-500">{activeJobs.length}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">مهام حالية</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] p-4 text-center">
                <p className="text-2xl font-bold">{formatSAR(totalEarnings)}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">إجمالي الأرباح</p>
              </div>
            </div>
          </motion.div>

          {/* Rating Stars Visual */}
          <motion.div
            variants={itemVariants}
            className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h3 className="mb-3 text-sm font-bold">التقييم العام</h3>
            <div className="mb-3 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border)]'}`}
                />
              ))}
            </div>
            <p className="text-center text-2xl font-bold">{avgRating}</p>
            <p className="text-center text-xs text-[var(--muted-foreground)]">
              من ٥ — بناءً على {provider.completedJobs} مهمة
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
