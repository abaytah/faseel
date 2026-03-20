'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Scale,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import {
  owners,
  getRequestsByOwner,
  getBuildingById,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  costLabels,
  costColors,
  categoryLabels,
  formatSAR,
  getRelativeTime,
  office,
  type MaintenanceRequest,
} from '@/lib/mock-data';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { useToast } from '@/components/ui/toast-provider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

type FilterTab = 'all' | 'pending_approval' | 'active' | 'completed';

export default function OwnerRequestsPage() {
  const owner = owners[0];
  const allRequests = getRequestsByOwner(owner.id);
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [approvedRequests, setApprovedRequests] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [approvalModal, setApprovalModal] = useState<MaintenanceRequest | null>(null);
  const [rejectionModal, setRejectionModal] = useState<MaintenanceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load saved approval states
  useEffect(() => {
    const saved = localStorage.getItem('faseel-owner-approvals');
    if (saved) setApprovedRequests(JSON.parse(saved));
  }, []);

  function handleApprove(requestId: string) {
    const updated = { ...approvedRequests, [requestId]: 'approved' as const };
    setApprovedRequests(updated);
    localStorage.setItem('faseel-owner-approvals', JSON.stringify(updated));
    setApprovalModal(null);
    toast.success('تمت الموافقة على التكلفة');
  }

  function handleReject(requestId: string) {
    const updated = { ...approvedRequests, [requestId]: 'rejected' as const };
    setApprovedRequests(updated);
    localStorage.setItem('faseel-owner-approvals', JSON.stringify(updated));
    setRejectionModal(null);
    setRejectionReason('');
    toast.error('تم رفض الطلب');
  }

  // Filter logic
  const filteredRequests = allRequests.filter((r) => {
    switch (activeFilter) {
      case 'pending_approval':
        return (
          r.costResponsibility === 'owner' &&
          r.status === 'reviewed' &&
          r.estimatedCost &&
          !approvedRequests[r.id]
        );
      case 'active':
        return !['completed', 'cancelled'].includes(r.status);
      case 'completed':
        return r.status === 'completed';
      default:
        return true;
    }
  });

  // Counts for tabs
  const pendingApprovalCount = allRequests.filter(
    (r) =>
      r.costResponsibility === 'owner' &&
      r.status === 'reviewed' &&
      r.estimatedCost &&
      !approvedRequests[r.id]
  ).length;
  const activeCount = allRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const completedCount = allRequests.filter((r) => r.status === 'completed').length;

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: allRequests.length },
    { key: 'pending_approval', label: 'بانتظار موافقتي', count: pendingApprovalCount },
    { key: 'active', label: 'نشطة', count: activeCount },
    { key: 'completed', label: 'مكتملة', count: completedCount },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">طلبات الصيانة</h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            {allRequests.length} طلب · {pendingApprovalCount} بانتظار الموافقة
          </p>
        </div>
        <WhatsAppButton
          phone={office.phone.replace(/-/g, '')}
          message={`السلام عليكم، أنا المالك ${owner.name}، لدي استفسار عن طلبات الصيانة`}
          label="تواصل مع المكتب"
          size="sm"
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-soft"
      >
        {filterTabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === key
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
            }`}
          >
            <span>{label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
              activeFilter === key
                ? 'bg-[var(--background)]/20 text-[var(--background)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Pending Approvals Alert */}
      {pendingApprovalCount > 0 && activeFilter !== 'pending_approval' && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-800 dark:text-amber-300">
            لديك {pendingApprovalCount} طلب بانتظار موافقتك على التكلفة
          </span>
          <button
            onClick={() => setActiveFilter('pending_approval')}
            className="mr-auto rounded-lg bg-amber-200 dark:bg-amber-800 px-2 py-1 text-[10px] font-medium text-amber-800 dark:text-amber-200"
          >
            عرض
          </button>
        </motion.div>
      )}

      {/* Request List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-soft"
          >
            <Filter className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">لا توجد طلبات في هذا التصنيف</p>
          </motion.div>
        )}

        {filteredRequests.map((request) => {
          const building = getBuildingById(request.buildingId);
          const decision = approvedRequests[request.id];
          const isPendingApproval =
            request.costResponsibility === 'owner' &&
            request.status === 'reviewed' &&
            request.estimatedCost &&
            !decision;

          return (
            <motion.div
              key={request.id}
              variants={itemVariants}
              className={`rounded-2xl border p-4 shadow-soft ${
                isPendingApproval
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{request.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {building?.name} · {categoryLabels[request.category]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                    {statusLabels[request.status]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[request.priority]}`}>
                    {priorityLabels[request.priority]}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mb-2 line-clamp-2 text-xs text-[var(--muted-foreground)]">{request.description}</p>

              {/* Cost & Responsibility */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px]">
                <span className={`rounded-full px-2 py-0.5 font-medium ${costColors[request.costResponsibility]}`}>
                  {costLabels[request.costResponsibility]}
                </span>
                {request.estimatedCost && (
                  <span className="font-medium">
                    التكلفة المقدرة: {formatSAR(request.actualCost || request.estimatedCost)}
                  </span>
                )}
                {decision && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      decision === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {decision === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                  </span>
                )}
              </div>

              {/* Legal Basis */}
              <div className="mb-3 rounded-lg bg-[var(--secondary)] p-2 text-[10px] text-[var(--muted-foreground)]">
                <Scale className="mb-0.5 inline h-3 w-3 ml-1" />
                {request.costLegalBasis}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  <Clock className="inline h-2.5 w-2.5 ml-0.5" />
                  {getRelativeTime(request.updatedAt)}
                </span>

                <div className="flex items-center gap-2">
                  {/* WhatsApp to office */}
                  <WhatsAppButton
                    phone={office.phone.replace(/-/g, '')}
                    message={`استفسار عن طلب الصيانة: ${request.title} - ${building?.name}`}
                    variant="icon"
                    size="sm"
                  />

                  {/* Approve/Reject buttons */}
                  {isPendingApproval && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setApprovalModal(request)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] font-medium text-white"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        موافقة
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRejectionModal(request)}
                        className="flex items-center gap-1 rounded-xl bg-red-500 px-3 py-1.5 text-[10px] font-medium text-white"
                      >
                        <XCircle className="h-3 w-3" />
                        رفض
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Approval Confirmation Modal */}
      <AnimatePresence>
        {approvalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setApprovalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-5 shadow-xl border border-[var(--border)]"
            >
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold">تأكيد الموافقة</h3>
              </div>

              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium">{approvalModal.title}</p>
                <div className="rounded-xl bg-[var(--secondary)] p-3 text-xs">
                  <p className="mb-1 font-bold">التكلفة المقدرة:</p>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {formatSAR(approvalModal.estimatedCost || 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--secondary)] p-3 text-xs">
                  <p className="mb-1 font-bold">الأساس النظامي:</p>
                  <p className="text-[var(--muted-foreground)]">{approvalModal.costLegalBasis}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApprove(approvalModal.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  أوافق على التكلفة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setApprovalModal(null)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Dialog */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => { setRejectionModal(null); setRejectionReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-5 shadow-xl border border-[var(--border)]"
            >
              <div className="mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold">رفض الطلب</h3>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">{rejectionModal.title}</p>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                  التكلفة المقدرة: {formatSAR(rejectionModal.estimatedCost || 0)}
                </p>
                <label className="mb-1 block text-xs font-medium">سبب الرفض</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب الرفض..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(rejectionModal.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-3 text-sm font-medium text-white"
                >
                  <XCircle className="h-4 w-4" />
                  تأكيد الرفض
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRejectionModal(null); setRejectionReason(''); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
