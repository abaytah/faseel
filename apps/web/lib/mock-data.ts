// ============================================================
// Faseel — Mock Data (Culturally-Authentic Saudi Arabia)
// ============================================================

// --- Types ---

export type UserRole = 'office' | 'owner' | 'tenant' | 'provider';

export interface Office {
  id: string;
  name: string;
  nameEn: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  licenseNumber: string;
  buildingCount: number;
  unitCount: number;
}

export interface Building {
  id: string;
  officeId: string;
  name: string;
  nameEn: string;
  type: 'residential' | 'commercial';
  district: string;
  city: string;
  unitCount: number;
  occupiedUnits: number;
  yearBuilt: number;
  floors: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasGenerator: boolean;
  imageUrl?: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number;
  area: number; // sqm
  rooms: number;
  bathrooms: number;
  monthlyRent: number; // SAR
  status: 'occupied' | 'vacant' | 'maintenance';
  ownerId: string;
  tenantId?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nationalId?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
  phone: string;
  email: string;
  rating: number;
  completedJobs: number;
  responseTime: string;
  city: string;
  licenseNumber: string;
  isAvailable?: boolean;
}

export type RequestStatus =
  | 'submitted'
  | 'reviewed'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type CostResponsibility = 'owner' | 'tenant' | 'hoa' | 'pending_review';

export type RequestCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'structural'
  | 'appliance'
  | 'cosmetic'
  | 'elevator'
  | 'fire_safety'
  | 'generator'
  | 'general'
  | 'painting'
  | 'cleaning'
  | 'pest_control';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  subcategory: string;
  buildingId: string;
  unitId?: string;
  location: 'unit' | 'common_area' | 'building_system';
  locationLabel: string;
  status: RequestStatus;
  priority: RequestPriority;
  costResponsibility: CostResponsibility;
  costLegalBasis: string;
  estimatedCost?: number;
  actualCost?: number;
  reportedById: string;
  assignedProviderId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  statusLog: StatusLogEntry[];
}

export interface StatusLogEntry {
  status: RequestStatus;
  timestamp: string;
  note: string;
  userId?: string;
}

