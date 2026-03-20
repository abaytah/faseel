// ============================================================
// Faseel — Shared format utilities & label maps
// Extracted from mock-data.ts for use with real API data
// ============================================================

// --- Status Labels ---

export type RequestStatus =
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'APPLIANCE'
  | 'COSMETIC'
  | 'PAINTING'
  | 'CARPENTRY'
  | 'PEST_CONTROL'
  | 'ELEVATOR'
  | 'SECURITY'
  | 'CLEANING'
  | 'OTHER';

export const statusLabels: Record<string, string> = {
  SUBMITTED: 'تم الإرسال',
  REVIEWED: 'قيد المراجعة',
  ASSIGNED: 'تم التعيين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

export const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  REVIEWED: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ASSIGNED: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  CANCELLED: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'عالي',
  URGENT: 'عاجل',
};

export const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export const categoryLabels: Record<string, string> = {
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

export const statusPipeline: RequestStatus[] = [
  'SUBMITTED',
  'REVIEWED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
];

export const progressMap: Record<string, number> = {
  SUBMITTED: 15,
  REVIEWED: 30,
  ASSIGNED: 50,
  IN_PROGRESS: 75,
  COMPLETED: 100,
  CANCELLED: 0,
};

// --- Format Functions ---

export function formatSAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateStr: string | Date): string {
  const now = new Date();
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  return formatDate(dateStr);
}

// Map API category to the old mock category for UI mapping
export function mapCategoryToIcon(category: string): string {
  const map: Record<string, string> = {
    PLUMBING: 'plumbing',
    ELECTRICAL: 'electrical',
    HVAC: 'hvac',
    STRUCTURAL: 'structural',
    APPLIANCE: 'appliance',
    COSMETIC: 'cosmetic',
    PAINTING: 'cosmetic',
    CARPENTRY: 'structural',
    PEST_CONTROL: 'general',
    ELEVATOR: 'elevator',
    SECURITY: 'general',
    CLEANING: 'general',
    OTHER: 'general',
  };
  return map[category] ?? 'general';
}

// Priority dot color class
export function getPriorityDotColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500 animate-pulse';
    case 'HIGH':
      return 'bg-orange-500';
    case 'MEDIUM':
      return 'bg-sky-500';
    default:
      return 'bg-slate-400';
  }
}
