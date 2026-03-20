'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowRight,
  MapPin,
  User,
  Phone,
  Star,
  Scale,
  Clock,
  CheckCircle2,
  Circle,
  Wrench,
  Camera,
  X,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getOfficeId } from '@/lib/auth';
import { useToast } from '@/components/ui/toast-provider';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const statusLabels: Record<string, string> = {
  SUBMITTED: 'تم الإرسال',
  REVIEWED: 'قيد المراجعة',
  ASSIGNED: 'تم التعيين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  REVIEWED: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  ASSIGNED: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const priorityLabels: Record<string, string> = {
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'عالي',
  URGENT: 'عاجل',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-sky-50 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const categoryLabels: Record<string, string> = {
  PLUMBING: 'سباكة',
  ELECTRICAL: 'كهرباء',
  HVAC: 'تكييف',
  STRUCTURAL: 'هيكلي',
  APPLIANCE: 'أجهزة',
  COSMETIC: 'تجميلي',
  PAINTING: 'دهان',
  CARPENTRY: 'نجارة',
  PEST_CONTROL: 'مكافحة حشرات',
  ELEVATOR: 'مصاعد',
  SECURITY: 'أمن',
  CLEANING: 'نظافة',
  OTHER: 'أخرى',
};

const statusPipeline = ['SUBMITTED', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

function formatDateTime(dateStr: Date | string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RequestDetailPage() {
  const params = useParams();
  const toast = useToast();
  const officeId = getOfficeId();
  const requestId = params?.id as string | undefined;

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [whatsappPopup, setWhatsappPopup] = useState(false);

  const utils = trpc.useUtils();

  const { data: request, isLoading } = trpc.maintenance.getById.useQuery(
    { id: requestId! },
    { enabled: !!requestId },
  );

  const { data: providers } = trpc.providers.list.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId },
  );

  const updateStatus = trpc.maintenance.updateStatus.useMutation({
    onSuccess: () => {
      utils.maintenance.getById.invalidate({ id: requestId! });
      toast.success('تم تحديث حالة الطلب');
      setWhatsappPopup(true);
      setTimeout(() => setWhatsappPopup(false), 3000);
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        toast.error(parsed.messageAr || 'حدث خطأ أثناء تحديث الحالة');
      } catch {
        toast.error('حدث خطأ أثناء تحديث الحالة');
      }
    },
  });

  const assignProvider = trpc.maintenance.assignProvider.useMutation({
    onSuccess: () => {
      utils.maintenance.getById.invalidate({ id: requestId! });
      toast.success('تم تعيين مقدم الخدمة');
      setAssignDialogOpen(false);
      setWhatsappPopup(true);
      setTimeout(() => setWhatsappPopup(false), 3000);
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        toast.error(parsed.messageAr || 'حدث خطأ أثناء التعيين');
      } catch {
        toast.error('حدث خطأ أثناء التعيين');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-[var(--muted-foreground)]">الطلب غير موجود</p>
        <Link href="/office/requests" className="text-brand-500 mt-4 text-sm">
          ← العودة للطلبات
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusPipeline.indexOf(request.status);
  const allProviders = providers ?? [];

  function handleUpdateStatus(newStatus: string, note: string) {
    updateStatus.mutate({
      id: request!.id,
      status: newStatus as 'REVIEWED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
      notes: note,
    });
  }

  function handleAssignProvider(providerId: string) {
    assignProvider.mutate({
      requestId: request!.id,
      providerId,
    });
  }

  function renderStatusActions() {
    const buttonBase =
      'flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all min-h-[44px]';
    const isPending = updateStatus.isPending || assignProvider.isPending;

    switch (request!.status) {
      case 'SUBMITTED':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            onClick={() => handleUpdateStatus('REVIEWED', 'تمت مراجعة الطلب من قبل المكتب')}
            className={`${buttonBase} bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            مراجعة
          </motion.button>
        );
      case 'REVIEWED':
        return (
          <Dialog.Root open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <Dialog.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPending}
                className={`${buttonBase} bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-60`}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4" />
                )}
                تعيين مقدم خدمة
              </motion.button>
            </Dialog.Trigger>
            {renderAssignDialog()}
          </Dialog.Root>
        );
      case 'ASSIGNED':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            onClick={() => handleUpdateStatus('IN_PROGRESS', 'تم بدء التنفيذ')}
            className={`${buttonBase} bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wrench className="h-4 w-4" />
            )}
            بدء التنفيذ
          </motion.button>
        );
      case 'IN_PROGRESS':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            onClick={() => handleUpdateStatus('COMPLETED', 'تم إكمال الطلب بنجاح')}
            className={`${buttonBase} bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            إكمال
          </motion.button>
        );
      default:
        return null;
    }
  }

  function renderAssignDialog() {
    return (
      <AnimatePresence>
        {assignDialogOpen && (
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
                className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:inset-x-auto sm:w-full"
              >
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-bold">تعيين مقدم خدمة</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="rounded-lg p-1.5 transition-colors hover:bg-[var(--secondary)]">
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                  مقدمو الخدمة المتوفرون - تخصص:{' '}
                  <span className="font-medium text-[var(--foreground)]">
                    {categoryLabels[request!.category] ?? request!.category}
                  </span>
                </p>

                {allProviders.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      لا يوجد مقدمو خدمة متوفرون
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allProviders.map((sp) => (
                      <motion.div
                        key={sp.id}
                        whileHover={{ y: -2 }}
                        className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 transition-colors hover:bg-[var(--accent)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold">{sp.nameAr}</h4>
                            {sp.nameEn && (
                              <p className="text-[10px] text-[var(--muted-foreground)]">
                                {sp.nameEn}
                              </p>
                            )}
                            <p className="text-[10px] text-[var(--muted-foreground)]">
                              {sp.specialties?.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold">{sp.rating}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>{sp.completedJobs} مهمة</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={assignProvider.isPending}
                            onClick={() => handleAssignProvider(sp.id)}
                            className="bg-brand-500 hover:bg-brand-600 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white transition-colors disabled:opacity-60"
                          >
                            {assignProvider.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            تعيين
                          </motion.button>
                          {sp.phone && (
                            <WhatsAppButton
                              phone={sp.phone.replace(/[^0-9]/g, '')}
                              message={`مرحبا ${sp.nameAr}, لدينا طلب صيانة نود تعيينكم عليه.`}
                              variant="icon"
                              size="sm"
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* WhatsApp notification popup */}
      <AnimatePresence>
        {whatsappPopup && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed start-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/80"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              تم إرسال إشعار واتساب لمقدم الخدمة
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <motion.div variants={itemVariants}>
        <Link
          href="/office/requests"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>
      </motion.div>

      {/* Status Pipeline */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">مسار الطلب</h3>
          {renderStatusActions()}
        </div>
        <div className="flex items-center justify-between gap-1">
          {statusPipeline.map((step, index) => {
            const isPast = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${isPast ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}
                    />
                  )}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300 }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? 'bg-brand-500 shadow-card ring-brand-100 dark:ring-brand-900/50 text-white ring-4'
                        : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {isPast && !isCurrent ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </motion.div>
                  {index < statusPipeline.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${isCurrent ? 'text-brand-500' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted-foreground)]'}`}
                >
                  {statusLabels[step]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Request Info */}
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status] ?? ''}`}
            >
              {statusLabels[request.status] ?? request.status}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${priorityColors[request.priority] ?? ''}`}
            >
              {priorityLabels[request.priority] ?? request.priority}
            </span>
          </div>
          <h2 className="mb-2 text-lg font-bold">{request.titleAr ?? request.titleEn}</h2>
          <p className="mb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {request.descriptionAr ?? request.descriptionEn}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <span>{categoryLabels[request.category] ?? request.category}</span>
            </div>
            {request.tenant && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <span>مقدم البلاغ: {request.tenant.nameAr}</span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {request.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--secondary)]"
                >
                  {att.url ? (
                    <img
                      src={att.url}
                      alt="صورة مرفقة بالبلاغ"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-5 w-5 text-[var(--muted-foreground)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Provider info */}
        <div className="space-y-4">
          {request.provider && (
            <motion.div
              variants={itemVariants}
              className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <h3 className="mb-3 text-sm font-bold">مقدم الخدمة المعيّن</h3>
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 dark:bg-brand-900/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Wrench className="text-brand-500 h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{request.provider.nameAr}</p>
                  {request.provider.nameEn && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {request.provider.nameEn}
                    </p>
                  )}
                </div>
              </div>
              {request.provider.phone && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-[var(--muted-foreground)]" />
                    <span className="text-xs" dir="ltr">
                      {request.provider.phone}
                    </span>
                  </div>
                  <WhatsAppButton
                    phone={request.provider.phone.replace(/[^0-9]/g, '')}
                    message={`مرحبا, متابعة بخصوص طلب الصيانة: ${request.titleAr ?? ''}`}
                    variant="icon"
                    size="sm"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Show assign prompt when no provider and status allows */}
          {!request.provider &&
            (request.status === 'SUBMITTED' || request.status === 'REVIEWED') && (
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--secondary)] p-5"
              >
                <div className="text-center">
                  <Wrench className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                    لم يتم تعيين مقدم خدمة بعد
                  </p>
                  <Dialog.Root open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                    <Dialog.Trigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600"
                      >
                        <Wrench className="h-4 w-4" />
                        تعيين مقدم خدمة
                      </motion.button>
                    </Dialog.Trigger>
                    {renderAssignDialog()}
                  </Dialog.Root>
                </div>
              </motion.div>
            )}
        </div>
      </div>

      {/* Activity Feed / Status Log */}
      {request.statusLog && request.statusLog.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <h3 className="mb-4 text-sm font-bold">سجل الحالة</h3>
          <div className="relative">
            <div className="absolute bottom-2 start-3 top-2 w-0.5 bg-[var(--border)]" />

            <div className="space-y-4">
              {request.statusLog.map((entry, index) => (
                <motion.div
                  key={entry.id ?? index}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="relative flex gap-3 ps-8"
                >
                  <div
                    className={`absolute start-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-[var(--card)] ${
                      index === 0 ? 'bg-brand-500' : 'bg-[var(--border)]'
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[entry.toStatus] ?? ''}`}
                      >
                        {statusLabels[entry.toStatus] ?? entry.toStatus}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