export interface HOAFee {
  id: string;
  unitId: string;
  buildingId: string;
  period: string;
  amount: number;
  status: 'paid' | 'outstanding' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

export interface CostRule {
  id: string;
  category: string;
  responsibility: CostResponsibility;
  legalBasis: string;
  description: string;
}

// --- Category Labels ---

export const categoryLabels: Record<RequestCategory, string> = {
  plumbing: 'سباكة',
  electrical: 'كهرباء',
  hvac: 'تكييف',
  structural: 'هيكلي',
  appliance: 'أجهزة',
  cosmetic: 'تجميلي',
  elevator: 'مصاعد',
  fire_safety: 'سلامة',
  generator: 'مولدات',
  general: 'عام',
  painting: 'دهان',
  cleaning: 'نظافة',
  pest_control: 'مكافحة حشرات',
};

export const categoryIcons: Record<RequestCategory, string> = {
  plumbing: 'Droplets',
  electrical: 'Zap',
  hvac: 'Wind',
  structural: 'Hammer',
  appliance: 'Refrigerator',
  cosmetic: 'Paintbrush',
  elevator: 'ArrowUpDown',
  fire_safety: 'ShieldAlert',
  generator: 'Power',
  general: 'Wrench',
  painting: 'Paintbrush',
  cleaning: 'Sparkles',
  pest_control: 'Bug',
};

export const statusLabels: Record<RequestStatus, string> = {
  submitted: 'تم الإرسال',
  reviewed: 'قيد المراجعة',
  assigned: 'تم التعيين',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const statusColors: Record<RequestStatus, string> = {
  submitted: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  reviewed: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  assigned: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  in_progress: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const priorityLabels: Record<RequestPriority, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  urgent: 'عاجل',
};

export const priorityColors: Record<RequestPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  urgent: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export const costLabels: Record<CostResponsibility, string> = {
  owner: 'على المالك',
  tenant: 'على المستأجر',
  hoa: 'صندوق الملاك',
  pending_review: 'قيد المراجعة',
};

export const costColors: Record<CostResponsibility, string> = {
  owner: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  tenant: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  hoa: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  pending_review: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// --- Office ---

export const office: Office = {
  id: 'off-001',
  name: 'مكتب الجزيرة العقاري',
  nameEn: 'Al Jazeera Real Estate Office',
  phone: '012-654-8900',
  email: 'info@aljazeera-re.com.sa',
  city: 'جدة',
  district: 'حي الروضة',
  licenseNumber: '7200045891',
  buildingCount: 8,
  unitCount: 124,
};

// --- Buildings ---

export const buildings: Building[] = [
  {
    id: 'bld-001',
    officeId: 'off-001',
    name: 'برج النخيل',
    nameEn: 'Al Nakheel Tower',
    type: 'residential',
    district: 'حي الصفا',
    city: 'جدة',
    unitCount: 24,
    occupiedUnits: 20,
    yearBuilt: 2019,
    floors: 8,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
  {
    id: 'bld-002',
    officeId: 'off-001',
    name: 'عمارة الياسمين',
    nameEn: 'Al Yasmin Building',
    type: 'residential',
    district: 'حي الحمراء',
    city: 'جدة',
    unitCount: 12,
    occupiedUnits: 10,
    yearBuilt: 2015,
    floors: 4,
    hasElevator: false,
    hasParking: true,
    hasGenerator: false,
  },
  {
    id: 'bld-003',
    officeId: 'off-001',
    name: 'مجمع الواحة التجاري',
    nameEn: 'Al Waha Commercial Complex',
    type: 'commercial',
    district: 'حي السلامة',
    city: 'جدة',
    unitCount: 8,
    occupiedUnits: 6,
    yearBuilt: 2021,
    floors: 3,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
  {
    id: 'bld-004',
    officeId: 'off-001',
    name: 'برج الياقوت',
    nameEn: 'Al Yaqoot Tower',
    type: 'residential',
    district: 'حي الروضة',
    city: 'جدة',
    unitCount: 24,
    occupiedUnits: 18,
    yearBuilt: 2020,
    floors: 8,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
  {
    id: 'bld-005',
    officeId: 'off-001',
    name: 'مجمع الريان التجاري',
    nameEn: 'Al Rayan Commercial Complex',
    type: 'commercial',
    district: 'حي الحمراء',
    city: 'جدة',
    unitCount: 16,
    occupiedUnits: 12,
    yearBuilt: 2022,
    floors: 4,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
  {
    id: 'bld-006',
    officeId: 'off-001',
    name: 'عمارة السلام',
    nameEn: 'Al Salam Building',
    type: 'residential',
    district: 'حي النزهة',
    city: 'جدة',
    unitCount: 12,
    occupiedUnits: 9,
    yearBuilt: 2016,
    floors: 4,
    hasElevator: false,
    hasParking: true,
    hasGenerator: false,
  },
  {
    id: 'bld-007',
    officeId: 'off-001',
    name: 'أبراج المروج',
    nameEn: 'Al Murooj Towers',
    type: 'residential',
    district: 'حي المروج',
    city: 'جدة',
    unitCount: 32,
    occupiedUnits: 26,
    yearBuilt: 2023,
    floors: 10,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
  {
    id: 'bld-008',
    officeId: 'off-001',
    name: 'مجمع الأندلس',
    nameEn: 'Al Andalus Complex',
    type: 'commercial',
    district: 'حي الفيصلية',
    city: 'جدة',
    unitCount: 20,
    occupiedUnits: 15,
    yearBuilt: 2018,
    floors: 5,
    hasElevator: true,
    hasParking: true,
    hasGenerator: true,
  },
];

// --- Users ---

export const owners: User[] = [
  {
    id: 'own-001',
    name: 'أحمد بن محمد العتيبي',
    phone: '055-312-8844',
    email: 'ahmad.otaibi@email.com',
    role: 'owner',
    nationalId: '1089XXXXXX',
  },
  {
    id: 'own-002',
    name: 'فهد بن عبدالله الشمري',
    phone: '054-776-2190',
    email: 'fahad.shamri@email.com',
    role: 'owner',
    nationalId: '1078XXXXXX',
  },
  {
    id: 'own-003',
    name: 'نورة بنت سعد القحطاني',
    phone: '050-445-3377',
    email: 'noura.qahtani@email.com',
    role: 'owner',
    nationalId: '1095XXXXXX',
  },
  {
    id: 'own-004',
    name: 'سارة بنت خالد الحربي',
    phone: '056-881-4420',
    email: 'sarah.harbi@email.com',
    role: 'owner',
    nationalId: '1092XXXXXX',
  },
  {
    id: 'own-005',
    name: 'عبدالرحمن بن سعد العتيبي',
    phone: '966559214873',
    email: 'abdulrahman.otaibi@email.com',
    role: 'owner',
    nationalId: '1087XXXXXX',
  },
  {
    id: 'own-006',
    name: 'فهد بن خالد الغامدي',
    phone: '966551387462',
    email: 'fahad.ghamdi@email.com',
    role: 'owner',
    nationalId: '1091XXXXXX',
  },
  {
    id: 'own-007',
    name: 'سلطان بن ناصر القحطاني',
    phone: '966504821936',
    email: 'sultan.qahtani@email.com',
    role: 'owner',
    nationalId: '1084XXXXXX',
  },
  {
    id: 'own-008',
    name: 'محمد بن عبدالله الشهري',
    phone: '966567293841',
    email: 'mohammed.shehri@email.com',
    role: 'owner',
    nationalId: '1093XXXXXX',
  },
  {
    id: 'own-009',
    name: 'عبدالعزيز بن فيصل المطيري',
    phone: '966538471920',
    email: 'abdulaziz.mutairi@email.com',
    role: 'owner',
    nationalId: '1086XXXXXX',
  },
  {
    id: 'own-010',
    name: 'ياسر بن أحمد الزهراني',
    phone: '966542918374',
    email: 'yasser.zahrani@email.com',
    role: 'owner',
    nationalId: '1090XXXXXX',
  },
];

export const tenants: User[] = [
  {
    id: 'ten-001',
    name: 'خالد بن سعود المالكي',
    phone: '053-298-7650',
    email: 'khaled.malki@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-002',
    name: 'مريم بنت علي الزهراني',
    phone: '055-114-6633',
    email: 'maryam.zahrani@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-003',
    name: 'عبدالرحمن بن فيصل الدوسري',
    phone: '050-887-3214',
    email: 'abdulrahman.dosari@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-004',
    name: 'هند بنت ناصر العمري',
    phone: '054-330-9876',
    email: 'hind.omari@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-005',
    name: 'سلطان بن فارس الغامدي',
    phone: '056-442-1155',
    email: 'sultan.ghamdi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-006',
    name: 'ريم بنت عبدالعزيز المطيري',
    phone: '053-775-8800',
    email: 'reem.mutairi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-007',
    name: 'سعد بن محمد القرني',
    phone: '966553918274',
    email: 'saad.qarni@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-008',
    name: 'ناصر بن علي الحربي',
    phone: '966507482913',
    email: 'nasser.harbi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-009',
    name: 'تركي بن سلمان العنزي',
    phone: '966541829370',
    email: 'turki.anazi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-010',
    name: 'فيصل بن خالد الدوسري',
    phone: '966558293741',
    email: 'faisal.dosari@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-011',
    name: 'بندر بن عبدالرحمن الشمري',
    phone: '966504718293',
    email: 'bandar.shamri@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-012',
    name: 'عادل بن سعود البلوي',
    phone: '966562847193',
    email: 'adel.balawi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-013',
    name: 'أحمد محمد حسن',
    phone: '966539182740',
    email: 'ahmed.m.hassan@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-014',
    name: 'عمر عبدالله إبراهيم',
    phone: '966557194823',
    email: 'omar.ibrahim@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-015',
    name: 'محمد أشرف خان',
    phone: '966548271930',
    email: 'ashraf.khan@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-016',
    name: 'عبدالرحيم رشيد أحمد',
    phone: '966531749280',
    email: 'rahim.ahmed@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-017',
    name: 'مشعل بن فهد الحربي',
    phone: '966509384712',
    email: 'mishal.harbi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-018',
    name: 'عبدالله بن سعيد القرني',
    phone: '966554829173',
    email: 'abdullah.qarni@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-019',
    name: 'خالد عثمان الأمين',
    phone: '966547382910',
    email: 'khaled.osman@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-020',
    name: 'ياسر بن محمد الدوسري',
    phone: '966538194720',
    email: 'yasser.dosari@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-021',
    name: 'مازن بن عبدالعزيز العنزي',
    phone: '966501847293',
    email: 'mazen.anazi@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-022',
    name: 'حسن علي محمود',
    phone: '966569281734',
    email: 'hassan.ali@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-023',
    name: 'سامي بن ناصر الشمري',
    phone: '966552749183',
    email: 'sami.shamri@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-024',
    name: 'طارق أحمد عبدالله',
    phone: '966543918270',
    email: 'tariq.ahmed@email.com',
    role: 'tenant',
  },
  {
    id: 'ten-025',
    name: 'وليد بن سلطان البلوي',
    phone: '966507293841',
    email: 'waleed.balawi@email.com',
    role: 'tenant',
  },
];

// --- Service Providers ---

export const serviceProviders: ServiceProvider[] = [
  // --- Original 4 providers ---
  {
    id: 'sp-001',
    name: 'مؤسسة الفيصل للتكييف والتبريد',
    nameEn: 'Al Faisal HVAC',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '012-645-3200',
    email: 'info@alfaisal-hvac.com',
    rating: 4.7,
    completedJobs: 234,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500123456',
    isAvailable: true,
  },
  {
    id: 'sp-002',
    name: 'شركة البناء المتين للسباكة',
    nameEn: 'Al Bina Al Mateen Plumbing',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '012-678-9100',
    email: 'info@albina-plumbing.com',
    rating: 4.5,
    completedJobs: 189,
    responseTime: 'خلال ٣ ساعات',
    city: 'جدة',
    licenseNumber: 'CR-4500789012',
    isAvailable: true,
  },
  {
    id: 'sp-003',
    name: 'مؤسسة النور للكهرباء',
    nameEn: 'Al Noor Electrical',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '012-690-4455',
    email: 'info@alnoor-elec.com',
    rating: 4.8,
    completedJobs: 312,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500345678',
    isAvailable: true,
  },
  {
    id: 'sp-004',
    name: 'شركة الأمان للصيانة العامة',
    nameEn: 'Al Aman General Maintenance',
    specialty: 'صيانة عامة',
    specialtyEn: 'General Maintenance',
    phone: '012-712-8877',
    email: 'info@alaman-maint.com',
    rating: 4.2,
    completedJobs: 156,
    responseTime: 'خلال ٤ ساعات',
    city: 'جدة',
    licenseNumber: 'CR-4500901234',
    isAvailable: true,
  },

  // --- Plumbing (سباكة) ---
  {
    id: 'sp-005',
    name: 'مؤسسة الفيصل للسباكة',
    nameEn: 'Al Faisal Plumbing',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512743891',
    email: 'info@alfaisal-plumbing.com',
    rating: 4.6,
    completedJobs: 210,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500100001',
    isAvailable: true,
  },
  {
    id: 'sp-006',
    name: 'شركة خطوط المياه',
    nameEn: 'Water Lines Co',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512894730',
    email: 'info@waterlines.com.sa',
    rating: 4.3,
    completedJobs: 145,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500100002',
    isAvailable: true,
  },
  {
    id: 'sp-007',
    name: 'سباكة الخبرة',
    nameEn: 'Expert Plumbing',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512937481',
    email: 'info@expert-plumbing.com',
    rating: 4.1,
    completedJobs: 98,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500100003',
    isAvailable: false,
  },
  {
    id: 'sp-008',
    name: 'مؤسسة التدفق',
    nameEn: 'Al Tadaffuq',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512847190',
    email: 'info@altadaffuq.com',
    rating: 4.4,
    completedJobs: 167,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500100004',
    isAvailable: true,
  },
  {
    id: 'sp-009',
    name: 'سباك الحي',
    nameEn: 'Neighborhood Plumber',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512938471',
    email: 'sabbak.alhai@email.com',
    rating: 3.9,
    completedJobs: 75,
    responseTime: '٣٠ دقيقة',
    city: 'جدة',
    licenseNumber: 'CR-4500100005',
    isAvailable: true,
  },
  {
    id: 'sp-010',
    name: 'مؤسسة الأنابيب الذهبية',
    nameEn: 'Golden Pipes',
    specialty: 'سباكة',
    specialtyEn: 'Plumbing',
    phone: '966512741893',
    email: 'info@golden-pipes.com',
    rating: 4.7,
    completedJobs: 289,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500100006',
    isAvailable: true,
  },

  // --- Electrical (كهرباء) ---
  {
    id: 'sp-011',
    name: 'شركة الكهرباء المتقدمة',
    nameEn: 'Advanced Electrical Co',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512839471',
    email: 'info@advanced-elec.com',
    rating: 4.6,
    completedJobs: 278,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200001',
    isAvailable: true,
  },
  {
    id: 'sp-012',
    name: 'مؤسسة النور الكهربائية',
    nameEn: 'Al Noor Electrical Est',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512748391',
    email: 'info@alnoor-elec2.com',
    rating: 4.4,
    completedJobs: 195,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200002',
    isAvailable: true,
  },
  {
    id: 'sp-013',
    name: 'كهرباء الأمان',
    nameEn: 'Safety Electrical',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512937184',
    email: 'info@safety-elec.com',
    rating: 4.2,
    completedJobs: 134,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200003',
    isAvailable: true,
  },
  {
    id: 'sp-014',
    name: 'مؤسسة الفولت',
    nameEn: 'Al Volt Est',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512841739',
    email: 'info@alvolt.com',
    rating: 4.0,
    completedJobs: 88,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200004',
    isAvailable: false,
  },
  {
    id: 'sp-015',
    name: 'كهربائي الخبرة',
    nameEn: 'Expert Electrician',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512938741',
    email: 'kahraba.alkhibra@email.com',
    rating: 4.5,
    completedJobs: 220,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200005',
    isAvailable: true,
  },
  {
    id: 'sp-016',
    name: 'مؤسسة التيار',
    nameEn: 'Al Tayyar Electrical',
    specialty: 'كهرباء',
    specialtyEn: 'Electrical',
    phone: '966512749318',
    email: 'info@altayyar-elec.com',
    rating: 3.8,
    completedJobs: 67,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500200006',
    isAvailable: true,
  },

  // --- HVAC (تكييف) ---
  {
    id: 'sp-017',
    name: 'شركة البرودة السعودية',
    nameEn: 'Saudi Cooling Co',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512893741',
    email: 'info@saudicooling.com',
    rating: 4.8,
    completedJobs: 345,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300001',
    isAvailable: true,
  },
  {
    id: 'sp-018',
    name: 'مؤسسة المناخ',
    nameEn: 'Al Manakh HVAC',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512847391',
    email: 'info@almanakh.com',
    rating: 4.3,
    completedJobs: 156,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300002',
    isAvailable: true,
  },
  {
    id: 'sp-019',
    name: 'تكييف الراحة',
    nameEn: 'Comfort HVAC',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512938174',
    email: 'info@raaha-hvac.com',
    rating: 4.5,
    completedJobs: 198,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300003',
    isAvailable: true,
  },
  {
    id: 'sp-020',
    name: 'مؤسسة الهواء النقي',
    nameEn: 'Clean Air Est',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512741839',
    email: 'info@cleanair.com.sa',
    rating: 4.1,
    completedJobs: 112,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300004',
    isAvailable: false,
  },
  {
    id: 'sp-021',
    name: 'شركة فروست',
    nameEn: 'Frost HVAC Co',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512893174',
    email: 'info@frost-hvac.com',
    rating: 4.6,
    completedJobs: 267,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300005',
    isAvailable: true,
  },
  {
    id: 'sp-022',
    name: 'تكييف السلامة',
    nameEn: 'Safety HVAC',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512847913',
    email: 'info@safety-hvac.com',
    rating: 4.0,
    completedJobs: 89,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300006',
    isAvailable: true,
  },
  {
    id: 'sp-023',
    name: 'مؤسسة الثلج',
    nameEn: 'Ice HVAC Est',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512739184',
    email: 'info@ice-hvac.com',
    rating: 3.7,
    completedJobs: 45,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500300007',
    isAvailable: true,
  },
  {
    id: 'sp-024',
    name: 'شركة المكيفات المركزية',
    nameEn: 'Central AC Co',
    specialty: 'تكييف',
    specialtyEn: 'HVAC',
    phone: '966512894173',
    email: 'info@central-ac.com.sa',
    rating: 4.9,
    completedJobs: 456,
    responseTime: '٣٠ دقيقة',
    city: 'جدة',
    licenseNumber: 'CR-4500300008',
    isAvailable: true,
  },

  // --- Elevator (مصاعد) ---
  {
    id: 'sp-025',
    name: 'شركة المصاعد السعودية',
    nameEn: 'Saudi Elevators Co',
    specialty: 'مصاعد',
    specialtyEn: 'Elevator',
    phone: '966512847391',
    email: 'info@saudi-elevators.com',
    rating: 4.7,
    completedJobs: 189,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500400001',
    isAvailable: true,
  },
  {
    id: 'sp-026',
    name: 'مؤسسة الرفع',
    nameEn: 'Al Raf Est',
    specialty: 'مصاعد',
    specialtyEn: 'Elevator',
    phone: '966512938471',
    email: 'info@alraf.com',
    rating: 4.3,
    completedJobs: 134,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500400002',
    isAvailable: true,
  },
  {
    id: 'sp-027',
    name: 'شركة أوتيس السعودية',
    nameEn: 'Otis Saudi Arabia',
    specialty: 'مصاعد',
    specialtyEn: 'Elevator',
    phone: '966512741893',
    email: 'info@otis.com.sa',
    rating: 4.9,
    completedJobs: 500,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500400003',
    isAvailable: true,
  },
  {
    id: 'sp-028',
    name: 'مصاعد التقنية',
    nameEn: 'Tech Elevators',
    specialty: 'مصاعد',
    specialtyEn: 'Elevator',
    phone: '966512893714',
    email: 'info@tech-elevators.com',
    rating: 4.1,
    completedJobs: 78,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500400004',
    isAvailable: false,
  },

  // --- Fire Safety (سلامة ووقاية) ---
  {
    id: 'sp-029',
    name: 'شركة الحماية والسلامة',
    nameEn: 'Protection & Safety Co',
    specialty: 'سلامة ووقاية',
    specialtyEn: 'Fire Safety',
    phone: '966512847913',
    email: 'info@protection-safety.com',
    rating: 4.6,
    completedJobs: 198,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500500001',
    isAvailable: true,
  },
  {
    id: 'sp-030',
    name: 'مؤسسة الإطفاء المتقدمة',
    nameEn: 'Advanced Fire Est',
    specialty: 'سلامة ووقاية',
    specialtyEn: 'Fire Safety',
    phone: '966512938714',
    email: 'info@advanced-fire.com',
    rating: 4.4,
    completedJobs: 145,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500500002',
    isAvailable: true,
  },
  {
    id: 'sp-031',
    name: 'شركة سلامتك',
    nameEn: 'Salamatak Co',
    specialty: 'سلامة ووقاية',
    specialtyEn: 'Fire Safety',
    phone: '966512847139',
    email: 'info@salamatak.com',
    rating: 4.2,
    completedJobs: 112,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500500003',
    isAvailable: true,
  },

  // --- Painting (دهان) ---
  {
    id: 'sp-032',
    name: 'مؤسسة الألوان الجميلة',
    nameEn: 'Beautiful Colors Est',
    specialty: 'دهان',
    specialtyEn: 'Painting',
    phone: '966512741389',
    email: 'info@alwan-jamila.com',
    rating: 4.5,
    completedJobs: 167,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500600001',
    isAvailable: true,
  },
  {
    id: 'sp-033',
    name: 'دهانات الفخامة',
    nameEn: 'Luxury Paints',
    specialty: 'دهان',
    specialtyEn: 'Painting',
    phone: '966512893471',
    email: 'info@luxury-paints.com',
    rating: 4.7,
    completedJobs: 234,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500600002',
    isAvailable: true,
  },
  {
    id: 'sp-034',
    name: 'مؤسسة الطلاء الحديث',
    nameEn: 'Modern Paint Est',
    specialty: 'دهان',
    specialtyEn: 'Painting',
    phone: '966512847391',
    email: 'info@modern-paint.com',
    rating: 4.0,
    completedJobs: 89,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500600003',
    isAvailable: true,
  },
  {
    id: 'sp-035',
    name: 'شركة اللمسة الأخيرة',
    nameEn: 'Final Touch Co',
    specialty: 'دهان',
    specialtyEn: 'Painting',
    phone: '966512938174',
    email: 'info@final-touch.com',
    rating: 4.3,
    completedJobs: 145,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500600004',
    isAvailable: false,
  },

  // --- Carpentry (نجارة) ---
  {
    id: 'sp-036',
    name: 'ورشة الخشب الذهبي',
    nameEn: 'Golden Wood Workshop',
    specialty: 'نجارة',
    specialtyEn: 'Carpentry',
    phone: '966512741893',
    email: 'info@golden-wood.com',
    rating: 4.6,
    completedJobs: 178,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500700001',
    isAvailable: true,
  },
  {
    id: 'sp-037',
    name: 'نجارة الإتقان',
    nameEn: 'Itqan Carpentry',
    specialty: 'نجارة',
    specialtyEn: 'Carpentry',
    phone: '966512893741',
    email: 'info@itqan-carp.com',
    rating: 4.4,
    completedJobs: 134,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500700002',
    isAvailable: true,
  },
  {
    id: 'sp-038',
    name: 'مؤسسة الأثاث المتين',
    nameEn: 'Solid Furniture Est',
    specialty: 'نجارة',
    specialtyEn: 'Carpentry',
    phone: '966512847193',
    email: 'info@solid-furniture.com',
    rating: 4.1,
    completedJobs: 95,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500700003',
    isAvailable: true,
  },

  // --- Cleaning (نظافة) ---
  {
    id: 'sp-039',
    name: 'شركة النظافة المتكاملة',
    nameEn: 'Integrated Cleaning Co',
    specialty: 'نظافة',
    specialtyEn: 'Cleaning',
    phone: '966512938471',
    email: 'info@integrated-clean.com',
    rating: 4.5,
    completedJobs: 345,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500800001',
    isAvailable: true,
  },
  {
    id: 'sp-040',
    name: 'مؤسسة اللمعان',
    nameEn: 'Al Lamaan Est',
    specialty: 'نظافة',
    specialtyEn: 'Cleaning',
    phone: '966512847139',
    email: 'info@allamaan.com',
    rating: 4.2,
    completedJobs: 198,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500800002',
    isAvailable: true,
  },
  {
    id: 'sp-041',
    name: 'خدمات البريق',
    nameEn: 'Sparkle Services',
    specialty: 'نظافة',
    specialtyEn: 'Cleaning',
    phone: '966512741389',
    email: 'info@sparkle-services.com',
    rating: 4.0,
    completedJobs: 123,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500800003',
    isAvailable: true,
  },
  {
    id: 'sp-042',
    name: 'شركة نقاء',
    nameEn: 'Naqaa Co',
    specialty: 'نظافة',
    specialtyEn: 'Cleaning',
    phone: '966512893174',
    email: 'info@naqaa.com.sa',
    rating: 4.7,
    completedJobs: 412,
    responseTime: '٣٠ دقيقة',
    city: 'جدة',
    licenseNumber: 'CR-4500800004',
    isAvailable: true,
  },

  // --- Pest Control (مكافحة حشرات) ---
  {
    id: 'sp-043',
    name: 'شركة رش الحشرات',
    nameEn: 'Pest Spray Co',
    specialty: 'مكافحة حشرات',
    specialtyEn: 'Pest Control',
    phone: '966512847391',
    email: 'info@pest-spray.com',
    rating: 4.4,
    completedJobs: 267,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500900001',
    isAvailable: true,
  },
  {
    id: 'sp-044',
    name: 'مؤسسة البيئة النظيفة',
    nameEn: 'Clean Environment Est',
    specialty: 'مكافحة حشرات',
    specialtyEn: 'Pest Control',
    phone: '966512938174',
    email: 'info@clean-env.com',
    rating: 4.6,
    completedJobs: 312,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500900002',
    isAvailable: true,
  },
  {
    id: 'sp-045',
    name: 'مكافحة الآفات',
    nameEn: 'Pest Control Services',
    specialty: 'مكافحة حشرات',
    specialtyEn: 'Pest Control',
    phone: '966512741893',
    email: 'info@pest-control.com.sa',
    rating: 4.1,
    completedJobs: 145,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4500900003',
    isAvailable: false,
  },

  // --- Waterproofing (عزل) ---
  {
    id: 'sp-046',
    name: 'شركة العزل السعودية',
    nameEn: 'Saudi Waterproofing Co',
    specialty: 'عزل',
    specialtyEn: 'Waterproofing',
    phone: '966512893471',
    email: 'info@saudi-waterproof.com',
    rating: 4.7,
    completedJobs: 234,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501000001',
    isAvailable: true,
  },
  {
    id: 'sp-047',
    name: 'مؤسسة الحماية من التسرب',
    nameEn: 'Leak Protection Est',
    specialty: 'عزل',
    specialtyEn: 'Waterproofing',
    phone: '966512847913',
    email: 'info@leak-protect.com',
    rating: 4.3,
    completedJobs: 156,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501000002',
    isAvailable: true,
  },
  {
    id: 'sp-048',
    name: 'عزل الخبرة',
    nameEn: 'Expert Waterproofing',
    specialty: 'عزل',
    specialtyEn: 'Waterproofing',
    phone: '966512938714',
    email: 'info@expert-waterproof.com',
    rating: 4.0,
    completedJobs: 89,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501000003',
    isAvailable: true,
  },

  // --- Security (أمن وحراسة) ---
  {
    id: 'sp-049',
    name: 'شركة الحراسات الأمنية',
    nameEn: 'Security Guards Co',
    specialty: 'أمن وحراسة',
    specialtyEn: 'Security',
    phone: '966512847139',
    email: 'info@security-guards.com',
    rating: 4.5,
    completedJobs: 178,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501100001',
    isAvailable: true,
  },
  {
    id: 'sp-050',
    name: 'مؤسسة الأمان',
    nameEn: 'Al Aman Security Est',
    specialty: 'أمن وحراسة',
    specialtyEn: 'Security',
    phone: '966512741893',
    email: 'info@alaman-security.com',
    rating: 4.3,
    completedJobs: 145,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501100002',
    isAvailable: true,
  },
  {
    id: 'sp-051',
    name: 'خدمات الحماية',
    nameEn: 'Protection Services',
    specialty: 'أمن وحراسة',
    specialtyEn: 'Security',
    phone: '966512893174',
    email: 'info@protection-svc.com',
    rating: 4.1,
    completedJobs: 98,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501100003',
    isAvailable: true,
  },

  // --- Landscaping (تنسيق حدائق) ---
  {
    id: 'sp-052',
    name: 'مؤسسة الحدائق الجميلة',
    nameEn: 'Beautiful Gardens Est',
    specialty: 'تنسيق حدائق',
    specialtyEn: 'Landscaping',
    phone: '966512847391',
    email: 'info@beautiful-gardens.com',
    rating: 4.4,
    completedJobs: 123,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501200001',
    isAvailable: true,
  },
  {
    id: 'sp-053',
    name: 'شركة الخضراء',
    nameEn: 'Al Khadraa Co',
    specialty: 'تنسيق حدائق',
    specialtyEn: 'Landscaping',
    phone: '966512938471',
    email: 'info@alkhadraa.com',
    rating: 4.6,
    completedJobs: 189,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501200002',
    isAvailable: true,
  },

  // --- Smart Systems (أنظمة ذكية) ---
  {
    id: 'sp-054',
    name: 'شركة البيت الذكي',
    nameEn: 'Smart Home Co',
    specialty: 'أنظمة ذكية',
    specialtyEn: 'Smart Systems',
    phone: '966512847913',
    email: 'info@smart-home.com.sa',
    rating: 4.8,
    completedJobs: 156,
    responseTime: 'خلال ١ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501300001',
    isAvailable: true,
  },
  {
    id: 'sp-055',
    name: 'مؤسسة التقنية المنزلية',
    nameEn: 'Home Tech Est',
    specialty: 'أنظمة ذكية',
    specialtyEn: 'Smart Systems',
    phone: '966512938174',
    email: 'info@home-tech.com',
    rating: 4.5,
    completedJobs: 112,
    responseTime: 'خلال ٢ ساعة',
    city: 'جدة',
    licenseNumber: 'CR-4501300002',
    isAvailable: true,
  },
];

// --- Units ---

export const units: Unit[] = [
  // --- Al Nakheel Tower (bld-001) — 8 units ---
  { id: 'unit-001', buildingId: 'bld-001', unitNumber: 'شقة ١٠١', floor: 1, area: 120, rooms: 3, bathrooms: 2, monthlyRent: 4500, status: 'occupied', ownerId: 'own-001', tenantId: 'ten-001' },
  { id: 'unit-002', buildingId: 'bld-001', unitNumber: 'شقة ١٠٢', floor: 1, area: 95, rooms: 2, bathrooms: 1, monthlyRent: 3500, status: 'occupied', ownerId: 'own-001', tenantId: 'ten-002' },
  { id: 'unit-003', buildingId: 'bld-001', unitNumber: 'شقة ٢٠١', floor: 2, area: 150, rooms: 4, bathrooms: 2, monthlyRent: 5500, status: 'occupied', ownerId: 'own-002', tenantId: 'ten-003' },
  { id: 'unit-004', buildingId: 'bld-001', unitNumber: 'شقة ٢٠٢', floor: 2, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 4000, status: 'vacant', ownerId: 'own-002' },
  { id: 'unit-005', buildingId: 'bld-001', unitNumber: 'شقة ٢٠٥', floor: 2, area: 85, rooms: 2, bathrooms: 1, monthlyRent: 3200, status: 'occupied', ownerId: 'own-001', tenantId: 'ten-004' },
  { id: 'unit-006', buildingId: 'bld-001', unitNumber: 'شقة ٣٠٢', floor: 3, area: 130, rooms: 3, bathrooms: 2, monthlyRent: 5000, status: 'occupied', ownerId: 'own-003', tenantId: 'ten-005' },
  { id: 'unit-007', buildingId: 'bld-001', unitNumber: 'شقة ٤٠٢', floor: 4, area: 140, rooms: 4, bathrooms: 3, monthlyRent: 6000, status: 'occupied', ownerId: 'own-003', tenantId: 'ten-006' },
  { id: 'unit-008', buildingId: 'bld-001', unitNumber: 'شقة ٥٠١', floor: 5, area: 200, rooms: 5, bathrooms: 3, monthlyRent: 8000, status: 'maintenance', ownerId: 'own-001' },

  // --- Al Yasmin Building (bld-002) — 6 units ---
  { id: 'unit-009', buildingId: 'bld-002', unitNumber: 'شقة ١٠١', floor: 1, area: 100, rooms: 3, bathrooms: 2, monthlyRent: 3000, status: 'occupied', ownerId: 'own-004', tenantId: 'ten-001' },
  { id: 'unit-010', buildingId: 'bld-002', unitNumber: 'شقة ١٠٢', floor: 1, area: 80, rooms: 2, bathrooms: 1, monthlyRent: 2500, status: 'occupied', ownerId: 'own-004', tenantId: 'ten-002' },
  { id: 'unit-011', buildingId: 'bld-002', unitNumber: 'شقة ١٠٣', floor: 1, area: 90, rooms: 2, bathrooms: 1, monthlyRent: 2800, status: 'occupied', ownerId: 'own-002', tenantId: 'ten-004' },
  { id: 'unit-012', buildingId: 'bld-002', unitNumber: 'شقة ٢٠١', floor: 2, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 3500, status: 'occupied', ownerId: 'own-002', tenantId: 'ten-003' },
  { id: 'unit-013', buildingId: 'bld-002', unitNumber: 'شقة ٢٠٢', floor: 2, area: 100, rooms: 3, bathrooms: 2, monthlyRent: 3200, status: 'vacant', ownerId: 'own-004' },
  { id: 'unit-014', buildingId: 'bld-002', unitNumber: 'شقة ٣٠١', floor: 3, area: 120, rooms: 3, bathrooms: 2, monthlyRent: 3800, status: 'occupied', ownerId: 'own-004', tenantId: 'ten-006' },

  // --- Al Waha Commercial Complex (bld-003) — 6 units ---
  { id: 'unit-015', buildingId: 'bld-003', unitNumber: 'معرض ١', floor: 0, area: 150, rooms: 0, bathrooms: 1, monthlyRent: 12000, status: 'occupied', ownerId: 'own-001', tenantId: 'ten-005' },
  { id: 'unit-016', buildingId: 'bld-003', unitNumber: 'معرض ٢', floor: 0, area: 120, rooms: 0, bathrooms: 1, monthlyRent: 10000, status: 'occupied', ownerId: 'own-001' },
  { id: 'unit-017', buildingId: 'bld-003', unitNumber: 'مكتب ١٠١', floor: 1, area: 80, rooms: 0, bathrooms: 1, monthlyRent: 6000, status: 'occupied', ownerId: 'own-003', tenantId: 'ten-003' },
  { id: 'unit-018', buildingId: 'bld-003', unitNumber: 'مكتب ١٠٢', floor: 1, area: 65, rooms: 0, bathrooms: 1, monthlyRent: 5000, status: 'occupied', ownerId: 'own-003' },
  { id: 'unit-019', buildingId: 'bld-003', unitNumber: 'مكتب ٢٠١', floor: 2, area: 100, rooms: 0, bathrooms: 1, monthlyRent: 7000, status: 'vacant', ownerId: 'own-002' },
  { id: 'unit-020', buildingId: 'bld-003', unitNumber: 'مكتب ٢٠٢', floor: 2, area: 90, rooms: 0, bathrooms: 1, monthlyRent: 6500, status: 'occupied', ownerId: 'own-002', tenantId: 'ten-006' },

  // --- Al Yaqoot Tower (bld-004) — 10 units ---
  { id: 'unit-021', buildingId: 'bld-004', unitNumber: 'شقة ١٠١', floor: 1, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 4200, status: 'occupied', ownerId: 'own-005', tenantId: 'ten-007' },
  { id: 'unit-022', buildingId: 'bld-004', unitNumber: 'شقة ١٠٢', floor: 1, area: 90, rooms: 2, bathrooms: 1, monthlyRent: 3300, status: 'occupied', ownerId: 'own-005', tenantId: 'ten-008' },
  { id: 'unit-023', buildingId: 'bld-004', unitNumber: 'شقة ٢٠١', floor: 2, area: 130, rooms: 3, bathrooms: 2, monthlyRent: 4800, status: 'occupied', ownerId: 'own-006', tenantId: 'ten-009' },
  { id: 'unit-024', buildingId: 'bld-004', unitNumber: 'شقة ٢٠٢', floor: 2, area: 100, rooms: 2, bathrooms: 1, monthlyRent: 3600, status: 'vacant', ownerId: 'own-006' },
  { id: 'unit-025', buildingId: 'bld-004', unitNumber: 'شقة ٣٠١', floor: 3, area: 140, rooms: 4, bathrooms: 2, monthlyRent: 5200, status: 'occupied', ownerId: 'own-005', tenantId: 'ten-010' },
  { id: 'unit-026', buildingId: 'bld-004', unitNumber: 'شقة ٣٠٢', floor: 3, area: 120, rooms: 3, bathrooms: 2, monthlyRent: 4500, status: 'occupied', ownerId: 'own-005', tenantId: 'ten-011' },
  { id: 'unit-027', buildingId: 'bld-004', unitNumber: 'شقة ٤٠١', floor: 4, area: 160, rooms: 4, bathrooms: 3, monthlyRent: 6000, status: 'maintenance', ownerId: 'own-006' },
  { id: 'unit-028', buildingId: 'bld-004', unitNumber: 'شقة ٥٠١', floor: 5, area: 95, rooms: 2, bathrooms: 1, monthlyRent: 3400, status: 'occupied', ownerId: 'own-006', tenantId: 'ten-012' },
  { id: 'unit-029', buildingId: 'bld-004', unitNumber: 'شقة ٦٠١', floor: 6, area: 180, rooms: 5, bathrooms: 3, monthlyRent: 7500, status: 'occupied', ownerId: 'own-005', tenantId: 'ten-013' },
  { id: 'unit-030', buildingId: 'bld-004', unitNumber: 'شقة ٧٠١', floor: 7, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 4300, status: 'vacant', ownerId: 'own-005' },

  // --- Al Rayan Commercial Complex (bld-005) — 8 units ---
  { id: 'unit-031', buildingId: 'bld-005', unitNumber: 'معرض ١', floor: 0, area: 180, rooms: 0, bathrooms: 2, monthlyRent: 15000, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-014' },
  { id: 'unit-032', buildingId: 'bld-005', unitNumber: 'معرض ٢', floor: 0, area: 150, rooms: 0, bathrooms: 1, monthlyRent: 12000, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-015' },
  { id: 'unit-033', buildingId: 'bld-005', unitNumber: 'مكتب ١٠١', floor: 1, area: 90, rooms: 0, bathrooms: 1, monthlyRent: 7000, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-016' },
  { id: 'unit-034', buildingId: 'bld-005', unitNumber: 'مكتب ١٠٢', floor: 1, area: 75, rooms: 0, bathrooms: 1, monthlyRent: 5500, status: 'vacant', ownerId: 'own-008' },
  { id: 'unit-035', buildingId: 'bld-005', unitNumber: 'مكتب ٢٠١', floor: 2, area: 110, rooms: 0, bathrooms: 1, monthlyRent: 8000, status: 'occupied', ownerId: 'own-008', tenantId: 'ten-017' },
  { id: 'unit-036', buildingId: 'bld-005', unitNumber: 'مكتب ٢٠٢', floor: 2, area: 85, rooms: 0, bathrooms: 1, monthlyRent: 6000, status: 'occupied', ownerId: 'own-008', tenantId: 'ten-018' },
  { id: 'unit-037', buildingId: 'bld-005', unitNumber: 'مكتب ٣٠١', floor: 3, area: 100, rooms: 0, bathrooms: 1, monthlyRent: 7500, status: 'vacant', ownerId: 'own-007' },
  { id: 'unit-038', buildingId: 'bld-005', unitNumber: 'مكتب ٣٠٢', floor: 3, area: 70, rooms: 0, bathrooms: 1, monthlyRent: 5000, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-019' },

  // --- Al Salam Building (bld-006) — 8 units ---
  { id: 'unit-039', buildingId: 'bld-006', unitNumber: 'شقة ١٠١', floor: 1, area: 85, rooms: 2, bathrooms: 1, monthlyRent: 2200, status: 'occupied', ownerId: 'own-008', tenantId: 'ten-020' },
  { id: 'unit-040', buildingId: 'bld-006', unitNumber: 'شقة ١٠٢', floor: 1, area: 75, rooms: 2, bathrooms: 1, monthlyRent: 2000, status: 'occupied', ownerId: 'own-008', tenantId: 'ten-021' },
  { id: 'unit-041', buildingId: 'bld-006', unitNumber: 'شقة ٢٠١', floor: 2, area: 100, rooms: 3, bathrooms: 2, monthlyRent: 2800, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-022' },
  { id: 'unit-042', buildingId: 'bld-006', unitNumber: 'شقة ٢٠٢', floor: 2, area: 90, rooms: 2, bathrooms: 1, monthlyRent: 2500, status: 'vacant', ownerId: 'own-009' },
  { id: 'unit-043', buildingId: 'bld-006', unitNumber: 'شقة ٣٠١', floor: 3, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 3000, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-023' },
  { id: 'unit-044', buildingId: 'bld-006', unitNumber: 'شقة ٣٠٢', floor: 3, area: 80, rooms: 2, bathrooms: 1, monthlyRent: 2300, status: 'occupied', ownerId: 'own-008', tenantId: 'ten-024' },
  { id: 'unit-045', buildingId: 'bld-006', unitNumber: 'شقة ٤٠١', floor: 4, area: 120, rooms: 3, bathrooms: 2, monthlyRent: 3200, status: 'maintenance', ownerId: 'own-009' },
  { id: 'unit-046', buildingId: 'bld-006', unitNumber: 'شقة ٤٠٢', floor: 4, area: 70, rooms: 1, bathrooms: 1, monthlyRent: 1500, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-025' },

  // --- Al Murooj Towers (bld-007) — 12 units ---
  { id: 'unit-047', buildingId: 'bld-007', unitNumber: 'شقة ١٠١', floor: 1, area: 130, rooms: 3, bathrooms: 2, monthlyRent: 5500, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-007' },
  { id: 'unit-048', buildingId: 'bld-007', unitNumber: 'شقة ١٠٢', floor: 1, area: 100, rooms: 2, bathrooms: 1, monthlyRent: 4000, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-008' },
  { id: 'unit-049', buildingId: 'bld-007', unitNumber: 'شقة ٢٠١', floor: 2, area: 150, rooms: 4, bathrooms: 2, monthlyRent: 6500, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-009' },
  { id: 'unit-050', buildingId: 'bld-007', unitNumber: 'شقة ٢٠٢', floor: 2, area: 110, rooms: 3, bathrooms: 2, monthlyRent: 4800, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-010' },
  { id: 'unit-051', buildingId: 'bld-007', unitNumber: 'شقة ٣٠١', floor: 3, area: 160, rooms: 4, bathrooms: 3, monthlyRent: 7000, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-011' },
  { id: 'unit-052', buildingId: 'bld-007', unitNumber: 'شقة ٤٠١', floor: 4, area: 120, rooms: 3, bathrooms: 2, monthlyRent: 5200, status: 'vacant', ownerId: 'own-010' },
  { id: 'unit-053', buildingId: 'bld-007', unitNumber: 'شقة ٥٠١', floor: 5, area: 140, rooms: 3, bathrooms: 2, monthlyRent: 5800, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-012' },
  { id: 'unit-054', buildingId: 'bld-007', unitNumber: 'شقة ٦٠١', floor: 6, area: 170, rooms: 4, bathrooms: 3, monthlyRent: 7200, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-013' },
  { id: 'unit-055', buildingId: 'bld-007', unitNumber: 'شقة ٧٠١', floor: 7, area: 100, rooms: 2, bathrooms: 1, monthlyRent: 4200, status: 'occupied', ownerId: 'own-007', tenantId: 'ten-014' },
  { id: 'unit-056', buildingId: 'bld-007', unitNumber: 'شقة ٨٠١', floor: 8, area: 190, rooms: 5, bathrooms: 3, monthlyRent: 8000, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-015' },
  { id: 'unit-057', buildingId: 'bld-007', unitNumber: 'شقة ٩٠١', floor: 9, area: 130, rooms: 3, bathrooms: 2, monthlyRent: 5500, status: 'vacant', ownerId: 'own-010' },
  { id: 'unit-058', buildingId: 'bld-007', unitNumber: 'شقة ١٠٠١', floor: 10, area: 200, rooms: 5, bathrooms: 3, monthlyRent: 8500, status: 'maintenance', ownerId: 'own-007' },

  // --- Al Andalus Complex (bld-008) — 9 units ---
  { id: 'unit-059', buildingId: 'bld-008', unitNumber: 'معرض ١', floor: 0, area: 200, rooms: 0, bathrooms: 2, monthlyRent: 14000, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-016' },
  { id: 'unit-060', buildingId: 'bld-008', unitNumber: 'معرض ٢', floor: 0, area: 160, rooms: 0, bathrooms: 1, monthlyRent: 11000, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-017' },
  { id: 'unit-061', buildingId: 'bld-008', unitNumber: 'مكتب ١٠١', floor: 1, area: 85, rooms: 0, bathrooms: 1, monthlyRent: 6500, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-018' },
  { id: 'unit-062', buildingId: 'bld-008', unitNumber: 'مكتب ١٠٢', floor: 1, area: 70, rooms: 0, bathrooms: 1, monthlyRent: 5000, status: 'vacant', ownerId: 'own-010' },
  { id: 'unit-063', buildingId: 'bld-008', unitNumber: 'مكتب ٢٠١', floor: 2, area: 95, rooms: 0, bathrooms: 1, monthlyRent: 7000, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-019' },
  { id: 'unit-064', buildingId: 'bld-008', unitNumber: 'مكتب ٢٠٢', floor: 2, area: 80, rooms: 0, bathrooms: 1, monthlyRent: 6000, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-020' },
  { id: 'unit-065', buildingId: 'bld-008', unitNumber: 'مكتب ٣٠١', floor: 3, area: 100, rooms: 0, bathrooms: 1, monthlyRent: 7500, status: 'vacant', ownerId: 'own-010' },
  { id: 'unit-066', buildingId: 'bld-008', unitNumber: 'مكتب ٤٠١', floor: 4, area: 110, rooms: 0, bathrooms: 1, monthlyRent: 8000, status: 'occupied', ownerId: 'own-010', tenantId: 'ten-021' },
  { id: 'unit-067', buildingId: 'bld-008', unitNumber: 'مكتب ٥٠١', floor: 5, area: 130, rooms: 0, bathrooms: 2, monthlyRent: 9500, status: 'occupied', ownerId: 'own-009', tenantId: 'ten-022' },
];

// --- Maintenance Requests ---

export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'req-001',
    title: 'عطل كومبرسور التكييف',
    description: 'الكومبرسور الخارجي توقف عن العمل بشكل كامل. درجة الحرارة داخل الشقة مرتفعة جداً. الموديل: سبليت ٢٤٠٠٠ وحدة.',
    category: 'hvac',
    subcategory: 'كومبرسور',
    buildingId: 'bld-001',
    unitId: 'unit-006',
    location: 'unit',
    locationLabel: 'شقة ٣٠٢ — برج النخيل',
    status: 'in_progress',
    priority: 'high',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً للمادة ٥ من نظام إيجار: "يتحمل المؤجر نفقات الصيانة غير التأجيرية وإصلاح الخلل الذي يؤثر في استيفاء المنفعة المقصودة" — الكومبرسور من الأنظمة الأساسية للعين المؤجرة.',
    estimatedCost: 3500,
    reportedById: 'ten-005',
    assignedProviderId: 'sp-001',
    createdAt: '2026-03-04T09:30:00',
    updatedAt: '2026-03-05T14:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-04T09:30:00', note: 'تم تقديم الطلب من المستأجر', userId: 'ten-005' },
      { status: 'reviewed', timestamp: '2026-03-04T11:00:00', note: 'تمت مراجعة الطلب — أولوية عالية بسبب ارتفاع الحرارة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-04T12:30:00', note: 'تم تعيين مؤسسة الفيصل للتكييف والتبريد', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-05T08:00:00', note: 'الفني وصل الموقع وبدأ الفحص. يحتاج استبدال كومبرسور.', userId: 'sp-001' },
    ],
  },
  {
    id: 'req-002',
    title: 'تسريب في أنبوب المياه الرئيسي',
    description: 'تسريب ماء مستمر من أنبوب المياه الرئيسي أسفل حوض المطبخ. أدى لتلف الخزانة السفلية.',
    category: 'plumbing',
    subcategory: 'تسريب',
    buildingId: 'bld-002',
    unitId: 'unit-009',
    location: 'unit',
    locationLabel: 'شقة ١٠١ — عمارة الياسمين',
    status: 'completed',
    priority: 'high',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً للمادة ٥ من نظام إيجار: أنابيب المياه الرئيسية من مكونات العين المؤجرة التي يتحمل المؤجر صيانتها وإصلاحها.',
    estimatedCost: 1200,
    actualCost: 980,
    reportedById: 'ten-001',
    assignedProviderId: 'sp-002',
    createdAt: '2026-02-28T16:45:00',
    updatedAt: '2026-03-02T11:30:00',
    completedAt: '2026-03-02T11:30:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-28T16:45:00', note: 'تم تقديم الطلب', userId: 'ten-001' },
      { status: 'reviewed', timestamp: '2026-02-28T17:30:00', note: 'تمت المراجعة — حالة طارئة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-28T18:00:00', note: 'تم تعيين شركة البناء المتين للسباكة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-01T08:30:00', note: 'بدء أعمال الإصلاح', userId: 'sp-002' },
      { status: 'completed', timestamp: '2026-03-02T11:30:00', note: 'تم إصلاح التسريب واستبدال الأنبوب التالف. التكلفة الفعلية ٩٨٠ ر.س', userId: 'sp-002' },
    ],
  },
  {
    id: 'req-003',
    title: 'عطل في مصعد المبنى',
    description: 'المصعد يتوقف بشكل متكرر بين الطوابق. صدرت أصوات غير طبيعية من المحرك. المصعد ماركة أوتيس — موديل ٢٠١٩.',
    category: 'elevator',
    subcategory: 'محرك',
    buildingId: 'bld-001',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — برج النخيل',
    status: 'assigned',
    priority: 'urgent',
    costResponsibility: 'hoa',
    costLegalBasis: 'وفقاً لنظام ملكية الوحدات العقارية المفرزة وإدارتها (المادة ١١): "تكون نفقات صيانة الأجزاء المشتركة على جميع الملاك كل بنسبة حصته" — المصعد من الأجزاء المشتركة.',
    estimatedCost: 8500,
    reportedById: 'off-001',
    assignedProviderId: 'sp-004',
    createdAt: '2026-03-06T07:15:00',
    updatedAt: '2026-03-06T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-06T07:15:00', note: 'بلاغ من حارس المبنى عن خلل في المصعد', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-03-06T08:00:00', note: 'تم إيقاف المصعد احترازياً — أولوية عاجلة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-06T10:00:00', note: 'تم تعيين شركة الأمان للصيانة العامة — موعد الزيارة غداً الساعة ٨ صباحاً', userId: 'off-001' },
    ],
  },
  {
    id: 'req-004',
    title: 'كسر زجاج النافذة',
    description: 'انكسر زجاج نافذة غرفة النوم بسبب اصطدام كرة — الكسر بفعل المستأجر.',
    category: 'structural',
    subcategory: 'زجاج',
    buildingId: 'bld-001',
    unitId: 'unit-005',
    location: 'unit',
    locationLabel: 'شقة ٢٠٥ — برج النخيل',
    status: 'submitted',
    priority: 'medium',
    costResponsibility: 'tenant',
    costLegalBasis: 'وفقاً للمادة ١٣ من نظام إيجار: "يلتزم المستأجر بإصلاح ما أحدثه هو أو من يأذن لهم بالانتفاع من تلف في العين المؤجرة" — الضرر ناتج عن فعل المستأجر.',
    estimatedCost: 650,
    reportedById: 'ten-004',
    createdAt: '2026-03-07T11:20:00',
    updatedAt: '2026-03-07T11:20:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T11:20:00', note: 'تم تقديم الطلب — المستأجر أقر بأن الكسر بسبب كرة أطفال', userId: 'ten-004' },
    ],
  },
  {
    id: 'req-005',
    title: 'خلل في نظام الإنذار',
    description: 'نظام إنذار الحريق يعطي إنذارات كاذبة متكررة في الطابق الثاني. تم فحص الدخان — لا يوجد مصدر.',
    category: 'fire_safety',
    subcategory: 'إنذار حريق',
    buildingId: 'bld-002',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — عمارة الياسمين',
    status: 'reviewed',
    priority: 'high',
    costResponsibility: 'hoa',
    costLegalBasis: 'وفقاً لنظام ملكية الوحدات العقارية المفرزة: أنظمة السلامة والحماية من الحريق من الأجزاء المشتركة — نفقاتها على جميع الملاك بنسبة حصصهم.',
    estimatedCost: 2200,
    reportedById: 'ten-003',
    createdAt: '2026-03-05T20:00:00',
    updatedAt: '2026-03-06T09:15:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-05T20:00:00', note: 'بلاغ من مستأجر الطابق الثاني عن إنذارات كاذبة متكررة', userId: 'ten-003' },
      { status: 'reviewed', timestamp: '2026-03-06T09:15:00', note: 'تمت المراجعة — يحتاج فحص النظام بالكامل. تم التواصل مع شركة صيانة أنظمة الحريق.', userId: 'off-001' },
    ],
  },
  {
    id: 'req-006',
    title: 'تسريب من سخان الماء',
    description: 'تسريب بسيط من سخان الماء الكهربائي (٥٠ لتر). السخان عمره ٤ سنوات — يحتاج استبدال.',
    category: 'plumbing',
    subcategory: 'سخان',
    buildingId: 'bld-001',
    unitId: 'unit-007',
    location: 'unit',
    locationLabel: 'شقة ٤٠٢ — برج النخيل',
    status: 'completed',
    priority: 'medium',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً لنظام إيجار (المادة ٥): السخان من تجهيزات العين المؤجرة الأساسية — صيانته واستبداله على المؤجر ما لم يكن التلف بفعل المستأجر.',
    estimatedCost: 1800,
    actualCost: 1650,
    reportedById: 'ten-006',
    assignedProviderId: 'sp-002',
    createdAt: '2026-02-20T14:00:00',
    updatedAt: '2026-02-23T16:00:00',
    completedAt: '2026-02-23T16:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-20T14:00:00', note: 'تم تقديم الطلب', userId: 'ten-006' },
      { status: 'reviewed', timestamp: '2026-02-20T15:30:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-21T09:00:00', note: 'تم تعيين شركة البناء المتين للسباكة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-22T10:00:00', note: 'تم طلب سخان جديد — التركيب غداً', userId: 'sp-002' },
      { status: 'completed', timestamp: '2026-02-23T16:00:00', note: 'تم استبدال السخان بنجاح — ضمان سنة', userId: 'sp-002' },
    ],
  },
  {
    id: 'req-007',
    title: 'صيانة مولد الكهرباء',
    description: 'الصيانة الدورية للمولد الاحتياطي. آخر صيانة قبل ٦ أشهر. يحتاج تغيير زيت وفلاتر وفحص البطارية.',
    category: 'generator',
    subcategory: 'صيانة دورية',
    buildingId: 'bld-003',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — مجمع الواحة التجاري',
    status: 'in_progress',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'وفقاً لنظام ملكية الوحدات المفرزة (المادة ١١): المولد الاحتياطي من المرافق المشتركة — نفقات صيانته الدورية على جميع الملاك.',
    estimatedCost: 4500,
    reportedById: 'off-001',
    assignedProviderId: 'sp-003',
    createdAt: '2026-03-03T08:00:00',
    updatedAt: '2026-03-06T15:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-03T08:00:00', note: 'جدولة صيانة دورية للمولد', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-03T10:00:00', note: 'تم تعيين مؤسسة النور للكهرباء', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-06T09:00:00', note: 'بدأ الفني العمل — يحتاج تغيير فلتر الهواء أيضاً', userId: 'sp-003' },
    ],
  },
  {
    id: 'req-008',
    title: 'انسداد في مجرى الصرف',
    description: 'انسداد في مجرى الصرف الرئيسي للحمام. المياه لا تنزل بشكل طبيعي. المشكلة متكررة للمرة الثالثة خلال شهرين.',
    category: 'plumbing',
    subcategory: 'انسداد',
    buildingId: 'bld-002',
    unitId: 'unit-011',
    location: 'unit',
    locationLabel: 'شقة ١٠٣ — عمارة الياسمين',
    status: 'submitted',
    priority: 'medium',
    costResponsibility: 'tenant',
    costLegalBasis: 'وفقاً للمادة ١٠ من نظام إيجار: "يلتزم المستأجر بالصيانة التأجيرية (الدورية) اللازمة للمحافظة على العين المؤجرة" — الانسداد المتكرر ناتج عن سوء الاستخدام.',
    estimatedCost: 350,
    reportedById: 'ten-004',
    createdAt: '2026-03-07T08:30:00',
    updatedAt: '2026-03-07T08:30:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T08:30:00', note: 'تم تقديم الطلب — المشكلة متكررة', userId: 'ten-004' },
    ],
  },
  {
    id: 'req-009',
    title: 'إصلاح تلف في دهان الجدار',
    description: 'تقشر الدهان في السقف بسبب رطوبة من الطابق العلوي. بقعة بمساحة متر مربع تقريباً.',
    category: 'cosmetic',
    subcategory: 'دهان',
    buildingId: 'bld-001',
    unitId: 'unit-002',
    location: 'unit',
    locationLabel: 'شقة ١٠٢ — برج النخيل',
    status: 'reviewed',
    priority: 'low',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً للمادة ٥ من نظام إيجار: التلف ناتج عن عيب هيكلي (رطوبة) وليس بفعل المستأجر — المسؤولية على المؤجر.',
    estimatedCost: 800,
    reportedById: 'ten-002',
    createdAt: '2026-03-06T13:00:00',
    updatedAt: '2026-03-07T09:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-06T13:00:00', note: 'تم تقديم الطلب مع صور للتلف', userId: 'ten-002' },
      { status: 'reviewed', timestamp: '2026-03-07T09:00:00', note: 'تمت المراجعة — يجب معالجة مصدر الرطوبة أولاً قبل إعادة الدهان', userId: 'off-001' },
    ],
  },
  {
    id: 'req-010',
    title: 'تركيب قفل جديد للباب',
    description: 'قفل الباب الرئيسي للشقة لا يعمل بشكل سليم. المفتاح يعلق أحياناً. يحتاج استبدال كامل.',
    category: 'general',
    subcategory: 'أقفال',
    buildingId: 'bld-002',
    unitId: 'unit-012',
    location: 'unit',
    locationLabel: 'شقة ٢٠١ — عمارة الياسمين',
    status: 'assigned',
    priority: 'high',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً لنظام إيجار: الباب الرئيسي وقفله من مكونات العين المؤجرة — صيانته على المؤجر ما لم يثبت تلف بفعل المستأجر.',
    estimatedCost: 450,
    reportedById: 'ten-003',
    assignedProviderId: 'sp-004',
    createdAt: '2026-03-05T10:00:00',
    updatedAt: '2026-03-06T14:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-05T10:00:00', note: 'تم تقديم الطلب', userId: 'ten-003' },
      { status: 'reviewed', timestamp: '2026-03-05T16:00:00', note: 'تمت المراجعة — مسألة أمنية تحتاج سرعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-06T14:00:00', note: 'تم تعيين شركة الأمان للصيانة العامة', userId: 'off-001' },
    ],
  },

  // --- NEW REQUESTS (req-011 to req-035) ---
  {
    id: 'req-011',
    title: 'تسريب مياه من السقف',
    description: 'تسريب مياه من السقف في صالة المعيشة بعد هطول الأمطار. يبدو أن المشكلة من العزل الخارجي.',
    category: 'plumbing',
    subcategory: 'تسريب مياه',
    buildingId: 'bld-004',
    unitId: 'unit-029',
    location: 'unit',
    locationLabel: 'شقة ٦٠١ — برج الياقوت',
    status: 'submitted',
    priority: 'high',
    costResponsibility: 'owner',
    costLegalBasis: 'وفقاً للمادة ٥ من نظام إيجار: تسريب الأمطار من عيوب العين المؤجرة الهيكلية — المسؤولية على المؤجر.',
    estimatedCost: 2500,
    reportedById: 'ten-013',
    createdAt: '2026-03-08T07:00:00',
    updatedAt: '2026-03-08T07:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T07:00:00', note: 'تم تقديم الطلب مع صور للتسريب', userId: 'ten-013' },
    ],
  },
  {
    id: 'req-012',
    title: 'عطل في التكييف المركزي',
    description: 'التكييف المركزي لا يعمل في الطابق الثالث. جميع المكاتب متأثرة. درجة الحرارة مرتفعة جداً.',
    category: 'hvac',
    subcategory: 'تكييف مركزي',
    buildingId: 'bld-005',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — مجمع الريان التجاري',
    status: 'in_progress',
    priority: 'urgent',
    costResponsibility: 'hoa',
    costLegalBasis: 'التكييف المركزي من أنظمة المبنى المشتركة — نفقاته على جميع الملاك وفقاً لنظام ملكية الوحدات المفرزة.',
    estimatedCost: 12000,
    reportedById: 'ten-017',
    assignedProviderId: 'sp-017',
    createdAt: '2026-03-07T10:00:00',
    updatedAt: '2026-03-08T09:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T10:00:00', note: 'بلاغ عن توقف التكييف المركزي', userId: 'ten-017' },
      { status: 'reviewed', timestamp: '2026-03-07T10:30:00', note: 'أولوية عاجلة — مكاتب تجارية متأثرة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-07T11:00:00', note: 'تم تعيين شركة البرودة السعودية', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-08T08:00:00', note: 'الفريق الفني في الموقع — تشخيص العطل جاري', userId: 'sp-017' },
    ],
  },
  {
    id: 'req-013',
    title: 'خلل في الإضاءة الخارجية',
    description: 'إضاءة المواقف والممرات الخارجية لا تعمل منذ يومين. مشكلة أمنية.',
    category: 'electrical',
    subcategory: 'إضاءة',
    buildingId: 'bld-006',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — عمارة السلام',
    status: 'assigned',
    priority: 'high',
    costResponsibility: 'hoa',
    costLegalBasis: 'الإضاءة الخارجية من المرافق المشتركة — المسؤولية على اتحاد الملاك.',
    estimatedCost: 1800,
    reportedById: 'ten-020',
    assignedProviderId: 'sp-011',
    createdAt: '2026-03-06T18:00:00',
    updatedAt: '2026-03-07T11:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-06T18:00:00', note: 'بلاغ عن انطفاء الإضاءة الخارجية', userId: 'ten-020' },
      { status: 'reviewed', timestamp: '2026-03-07T08:00:00', note: 'تمت المراجعة — مشكلة أمنية', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-07T11:00:00', note: 'تم تعيين شركة الكهرباء المتقدمة', userId: 'off-001' },
    ],
  },
  {
    id: 'req-014',
    title: 'صيانة مصعد أبراج المروج',
    description: 'المصعد رقم ٢ يصدر أصوات احتكاك عند التوقف. يحتاج فحص وتشحيم القضبان.',
    category: 'elevator',
    subcategory: 'صيانة دورية',
    buildingId: 'bld-007',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — أبراج المروج',
    status: 'in_progress',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'صيانة المصاعد من مسؤولية اتحاد الملاك وفقاً لنظام ملكية الوحدات المفرزة.',
    estimatedCost: 3200,
    reportedById: 'off-001',
    assignedProviderId: 'sp-027',
    createdAt: '2026-03-05T09:00:00',
    updatedAt: '2026-03-07T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-05T09:00:00', note: 'طلب صيانة وقائية للمصعد', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-05T14:00:00', note: 'تم تعيين شركة أوتيس السعودية', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-07T10:00:00', note: 'فريق أوتيس في الموقع — بدء أعمال الصيانة', userId: 'sp-027' },
    ],
  },
  {
    id: 'req-015',
    title: 'مكافحة حشرات في المبنى',
    description: 'ظهور صراصير في الطابق الأرضي والقبو. يحتاج رش شامل للمبنى.',
    category: 'pest_control',
    subcategory: 'صراصير',
    buildingId: 'bld-006',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — عمارة السلام',
    status: 'completed',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'مكافحة الحشرات في المناطق المشتركة من مسؤولية اتحاد الملاك.',
    estimatedCost: 1500,
    actualCost: 1200,
    reportedById: 'ten-022',
    assignedProviderId: 'sp-044',
    createdAt: '2026-02-25T09:00:00',
    updatedAt: '2026-02-27T16:00:00',
    completedAt: '2026-02-27T16:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-25T09:00:00', note: 'بلاغ عن ظهور حشرات', userId: 'ten-022' },
      { status: 'reviewed', timestamp: '2026-02-25T10:30:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-25T14:00:00', note: 'تم تعيين مؤسسة البيئة النظيفة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-26T08:00:00', note: 'بدء أعمال الرش', userId: 'sp-044' },
      { status: 'completed', timestamp: '2026-02-27T16:00:00', note: 'تم الرش بنجاح — ضمان ٣ أشهر', userId: 'sp-044' },
    ],
  },
  {
    id: 'req-016',
    title: 'إعادة دهان الشقة',
    description: 'دهان الشقة متهالك بعد ٥ سنوات من الاستخدام. يحتاج إعادة دهان كاملة قبل تأجيرها مجدداً.',
    category: 'painting',
    subcategory: 'دهان كامل',
    buildingId: 'bld-004',
    unitId: 'unit-027',
    location: 'unit',
    locationLabel: 'شقة ٤٠١ — برج الياقوت',
    status: 'in_progress',
    priority: 'low',
    costResponsibility: 'owner',
    costLegalBasis: 'إعادة الدهان لتجهيز الشقة للتأجير من مسؤولية المالك.',
    estimatedCost: 4000,
    reportedById: 'off-001',
    assignedProviderId: 'sp-033',
    createdAt: '2026-03-01T10:00:00',
    updatedAt: '2026-03-06T14:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-01T10:00:00', note: 'طلب إعادة دهان الشقة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-02T09:00:00', note: 'تم تعيين دهانات الفخامة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-06T08:00:00', note: 'بدء أعمال الدهان — متوقع الانتهاء خلال ٣ أيام', userId: 'sp-033' },
    ],
  },
  {
    id: 'req-017',
    title: 'عطل في القاطع الكهربائي',
    description: 'القاطع الرئيسي يفصل بشكل متكرر عند تشغيل المكيف والغسالة معاً. يحتاج ترقية اللوحة.',
    category: 'electrical',
    subcategory: 'لوحة كهربائية',
    buildingId: 'bld-004',
    unitId: 'unit-021',
    location: 'unit',
    locationLabel: 'شقة ١٠١ — برج الياقوت',
    status: 'completed',
    priority: 'high',
    costResponsibility: 'owner',
    costLegalBasis: 'اللوحة الكهربائية من مكونات العين المؤجرة الأساسية — المسؤولية على المؤجر.',
    estimatedCost: 2800,
    actualCost: 3200,
    reportedById: 'ten-007',
    assignedProviderId: 'sp-003',
    createdAt: '2026-02-15T16:00:00',
    updatedAt: '2026-02-19T12:00:00',
    completedAt: '2026-02-19T12:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-15T16:00:00', note: 'تم تقديم الطلب', userId: 'ten-007' },
      { status: 'reviewed', timestamp: '2026-02-16T09:00:00', note: 'تمت المراجعة — يحتاج ترقية', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-16T14:00:00', note: 'تم تعيين مؤسسة النور للكهرباء', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-18T08:00:00', note: 'بدء أعمال ترقية اللوحة', userId: 'sp-003' },
      { status: 'completed', timestamp: '2026-02-19T12:00:00', note: 'تم ترقية اللوحة الكهربائية — التكلفة الفعلية ٣,٢٠٠ ر.س', userId: 'sp-003' },
    ],
  },
  {
    id: 'req-018',
    title: 'تنظيف خزان المياه',
    description: 'الصيانة الدورية لخزان المياه العلوي. آخر تنظيف قبل ٦ أشهر.',
    category: 'cleaning',
    subcategory: 'خزان مياه',
    buildingId: 'bld-007',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — أبراج المروج',
    status: 'completed',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'خزان المياه من المرافق المشتركة — تنظيفه الدوري على اتحاد الملاك.',
    estimatedCost: 2000,
    actualCost: 1800,
    reportedById: 'off-001',
    assignedProviderId: 'sp-042',
    createdAt: '2026-02-10T08:00:00',
    updatedAt: '2026-02-12T15:00:00',
    completedAt: '2026-02-12T15:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-10T08:00:00', note: 'جدولة تنظيف دوري للخزان', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-10T10:00:00', note: 'تم تعيين شركة نقاء', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-11T07:00:00', note: 'بدء أعمال التنظيف والتعقيم', userId: 'sp-042' },
      { status: 'completed', timestamp: '2026-02-12T15:00:00', note: 'تم التنظيف والتعقيم — شهادة صلاحية المياه مرفقة', userId: 'sp-042' },
    ],
  },
  {
    id: 'req-019',
    title: 'تسريب في مواسير الصرف',
    description: 'تسريب من مواسير الصرف الصحي في الطابق الأرضي. رائحة كريهة وتسرب مياه.',
    category: 'plumbing',
    subcategory: 'صرف صحي',
    buildingId: 'bld-008',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — مجمع الأندلس',
    status: 'in_progress',
    priority: 'urgent',
    costResponsibility: 'hoa',
    costLegalBasis: 'مواسير الصرف الرئيسية من المرافق المشتركة.',
    estimatedCost: 5000,
    reportedById: 'ten-016',
    assignedProviderId: 'sp-010',
    createdAt: '2026-03-08T06:30:00',
    updatedAt: '2026-03-08T11:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T06:30:00', note: 'بلاغ عاجل عن تسريب صرف صحي', userId: 'ten-016' },
      { status: 'reviewed', timestamp: '2026-03-08T07:00:00', note: 'حالة طارئة — تحتاج تدخل فوري', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-08T07:30:00', note: 'تم تعيين مؤسسة الأنابيب الذهبية', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-08T09:00:00', note: 'الفريق الفني وصل الموقع', userId: 'sp-010' },
    ],
  },
  {
    id: 'req-020',
    title: 'تركيب كاميرات مراقبة',
    description: 'تركيب نظام كاميرات مراقبة جديد للمداخل والمواقف. ٨ كاميرات مع جهاز تسجيل.',
    category: 'general',
    subcategory: 'أنظمة أمنية',
    buildingId: 'bld-007',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — أبراج المروج',
    status: 'reviewed',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'أنظمة الأمان من المرافق المشتركة — تكلفتها على جميع الملاك.',
    estimatedCost: 15000,
    reportedById: 'off-001',
    createdAt: '2026-03-04T10:00:00',
    updatedAt: '2026-03-05T14:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-04T10:00:00', note: 'طلب تركيب كاميرات مراقبة', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-03-05T14:00:00', note: 'تمت المراجعة — بانتظار عروض أسعار من الموردين', userId: 'off-001' },
    ],
  },
  {
    id: 'req-021',
    title: 'إصلاح تكييف سبليت',
    description: 'تكييف غرفة النوم لا يبرد بشكل كافي. يحتاج تنظيف وإعادة تعبئة فريون.',
    category: 'hvac',
    subcategory: 'لا يبرد بشكل كافي',
    buildingId: 'bld-006',
    unitId: 'unit-041',
    location: 'unit',
    locationLabel: 'شقة ٢٠١ — عمارة السلام',
    status: 'assigned',
    priority: 'medium',
    costResponsibility: 'owner',
    costLegalBasis: 'نظام التكييف من تجهيزات العين المؤجرة الأساسية — صيانته على المؤجر.',
    estimatedCost: 800,
    reportedById: 'ten-022',
    assignedProviderId: 'sp-019',
    createdAt: '2026-03-07T14:00:00',
    updatedAt: '2026-03-08T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T14:00:00', note: 'تم تقديم الطلب', userId: 'ten-022' },
      { status: 'reviewed', timestamp: '2026-03-07T16:00:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-08T10:00:00', note: 'تم تعيين تكييف الراحة', userId: 'off-001' },
    ],
  },
  {
    id: 'req-022',
    title: 'تسريب ماء من المكيف',
    description: 'تسريب ماء مستمر من الوحدة الداخلية للمكيف على الحائط. أدى لتلف الدهان.',
    category: 'hvac',
    subcategory: 'تسريب ماء',
    buildingId: 'bld-002',
    unitId: 'unit-014',
    location: 'unit',
    locationLabel: 'شقة ٣٠١ — عمارة الياسمين',
    status: 'completed',
    priority: 'medium',
    costResponsibility: 'owner',
    costLegalBasis: 'تسريب المكيف من مشاكل التجهيزات الأساسية — المسؤولية على المؤجر.',
    estimatedCost: 600,
    actualCost: 450,
    reportedById: 'ten-006',
    assignedProviderId: 'sp-001',
    createdAt: '2026-02-22T11:00:00',
    updatedAt: '2026-02-24T14:00:00',
    completedAt: '2026-02-24T14:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-22T11:00:00', note: 'تم تقديم الطلب', userId: 'ten-006' },
      { status: 'reviewed', timestamp: '2026-02-22T14:00:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-23T09:00:00', note: 'تم تعيين مؤسسة الفيصل للتكييف', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-24T08:00:00', note: 'الفني في الموقع — المشكلة في انسداد خرطوم التصريف', userId: 'sp-001' },
      { status: 'completed', timestamp: '2026-02-24T14:00:00', note: 'تم تنظيف خرطوم التصريف — التكلفة ٤٥٠ ر.س', userId: 'sp-001' },
    ],
  },
  {
    id: 'req-023',
    title: 'إصلاح باب خشبي',
    description: 'باب غرفة النوم الرئيسية متضرر ولا يغلق بشكل صحيح. يحتاج تعديل أو استبدال.',
    category: 'structural',
    subcategory: 'أبواب',
    buildingId: 'bld-007',
    unitId: 'unit-050',
    location: 'unit',
    locationLabel: 'شقة ٢٠٢ — أبراج المروج',
    status: 'submitted',
    priority: 'low',
    costResponsibility: 'pending_review',
    costLegalBasis: 'يحتاج تحديد سبب التلف — إذا كان بفعل المستأجر فالمسؤولية عليه، وإذا كان عيب في التصنيع فالمسؤولية على المالك.',
    estimatedCost: 1200,
    reportedById: 'ten-010',
    createdAt: '2026-03-08T15:00:00',
    updatedAt: '2026-03-08T15:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T15:00:00', note: 'تم تقديم الطلب — بانتظار تحديد المسؤولية', userId: 'ten-010' },
    ],
  },
  {
    id: 'req-024',
    title: 'فحص نظام الحريق',
    description: 'الفحص السنوي لنظام إطفاء الحريق وطفايات الحريق في المبنى.',
    category: 'fire_safety',
    subcategory: 'فحص دوري',
    buildingId: 'bld-008',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — مجمع الأندلس',
    status: 'assigned',
    priority: 'high',
    costResponsibility: 'hoa',
    costLegalBasis: 'فحص أنظمة السلامة الدوري من مسؤولية اتحاد الملاك.',
    estimatedCost: 3500,
    reportedById: 'off-001',
    assignedProviderId: 'sp-029',
    createdAt: '2026-03-06T08:00:00',
    updatedAt: '2026-03-07T09:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-06T08:00:00', note: 'جدولة الفحص السنوي لنظام الحريق', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-03-06T10:00:00', note: 'تمت المراجعة والموافقة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-07T09:00:00', note: 'تم تعيين شركة الحماية والسلامة', userId: 'off-001' },
    ],
  },
  {
    id: 'req-025',
    title: 'نظافة عامة للمبنى',
    description: 'تنظيف شامل للمداخل والسلالم والمصاعد والمواقف.',
    category: 'cleaning',
    subcategory: 'تنظيف شامل',
    buildingId: 'bld-004',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — برج الياقوت',
    status: 'completed',
    priority: 'low',
    costResponsibility: 'hoa',
    costLegalBasis: 'نظافة المناطق المشتركة من مسؤولية اتحاد الملاك.',
    estimatedCost: 3000,
    actualCost: 2800,
    reportedById: 'off-001',
    assignedProviderId: 'sp-039',
    createdAt: '2026-03-01T07:00:00',
    updatedAt: '2026-03-02T17:00:00',
    completedAt: '2026-03-02T17:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-01T07:00:00', note: 'طلب تنظيف شامل شهري', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-01T09:00:00', note: 'تم تعيين شركة النظافة المتكاملة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-02T07:00:00', note: 'بدء أعمال التنظيف', userId: 'sp-039' },
      { status: 'completed', timestamp: '2026-03-02T17:00:00', note: 'تم الانتهاء من التنظيف', userId: 'sp-039' },
    ],
  },
  {
    id: 'req-026',
    title: 'تلف في أرضية السيراميك',
    description: 'كسر في بلاط المطبخ — ٣ بلاطات متضررة. المستأجر يقول السبب سقوط جسم ثقيل.',
    category: 'structural',
    subcategory: 'أرضيات',
    buildingId: 'bld-006',
    unitId: 'unit-039',
    location: 'unit',
    locationLabel: 'شقة ١٠١ — عمارة السلام',
    status: 'reviewed',
    priority: 'low',
    costResponsibility: 'tenant',
    costLegalBasis: 'التلف بفعل المستأجر — يتحمل تكلفة الإصلاح وفقاً للمادة ١٣ من نظام إيجار.',
    estimatedCost: 500,
    reportedById: 'ten-020',
    createdAt: '2026-03-07T12:00:00',
    updatedAt: '2026-03-08T09:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T12:00:00', note: 'تم تقديم الطلب — المستأجر أقر بأن التلف بسببه', userId: 'ten-020' },
      { status: 'reviewed', timestamp: '2026-03-08T09:00:00', note: 'تمت المراجعة — المسؤولية على المستأجر', userId: 'off-001' },
    ],
  },
  {
    id: 'req-027',
    title: 'عزل مائي للسطح',
    description: 'يحتاج السطح إعادة عزل مائي بعد ظهور تسريبات في الطابق الأخير.',
    category: 'structural',
    subcategory: 'عزل',
    buildingId: 'bld-007',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — أبراج المروج',
    status: 'submitted',
    priority: 'high',
    costResponsibility: 'hoa',
    costLegalBasis: 'السطح من المرافق المشتركة — عزله من مسؤولية اتحاد الملاك.',
    estimatedCost: 25000,
    reportedById: 'off-001',
    createdAt: '2026-03-08T08:00:00',
    updatedAt: '2026-03-08T08:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T08:00:00', note: 'طلب إعادة عزل سطح المبنى', userId: 'off-001' },
    ],
  },
  {
    id: 'req-028',
    title: 'تغيير مفتاح إنارة',
    description: 'مفتاح الإنارة في الصالة لا يعمل. يحتاج استبدال بسيط.',
    category: 'electrical',
    subcategory: 'مفتاح',
    buildingId: 'bld-004',
    unitId: 'unit-022',
    location: 'unit',
    locationLabel: 'شقة ١٠٢ — برج الياقوت',
    status: 'completed',
    priority: 'low',
    costResponsibility: 'tenant',
    costLegalBasis: 'استبدال المفاتيح والأباريز من الصيانة التأجيرية البسيطة — على المستأجر.',
    estimatedCost: 80,
    actualCost: 80,
    reportedById: 'ten-008',
    assignedProviderId: 'sp-015',
    createdAt: '2026-02-28T10:00:00',
    updatedAt: '2026-03-01T11:00:00',
    completedAt: '2026-03-01T11:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-28T10:00:00', note: 'تم تقديم الطلب', userId: 'ten-008' },
      { status: 'assigned', timestamp: '2026-02-28T14:00:00', note: 'تم تعيين كهربائي الخبرة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-01T09:00:00', note: 'الفني في الموقع', userId: 'sp-015' },
      { status: 'completed', timestamp: '2026-03-01T11:00:00', note: 'تم الاستبدال', userId: 'sp-015' },
    ],
  },
  {
    id: 'req-029',
    title: 'إصلاح واجهة المحل',
    description: 'كسر في زجاج واجهة المعرض بسبب حادث سيارة. يحتاج استبدال فوري.',
    category: 'structural',
    subcategory: 'زجاج واجهة',
    buildingId: 'bld-005',
    unitId: 'unit-031',
    location: 'unit',
    locationLabel: 'معرض ١ — مجمع الريان التجاري',
    status: 'in_progress',
    priority: 'urgent',
    costResponsibility: 'pending_review',
    costLegalBasis: 'يحتاج تحديد — إذا كان الضرر من طرف ثالث قد يُطالب بالتعويض عبر التأمين.',
    estimatedCost: 8000,
    reportedById: 'ten-014',
    assignedProviderId: 'sp-036',
    createdAt: '2026-03-08T14:00:00',
    updatedAt: '2026-03-08T16:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T14:00:00', note: 'بلاغ عاجل — كسر واجهة المحل', userId: 'ten-014' },
      { status: 'reviewed', timestamp: '2026-03-08T14:30:00', note: 'حالة طارئة — يحتاج تأمين فوري', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-08T15:00:00', note: 'تم تعيين ورشة الخشب الذهبي لتأمين الواجهة مؤقتاً', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-03-08T16:00:00', note: 'تم تركيب حماية مؤقتة — طلب زجاج جديد', userId: 'sp-036' },
    ],
  },
  {
    id: 'req-030',
    title: 'صيانة حديقة المبنى',
    description: 'قص أشجار وتنظيف الحديقة الخارجية وإصلاح نظام الري.',
    category: 'general',
    subcategory: 'تنسيق حدائق',
    buildingId: 'bld-007',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — أبراج المروج',
    status: 'completed',
    priority: 'low',
    costResponsibility: 'hoa',
    costLegalBasis: 'تنسيق الحدائق من صيانة المرافق المشتركة.',
    estimatedCost: 2500,
    actualCost: 2200,
    reportedById: 'off-001',
    assignedProviderId: 'sp-052',
    createdAt: '2026-02-20T08:00:00',
    updatedAt: '2026-02-22T16:00:00',
    completedAt: '2026-02-22T16:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-20T08:00:00', note: 'طلب صيانة دورية للحديقة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-02-20T10:00:00', note: 'تم تعيين مؤسسة الحدائق الجميلة', userId: 'off-001' },
      { status: 'in_progress', timestamp: '2026-02-21T07:00:00', note: 'بدء أعمال التنسيق', userId: 'sp-052' },
      { status: 'completed', timestamp: '2026-02-22T16:00:00', note: 'تم الانتهاء — تم إصلاح نظام الري', userId: 'sp-052' },
    ],
  },
  {
    id: 'req-031',
    title: 'رائحة كريهة من المكيف',
    description: 'رائحة كريهة تصدر من المكيف عند تشغيله. يحتاج تنظيف الفلتر والوحدة الداخلية.',
    category: 'hvac',
    subcategory: 'رائحة كريهة',
    buildingId: 'bld-006',
    unitId: 'unit-044',
    location: 'unit',
    locationLabel: 'شقة ٣٠٢ — عمارة السلام',
    status: 'submitted',
    priority: 'low',
    costResponsibility: 'tenant',
    costLegalBasis: 'تنظيف فلتر المكيف من الصيانة الدورية — على المستأجر.',
    estimatedCost: 200,
    reportedById: 'ten-024',
    createdAt: '2026-03-08T13:00:00',
    updatedAt: '2026-03-08T13:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-08T13:00:00', note: 'تم تقديم الطلب', userId: 'ten-024' },
    ],
  },
  {
    id: 'req-032',
    title: 'استبدال سيفون الحمام',
    description: 'السيفون يسرب ماء بشكل مستمر. يحتاج استبدال كامل.',
    category: 'plumbing',
    subcategory: 'سيفون',
    buildingId: 'bld-007',
    unitId: 'unit-047',
    location: 'unit',
    locationLabel: 'شقة ١٠١ — أبراج المروج',
    status: 'assigned',
    priority: 'medium',
    costResponsibility: 'owner',
    costLegalBasis: 'السيفون من تجهيزات العين المؤجرة — استبداله على المؤجر.',
    estimatedCost: 350,
    reportedById: 'ten-007',
    assignedProviderId: 'sp-005',
    createdAt: '2026-03-07T09:00:00',
    updatedAt: '2026-03-08T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-07T09:00:00', note: 'تم تقديم الطلب', userId: 'ten-007' },
      { status: 'reviewed', timestamp: '2026-03-07T14:00:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'assigned', timestamp: '2026-03-08T10:00:00', note: 'تم تعيين مؤسسة الفيصل للسباكة', userId: 'off-001' },
    ],
  },
  {
    id: 'req-033',
    title: 'إصلاح سور المواقف',
    description: 'جزء من سور المواقف متضرر بسبب اصطدام سيارة. يحتاج إصلاح.',
    category: 'structural',
    subcategory: 'سور',
    buildingId: 'bld-005',
    unitId: undefined,
    location: 'common_area',
    locationLabel: 'منطقة مشتركة — مجمع الريان التجاري',
    status: 'cancelled',
    priority: 'low',
    costResponsibility: 'hoa',
    costLegalBasis: 'سور المواقف من المرافق المشتركة.',
    estimatedCost: 3000,
    reportedById: 'off-001',
    createdAt: '2026-02-18T10:00:00',
    updatedAt: '2026-02-20T09:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-18T10:00:00', note: 'طلب إصلاح سور المواقف', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-02-19T09:00:00', note: 'تمت المراجعة', userId: 'off-001' },
      { status: 'cancelled', timestamp: '2026-02-20T09:00:00', note: 'تم إلغاء الطلب — سيتم التعامل من خلال التأمين', userId: 'off-001' },
    ],
  },
  {
    id: 'req-034',
    title: 'تركيب نظام إنتركم',
    description: 'تركيب نظام إنتركم جديد لجميع الشقق مع شاشة فيديو.',
    category: 'general',
    subcategory: 'أنظمة ذكية',
    buildingId: 'bld-004',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — برج الياقوت',
    status: 'reviewed',
    priority: 'medium',
    costResponsibility: 'hoa',
    costLegalBasis: 'أنظمة الاتصال الداخلي من المرافق المشتركة.',
    estimatedCost: 18000,
    reportedById: 'off-001',
    createdAt: '2026-03-03T11:00:00',
    updatedAt: '2026-03-05T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-03-03T11:00:00', note: 'طلب تركيب نظام إنتركم', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-03-05T10:00:00', note: 'تمت المراجعة — بانتظار موافقة الملاك', userId: 'off-001' },
    ],
  },
  {
    id: 'req-035',
    title: 'تسريب في خزان المياه',
    description: 'تسريب بسيط من خزان المياه الأرضي. يحتاج فحص وإصلاح.',
    category: 'plumbing',
    subcategory: 'خزان مياه',
    buildingId: 'bld-008',
    unitId: undefined,
    location: 'building_system',
    locationLabel: 'نظام المبنى — مجمع الأندلس',
    status: 'cancelled',
    priority: 'high',
    costResponsibility: 'hoa',
    costLegalBasis: 'خزان المياه من المرافق المشتركة.',
    estimatedCost: 4000,
    reportedById: 'off-001',
    createdAt: '2026-02-15T08:00:00',
    updatedAt: '2026-02-17T10:00:00',
    statusLog: [
      { status: 'submitted', timestamp: '2026-02-15T08:00:00', note: 'بلاغ عن تسريب من الخزان', userId: 'off-001' },
      { status: 'reviewed', timestamp: '2026-02-15T10:00:00', note: 'تمت المعاينة — تبين أنه تكثف وليس تسريب', userId: 'off-001' },
      { status: 'cancelled', timestamp: '2026-02-17T10:00:00', note: 'تم إلغاء الطلب — لا يوجد تسريب حقيقي', userId: 'off-001' },
    ],
  },
];

