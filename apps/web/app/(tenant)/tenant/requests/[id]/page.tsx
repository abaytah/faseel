'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Scale,
  Clock,
  Wrench,
  Star,
  Phone,
  Camera,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  maintenanceRequests,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  costLabels,
  costColors,
  categoryLabels,
  statusPipeline,
  getProviderById,
  getBuildingById,
  tenants,
  units,
  office,
  formatSAR,
  formatDateTime,
  formatDate,
  getRelativeTime,
} from '@/lib/mock-data';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function TenantRequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string | undefined;
  const request = maintenanceRequests.find((r) => r.id === requestId);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const tenant = tenants[0];
  const tenantUnit = units.find((u) => u.tenantId === tenant.id);
  const building = tenantUnit ? getBuildingById(tenantUnit.buildingId) : null;

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
          <FileText className="h-8 w-8 text-[var(--muted-foreground)]" />
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">الطلب غير موجود</p>
        <Link href="/tenant/dashboard" className="mt-4 text-sm font-medium text-brand-500 hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const provider = request.assignedProviderId ? getProviderById(request.assignedProviderId) : null;
  const requestBuilding = getBuildingById(request.buildingId);
  const currentStepIndex = statusPipeline.indexOf(request.status);
  const isCompleted = request.status === 'completed';

  // Progress percentage
  const progressMap: Record<string, number> = {
    submitted: 15,
    reviewed: 30,
    assigned: 50,
    in_progress: 75,
    completed: 100,
    cancelled: 0,
  };
  const progress = progressMap[request.status] || 0;

  // Google Maps URL for building location
  const mapsUrl = requestBuilding
    ? `https://maps.google.com/?q=${encodeURIComponent(`${requestBuilding.district} ${requestBuilding.city} السعودية`)}`
    : '#';

  const handleRatingSubmit = () => {
    // Save rating to localStorage
    try {
      const ratingData = {
        requestId: request.id,
        rating,
        comment,
        submittedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('tenant_ratings') || '[]');
      existing.push(ratingData);
      localStorage.setItem('tenant_ratings', JSON.stringify(existing));
    } catch {
      // Ignore localStorage errors
    }

    setRatingSubmitted(true);
    toast.success('شكراً على تقييمك!');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link href="/tenant/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة
        </Link>
      </motion.div>

      {/* Request header — enhanced */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
            {statusLabels[request.status]}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${priorityColors[request.priority]}`}>
            {priorityLabels[request.priority]}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${costColors[request.costResponsibility]}`}>
            {costLabels[request.costResponsibility]}
          </span>
        </div>
        <h2 className="text-lg font-bold">{request.title}</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {categoryLabels[request.category]} — {request.locationLabel}
        </p>

        {/* Progress bar */}
        {!isCompleted && request.status !== 'cancelled' && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-brand-500"
              />
            </div>
            <span className="text-xs font-medium text-brand-500">{progress}%</span>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {request.description}
        </p>

        {/* Ticket info row */}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>أُنشئ: {formatDate(request.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>آخر تحديث: {getRelativeTime(request.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>رقم الطلب: {request.id}</span>
          </div>
        </div>
      </motion.div>

      {/* Mock Photo Gallery */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-bold">صور المشكلة</h3>
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
            >
              <Camera className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
          ))}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--secondary)]">
            <span className="text-xs text-[var(--muted-foreground)]">+ إضافة</span>
          </div>
        </div>
      </motion.div>

      {/* Animated Status Pipeline */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-bold">مسار الطلب</h3>
        <div className="space-y-0">
          {statusPipeline.map((step, index) => {
            const isPast = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const logEntry = request.statusLog.find((l) => l.status === step);

            return (
              <div key={step} className="flex gap-3">
                {/* Vertical track */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.12, type: 'spring', stiffness: 200, damping: 15 }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900/30'
                        : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {isPast && !isCurrent ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Circle className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </motion.div>
                  {index < statusPipeline.length - 1 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.3 + index * 0.12, duration: 0.3 }}
                      className={`w-0.5 min-h-[40px] ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}
                    />
                  )}
                </div>
                {/* Label + timestamp + note */}
                <div className={`pb-5 ${isCurrent ? '' : isPast ? 'opacity-80' : 'opacity-40'}`}>
                  <p className={`text-sm font-medium ${isCurrent ? 'text-brand-500' : ''}`}>
                    {statusLabels[step]}
                  </p>
                  {logEntry && (
                    <>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {logEntry.note}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                        {formatDateTime(logEntry.timestamp)}
                      </p>
                    </>
                  )}
                  {!logEntry && !isPast && (
                    <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                      في الانتظار...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Cost Router — with expandable details */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <button
          onClick={() => setShowCostDetails(!showCostDetails)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand-500" />
            <h3 className="text-sm font-bold">المسؤولية المالية</h3>
          </div>
          {showCostDetails ? (
            <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
          )}
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${costColors[request.costResponsibility]}`}>
            {costLabels[request.costResponsibility]}
          </span>
          {request.estimatedCost && (
            <span className="text-xs text-[var(--muted-foreground)]">
              التقدير: <span className="font-bold text-[var(--foreground)]">{formatSAR(request.estimatedCost)}</span>
            </span>
          )}
          {request.actualCost && (
            <span className="text-xs text-[var(--muted-foreground)]">
              الفعلي: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(request.actualCost)}</span>
            </span>
          )}
        </div>

        <AnimatePresence>
          {showCostDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {/* Cost breakdown */}
                {request.estimatedCost && request.actualCost && (
                  <div className="rounded-xl bg-[var(--secondary)] p-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[var(--muted-foreground)]">التكلفة المقدرة</span>
                      <span className="font-medium">{formatSAR(request.estimatedCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[var(--muted-foreground)]">التكلفة الفعلية</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSAR(request.actualCost)}</span>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-[var(--muted-foreground)]">الفرق</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        وفّرت {formatSAR(request.estimatedCost - request.actualCost)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Legal basis */}
                <div className="rounded-xl bg-[var(--secondary)] p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {request.costLegalBasis}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Provider Info — enhanced with WhatsApp */}
      {provider && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold">مقدم الخدمة</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <Wrench className="h-6 w-6 text-brand-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{provider.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{provider.specialty}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-medium">{provider.rating}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{provider.responseTime}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>{provider.completedJobs} مهمة</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href={`tel:${provider.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-medium text-white transition-colors hover:bg-brand-600"
            >
              <Phone className="h-4 w-4" />
              <span>اتصال</span>
            </a>
            <WhatsAppButton
              phone={provider.phone.replace(/-/g, '')}
              message={`مرحباً، أنا المستأجر ${tenant.name}. بخصوص طلب الصيانة رقم ${request.id} في ${building?.name || ''} - ${tenantUnit?.unitNumber || ''}`}
              label="واتساب"
              variant="primary"
              size="md"
              className="flex-1 justify-center rounded-xl py-3"
            />
          </div>
        </motion.div>
      )}

      {/* Activity feed — enhanced with better visuals */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-bold">سجل التحديثات</h3>
        <div className="relative">
          <div className="absolute start-[11px] top-2 bottom-2 w-0.5 bg-[var(--border)]" />
          <div className="space-y-4">
            {[...request.statusLog].reverse().map((entry, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="relative flex gap-3 ps-8"
                >
                  <div className={`absolute start-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--card)] ${
                    index === 0 ? 'bg-brand-500' : 'bg-[var(--secondary)]'
                  }`}>
                    {index === 0 ? (
                      <Circle className="h-2 w-2 text-white" />
                    ) : (
                      <Circle className="h-2 w-2 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                  <div className={`rounded-xl p-3 ${
                    index === 0 ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'bg-[var(--secondary)]'
                  } flex-1`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${statusColors[entry.status]}`}>
                        {statusLabels[entry.status]}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--foreground)] leading-relaxed">{entry.note}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Rate the service — only for completed requests */}
      {isCompleted && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          {ratingSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div className="mb-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--border)]'}`}
                  />
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                تم التقييم
              </span>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                تقييمك يساعدنا في تحسين جودة الخدمة
              </p>
            </motion.div>
          ) : (
            <>
              <h3 className="mb-3 text-sm font-bold">قيّم الخدمة</h3>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                كيف كانت تجربتك مع مقدم الخدمة؟
              </p>

              {/* Star rating */}
              <div className="mb-4 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[var(--border)]'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              {rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <p className="text-center text-sm font-medium">
                    {rating <= 2 ? 'نأسف على ذلك — نسعى للتحسين' :
                      rating === 3 ? 'شكراً — نسعى للأفضل دائماً' :
                      rating === 4 ? 'جيد جداً!' :
                      'ممتاز! شكراً لك'}
                  </p>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="أضف ملاحظاتك (اختياري)..."
                    rows={2}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRatingSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-medium text-white transition-colors hover:bg-brand-600"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>إرسال التقييم</span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Contact & Location */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-bold">تواصل ومساعدة</h3>

        <div className="space-y-2">
          {/* Contact office — WhatsApp */}
          <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-500" />
              <div>
                <p className="text-xs font-medium">مكتب الإدارة</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{office.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${office.phone}`}
                className="flex items-center gap-1 rounded-lg bg-[var(--background)] px-3 py-1.5 text-[10px] font-medium transition-colors hover:bg-[var(--accent)]"
              >
                <Phone className="h-3 w-3" />
                اتصال
              </a>
              <WhatsAppButton
                phone={office.phone.replace(/-/g, '')}
                message={`مرحباً، أنا المستأجر ${tenant.name}. بخصوص طلب الصيانة رقم ${request.id} في ${building?.name || ''} - ${tenantUnit?.unitNumber || ''}`}
                variant="icon"
                size="sm"
              />
            </div>
          </div>

          {/* Location sharing */}
          {requestBuilding && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs font-medium">موقع المبنى</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    {requestBuilding.district} — {requestBuilding.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-brand-500">
                <span>خرائط</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
