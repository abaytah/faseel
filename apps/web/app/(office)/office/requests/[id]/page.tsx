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
} from 'lucide-react';
import {
  maintenanceRequests as seedRequests,
  serviceProviders as seedProviders,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  costLabels,
  costColors,
  categoryLabels,
  statusPipeline,
  getUserById,
  formatSAR,
  formatDateTime,
  type MaintenanceRequest,
  type ServiceProvider,
  type RequestStatus,
} from '@/lib/mock-data';
import {
  useLocalStorageState,
  STORAGE_KEYS,
} from '@/lib/local-storage';
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

// Map request categories to provider specialties
const categoryToSpecialty: Record<string, string[]> = {
  plumbing: ['سباكة'],
  electrical: ['كهرباء'],
  hvac: ['تكييف'],
  structural: ['صيانة عامة'],
  appliance: ['صيانة عامة', 'كهرباء'],
  cosmetic: ['دهان', 'صيانة عامة'],
  elevator: ['مصاعد'],
  fire_safety: ['سلامة'],
  generator: ['كهرباء', 'صيانة عامة'],
  general: ['صيانة عامة'],
  painting: ['دهان'],
  cleaning: ['نظافة'],
  pest_control: ['مكافحة حشرات'],
};

export default function RequestDetailPage() {
  const params = useParams();
  const toast = useToast();

  const [allRequests, setAllRequests] = useLocalStorageState<MaintenanceRequest>(STORAGE_KEYS.REQUESTS, seedRequests);
  const [allProviders] = useLocalStorageState<ServiceProvider>(STORAGE_KEYS.SERVICE_PROVIDERS, seedProviders);

  const requestId = params?.id as string | undefined;
  const request = allRequests.find((r) => r.id === requestId);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [whatsappPopup, setWhatsappPopup] = useState(false);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-[var(--muted-foreground)]">الطلب غير موجود</p>
        <Link href="/office/requests" className="mt-4 text-sm text-brand-500">
          ← العودة للطلبات
        </Link>
      </div>
    );
  }

  const reporter = getUserById(request.reportedById);
  const provider = request.assignedProviderId ? allProviders.find((p) => p.id === request.assignedProviderId) : null;

  // Determine pipeline step index
  const currentStepIndex = statusPipeline.indexOf(request.status);

  // Get relevant providers for assignment
  const relevantSpecialties = categoryToSpecialty[request.category] || ['صيانة عامة'];
  const relevantProviders = allProviders.filter((p) =>
    relevantSpecialties.includes(p.specialty)
  );

  function updateRequestStatus(newStatus: RequestStatus, note: string) {
    setAllRequests((prev) =>
      prev.map((r) => {
        if (r.id !== request!.id) return r;
        return {
          ...r,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          completedAt: newStatus === 'completed' ? new Date().toISOString() : r.completedAt,
          statusLog: [
            ...r.statusLog,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note,
              userId: 'off-001',
            },
          ],
        };
      })
    );

    toast.success(`تم تحديث حالة الطلب إلى "${statusLabels[newStatus]}"`);

    // Simulate WhatsApp notification
    setWhatsappPopup(true);
    setTimeout(() => setWhatsappPopup(false), 3000);
  }

  function handleAssignProvider(selectedProvider: ServiceProvider) {
    setAllRequests((prev) =>
      prev.map((r) => {
        if (r.id !== request!.id) return r;
        return {
          ...r,
          status: 'assigned' as RequestStatus,
          assignedProviderId: selectedProvider.id,
          updatedAt: new Date().toISOString(),
          statusLog: [
            ...r.statusLog,
            {
              status: 'assigned' as RequestStatus,
              timestamp: new Date().toISOString(),
              note: `تم تعيين ${selectedProvider.name} للطلب`,
              userId: 'off-001',
            },
          ],
        };
      })
    );

    toast.success(`تم تعيين ${selectedProvider.name} للطلب`);
    setAssignDialogOpen(false);

    // Simulate WhatsApp notification
    setWhatsappPopup(true);
    setTimeout(() => setWhatsappPopup(false), 3000);
  }

  // Determine which action button to show
  function renderStatusActions() {
    const buttonBase = 'flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all';

    switch (request!.status) {
      case 'submitted':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateRequestStatus('reviewed', 'تمت مراجعة الطلب من قبل المكتب')}
            className={`${buttonBase} bg-amber-500 text-white hover:bg-amber-600`}
          >
            <CheckCircle2 className="h-4 w-4" />
            مراجعة
          </motion.button>
        );
      case 'reviewed':
        return (
          <Dialog.Root open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <Dialog.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${buttonBase} bg-purple-500 text-white hover:bg-purple-600`}
              >
                <Wrench className="h-4 w-4" />
                تعيين مقدم خدمة
              </motion.button>
            </Dialog.Trigger>
            {renderAssignDialog()}
          </Dialog.Root>
        );
      case 'assigned':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateRequestStatus('in_progress', 'تم بدء التنفيذ')}
            className={`${buttonBase} bg-orange-500 text-white hover:bg-orange-600`}
          >
            <Wrench className="h-4 w-4" />
            بدء التنفيذ
          </motion.button>
        );
      case 'in_progress':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateRequestStatus('completed', 'تم إكمال الطلب بنجاح')}
            className={`${buttonBase} bg-emerald-500 text-white hover:bg-emerald-600`}
          >
            <CheckCircle2 className="h-4 w-4" />
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
                className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:inset-x-auto sm:w-full max-h-[90vh] overflow-y-auto"
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
                  مقدمو الخدمة المتوفرون في تخصص: <span className="font-medium text-[var(--foreground)]">{categoryLabels[request!.category]}</span>
                </p>

                {relevantProviders.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--muted-foreground)]">لا يوجد مقدمو خدمة متوفرون لهذا التخصص</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relevantProviders.map((sp) => (
                      <motion.div
                        key={sp.id}
                        whileHover={{ y: -2 }}
                        className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 transition-colors hover:bg-[var(--accent)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold">{sp.name}</h4>
                            <p className="text-[10px] text-[var(--muted-foreground)]">{sp.specialty}</p>
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
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-500" />
                            <span>{sp.responseTime}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAssignProvider(sp)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            تعيين
                          </motion.button>
                          <WhatsAppButton
                            phone={sp.phone.replace(/[^0-9]/g, '')}
                            message={`مرحبا ${sp.name}، لدينا طلب صيانة (${request!.title}) نود تعيينكم عليه.`}
                            variant="icon"
                            size="sm"
                          />
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* WhatsApp notification popup */}
      <AnimatePresence>
        {whatsappPopup && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 start-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/80"
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
        <Link href="/office/requests" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>
      </motion.div>

      {/* Status Pipeline */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
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
                  {/* Line before */}
                  {index > 0 && (
                    <div className={`h-0.5 flex-1 transition-colors ${isPast ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
                  )}
                  {/* Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300 }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? 'bg-brand-500 text-white shadow-card ring-4 ring-brand-100 dark:ring-brand-900/50'
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
                  {/* Line after */}
                  {index < statusPipeline.length - 1 && (
                    <div className={`h-0.5 flex-1 transition-colors ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isCurrent ? 'text-brand-500' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted-foreground)]'}`}>
                  {statusLabels[step]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Request Info */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
              {statusLabels[request.status]}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${priorityColors[request.priority]}`}>
              {priorityLabels[request.priority]}
            </span>
          </div>
          <h2 className="mb-2 text-lg font-bold">{request.title}</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)] leading-relaxed">{request.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <span>{request.locationLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <span>{categoryLabels[request.category]} — {request.subcategory}</span>
            </div>
            {reporter && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <span>مقدم البلاغ: {reporter.name}</span>
              </div>
            )}
            {request.estimatedCost && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted-foreground)]">التكلفة المتوقعة:</span>
                <span className="font-bold">{formatSAR(request.estimatedCost)}</span>
              </div>
            )}
            {request.actualCost && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted-foreground)]">التكلفة الفعلية:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(request.actualCost)}</span>
              </div>
            )}
          </div>

          {/* Photo placeholder */}
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {[1, 2].map((i) => (
              <div key={i} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)]">
                <Camera className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cost Router + Provider */}
        <div className="space-y-4">
          {/* Cost Router Verdict */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-brand-500" />
              <h3 className="text-sm font-bold">تحديد المسؤولية المالية</h3>
            </div>
            <div className="mb-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${costColors[request.costResponsibility]}`}>
                {costLabels[request.costResponsibility]}
              </span>
            </div>
            <div className="rounded-xl bg-[var(--secondary)] p-4">
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                {request.costLegalBasis}
              </p>
            </div>
          </motion.div>

          {/* Assigned Provider */}
          {provider && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
              <h3 className="mb-3 text-sm font-bold">مقدم الخدمة المعيّن</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <Wrench className="h-6 w-6 text-brand-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{provider.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{provider.specialty}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span>{provider.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{provider.completedJobs} مهمة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{provider.responseTime}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-[var(--muted-foreground)]" />
                  <span className="text-xs" dir="ltr">{provider.phone}</span>
                </div>
                <WhatsAppButton
                  phone={provider.phone.replace(/[^0-9]/g, '')}
                  message={`مرحبا ${provider.name}، متابعة بخصوص طلب الصيانة: ${request.title}`}
                  variant="icon"
                  size="sm"
                />
              </div>
            </motion.div>
          )}

          {/* Show assign button when in submitted/reviewed state and no provider */}
          {!provider && (request.status === 'submitted' || request.status === 'reviewed') && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--secondary)] p-5">
              <div className="text-center">
                <Wrench className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mb-3 text-sm text-[var(--muted-foreground)]">لم يتم تعيين مقدم خدمة بعد</p>
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
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-bold">سجل الحالة</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-3 top-2 bottom-2 w-0.5 bg-[var(--border)]" />

          <div className="space-y-4">
            {[...request.statusLog].reverse().map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                className="relative flex gap-3 ps-8"
              >
                {/* Dot */}
                <div className={`absolute start-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-[var(--card)] ${
                  index === 0 ? 'bg-brand-500' : 'bg-[var(--border)]'
                }`} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[entry.status]}`}>
                      {statusLabels[entry.status]}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">{entry.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