// --- HOA Fees ---

export const hoaFees: HOAFee[] = [
  // Al Nakheel Tower Q1 2026
  { id: 'hoa-001', unitId: 'unit-001', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 1800, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-10' },
  { id: 'hoa-002', unitId: 'unit-002', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 1425, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-14' },
  { id: 'hoa-003', unitId: 'unit-003', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 2250, status: 'overdue', dueDate: '2026-01-15' },
  { id: 'hoa-004', unitId: 'unit-005', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 1275, status: 'outstanding', dueDate: '2026-03-15' },
  { id: 'hoa-005', unitId: 'unit-006', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 1950, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-12' },
  { id: 'hoa-006', unitId: 'unit-007', buildingId: 'bld-001', period: 'الربع الأول ٢٠٢٦', amount: 2100, status: 'overdue', dueDate: '2026-01-15' },
  // Al Yasmin Q1 2026
  { id: 'hoa-007', unitId: 'unit-009', buildingId: 'bld-002', period: 'الربع الأول ٢٠٢٦', amount: 1000, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-13' },
  { id: 'hoa-008', unitId: 'unit-010', buildingId: 'bld-002', period: 'الربع الأول ٢٠٢٦', amount: 800, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-15' },
  { id: 'hoa-009', unitId: 'unit-011', buildingId: 'bld-002', period: 'الربع الأول ٢٠٢٦', amount: 900, status: 'outstanding', dueDate: '2026-03-15' },
  { id: 'hoa-010', unitId: 'unit-012', buildingId: 'bld-002', period: 'الربع الأول ٢٠٢٦', amount: 1100, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-11' },
];

// --- Cost Rules ---

export const costRules: CostRule[] = [
  {
    id: 'cr-001',
    category: 'الصيانة الأساسية (هيكلية)',
    responsibility: 'owner',
    legalBasis: 'المادة ٥ من نظام إيجار',
    description: 'يتحمل المؤجر نفقات الصيانة غير التأجيرية وإصلاح الخلل الذي يؤثر في استيفاء المنفعة المقصودة.',
  },
  {
    id: 'cr-002',
    category: 'الصيانة الدورية',
    responsibility: 'tenant',
    legalBasis: 'المادة ١٠ من نظام إيجار',
    description: 'يلتزم المستأجر بالصيانة التأجيرية (الدورية) اللازمة للمحافظة على العين المؤجرة بحالة حسنة.',
  },
  {
    id: 'cr-003',
    category: 'تلف بفعل المستأجر',
    responsibility: 'tenant',
    legalBasis: 'المادة ١٣ من نظام إيجار',
    description: 'يلتزم المستأجر بإصلاح ما أحدثه هو أو من يأذن لهم بالانتفاع من تلف في العين المؤجرة.',
  },
  {
    id: 'cr-004',
    category: 'المرافق المشتركة',
    responsibility: 'hoa',
    legalBasis: 'المادة ١١ من نظام ملكية الوحدات المفرزة',
    description: 'تكون نفقات صيانة الأجزاء المشتركة على جميع الملاك كل بنسبة حصته من المساحة الكلية.',
  },
];

// --- Notification count ---
export const notificationCount = 12;

// --- Helper functions ---

export function getBuildingById(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

export function getUnitById(id: string): Unit | undefined {
  return units.find((u) => u.id === id);
}

export function getUnitsByBuilding(buildingId: string): Unit[] {
  return units.filter((u) => u.buildingId === buildingId);
}

export function getUserById(id: string): User | undefined {
  return [...owners, ...tenants].find((u) => u.id === id);
}

export function getProviderById(id: string): ServiceProvider | undefined {
  return serviceProviders.find((sp) => sp.id === id);
}

export function getRequestsByBuilding(buildingId: string): MaintenanceRequest[] {
  return maintenanceRequests.filter((r) => r.buildingId === buildingId);
}

export function getRequestsByTenant(tenantId: string): MaintenanceRequest[] {
  return maintenanceRequests.filter((r) => r.reportedById === tenantId);
}

export function getRequestsByOwner(ownerId: string): MaintenanceRequest[] {
  const ownerUnits = units.filter((u) => u.ownerId === ownerId);
  const ownerUnitIds = ownerUnits.map((u) => u.id);
  return maintenanceRequests.filter((r) => r.unitId && ownerUnitIds.includes(r.unitId));
}

export function getRequestsByProvider(providerId: string): MaintenanceRequest[] {
  return maintenanceRequests.filter((r) => r.assignedProviderId === providerId);
}

export function getHOAFeesByBuilding(buildingId: string): HOAFee[] {
  return hoaFees.filter((f) => f.buildingId === buildingId);
}

export function getHOAFeesByUnit(unitId: string): HOAFee[] {
  return hoaFees.filter((f) => f.unitId === unitId);
}

export function formatSAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date('2026-03-07T15:00:00');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  return formatDate(dateStr);
}

// --- Stats ---

export function getOfficeStats() {
  const totalRequests = maintenanceRequests.length;
  const activeRequests = maintenanceRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const pendingRequests = maintenanceRequests.filter((r) => ['submitted', 'reviewed'].includes(r.status)).length;
  const completedThisMonth = maintenanceRequests.filter((r) => r.status === 'completed' && r.completedAt && r.completedAt.startsWith('2026-03')).length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const totalMonthlyRent = units.filter((u) => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);
  const hoaPaid = hoaFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const hoaOutstanding = hoaFees.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);

  return {
    totalBuildings: buildings.length,
    totalUnits,
    occupiedUnits,
    occupancyRate,
    totalRequests,
    activeRequests,
    pendingRequests,
    completedThisMonth,
    totalMonthlyRent,
    hoaPaid,
    hoaOutstanding,
  };
}

// Status pipeline order
export const statusPipeline: RequestStatus[] = [
  'submitted',
  'reviewed',
  'assigned',
  'in_progress',
  'completed',
];

// --- Ejar Contracts ---

export interface EjarContract {
  id: string;
  unitId: string;
  buildingId: string;
  tenantId: string;
  ownerId?: string;
  monthlyRent: number;
  annualRent?: number;
  startDate: string;
  endDate: string;
  ejarNumber: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_renewal';
  depositAmount?: number;
  contractTerms?: string;
}

export const ejarContracts: EjarContract[] = [
  // Original 14 contracts
  { id: 'ej-001', unitId: 'unit-001', buildingId: 'bld-001', tenantId: 'ten-001', ownerId: 'own-001', monthlyRent: 4500, annualRent: 54000, startDate: '2025-04-01', endDate: '2026-03-31', ejarNumber: 'EJ-1446-00001', status: 'expiring_soon', depositAmount: 2700, contractTerms: 'عقد سكني سنوي — يشمل صيانة التكييف' },
  { id: 'ej-002', unitId: 'unit-002', buildingId: 'bld-001', tenantId: 'ten-002', ownerId: 'own-001', monthlyRent: 3500, annualRent: 42000, startDate: '2025-06-01', endDate: '2026-05-31', ejarNumber: 'EJ-1446-00002', status: 'active', depositAmount: 2100, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-003', unitId: 'unit-003', buildingId: 'bld-001', tenantId: 'ten-003', ownerId: 'own-002', monthlyRent: 5500, annualRent: 66000, startDate: '2025-09-01', endDate: '2026-08-31', ejarNumber: 'EJ-1446-00003', status: 'active', depositAmount: 3300, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-004', unitId: 'unit-005', buildingId: 'bld-001', tenantId: 'ten-004', ownerId: 'own-001', monthlyRent: 3200, annualRent: 38400, startDate: '2025-07-01', endDate: '2026-06-30', ejarNumber: 'EJ-1446-00004', status: 'active', depositAmount: 1920, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-005', unitId: 'unit-006', buildingId: 'bld-001', tenantId: 'ten-005', ownerId: 'own-003', monthlyRent: 5000, annualRent: 60000, startDate: '2025-05-01', endDate: '2026-04-30', ejarNumber: 'EJ-1446-00005', status: 'expiring_soon', depositAmount: 3000, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-006', unitId: 'unit-007', buildingId: 'bld-001', tenantId: 'ten-006', ownerId: 'own-003', monthlyRent: 6000, annualRent: 72000, startDate: '2025-08-01', endDate: '2026-07-31', ejarNumber: 'EJ-1446-00006', status: 'active', depositAmount: 3600, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-007', unitId: 'unit-009', buildingId: 'bld-002', tenantId: 'ten-001', ownerId: 'own-004', monthlyRent: 3000, annualRent: 36000, startDate: '2025-03-01', endDate: '2026-02-28', ejarNumber: 'EJ-1446-00007', status: 'expired', depositAmount: 1800, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-008', unitId: 'unit-010', buildingId: 'bld-002', tenantId: 'ten-002', ownerId: 'own-004', monthlyRent: 2500, annualRent: 30000, startDate: '2025-10-01', endDate: '2026-09-30', ejarNumber: 'EJ-1446-00008', status: 'active', depositAmount: 1500, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-009', unitId: 'unit-011', buildingId: 'bld-002', tenantId: 'ten-004', ownerId: 'own-002', monthlyRent: 2800, annualRent: 33600, startDate: '2025-11-01', endDate: '2026-04-15', ejarNumber: 'EJ-1446-00009', status: 'expiring_soon', depositAmount: 1680, contractTerms: 'عقد سكني — ٦ أشهر' },
  { id: 'ej-010', unitId: 'unit-012', buildingId: 'bld-002', tenantId: 'ten-003', ownerId: 'own-002', monthlyRent: 3500, annualRent: 42000, startDate: '2025-12-01', endDate: '2026-11-30', ejarNumber: 'EJ-1446-00010', status: 'active', depositAmount: 2100, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-011', unitId: 'unit-014', buildingId: 'bld-002', tenantId: 'ten-006', ownerId: 'own-004', monthlyRent: 3800, annualRent: 45600, startDate: '2025-06-01', endDate: '2026-05-31', ejarNumber: 'EJ-1446-00011', status: 'active', depositAmount: 2280, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-012', unitId: 'unit-015', buildingId: 'bld-003', tenantId: 'ten-005', ownerId: 'own-001', monthlyRent: 12000, annualRent: 144000, startDate: '2025-01-01', endDate: '2026-12-31', ejarNumber: 'EJ-1446-00012', status: 'active', depositAmount: 7200, contractTerms: 'عقد تجاري — سنتين' },
  { id: 'ej-013', unitId: 'unit-017', buildingId: 'bld-003', tenantId: 'ten-003', ownerId: 'own-003', monthlyRent: 6000, annualRent: 72000, startDate: '2025-04-01', endDate: '2026-03-31', ejarNumber: 'EJ-1446-00013', status: 'expiring_soon', depositAmount: 3600, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-014', unitId: 'unit-020', buildingId: 'bld-003', tenantId: 'ten-006', ownerId: 'own-002', monthlyRent: 6500, annualRent: 78000, startDate: '2025-07-01', endDate: '2026-06-30', ejarNumber: 'EJ-1446-00014', status: 'active', depositAmount: 3900, contractTerms: 'عقد تجاري سنوي' },

  // New contracts for new buildings
  { id: 'ej-015', unitId: 'unit-021', buildingId: 'bld-004', tenantId: 'ten-007', ownerId: 'own-005', monthlyRent: 4200, annualRent: 50400, startDate: '2025-08-01', endDate: '2026-07-31', ejarNumber: 'EJ-1446-00015', status: 'active', depositAmount: 2520, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-016', unitId: 'unit-022', buildingId: 'bld-004', tenantId: 'ten-008', ownerId: 'own-005', monthlyRent: 3300, annualRent: 39600, startDate: '2025-09-01', endDate: '2026-08-31', ejarNumber: 'EJ-1446-00016', status: 'active', depositAmount: 1980, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-017', unitId: 'unit-023', buildingId: 'bld-004', tenantId: 'ten-009', ownerId: 'own-006', monthlyRent: 4800, annualRent: 57600, startDate: '2025-06-01', endDate: '2026-05-31', ejarNumber: 'EJ-1446-00017', status: 'active', depositAmount: 2880, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-018', unitId: 'unit-025', buildingId: 'bld-004', tenantId: 'ten-010', ownerId: 'own-005', monthlyRent: 5200, annualRent: 62400, startDate: '2025-10-01', endDate: '2026-09-30', ejarNumber: 'EJ-1446-00018', status: 'active', depositAmount: 3120, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-019', unitId: 'unit-026', buildingId: 'bld-004', tenantId: 'ten-011', ownerId: 'own-005', monthlyRent: 4500, annualRent: 54000, startDate: '2025-11-01', endDate: '2026-10-31', ejarNumber: 'EJ-1446-00019', status: 'active', depositAmount: 2700, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-020', unitId: 'unit-028', buildingId: 'bld-004', tenantId: 'ten-012', ownerId: 'own-006', monthlyRent: 3400, annualRent: 40800, startDate: '2025-05-01', endDate: '2026-04-30', ejarNumber: 'EJ-1446-00020', status: 'expiring_soon', depositAmount: 2040, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-021', unitId: 'unit-029', buildingId: 'bld-004', tenantId: 'ten-013', ownerId: 'own-005', monthlyRent: 7500, annualRent: 90000, startDate: '2025-07-01', endDate: '2026-06-30', ejarNumber: 'EJ-1446-00021', status: 'active', depositAmount: 4500, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-022', unitId: 'unit-031', buildingId: 'bld-005', tenantId: 'ten-014', ownerId: 'own-007', monthlyRent: 15000, annualRent: 180000, startDate: '2025-01-01', endDate: '2026-12-31', ejarNumber: 'EJ-1446-00022', status: 'active', depositAmount: 9000, contractTerms: 'عقد تجاري — سنتين' },
  { id: 'ej-023', unitId: 'unit-032', buildingId: 'bld-005', tenantId: 'ten-015', ownerId: 'own-007', monthlyRent: 12000, annualRent: 144000, startDate: '2025-03-01', endDate: '2026-02-28', ejarNumber: 'EJ-1446-00023', status: 'expired', depositAmount: 7200, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-024', unitId: 'unit-033', buildingId: 'bld-005', tenantId: 'ten-016', ownerId: 'own-007', monthlyRent: 7000, annualRent: 84000, startDate: '2025-08-01', endDate: '2026-07-31', ejarNumber: 'EJ-1446-00024', status: 'active', depositAmount: 4200, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-025', unitId: 'unit-035', buildingId: 'bld-005', tenantId: 'ten-017', ownerId: 'own-008', monthlyRent: 8000, annualRent: 96000, startDate: '2025-04-01', endDate: '2026-03-31', ejarNumber: 'EJ-1446-00025', status: 'expiring_soon', depositAmount: 4800, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-026', unitId: 'unit-036', buildingId: 'bld-005', tenantId: 'ten-018', ownerId: 'own-008', monthlyRent: 6000, annualRent: 72000, startDate: '2025-09-01', endDate: '2026-08-31', ejarNumber: 'EJ-1446-00026', status: 'active', depositAmount: 3600, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-027', unitId: 'unit-038', buildingId: 'bld-005', tenantId: 'ten-019', ownerId: 'own-007', monthlyRent: 5000, annualRent: 60000, startDate: '2025-06-01', endDate: '2026-05-31', ejarNumber: 'EJ-1446-00027', status: 'active', depositAmount: 3000, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-028', unitId: 'unit-039', buildingId: 'bld-006', tenantId: 'ten-020', ownerId: 'own-008', monthlyRent: 2200, annualRent: 26400, startDate: '2025-10-01', endDate: '2026-09-30', ejarNumber: 'EJ-1446-00028', status: 'active', depositAmount: 1320, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-029', unitId: 'unit-040', buildingId: 'bld-006', tenantId: 'ten-021', ownerId: 'own-008', monthlyRent: 2000, annualRent: 24000, startDate: '2025-12-01', endDate: '2026-11-30', ejarNumber: 'EJ-1446-00029', status: 'active', depositAmount: 1200, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-030', unitId: 'unit-041', buildingId: 'bld-006', tenantId: 'ten-022', ownerId: 'own-009', monthlyRent: 2800, annualRent: 33600, startDate: '2025-07-01', endDate: '2026-06-30', ejarNumber: 'EJ-1446-00030', status: 'active', depositAmount: 1680, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-031', unitId: 'unit-043', buildingId: 'bld-006', tenantId: 'ten-023', ownerId: 'own-009', monthlyRent: 3000, annualRent: 36000, startDate: '2025-05-01', endDate: '2026-04-30', ejarNumber: 'EJ-1446-00031', status: 'expiring_soon', depositAmount: 1800, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-032', unitId: 'unit-044', buildingId: 'bld-006', tenantId: 'ten-024', ownerId: 'own-008', monthlyRent: 2300, annualRent: 27600, startDate: '2025-08-01', endDate: '2026-07-31', ejarNumber: 'EJ-1446-00032', status: 'active', depositAmount: 1380, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-033', unitId: 'unit-046', buildingId: 'bld-006', tenantId: 'ten-025', ownerId: 'own-009', monthlyRent: 1500, annualRent: 18000, startDate: '2025-02-01', endDate: '2026-01-31', ejarNumber: 'EJ-1446-00033', status: 'pending_renewal', depositAmount: 900, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-034', unitId: 'unit-047', buildingId: 'bld-007', tenantId: 'ten-007', ownerId: 'own-010', monthlyRent: 5500, annualRent: 66000, startDate: '2025-09-01', endDate: '2026-08-31', ejarNumber: 'EJ-1446-00034', status: 'active', depositAmount: 3300, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-035', unitId: 'unit-048', buildingId: 'bld-007', tenantId: 'ten-008', ownerId: 'own-010', monthlyRent: 4000, annualRent: 48000, startDate: '2025-11-01', endDate: '2026-10-31', ejarNumber: 'EJ-1446-00035', status: 'active', depositAmount: 2400, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-036', unitId: 'unit-049', buildingId: 'bld-007', tenantId: 'ten-009', ownerId: 'own-010', monthlyRent: 6500, annualRent: 78000, startDate: '2025-06-01', endDate: '2026-05-31', ejarNumber: 'EJ-1446-00036', status: 'active', depositAmount: 3900, contractTerms: 'عقد سكني سنوي' },
  { id: 'ej-037', unitId: 'unit-059', buildingId: 'bld-008', tenantId: 'ten-016', ownerId: 'own-009', monthlyRent: 14000, annualRent: 168000, startDate: '2025-02-01', endDate: '2027-01-31', ejarNumber: 'EJ-1446-00037', status: 'active', depositAmount: 8400, contractTerms: 'عقد تجاري — سنتين' },
  { id: 'ej-038', unitId: 'unit-060', buildingId: 'bld-008', tenantId: 'ten-017', ownerId: 'own-009', monthlyRent: 11000, annualRent: 132000, startDate: '2025-04-01', endDate: '2026-03-31', ejarNumber: 'EJ-1446-00038', status: 'expiring_soon', depositAmount: 6600, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-039', unitId: 'unit-061', buildingId: 'bld-008', tenantId: 'ten-018', ownerId: 'own-010', monthlyRent: 6500, annualRent: 78000, startDate: '2025-07-01', endDate: '2026-06-30', ejarNumber: 'EJ-1446-00039', status: 'active', depositAmount: 3900, contractTerms: 'عقد تجاري سنوي' },
  { id: 'ej-040', unitId: 'unit-063', buildingId: 'bld-008', tenantId: 'ten-019', ownerId: 'own-009', monthlyRent: 7000, annualRent: 84000, startDate: '2025-10-01', endDate: '2026-09-30', ejarNumber: 'EJ-1446-00040', status: 'active', depositAmount: 4200, contractTerms: 'عقد تجاري سنوي' },
];

export function getContractsByOwner(ownerId: string): EjarContract[] {
  const ownerUnitIds = units.filter((u) => u.ownerId === ownerId).map((u) => u.id);
  return ejarContracts.filter((c) => ownerUnitIds.includes(c.unitId));
}

export function getContractsByUnit(unitId: string): EjarContract | undefined {
  return ejarContracts.find((c) => c.unitId === unitId);
}

// --- Owner Monthly Financial Data ---

export interface OwnerMonthlyFinance {
  month: string;
  monthLabel: string;
  income: number;
  maintenance: number;
  hoaFees: number;
  managementFee: number;
}

export function getOwnerMonthlyFinances(ownerId: string): OwnerMonthlyFinance[] {
  const ownerUnitsList = units.filter((u) => u.ownerId === ownerId);
  const monthlyIncome = ownerUnitsList.filter((u) => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);
  const mgmtRate = 0.07;

  return [
    { month: '2025-10', monthLabel: 'أكتوبر', income: Math.round(monthlyIncome * 0.95), maintenance: 1200, hoaFees: 0, managementFee: Math.round(monthlyIncome * 0.95 * mgmtRate) },
    { month: '2025-11', monthLabel: 'نوفمبر', income: monthlyIncome, maintenance: 0, hoaFees: 0, managementFee: Math.round(monthlyIncome * mgmtRate) },
    { month: '2025-12', monthLabel: 'ديسمبر', income: monthlyIncome, maintenance: 3500, hoaFees: 0, managementFee: Math.round(monthlyIncome * mgmtRate) },
    { month: '2026-01', monthLabel: 'يناير', income: monthlyIncome, maintenance: 980, hoaFees: 3225, managementFee: Math.round(monthlyIncome * mgmtRate) },
    { month: '2026-02', monthLabel: 'فبراير', income: monthlyIncome, maintenance: 1650, hoaFees: 0, managementFee: Math.round(monthlyIncome * mgmtRate) },
    { month: '2026-03', monthLabel: 'مارس', income: Math.round(monthlyIncome * 0.88), maintenance: 800, hoaFees: 1275, managementFee: Math.round(monthlyIncome * 0.88 * mgmtRate) },
  ];
}

export const ejarContractStatusLabels: Record<string, string> = {
  active: 'ساري',
  expiring_soon: 'ينتهي قريباً',
  expired: 'منتهي',
  pending_renewal: 'بانتظار التجديد',
};

export const ejarContractStatusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  expiring_soon: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  expired: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  pending_renewal: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
};

// --- Extended Dashboard Stats ---

export function getExtendedOfficeStats() {
  const base = getOfficeStats();

  // Urgency breakdown
  const urgentRequests = maintenanceRequests.filter((r) => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status)).length;
  const highRequests = maintenanceRequests.filter((r) => r.priority === 'high' && !['completed', 'cancelled'].includes(r.status)).length;
  const mediumRequests = maintenanceRequests.filter((r) => r.priority === 'medium' && !['completed', 'cancelled'].includes(r.status)).length;
  const lowRequests = maintenanceRequests.filter((r) => r.priority === 'low' && !['completed', 'cancelled'].includes(r.status)).length;

  // Rent collection: occupied units expected rent vs "collected" (mock 88%)
  const expectedRent = units.filter((u) => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);
  const collectedRent = Math.round(expectedRent * 0.88);
  const collectionRate = Math.round((collectedRent / expectedRent) * 100);

  // Average resolution time (completed requests)
  const completedRequests = maintenanceRequests.filter((r) => r.status === 'completed' && r.completedAt);
  const avgResolutionDays = completedRequests.length > 0
    ? Math.round(completedRequests.reduce((sum, r) => {
        const created = new Date(r.createdAt).getTime();
        const completed = new Date(r.completedAt!).getTime();
        return sum + (completed - created) / (1000 * 60 * 60 * 24);
      }, 0) / completedRequests.length)
    : 0;

  // Category breakdown for expense chart
  const categoryExpenses: Record<string, number> = {};
  maintenanceRequests.forEach((r) => {
    const cost = r.actualCost || r.estimatedCost || 0;
    const label = categoryLabels[r.category] || r.category;
    categoryExpenses[label] = (categoryExpenses[label] || 0) + cost;
  });

  // Building-level profitability
  const buildingProfitability = buildings.map((b) => {
    const bUnits = units.filter((u) => u.buildingId === b.id);
    const revenue = bUnits.filter((u) => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);
    const bRequests = maintenanceRequests.filter((r) => r.buildingId === b.id);
    const expenses = bRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
    const occupancy = Math.round((b.occupiedUnits / b.unitCount) * 100);
    const activeIssues = bRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
    // Health score: occupancy weight 40%, issue-free weight 30%, collection weight 30%
    const issueScore = Math.max(0, 100 - activeIssues * 20);
    const healthScore = Math.round(occupancy * 0.4 + issueScore * 0.3 + collectionRate * 0.3);
    return { building: b, revenue, expenses, net: revenue - expenses, occupancy, activeIssues, healthScore };
  });

  // Monthly revenue mock (last 6 months)
  const monthlyRevenue = [
    { month: 'أكتوبر', revenue: 72000, expenses: 8200 },
    { month: 'نوفمبر', revenue: 75000, expenses: 5400 },
    { month: 'ديسمبر', revenue: 74500, expenses: 12100 },
    { month: 'يناير', revenue: 78000, expenses: 7800 },
    { month: 'فبراير', revenue: 76500, expenses: 9600 },
    { month: 'مارس', revenue: 79200, expenses: 6300 },
  ];

  // Commission earned this month (5% of collected)
  const commissionRate = 0.05;
  const commissionEarned = Math.round(collectedRent * commissionRate);

  // Ejar contracts expiring within 30 days
  const ejarExpiringContracts = ejarContracts
    .filter((c) => c.status === 'expiring_soon')
    .map((c) => {
      const unit = getUnitById(c.unitId);
      const building = getBuildingById(c.buildingId);
      const tenant = getUserById(c.tenantId);
      return {
        unitId: c.unitId,
        buildingName: building?.name || '',
        unitNumber: unit?.unitNumber || '',
        tenantName: tenant?.name || '',
        expiryDate: c.endDate,
      };
    });

  // Compliance alerts
  const complianceAlerts = [
    { type: 'ejar' as const, severity: 'warning' as const, message: `عقود إيجار تحتاج تجديد خلال ٣٠ يوم`, count: ejarExpiringContracts.length },
    { type: 'fire_safety' as const, severity: 'danger' as const, message: 'فحص السلامة مستحق — عمارة الياسمين', count: 1 },
    { type: 'elevator' as const, severity: 'warning' as const, message: 'شهادة صيانة المصعد تنتهي قريباً — برج النخيل', count: 1 },
    { type: 'hoa' as const, severity: 'danger' as const, message: 'رسوم اتحاد ملاك متأخرة', count: hoaFees.filter((f) => f.status === 'overdue').length },
  ];

  return {
    ...base,
    urgentRequests,
    highRequests,
    mediumRequests,
    lowRequests,
    expectedRent,
    collectedRent,
    collectionRate,
    avgResolutionDays,
    categoryExpenses,
    buildingProfitability,
    monthlyRevenue,
    commissionEarned,
    ejarExpiringContracts,
    complianceAlerts,
  };
}

// --- Tenant-specific data ---

export interface RentPayment {
  id: string;
  month: string;
  amount: number;
  status: 'paid' | 'due' | 'overdue';
  dueDate: string;
  paidDate?: string;
  method?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  buildingId: string;
  createdAt: string;
  type: 'info' | 'warning' | 'urgent';
  read: boolean;
}

export interface TenantContract {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  ejarNumber: string;
}

// Khaled's rent payments (ten-001, unit-001 in bld-001)
export const tenantRentPayments: RentPayment[] = [
  { id: 'rp-001', month: 'مارس ٢٠٢٦', amount: 4500, status: 'due', dueDate: '2026-03-15' },
  { id: 'rp-002', month: 'فبراير ٢٠٢٦', amount: 4500, status: 'paid', dueDate: '2026-02-15', paidDate: '2026-02-13', method: 'تحويل بنكي' },
  { id: 'rp-003', month: 'يناير ٢٠٢٦', amount: 4500, status: 'paid', dueDate: '2026-01-15', paidDate: '2026-01-14', method: 'تحويل بنكي' },
  { id: 'rp-004', month: 'ديسمبر ٢٠٢٥', amount: 4500, status: 'paid', dueDate: '2025-12-15', paidDate: '2025-12-12', method: 'مدى' },
  { id: 'rp-005', month: 'نوفمبر ٢٠٢٥', amount: 4500, status: 'paid', dueDate: '2025-11-15', paidDate: '2025-11-15', method: 'تحويل بنكي' },
  { id: 'rp-006', month: 'أكتوبر ٢٠٢٥', amount: 4500, status: 'paid', dueDate: '2025-10-15', paidDate: '2025-10-10', method: 'مدى' },
];

export const tenantContract: TenantContract = {
  startDate: '2025-04-01',
  endDate: '2026-03-31',
  monthlyRent: 4500,
  ejarNumber: 'EJAR-77204581',
};

export const buildingAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'صيانة مصعد المبنى',
    body: 'سيتم إيقاف المصعد يوم الخميس ١٣ مارس من الساعة ٨ صباحاً حتى ١٢ ظهراً للصيانة الدورية. نأمل استخدام الدرج خلال هذه الفترة.',
    buildingId: 'bld-001',
    createdAt: '2026-03-07T10:00:00',
    type: 'warning',
    read: false,
  },
  {
    id: 'ann-002',
    title: 'قطع مياه مؤقت',
    body: 'سيتم قطع المياه عن المبنى يوم السبت ١٥ مارس من الساعة ١٠ مساءً حتى ٦ صباحاً لأعمال صيانة الخزان العلوي. نوصي بتخزين مياه كافية.',
    buildingId: 'bld-001',
    createdAt: '2026-03-06T14:30:00',
    type: 'urgent',
    read: false,
  },
  {
    id: 'ann-003',
    title: 'تحديث نظام المواقف',
    body: 'تم تركيب بوابة دخول إلكترونية جديدة للمواقف. سيتم توزيع بطاقات الدخول الجديدة خلال الأسبوع القادم.',
    buildingId: 'bld-001',
    createdAt: '2026-03-04T09:00:00',
    type: 'info',
    read: true,
  },
  {
    id: 'ann-004',
    title: 'تذكير: رسوم الإيجار',
    body: 'نذكر السادة المستأجرين بأن موعد سداد إيجار شهر مارس هو ١٥ مارس ٢٠٢٦. يرجى الالتزام بالموعد تجنباً لأي غرامات تأخير.',
    buildingId: 'bld-001',
    createdAt: '2026-03-01T08:00:00',
    type: 'info',
    read: true,
  },
];

export function getAnnouncementsByBuilding(buildingId: string): Announcement[] {
  return buildingAnnouncements.filter((a) => a.buildingId === buildingId);
}

export function getDaysUntilContractEnd(): number {
  const end = new Date(tenantContract.endDate);
  const now = new Date('2026-03-08T12:00:00');
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getRentStatusColor(status: RentPayment['status']): string {
  if (status === 'paid') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  if (status === 'due') return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
  return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
}

export function getRentStatusLabel(status: RentPayment['status']): string {
  if (status === 'paid') return 'مدفوع';
  if (status === 'due') return 'مستحق';
  return 'متأخر';
}

// Cost router: determine who pays based on category + location + subcategory
export interface CostRouterResult {
  responsibility: CostResponsibility;
  label: string;
  legalBasis: string;
  estimatedRange: string;
  article: string;
}

export function getCostRouterResult(category: string, subcategory: string, location: string): CostRouterResult {
  // Common area / building system = HOA
  if (location === 'common_area' || location === 'building_system') {
    return {
      responsibility: 'hoa',
      label: 'صندوق الملاك (اتحاد المُلّاك)',
      legalBasis: 'المناطق المشتركة وأنظمة المبنى من مسؤولية اتحاد الملاك وفقاً لنظام ملكية الوحدات المفرزة.',
      estimatedRange: '٥٠٠ - ١٠,٠٠٠ ر.س',
      article: 'المادة ١١ — نظام ملكية الوحدات المفرزة',
    };
  }

  // Tenant-caused damage
  const tenantCaused = ['كسر زجاج', 'انسداد', 'انسداد مجاري', 'تلف بفعل المستأجر'];
  if (tenantCaused.some((t) => subcategory.includes(t))) {
    return {
      responsibility: 'tenant',
      label: 'المستأجر',
      legalBasis: 'يلتزم المستأجر بإصلاح ما أحدثه هو أو من يأذن لهم بالانتفاع من تلف.',
      estimatedRange: '١٠٠ - ٢,٠٠٠ ر.س',
      article: 'المادة ٤٣٠ — نظام المعاملات المدنية',
    };
  }

  // Periodic/routine maintenance = Tenant
  const tenantMaintenance = ['فلتر', 'تنظيف', 'صيانة دورية'];
  if (tenantMaintenance.some((t) => subcategory.includes(t))) {
    return {
      responsibility: 'tenant',
      label: 'المستأجر',
      legalBasis: 'الصيانة الدورية والتشغيلية البسيطة من مسؤولية المستأجر.',
      estimatedRange: '٥٠ - ٥٠٠ ر.س',
      article: 'المادة ٤٢٨ — نظام المعاملات المدنية',
    };
  }

  // Everything else: structural, systems, major repairs = Owner
  const costMap: Record<string, string> = {
    hvac: '١,٥٠٠ - ٥,٠٠٠ ر.س',
    plumbing: '٢٠٠ - ٣,٠٠٠ ر.س',
    electrical: '١٥٠ - ٢,٥٠٠ ر.س',
    structural: '٥٠٠ - ٨,٠٠٠ ر.س',
    cosmetic: '٢٠٠ - ٢,٠٠٠ ر.س',
    fire_safety: '٥٠٠ - ٥,٠٠٠ ر.س',
    elevator: '١,٠٠٠ - ١٥,٠٠٠ ر.س',
    general: '١٠٠ - ٣,٠٠٠ ر.س',
    painting: '٢٠٠ - ٤,٠٠٠ ر.س',
    cleaning: '١٠٠ - ٢,٠٠٠ ر.س',
    pest_control: '٣٠٠ - ٢,٠٠٠ ر.س',
  };

  return {
    responsibility: 'owner',
    label: 'المالك',
    legalBasis: 'يتحمل المؤجر نفقات الصيانة غير التأجيرية وإصلاح الخلل الذي يؤثر في استيفاء المنفعة المقصودة من العين المؤجرة.',
    estimatedRange: costMap[category] || '١٠٠ - ٣,٠٠٠ ر.س',
    article: 'المادة ٤١٩ — نظام المعاملات المدنية',
  };
}

// Self-help tips per category+subcategory
export function getSelfHelpTip(category: string, subcategory: string): { tip: string; icon: string } | null {
  const tips: Record<string, Record<string, { tip: string; icon: string }>> = {
    hvac: {
      'لا يبرد بشكل كافي': { tip: 'جرب أولا: نظف فلتر المكيف وتأكد من عدم انسداده بالغبار. أغلق النوافذ والأبواب واضبط الحرارة على ٢٢ درجة. إذا المشكلة مستمرة بعد ساعة، أكمل البلاغ.', icon: 'snowflake' },
      'أصوات غير طبيعية': { tip: 'جرب أولا: أطفئ المكيف لمدة ٥ دقائق ثم أعد تشغيله. تأكد من عدم وجود أشياء قريبة من الوحدة الخارجية.', icon: 'volume' },
      'تسريب ماء': { tip: 'ضع وعاء أسفل التسريب فوراً وامسح المياه المتراكمة. لا تستخدم المكيف حتى يتم الإصلاح.', icon: 'droplet' },
      'رائحة كريهة': { tip: 'جرب أولا: افتح النوافذ لتهوية الغرفة وأطفئ المكيف. نظف الفلتر بالماء والصابون إن أمكن.', icon: 'wind' },
    },
    plumbing: {
      'انسداد': { tip: 'جرب أولا: استخدم المكبس (السحاب) عدة مرات بقوة. صب ماء مغلي في المصرف. إذا لم ينفع، أكمل البلاغ.', icon: 'wrench' },
      'تسريب مياه': { tip: 'أغلق المحبس الرئيسي فوراً لمنع تلف إضافي. ضع مناشف حول منطقة التسريب.', icon: 'alert' },
    },
    electrical: {
      'انقطاع كهرباء': { tip: 'تحقق أولا: هل انقطعت الكهرباء عن شقتك فقط أم المبنى كاملاً؟ جرب إعادة تفعيل القاطع في لوحة الكهرباء.', icon: 'zap' },
      'إضاءة': { tip: 'جرب أولا: استبدل اللمبة بواحدة جديدة. إذا لم تعمل الإضاءة مع لمبة جديدة، المشكلة في التوصيلات — أكمل البلاغ.', icon: 'lightbulb' },
    },
  };

  return tips[category]?.[subcategory] || null;
}

// --- Activity Feed ---

export interface ActivityEvent {
  id: string;
  type: 'request_created' | 'status_changed' | 'payment_received' | 'provider_assigned' | 'request_completed' | 'hoa_overdue';
  buildingName: string;
  unitNumber?: string;
  description: string;
  timestamp: string;
  icon: 'wrench' | 'check' | 'alert' | 'wallet' | 'user' | 'clock';
  color: string;
}

export function getActivityFeed(): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  // Generate events from status logs
  maintenanceRequests.forEach((r) => {
    const building = getBuildingById(r.buildingId);
    const unit = r.unitId ? getUnitById(r.unitId) : null;
    r.statusLog.forEach((log) => {
      let type: ActivityEvent['type'] = 'status_changed';
      let icon: ActivityEvent['icon'] = 'clock';
      let color = 'text-sky-500';

      if (log.status === 'submitted') { type = 'request_created'; icon = 'wrench'; color = 'text-blue-500'; }
      else if (log.status === 'assigned') { type = 'provider_assigned'; icon = 'user'; color = 'text-purple-500'; }
      else if (log.status === 'completed') { type = 'request_completed'; icon = 'check'; color = 'text-emerald-500'; }
      else if (log.status === 'in_progress') { icon = 'clock'; color = 'text-orange-500'; }

      events.push({
        id: `${r.id}-${log.status}-${log.timestamp}`,
        type,
        buildingName: building?.name || '',
        unitNumber: unit?.unitNumber,
        description: log.note,
        timestamp: log.timestamp,
        icon,
        color,
      });
    });
  });

  // Add HOA payment events
  hoaFees.filter((f) => f.status === 'paid' && f.paidDate).forEach((f) => {
    const building = getBuildingById(f.buildingId);
    const unit = getUnitById(f.unitId);
    events.push({
      id: `hoa-paid-${f.id}`,
      type: 'payment_received',
      buildingName: building?.name || '',
      unitNumber: unit?.unitNumber,
      description: `تم تحصيل رسوم اتحاد الملاك — ${formatSAR(f.amount)}`,
      timestamp: f.paidDate!,
      icon: 'wallet',
      color: 'text-emerald-500',
    });
  });

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

// --- NEW Helper Functions ---

/** Get all providers by specialty */
export function getProvidersBySpecialty(specialty: string): ServiceProvider[] {
  return serviceProviders.filter((sp) => sp.specialty === specialty || sp.specialtyEn === specialty);
}

/** Get provider's assigned/active requests */
export function getProviderActiveJobs(providerId: string): MaintenanceRequest[] {
  return maintenanceRequests.filter(
    (r) => r.assignedProviderId === providerId && !['completed', 'cancelled'].includes(r.status)
  );
}

/** Get owner's properties summary */
export function getOwnerPropertySummary(ownerId: string): {
  buildings: Building[];
  units: Unit[];
  totalRent: number;
  occupancy: number;
} {
  const ownerUnits = units.filter((u) => u.ownerId === ownerId);
  const ownerBuildingIds = [...new Set(ownerUnits.map((u) => u.buildingId))];
  const ownerBuildings = buildings.filter((b) => ownerBuildingIds.includes(b.id));
  const occupiedCount = ownerUnits.filter((u) => u.status === 'occupied').length;
  const totalRent = ownerUnits
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + u.monthlyRent, 0);
  const occupancy = ownerUnits.length > 0 ? Math.round((occupiedCount / ownerUnits.length) * 100) : 0;

  return {
    buildings: ownerBuildings,
    units: ownerUnits,
    totalRent,
    occupancy,
  };
}

/** Get tenant's complete profile (unit, building, contract, requests) */
export function getTenantProfile(tenantId: string): {
  tenant: User | undefined;
  unit: Unit | undefined;
  building: Building | undefined;
  contract: EjarContract | undefined;
  requests: MaintenanceRequest[];
} {
  const tenant = tenants.find((t) => t.id === tenantId);
  const unit = units.find((u) => u.tenantId === tenantId);
  const building = unit ? getBuildingById(unit.buildingId) : undefined;
  const contract = unit ? ejarContracts.find((c) => c.unitId === unit.id && c.tenantId === tenantId) : undefined;
  const requests = maintenanceRequests.filter((r) => r.reportedById === tenantId);

  return {
    tenant,
    unit,
    building,
    contract,
    requests,
  };
}
