'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  categoryLabels,
  statusPipeline,
  progressMap,
  formatSAR,
  formatDateTime,
  formatDate,
  getRelativeTime,
} from '@/lib/format-utils';
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
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const requestQuery = trpc.maintenance.getById.useQuery(
    { id: requestId ?? '' },
    { enabled: !!requestId, staleTime: 15_000 },
  );

  const rateMutation = trpc.maintenance.rate.useMutation({
    onSuccess: () => {
      setRatingSubmitted(true);
      toast.success('شكراً على تقييمك!');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إرسال التقييم');
    },
  });

  if (requestQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)]">
          <FileText className="h-8 w-8 text-[var(--muted-foreground)]" />
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">الطلب غير موجود</p>
        <Link
          href="/tenant/dashboard"
          className="text-brand-500 mt-4 text-sm font-medium hover:underline"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const request = requestQuery.data;
  const isCompleted = request.status === 'COMPLETED';
  const currentStepIndex = statusPipeline.indexOf(
    request.status as (typeof statusPipeline)[number],
  );
  const progress = progressMap[request.status] ?? 0;

  const handleRatingSubmit = () => {
    if (!requestId || rating === 0) return;
    rateMutation.mutate({
      requestId,
      rating,
      comment: comment || undefined,
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link
          href="/tenant/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Link>
      </motion.div>

      {/* Request header */}
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
        <h2 className="text-lg font-bold">{request.titleAr}</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {categoryLabels[request.category] ?? request.category}
        </p>

        {/* Progress bar */}
        {!isCompleted && request.status !== 'CANCELLED' && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-brand-500 h-full rounded-full"
              />
            </div>
            <span className="text-brand-500 text-xs font-medium">{progress}%</span>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {request.descriptionAr}
        </p>

        {/* Ticket info row */}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>أُنشئ: {formatDate(request.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>آخر تحديث: {getRelativeTime(request.updatedAt ?? request.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>رقم الطلب: {request.id.slice(0, 8)}</span>
          </div>
        </div>
      </motion.div>

      {/* Photo Gallery */}
      {request.attachments && request.attachments.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <h3 className="mb-3 text-sm font-bold">صور المشكلة</h3>
          <div className="flex gap-3 overflow-x-auto">
            {request.attachments.map((att, i) => (
              <div
                key={att.id ?? i}
                className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
              >
                {att.url ? (
                  <img src={att.url} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Animated Status Pipeline */}
      <motion.div
        variants={itemVariants}
        className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h3 className="mb-4 text-sm font-bold">مسار الطلب</h3>
        <div className="space-y-0">
          {statusPipeline.map((step, index) => {
            const isPast = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const logEntry = request.statusLog?.find((l) => l.toStatus === step);

            return (
              <div key={step} className="flex gap-3">
                {/* Vertical track */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.12,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? 'bg-brand-500 ring-brand-100 dark:ring-brand-900/30 text-white ring-4'
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
                      className={`min-h-[40px] w-0.5 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}
                    />
                  )}
                </div>
                {/* Label + timestamp */}
                <div className={`pb-5 ${isCurrent ? '' : isPast ? 'opacity-80' : 'opacity-40'}`}>
                  <p className={`text-sm font-medium ${isCurrent ? 'text-brand-500' : ''}`}>
                    {statusLabels[step] ?? step}
                  </p>
                  {logEntry && (
                    <>
                      {logEntry.note && (
                        <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
                          {logEntry.note}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                        {formatDateTime(logEntry.createdAt)}
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

      {/* Provider Info */}
      {request.provider && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <h3 className="mb-3 text-sm font-bold">مقدم الخدمة</h3>
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 dark:bg-brand-900/20 flex h-12 w-12 items-center justify-center rounded-xl">
              <Wrench className="text-brand-500 h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{request.provider.nameAr}</p>
              {request.provider.phone && (
                <p className="text-xs text-[var(--muted-foreground)]">{request.provider.phone}</p>
              )}
            </div>
          </div>
          {request.provider.phone && (
            <div className="mt-3">
              <a
                href={`tel:${request.provider.phone}`}
                className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>اتصال</span>
              </a>
            </div>
          )}
        </motion.div>
      )}

      {/* Activity feed */}
      {request.statusLog && request.statusLog.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <h3 className="mb-4 text-sm font-bold">سجل التحديثات</h3>
          <div className="relative">
            <div className="absolute bottom-2 start-[11px] top-2 w-0.5 bg-[var(--border)]" />
            <div className="space-y-4">
              {[...request.statusLog].reverse().map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="relative flex gap-3 ps-8"
                >
                  <div
                    className={`absolute start-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--card)] ${
                      index === 0 ? 'bg-brand-500' : 'bg-[var(--secondary)]'
                    }`}
                  >
                    <Circle
                      className={`h-2 w-2 ${index === 0 ? 'text-white' : 'text-[var(--muted-foreground)]'}`}
                    />
                  </div>
                  <div
                    className={`rounded-xl p-3 ${
                      index === 0 ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'bg-[var(--secondary)]'
                    } flex-1`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${statusColors[entry.toStatus] ?? ''}`}
                      >
                        {statusLabels[entry.toStatus] ?? entry.toStatus}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs leading-relaxed text-[var(--foreground)]">
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

      {/* Rate the service */}
      {isCompleted && !request.tenantRating && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
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
            </motion.div>
          ) : (
            <>
              <h3 className="mb-3 text-sm font-bold">قيّم الخدمة</h3>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                كيف كانت تجربتك مع مقدم الخدمة؟
              </p>

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
                    {rating <= 2
                      ? 'نأسف على ذلك'
                      : rating === 3
                        ? 'شكراً'
                        : rating === 4
                          ? 'جيد جداً!'
                          : 'ممتاز! شكراً لك'}
                  </p>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="أضف ملاحظاتك (اختياري)..."
                    rows={2}
                    className="focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs outline-none transition-colors focus:ring-2"
                  />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRatingSubmit}
                    disabled={rateMutation.isPending}
                    className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium text-white transition-colors disabled:opacity-50"
                  >
                    {rateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>إرسال التقييم</span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Already rated */}
      {request.tenantRating && (
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= request.tenantRating! ? 'fill-amber-400 text-amber-400' : 'text-[var(--border)]'}`}
                />
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              تم التقييم
            </span>
            {request.tenantFeedback && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {request.tenantFeedback}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
