'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  CalendarClock,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  owners,
  units,
  getContractsByOwner,
  getBuildingById,
  getUserById,
  formatSAR,
  formatDate,
  ejarContractStatusLabels,
  ejarContractStatusColors,
  office,
} from '@/lib/mock-data';
// Note: No contract API exists yet. This page uses mock data as placeholder.
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

function getDaysRemaining(endDate: string): number {
  const now = new Date('2026-03-09');
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function OwnerContractsPage() {
  const owner = owners[0];
  const contracts = getContractsByOwner(owner.id);
  const toast = useToast();

  // Summary stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const expiringSoon = contracts.filter((c) => c.status === 'expiring_soon').length;
  const expiredContracts = contracts.filter((c) => c.status === 'expired').length;

  function handleRenewalRequest(_ejarNumber: string, _unitNumber: string) {
    toast.success('تم إرسال طلب التجديد للمكتب');
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">العقود</h1>
          <p className="text-xs text-[var(--muted-foreground)]">عقود إيجار الوحدات المملوكة</p>
        </div>
        <WhatsAppButton
          phone={office.phone.replace(/-/g, '')}
          message={`السلام عليكم، أنا المالك ${owner.name}، أرغب بالاستفسار عن عقود الإيجار`}
          label="تواصل مع المكتب"
          size="sm"
        />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
            <FileText className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold">{totalContracts}</p>
          <p className="text-xs text-[var(--muted-foreground)]">إجمالي العقود</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold">{activeContracts}</p>
          <p className="text-xs text-[var(--muted-foreground)]">ساري</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <CalendarClock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{expiringSoon}</p>
          <p className="text-xs text-[var(--muted-foreground)]">ينتهي قريباً</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shadow-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{expiredContracts}</p>
          <p className="text-xs text-[var(--muted-foreground)]">منتهي</p>
        </motion.div>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-xs dark:border-amber-700 dark:bg-amber-900/20"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-800 dark:text-amber-300">
            لديك {expiringSoon} عقد ينتهي قريباً — يرجى طلب التجديد
          </span>
        </motion.div>
      )}

      {/* Contract List */}
      <div className="space-y-3">
        {contracts.map((contract) => {
          const unit = units.find((u) => u.id === contract.unitId);
          const tenant = getUserById(contract.tenantId);
          const building = getBuildingById(contract.buildingId);
          const daysRemaining = getDaysRemaining(contract.endDate);

          return (
            <motion.div
              key={contract.id}
              variants={itemVariants}
              className={`shadow-soft rounded-2xl border p-4 ${
                contract.status === 'expiring_soon'
                  ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/10'
                  : contract.status === 'expired'
                    ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
                    : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold">{unit?.unitNumber}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{building?.name}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ejarContractStatusColors[contract.status]}`}
                >
                  {ejarContractStatusLabels[contract.status]}
                </span>
              </div>

              {/* Contract Details */}
              <div className="mb-3 grid grid-cols-2 gap-3 text-[10px] text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  <span>{tenant?.name.split(' ').slice(0, 3).join(' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-2.5 w-2.5" />
                  <span className="font-medium text-[var(--foreground)]">
                    {formatSAR(contract.monthlyRent)}/شهر
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" />
                  <span>{contract.ejarNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarClock className="h-2.5 w-2.5" />
                  <span>ينتهي: {formatDate(contract.endDate)}</span>
                </div>
              </div>

              {/* Date range bar */}
              <div className="mb-3 rounded-lg bg-[var(--secondary)] p-2">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-[var(--muted-foreground)]">
                    {formatDate(contract.startDate)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {formatDate(contract.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <Clock className="h-2.5 w-2.5 text-[var(--muted-foreground)]" />
                  <span
                    className={`font-medium ${
                      daysRemaining <= 0
                        ? 'text-red-600 dark:text-red-400'
                        : daysRemaining <= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {daysRemaining <= 0
                      ? `منتهي منذ ${Math.abs(daysRemaining)} يوم`
                      : `${daysRemaining} يوم متبقي`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <WhatsAppButton
                  phone={office.phone.replace(/-/g, '')}
                  message={`أرغب بتجديد عقد ${contract.ejarNumber} للوحدة ${unit?.unitNumber}`}
                  variant="icon"
                  size="sm"
                />

                {(contract.status === 'expiring_soon' || contract.status === 'expired') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleRenewalRequest(contract.ejarNumber, unit?.unitNumber || '')
                    }
                    className="bg-brand-500 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                    طلب تجديد
                  </motion.button>
                )}
              </div>

              {/* Expired Warning */}
              {contract.status === 'expired' && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  <span>هذا العقد منتهي ويحتاج تجديد أو إخلاء</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
