'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Building2,
  Wrench,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  DollarSign,
  BarChart3,
  PieChart,
  CalendarClock,
  ShieldCheck,
  XCircle,
  CircleDot,
  Receipt,
  Scale,
  RefreshCw,
  Percent,
  Users,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  owners,
  units,
  buildings,
  getRequestsByOwner,
  getHOAFeesByUnit,
  getBuildingById,
  getUserById,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  costLabels,
  costColors,
  formatSAR,
  formatDate,
  formatDateTime,
  getRelativeTime,
  categoryLabels,
  getContractsByOwner,
  getOwnerMonthlyFinances,
  ejarContractStatusLabels,
  ejarContractStatusColors,
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

export default function OwnerDashboardPage() {
  // Simulated owner: Ahmed Al-Otaibi
  const owner = owners[0];
  const ownerUnits = units.filter((u) => u.ownerId === owner.id);
  const requests = getRequestsByOwner(owner.id);
  const activeRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const occupiedUnits = ownerUnits.filter((u) => u.status === 'occupied');
  const totalMonthlyIncome = occupiedUnits.reduce((sum, u) => sum + u.monthlyRent, 0);
  const occupancyRate = ownerUnits.length > 0 ? Math.round((occupiedUnits.length / ownerUnits.length) * 100) : 0;

  // Costs
  const ownerCostRequests = requests.filter((r) => r.costResponsibility === 'owner' && r.status !== 'cancelled');
  const totalMaintenanceCost = ownerCostRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
  const managementFeeRate = 0.07;
  const managementFee = Math.round(totalMonthlyIncome * managementFeeRate);

  // HOA
  const allHOAFees = ownerUnits.flatMap((u) => getHOAFeesByUnit(u.id));
  const paidHOA = allHOAFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const overdueHOA = allHOAFees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);
  const outstandingHOA = allHOAFees.filter((f) => f.status === 'outstanding').reduce((sum, f) => sum + f.amount, 0);
  const totalHOACost = paidHOA + overdueHOA + outstandingHOA;

  // Net income
  const netIncome = totalMonthlyIncome - totalMaintenanceCost - managementFee;

  // Monthly finances
  const monthlyFinances = getOwnerMonthlyFinances(owner.id);
  const ytdIncome = monthlyFinances.reduce((sum, m) => sum + m.income, 0);
  const ytdExpenses = monthlyFinances.reduce((sum, m) => sum + m.maintenance + m.hoaFees + m.managementFee, 0);
  const ytdNet = ytdIncome - ytdExpenses;

  // Ejar contracts
  const contracts = getContractsByOwner(owner.id);
  const expiringSoonContracts = contracts.filter((c) => c.status === 'expiring_soon');

  // Group units by building for per-building cards
  const buildingGroups = ownerUnits.reduce((acc, unit) => {
    if (!acc[unit.buildingId]) acc[unit.buildingId] = [];
    acc[unit.buildingId].push(unit);
    return acc;
  }, {} as Record<string, typeof ownerUnits>);

  const toast = useToast();

  // Interactive state
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [approvalModal, setApprovalModal] = useState<MaintenanceRequest | null>(null);
  const [approvedRequests, setApprovedRequests] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [reportToast, setReportToast] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'hoa' | 'contracts'>('overview');

  // Load saved approval states from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('faseel-owner-approvals');
    if (saved) setApprovedRequests(JSON.parse(saved));
  }, []);

  function handleApprove(requestId: string) {
    const updated = { ...approvedRequests, [requestId]: 'approved' as const };
    setApprovedRequests(updated);
    localStorage.setItem('faseel-owner-approvals', JSON.stringify(updated));
    setApprovalModal(null);
  }

  function handleReject(requestId: string) {
    const updated = { ...approvedRequests, [requestId]: 'rejected' as const };
    setApprovedRequests(updated);
    localStorage.setItem('faseel-owner-approvals', JSON.stringify(updated));
    setApprovalModal(null);
  }

  function handleDownloadReport() {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      toast.success('تم إعداد التقرير بنجاح');
      setReportToast(true);
      setTimeout(() => setReportToast(false), 3000);
    }, 2000);
  }

  // Pending cost approvals (owner cost, not yet approved/rejected)
  const pendingApprovals = requests.filter(
    (r) => r.costResponsibility === 'owner' && r.estimatedCost && !approvedRequests[r.id] && r.status !== 'cancelled'
  );

  // Max value for bar chart
  const maxMonthValue = Math.max(...monthlyFinances.map((m) => m.income));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header with WhatsApp */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <p className="text-xs text-[var(--muted-foreground)]">{owner.name}</p>
        </div>
        <WhatsAppButton
          phone={office.phone.replace(/-/g, '')}
          message={`السلام عليكم، أنا المالك ${owner.name}`}
          label="تواصل مع المكتب"
          size="sm"
        />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-soft">
        {[
          { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { key: 'maintenance', label: 'الصيانة', icon: Wrench },
          { key: 'hoa', label: 'اتحاد الملاك', icon: Receipt },
          { key: 'contracts', label: 'العقود', icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              activeTab === key
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </motion.div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
                <Home className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-xl font-bold">{ownerUnits.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">وحدة</p>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold">{formatSAR(totalMonthlyIncome)}</p>
              <p className="text-xs text-[var(--muted-foreground)]">الدخل الشهري</p>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                <Percent className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-xl font-bold">{occupancyRate}%</p>
              <p className="text-xs text-[var(--muted-foreground)]">نسبة الإشغال</p>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatSAR(netIncome)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">صافي الدخل</p>
            </motion.div>
          </div>

          {/* YTD Summary */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-bold">ملخص من بداية السنة</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatSAR(ytdIncome)}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">إجمالي الدخل</p>
              </div>
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">{formatSAR(ytdExpenses)}</p>
                <p className="text-[10px] text-red-600 dark:text-red-400">إجمالي المصاريف</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 p-3 text-center">
                <p className={`text-sm font-bold ${ytdNet >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-red-700 dark:text-red-300'}`}>
                  {formatSAR(ytdNet)}
                </p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400">صافي الربح</p>
              </div>
            </div>
          </motion.div>

          {/* Income vs Expenses Chart */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">الدخل مقابل المصاريف</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  الدخل
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  المصاريف
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {monthlyFinances.map((m) => {
                const incomeHeight = maxMonthValue > 0 ? (m.income / maxMonthValue) * 120 : 0;
                const totalExpense = m.maintenance + m.hoaFees + m.managementFee;
                const expenseHeight = maxMonthValue > 0 ? (totalExpense / maxMonthValue) * 120 : 0;
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 120 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: incomeHeight }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="w-3 rounded-t bg-emerald-500 dark:bg-emerald-400"
                        title={`${formatSAR(m.income)}`}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: expenseHeight }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="w-3 rounded-t bg-red-400 dark:bg-red-500"
                        title={`${formatSAR(totalExpense)}`}
                      />
                    </div>
                    <span className="text-[9px] text-[var(--muted-foreground)]">{m.monthLabel}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-bold">تفصيل المصاريف</h3>
            {(() => {
              const currentMonth = monthlyFinances[monthlyFinances.length - 1];
              const expenses = [
                { label: 'الصيانة', amount: currentMonth.maintenance, color: 'bg-orange-500' },
                { label: 'رسوم اتحاد الملاك', amount: currentMonth.hoaFees, color: 'bg-violet-500' },
                { label: `عمولة الإدارة (${managementFeeRate * 100}%)`, amount: currentMonth.managementFee, color: 'bg-sky-500' },
              ];
              const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

              return (
                <div className="space-y-3">
                  {expenses.map((e) => {
                    const pct = totalExpense > 0 ? Math.round((e.amount / totalExpense) * 100) : 0;
                    return (
                      <div key={e.label}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-[var(--muted-foreground)]">{e.label}</span>
                          <span className="font-medium">{formatSAR(e.amount)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--secondary)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className={`h-2 rounded-full ${e.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 text-xs">
                    <span className="font-medium">إجمالي المصاريف الشهرية</span>
                    <span className="font-bold">{formatSAR(totalExpense)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                    <Scale className="h-3 w-3" />
                    <span>عمولة الإدارة = {managementFeeRate * 100}% من إجمالي الإيجار المحصّل ({formatSAR(totalMonthlyIncome)} x {managementFeeRate * 100}% = {formatSAR(managementFee)})</span>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Per-Building Cards */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">العقارات ({Object.keys(buildingGroups).length})</h3>
              <Link href="/owner/properties" className="flex items-center gap-1 text-[10px] font-medium text-brand-500 hover:text-brand-600">
                <span>عرض الكل</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {Object.entries(buildingGroups).map(([buildingId, bUnits]) => {
                const building = getBuildingById(buildingId);
                if (!building) return null;
                const bOccupied = bUnits.filter((u) => u.status === 'occupied');
                const bRent = bOccupied.reduce((sum, u) => sum + u.monthlyRent, 0);
                const bRequests = requests.filter((r) => r.buildingId === buildingId);
                const bActiveRequests = bRequests.filter((r) => !['completed', 'cancelled'].includes(r.status));
                const bHOA = bUnits.flatMap((u) => getHOAFeesByUnit(u.id));
                const bOverdueHOA = bHOA.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);
                const isExpanded = expandedBuilding === buildingId;

                return (
                  <motion.div
                    key={buildingId}
                    layout
                    className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedBuilding(isExpanded ? null : buildingId)}
                      className="w-full p-4 text-start"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                            <Building2 className="h-5 w-5 text-brand-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{building.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{building.district}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-xs font-bold">{bOccupied.length}/{bUnits.length}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">مشغولة</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold">{formatSAR(bRent)}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">الإيجار</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{bActiveRequests.length}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">طلبات</p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${bOverdueHOA > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {bOverdueHOA > 0 ? formatSAR(bOverdueHOA) : 'مسدد'}
                          </p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">رسوم الملاك</p>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[var(--border)] px-4 pb-4"
                        >
                          <div className="mt-3 space-y-2">
                            {bUnits.map((unit) => {
                              const tenant = unit.tenantId ? getUserById(unit.tenantId) : null;
                              const unitReqs = requests.filter((r) => r.unitId === unit.id);
                              const unitActive = unitReqs.filter((r) => !['completed', 'cancelled'].includes(r.status));
                              return (
                                <div key={unit.id} className="rounded-lg bg-[var(--card)] p-3 border border-[var(--border)]">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold">{unit.unitNumber}</p>
                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                                      unit.status === 'occupied' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                                      unit.status === 'vacant' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                                      'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                      {unit.status === 'occupied' ? 'مشغولة' : unit.status === 'vacant' ? 'شاغرة' : 'صيانة'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 text-[10px] text-[var(--muted-foreground)]">
                                    <span>الإيجار: <span className="font-medium text-[var(--foreground)]">{formatSAR(unit.monthlyRent)}</span></span>
                                    <span>{unit.area} م² · {unit.rooms} غرف</span>
                                    {unitActive.length > 0 && (
                                      <span className="text-orange-600 dark:text-orange-400">{unitActive.length} طلب نشط</span>
                                    )}
                                  </div>
                                  {tenant && (
                                    <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                                      المستأجر: <span className="font-medium text-[var(--foreground)]">{tenant.name.split(' ').slice(0, 3).join(' ')}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links Row */}
          <motion.div variants={itemVariants} className="flex gap-3">
            {expiringSoonContracts.length > 0 && (
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs">
                <CalendarClock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-800 dark:text-amber-300">
                  {expiringSoonContracts.length} عقد ينتهي خلال ٦٠ يوم
                </span>
              </div>
            )}
            {pendingApprovals.length > 0 && (
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-300">
                  {pendingApprovals.length} موافقة تكلفة معلقة
                </span>
              </div>
            )}
          </motion.div>

          {/* Download Report */}
          <motion.div variants={itemVariants}>
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft text-sm font-medium hover:bg-[var(--secondary)] transition-colors disabled:opacity-60"
            >
              {reportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري إعداد التقرير...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>تحميل تقرير الشهر</span>
                </>
              )}
            </button>
          </motion.div>
        </>
      )}

      {/* === MAINTENANCE TAB === */}
      {activeTab === 'maintenance' && (
        <>
          {/* Pending Cost Approvals */}
          {pendingApprovals.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">موافقات معلقة ({pendingApprovals.length})</h3>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map((req) => {
                  const building = getBuildingById(req.buildingId);
                  return (
                    <div key={req.id} className="rounded-xl bg-[var(--card)] p-4 border border-[var(--border)]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold">{req.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{building?.name} · {req.locationLabel}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[req.priority]}`}>
                          {priorityLabels[req.priority]}
                        </span>
                      </div>
                      <div className="mb-3 rounded-lg bg-[var(--secondary)] p-2 text-[10px] text-[var(--muted-foreground)]">
                        <Scale className="mb-1 inline h-3 w-3" /> {req.costLegalBasis}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{formatSAR(req.estimatedCost || 0)}</p>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setApprovalModal(req)}
                            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            موافقة
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleReject(req.id)}
                            className="flex items-center gap-1 rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white"
                          >
                            <XCircle className="h-3 w-3" />
                            رفض
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* All Maintenance Requests */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-bold">جميع طلبات الصيانة ({requests.length})</h3>
            <div className="space-y-3">
              {requests.map((request, index) => {
                const building = getBuildingById(request.buildingId);
                const decision = approvedRequests[request.id];
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{building?.name} · {categoryLabels[request.category]}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                      </div>
                    </div>

                    <p className="mb-2 line-clamp-2 text-xs text-[var(--muted-foreground)]">{request.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${costColors[request.costResponsibility]}`}>
                        {costLabels[request.costResponsibility]}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${priorityColors[request.priority]}`}>
                        {priorityLabels[request.priority]}
                      </span>
                      {request.estimatedCost && (
                        <span className="font-medium">
                          التكلفة: {formatSAR(request.actualCost || request.estimatedCost)}
                        </span>
                      )}
                      {decision && (
                        <span className={`rounded-full px-2 py-0.5 font-medium ${
                          decision === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {decision === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                      <Scale className="inline h-2.5 w-2.5 ml-1" />
                      {request.costLegalBasis.slice(0, 80)}...
                    </div>

                    <div className="mt-1 text-end text-[10px] text-[var(--muted-foreground)]">
                      {getRelativeTime(request.updatedAt)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {/* === HOA TAB === */}
      {activeTab === 'hoa' && (
        <>
          {/* HOA Summary */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-bold">ملخص رسوم اتحاد الملاك</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatSAR(paidHOA)}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">مدفوع</p>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatSAR(outstandingHOA)}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">مستحق</p>
              </div>
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">{formatSAR(overdueHOA)}</p>
                <p className="text-[10px] text-red-600 dark:text-red-400">متأخر</p>
              </div>
            </div>

            {/* HOA Fund Balance Indicator */}
            <div className="mb-4 rounded-xl bg-[var(--secondary)] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--muted-foreground)]">إجمالي الرسوم هذا العام</span>
                <span className="font-bold">{formatSAR(totalHOACost)}</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--card)] overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${totalHOACost > 0 ? (paidHOA / totalHOACost) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-amber-400 transition-all"
                    style={{ width: `${totalHOACost > 0 ? (outstandingHOA / totalHOACost) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${totalHOACost > 0 ? (overdueHOA / totalHOACost) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {overdueHOA > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <span>لديك رسوم متأخرة بمبلغ {formatSAR(overdueHOA)} -- يرجى السداد لتجنب الغرامات</span>
              </div>
            )}
          </motion.div>

          {/* Per-Unit HOA Detail */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-bold">تفصيل حسب الوحدة</h3>
            <div className="space-y-3">
              {ownerUnits.map((unit) => {
                const unitFees = getHOAFeesByUnit(unit.id);
                const building = getBuildingById(unit.buildingId);
                if (unitFees.length === 0) return null;
                return (
                  <div key={unit.id} className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold">{unit.unitNumber}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{building?.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {unitFees.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--muted-foreground)]">{fee.period}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatSAR(fee.amount)}</span>
                            <span className={`rounded-full px-1.5 py-0.5 font-medium ${
                              fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                              fee.status === 'outstanding' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {fee.status === 'paid' ? 'مدفوع' : fee.status === 'outstanding' ? 'مستحق' : 'متأخر'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {/* === CONTRACTS TAB === */}
      {activeTab === 'contracts' && (
        <>
          {/* Expiring Soon Highlight */}
          {expiringSoonContracts.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  عقود تنتهي خلال ٦٠ يوم ({expiringSoonContracts.length})
                </h3>
              </div>
              <div className="space-y-2">
                {expiringSoonContracts.map((c) => {
                  const unit = units.find((u) => u.id === c.unitId);
                  const tenant = getUserById(c.tenantId);
                  const building = getBuildingById(c.buildingId);
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-xl bg-[var(--card)] p-3 border border-[var(--border)]">
                      <div>
                        <p className="text-xs font-bold">{unit?.unitNumber} · {building?.name}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{tenant?.name}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">{formatDate(c.endDate)}</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-1 flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1 text-[10px] font-medium text-white"
                        >
                          <RefreshCw className="h-2.5 w-2.5" />
                          تجديد
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* All Contracts */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">عقود إيجار ({contracts.length})</h3>
              <Link href="/owner/contracts" className="flex items-center gap-1 text-[10px] font-medium text-brand-500 hover:text-brand-600">
                <span>عرض الكل</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {contracts.map((contract, index) => {
                const unit = units.find((u) => u.id === contract.unitId);
                const tenant = getUserById(contract.tenantId);
                const building = getBuildingById(contract.buildingId);
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    className={`rounded-xl border p-4 ${
                      contract.status === 'expiring_soon'
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                        : contract.status === 'expired'
                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-[var(--border)] bg-[var(--secondary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold">{unit?.unitNumber}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{building?.name}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ejarContractStatusColors[contract.status]}`}>
                        {ejarContractStatusLabels[contract.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        <span>{tenant?.name.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-2.5 w-2.5" />
                        <span className="font-medium text-[var(--foreground)]">{formatSAR(contract.monthlyRent)}/شهر</span>
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

                    {contract.status === 'expiring_soon' && (
                      <div className="mt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 py-2 text-xs font-medium text-white"
                        >
                          <RefreshCw className="h-3 w-3" />
                          طلب تجديد العقد
                        </motion.button>
                      </div>
                    )}
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

          {/* Owner Report */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">معاينة التقرير الشهري</h3>
            <div className="space-y-2 rounded-xl bg-[var(--secondary)] p-3 text-xs text-[var(--muted-foreground)]">
              <p>يتضمن التقرير:</p>
              <ul className="mr-4 list-disc space-y-1">
                <li>ملخص الدخل والمصاريف الشهري</li>
                <li>تفصيل الإيجارات حسب الوحدة</li>
                <li>حالة رسوم اتحاد الملاك</li>
                <li>طلبات الصيانة والتكاليف</li>
                <li>حالة العقود وتواريخ الانتهاء</li>
                <li>كشف حساب عمولة الإدارة</li>
              </ul>
            </div>
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] py-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {reportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري إعداد التقرير...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  تحميل تقرير الشهر
                </>
              )}
            </button>
          </motion.div>
        </>
      )}

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
                  <p className="text-lg font-bold text-[var(--foreground)]">{formatSAR(approvalModal.estimatedCost || 0)}</p>
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

      {/* Toast Notification */}
      <AnimatePresence>
        {reportToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl bg-emerald-500 p-4 text-center text-sm font-medium text-white shadow-lg lg:bottom-6"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>تم إعداد التقرير بنجاح — جاري التحميل</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
