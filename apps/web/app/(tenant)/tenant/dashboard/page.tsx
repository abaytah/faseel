'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Building2,
  User,
  Phone,
  Plus,
  Wrench,
  MapPin,
  CalendarClock,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Wallet,
  Droplets,
  Zap,
  ArrowUpDown,
  X,
  Banknote,
  Apple,
  Coins,
} from 'lucide-react';
import {
  units,
  tenants,
  office,
  getBuildingById,
  getUserById,
  getRequestsByTenant,
  getAnnouncementsByBuilding,
  statusLabels,
  statusColors,
  categoryLabels,
  getRelativeTime,
  formatSAR,
  formatDate,
  tenantRentPayments as initialRentPayments,
  tenantContract,
  getDaysUntilContractEnd,
  getRentStatusColor,
  getRentStatusLabel,
  getProviderById,
} from '@/lib/mock-data';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

type RequestFilter = 'active' | 'completed' | 'all';

const paymentMethods = [
  { id: 'bank', label: 'تحويل بنكي', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'mada', label: 'مدى', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'apple', label: 'أبل باي', icon: Apple, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-gray-800/50' },
  { id: 'cash', label: 'نقداً', icon: Coins, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

export default function TenantDashboardPage() {
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('active');
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rentPayments, setRentPayments] = useState(initialRentPayments);
  const toast = useToast();

  const tenant = tenants[0];
  const tenantUnit = units.find((u) => u.tenantId === tenant.id);
  const building = tenantUnit ? getBuildingById(tenantUnit.buildingId) : null;
  const owner = tenantUnit ? getUserById(tenantUnit.ownerId) : null;
  const myRequests = getRequestsByTenant(tenant.id);
  const announcements = building ? getAnnouncementsByBuilding(building.id) : [];
  const daysLeft = getDaysUntilContractEnd();

  // Find active request with assigned provider for WhatsApp
  const activeRequestWithProvider = myRequests.find(
    (r) => !['completed', 'cancelled'].includes(r.status) && r.assignedProviderId
  );
  const activeProvider = activeRequestWithProvider?.assignedProviderId
    ? getProviderById(activeRequestWithProvider.assignedProviderId)
    : null;

  const filteredRequests = myRequests.filter((r) => {
    if (requestFilter === 'active') return !['completed', 'cancelled'].includes(r.status);
    if (requestFilter === 'completed') return r.status === 'completed';
    return true;
  });

  const activeCount = myRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const completedCount = myRequests.filter((r) => r.status === 'completed').length;

  const displayPayments = showAllPayments ? rentPayments : rentPayments.slice(0, 3);
  const totalPaidThisYear = rentPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  const currentRent = rentPayments[0];
  const rentStatusClass =
    currentRent?.status === 'paid'
      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
      : currentRent?.status === 'due'
        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30';

  // Handle payment
  const handlePayment = () => {
    if (!selectedMethod) return;
    setPaymentProcessing(true);

    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);

      // Update rent status
      const methodLabel = paymentMethods.find((m) => m.id === selectedMethod)?.label || '';
      setRentPayments((prev) =>
        prev.map((p, i) =>
          i === 0
            ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0], method: methodLabel }
            : p
        )
      );

      toast.success(`تم تسجيل سداد إيجار ${currentRent?.month} بنجاح`);

      setTimeout(() => {
        setShowPaymentDialog(false);
        setPaymentSuccess(false);
        setSelectedMethod('');
      }, 2000);
    }, 2000);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* My Unit Card — enhanced */}
      {tenantUnit && building && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
              <Home className="h-7 w-7 text-brand-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">{tenantUnit.unitNumber}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                <Building2 className="h-3.5 w-3.5" />
                <span>{building.name} — الطابق {tenantUnit.floor}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                <MapPin className="h-3.5 w-3.5" />
                <span>{building.district} — {building.city}</span>
              </div>
            </div>
          </div>

          {/* Unit Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
              <p className="text-lg font-bold">{tenantUnit.area}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">م²</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
              <p className="text-lg font-bold">{tenantUnit.rooms}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">غرف</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
              <p className="text-lg font-bold">{tenantUnit.bathrooms}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">حمامات</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
              <p className="text-lg font-bold">{formatSAR(tenantUnit.monthlyRent)}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">الإيجار الشهري</p>
            </div>
          </div>

          {/* Rent Status Pill + Payment Button */}
          <div className={`mt-3 rounded-xl border p-3 ${rentStatusClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">إيجار {currentRent?.month}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${getRentStatusColor(currentRent?.status || 'due')}`}>
                  {getRentStatusLabel(currentRent?.status || 'due')}
                </span>
                {currentRent && (currentRent.status === 'due' || currentRent.status === 'overdue') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaymentDialog(true)}
                    className="rounded-lg bg-brand-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-brand-600"
                  >
                    سداد
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Contract countdown */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--secondary)] p-3 text-sm">
            <CalendarClock className={`h-4 w-4 ${daysLeft <= 30 ? 'text-amber-500' : 'text-[var(--muted-foreground)]'}`} />
            <span className="text-[var(--muted-foreground)]">ينتهي العقد خلال</span>
            <span className={`font-bold ${daysLeft <= 30 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
              {daysLeft} يوم
            </span>
            <span className="mr-auto text-[10px] text-[var(--muted-foreground)]">{tenantContract.ejarNumber}</span>
          </div>

          {/* Owner + Office contact + WhatsApp */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {owner && (
              <div className="flex items-center gap-2 rounded-xl bg-[var(--secondary)] p-3 text-sm">
                <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[var(--muted-foreground)]">المالك</p>
                  <p className="truncate text-xs font-medium">{owner.name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-[var(--secondary)] p-3 text-sm">
              <a
                href={`tel:${office.phone}`}
                className="flex flex-1 items-center gap-2 transition-colors hover:opacity-80"
              >
                <Phone className="h-4 w-4 text-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[var(--muted-foreground)]">مكتب الإدارة</p>
                  <p className="truncate text-xs font-medium">{office.name}</p>
                </div>
              </a>
              <WhatsAppButton
                phone={office.phone.replace(/-/g, '')}
                message={`مرحباً، أنا المستأجر ${tenant.name}، أحتاج مساعدة بخصوص ${tenantUnit.unitNumber}`}
                variant="icon"
                size="sm"
              />
            </div>
          </div>

          {/* Active Provider WhatsApp (if active request with assigned provider) */}
          {activeProvider && activeRequestWithProvider && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-sm dark:border-brand-900/30 dark:bg-brand-900/10">
              <Wrench className="h-4 w-4 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[var(--muted-foreground)]">مقدم الخدمة — {activeRequestWithProvider.title}</p>
                <p className="truncate text-xs font-medium">{activeProvider.name}</p>
              </div>
              <WhatsAppButton
                phone={activeProvider.phone.replace(/-/g, '')}
                message={`مرحباً، أنا المستأجر ${tenant.name}. بخصوص طلب الصيانة رقم ${activeRequestWithProvider.id} في ${building.name} - ${tenantUnit.unitNumber}`}
                variant="icon"
                size="sm"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Report FAB — large branded CTA */}
      <motion.div variants={itemVariants}>
        <Link href="/tenant/requests/new">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-l from-brand-500 to-brand-600 p-6 text-white shadow-card"
          >
            {/* Background decoration */}
            <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -end-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h3 className="text-lg font-bold">بلّغ عن مشكلة</h3>
              <p className="mt-1 text-sm opacity-80">أخبرنا بالمشكلة وسنتولى الباقي خلال ساعة</p>
            </div>
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Plus className="h-7 w-7" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Emergency Shortcuts */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <Link href="/tenant/requests/new?category=plumbing&priority=urgent">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-center transition-all dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
              <Droplets className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-[11px] font-medium text-red-700 dark:text-red-300">تسريب مياه عاجل</span>
          </motion.div>
        </Link>
        <Link href="/tenant/requests/new?category=electrical&priority=urgent">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center transition-all dark:border-amber-800 dark:bg-amber-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">انقطاع كهرباء</span>
          </motion.div>
        </Link>
        <Link href="/tenant/requests/new?category=elevator&priority=urgent">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center transition-all dark:border-orange-800 dark:bg-orange-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40">
              <ArrowUpDown className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-[11px] font-medium text-orange-700 dark:text-orange-300">مصعد عالق</span>
          </motion.div>
        </Link>
      </motion.div>

      {/* My Requests — with filter tabs */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">
            طلباتي
          </h3>
          <div className="flex items-center gap-1 rounded-lg bg-[var(--secondary)] p-0.5">
            {[
              { key: 'active' as const, label: 'نشطة', count: activeCount },
              { key: 'completed' as const, label: 'مكتملة', count: completedCount },
              { key: 'all' as const, label: 'الكل', count: myRequests.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRequestFilter(tab.key)}
                className={`relative rounded-md px-3 py-1 text-[10px] font-medium transition-all ${
                  requestFilter === tab.key
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filteredRequests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
                <Wrench className="h-7 w-7 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {requestFilter === 'active' ? 'لا توجد طلبات نشطة حالياً' :
                  requestFilter === 'completed' ? 'لا توجد طلبات مكتملة' : 'لا توجد طلبات'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={requestFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              {filteredRequests.map((request, index) => {
                const progressMap: Record<string, number> = {
                  submitted: 15,
                  reviewed: 30,
                  assigned: 50,
                  in_progress: 75,
                  completed: 100,
                  cancelled: 0,
                };
                const progress = progressMap[request.status] || 0;

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/tenant/requests/${request.id}`}>
                      <div className="group rounded-xl border border-transparent p-3 transition-all hover:border-[var(--border)] hover:bg-[var(--secondary)] hover:shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            request.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                            request.priority === 'high' ? 'bg-orange-500' :
                            request.priority === 'medium' ? 'bg-sky-500' :
                            'bg-slate-400'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{request.title}</p>
                            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                              {categoryLabels[request.category]} · {request.locationLabel}
                            </p>
                            {/* Progress bar */}
                            {request.status !== 'completed' && request.status !== 'cancelled' && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--secondary)] group-hover:bg-[var(--background)]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-brand-500"
                                  />
                                </div>
                                <span className="text-[10px] text-[var(--muted-foreground)]">{progress}%</span>
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                              {statusLabels[request.status]}
                            </span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                              {getRelativeTime(request.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Rent Payment History */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">سجل الإيجار</h3>
          </div>
          <div className="text-end">
            <p className="text-[10px] text-[var(--muted-foreground)]">إجمالي المدفوع هذا العام</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(totalPaidThisYear)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {displayPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                payment.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                payment.status === 'due' ? 'bg-amber-100 dark:bg-amber-900/30' :
                'bg-red-100 dark:bg-red-900/30'
              }`}>
                {payment.status === 'paid' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : payment.status === 'due' ? (
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{payment.month}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {payment.paidDate ? `${payment.method} — ${formatDate(payment.paidDate)}` : `استحقاق: ${formatDate(payment.dueDate)}`}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs font-bold">{formatSAR(payment.amount)}</p>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${getRentStatusColor(payment.status)}`}>
                  {getRentStatusLabel(payment.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {rentPayments.length > 3 && (
          <button
            onClick={() => setShowAllPayments(!showAllPayments)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20"
          >
            {showAllPayments ? (
              <>
                <span>عرض أقل</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>عرض الكل ({rentPayments.length})</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* Building Announcements */}
      {announcements.length > 0 && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold">إعلانات المبنى</h3>
            {unreadAnnouncements > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                {unreadAnnouncements}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {announcements.map((ann, index) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedAnnouncement(expandedAnnouncement === ann.id ? null : ann.id)}
                  className="w-full text-start"
                >
                  <div className={`rounded-xl p-3 transition-all ${
                    !ann.read ? 'bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30' : 'bg-[var(--secondary)]'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        ann.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                        ann.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-sky-100 dark:bg-sky-900/30'
                      }`}>
                        {ann.type === 'urgent' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        ) : ann.type === 'warning' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Megaphone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">{ann.title}</p>
                          {!ann.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                          {getRelativeTime(ann.createdAt)}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${
                        expandedAnnouncement === ann.id ? 'rotate-180' : ''
                      }`} />
                    </div>

                    <AnimatePresence>
                      {expandedAnnouncement === ann.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 ps-10 text-xs leading-relaxed text-[var(--muted-foreground)]">
                            {ann.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Floating Action Button — mobile only */}
      <div className="fixed bottom-20 start-4 z-40 lg:hidden">
        <Link href="/tenant/requests/new">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-elevated"
          >
            <Plus className="h-7 w-7" />
          </motion.div>
        </Link>
      </div>

      {/* Payment Dialog */}
      <AnimatePresence>
        {showPaymentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {
              if (!paymentProcessing) {
                setShowPaymentDialog(false);
                setSelectedMethod('');
                setPaymentSuccess(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-elevated"
            >
              {paymentSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                  <p className="text-base font-bold">تم السداد بنجاح!</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    تم تسجيل سداد إيجار {currentRent?.month}
                  </p>
                  <div className="mt-4">
                    <WhatsAppButton
                      phone={office.phone.replace(/-/g, '')}
                      message={`تم سداد إيجار ${currentRent?.month} بمبلغ ${formatSAR(currentRent?.amount || 0)} — ${tenant.name}`}
                      label="إرسال تأكيد للمكتب"
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </motion.div>
              ) : paymentProcessing ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="mb-4 text-sm font-medium">جاري معالجة الدفع...</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                      className="h-full rounded-full bg-brand-500"
                    />
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">لا تغلق هذه النافذة</p>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-base font-bold">سداد الإيجار</h3>
                    <button
                      onClick={() => {
                        setShowPaymentDialog(false);
                        setSelectedMethod('');
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="mb-5 rounded-xl bg-[var(--secondary)] p-4 text-center">
                    <p className="text-[10px] text-[var(--muted-foreground)]">المبلغ المستحق</p>
                    <p className="mt-1 text-2xl font-bold text-brand-500">
                      {formatSAR(currentRent?.amount || 0)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      إيجار {currentRent?.month}
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <p className="mb-3 text-xs font-medium">طريقة الدفع</p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedMethod === method.id;
                      return (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)]'
                          }`}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.bg}`}>
                            <Icon className={`h-5 w-5 ${method.color}`} />
                          </div>
                          <span className="text-xs font-medium">{method.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Pay button */}
                  <motion.button
                    whileHover={{ scale: selectedMethod ? 1.01 : 1 }}
                    whileTap={{ scale: selectedMethod ? 0.98 : 1 }}
                    onClick={handlePayment}
                    disabled={!selectedMethod}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>تأكيد الدفع</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
