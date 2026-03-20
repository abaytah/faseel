'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  User,
  Building2,
  Home,
  CalendarClock,
  Calendar,
  Wallet,
  Shield,
  Printer,
  MapPin,
} from 'lucide-react';
import {
  tenants,
  units,
  office,
  getBuildingById,
  getUserById,
  ejarContracts,
  formatSAR,
  formatDate,
  tenantContract,
  getDaysUntilContractEnd,
} from '@/lib/mock-data';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function ContractPage() {
  const tenant = tenants[0];
  const tenantUnit = units.find((u) => u.tenantId === tenant.id);
  const building = tenantUnit ? getBuildingById(tenantUnit.buildingId) : null;
  const owner = tenantUnit ? getUserById(tenantUnit.ownerId) : null;
  const contract = ejarContracts.find((c) => c.tenantId === tenant.id && c.unitId === tenantUnit?.id);
  const daysLeft = getDaysUntilContractEnd();

  // Days remaining color
  const daysColor =
    daysLeft > 90
      ? 'text-emerald-600 dark:text-emerald-400'
      : daysLeft > 30
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  const daysRingColor =
    daysLeft > 90
      ? 'ring-emerald-200 dark:ring-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
      : daysLeft > 30
        ? 'ring-amber-200 dark:ring-amber-800 bg-amber-50 dark:bg-amber-900/20'
        : 'ring-red-200 dark:ring-red-800 bg-red-50 dark:bg-red-900/20';

  const ejarNumber = contract?.ejarNumber || tenantContract.ejarNumber;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Back */}
      <motion.div variants={itemVariants}>
        <Link href="/tenant/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة
        </Link>
      </motion.div>

      {/* Ejar Reference — prominent */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
            <FileText className="h-7 w-7 text-brand-500" />
          </div>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">رقم إيجار</p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-brand-500">{ejarNumber}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          <Shield className="h-3 w-3" />
          عقد موثّق في منصة إيجار
        </div>
      </motion.div>

      {/* Days Remaining — prominent countdown */}
      <motion.div variants={itemVariants} className={`rounded-2xl p-5 text-center ring-2 ${daysRingColor}`}>
        <div className="flex items-center justify-center gap-3">
          <CalendarClock className={`h-6 w-6 ${daysColor}`} />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">المتبقي على انتهاء العقد</p>
            <p className={`text-3xl font-bold ${daysColor}`}>{daysLeft} <span className="text-base font-medium">يوم</span></p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>البداية: {formatDate(contract?.startDate || tenantContract.startDate)}</span>
          </div>
          <span>—</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>النهاية: {formatDate(contract?.endDate || tenantContract.endDate)}</span>
          </div>
        </div>
      </motion.div>

      {/* Parties */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-bold">أطراف العقد</h3>
        <div className="space-y-3">
          {/* Tenant */}
          <div className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <User className="h-5 w-5 text-brand-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--muted-foreground)]">المستأجر</p>
              <p className="text-sm font-medium">{tenant.name}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{tenant.phone}</p>
            </div>
          </div>

          {/* Owner */}
          {owner && (
            <div className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[var(--muted-foreground)]">المالك</p>
                <p className="text-sm font-medium">{owner.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{owner.phone}</p>
              </div>
            </div>
          )}

          {/* Office */}
          <div className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--muted-foreground)]">مكتب الإدارة</p>
              <p className="text-sm font-medium">{office.name}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{office.phone} — {office.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Property */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-bold">العقار</h3>
        {tenantUnit && building && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <Home className="h-5 w-5 text-brand-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{tenantUnit.unitNumber}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{building.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-[var(--secondary)] p-3 text-center">
                <p className="text-lg font-bold">{tenantUnit.floor}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">الطابق</p>
              </div>
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
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[var(--secondary)] p-3 text-sm">
              <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-xs text-[var(--muted-foreground)]">{building.district} — {building.city}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Financial */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-bold">التفاصيل المالية</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
            <span className="text-xs text-[var(--muted-foreground)]">الإيجار الشهري</span>
            <span className="text-sm font-bold">{formatSAR(contract?.monthlyRent || tenantContract.monthlyRent)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
            <span className="text-xs text-[var(--muted-foreground)]">الإيجار السنوي</span>
            <span className="text-sm font-bold">{formatSAR(contract?.annualRent || (tenantContract.monthlyRent * 12))}</span>
          </div>
          {contract?.depositAmount && (
            <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
              <span className="text-xs text-[var(--muted-foreground)]">مبلغ التأمين</span>
              <span className="text-sm font-bold">{formatSAR(contract.depositAmount)}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Contract Terms */}
      {contract?.contractTerms && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold">شروط العقد</h3>
          <div className="rounded-xl bg-[var(--secondary)] p-4">
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              {contract.contractTerms}
            </p>
          </div>
          <div className="mt-3 rounded-xl bg-[var(--secondary)] p-4">
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              يلتزم المستأجر بالمحافظة على العين المؤجرة واستخدامها في الغرض المخصص لها. يتحمل المستأجر أعمال الصيانة البسيطة والتلفيات الناتجة عن سوء الاستخدام. يتحمل المالك أعمال الصيانة الهيكلية والأنظمة الرئيسية للمبنى.
            </p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={itemVariants} className="space-y-3">
        {/* WhatsApp for renewal */}
        <div className="flex gap-3">
          <WhatsAppButton
            phone={office.phone.replace(/-/g, '')}
            message={`أرغب بتجديد العقد رقم ${ejarNumber}`}
            label="طلب تجديد العقد"
            variant="primary"
            size="lg"
            className="flex-1 justify-center rounded-xl"
          />
        </div>

        {/* Print contract */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 text-sm font-medium transition-colors hover:bg-[var(--secondary)]"
        >
          <Printer className="h-4 w-4" />
          <span>طباعة العقد</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
