/**
 * Curated resources data for the Faseel Resources Hub.
 * Links to government platforms, useful tools, and provider services
 * relevant to Saudi real estate management.
 */

export interface Resource {
  id: string;
  nameAr: string;
  nameEn: string;
  url: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'government' | 'tools' | 'providers';
  relevantRoles: ('office' | 'tenant' | 'owner' | 'provider')[];
}

export const resources: Resource[] = [
  // ─── Government / Regulatory ───
  {
    id: 'ejar',
    nameAr: 'إيجار',
    nameEn: 'Ejar',
    url: 'https://www.ejar.sa',
    descriptionAr: 'منصة العقود الإلكترونية لتسجيل وتوثيق عقود الإيجار',
    descriptionEn: 'Electronic contracts platform for registering and documenting lease agreements',
    category: 'government',
    relevantRoles: ['office', 'tenant', 'owner'],
  },
  {
    id: 'mullak',
    nameAr: 'ملّاك',
    nameEn: 'Mullak',
    url: 'https://www.mullak.sa',
    descriptionAr: 'منصة اتحادات الملاك لإدارة العقارات المشتركة',
    descriptionEn: 'Owners associations platform for managing shared properties',
    category: 'government',
    relevantRoles: ['office', 'owner'],
  },
  {
    id: 'sakani',
    nameAr: 'سكني',
    nameEn: 'Sakani',
    url: 'https://www.sakani.sa',
    descriptionAr: 'برامج الإسكان والدعم السكني للمواطنين',
    descriptionEn: 'Housing programs and residential support for citizens',
    category: 'government',
    relevantRoles: ['tenant', 'owner'],
  },
  {
    id: 'balady',
    nameAr: 'بلدي',
    nameEn: 'Balady',
    url: 'https://www.balady.gov.sa',
    descriptionAr: 'الخدمات البلدية والتراخيص وشكاوى المباني',
    descriptionEn: 'Municipal services, licenses, and building complaints',
    category: 'government',
    relevantRoles: ['office', 'owner'],
  },
  {
    id: 'housing',
    nameAr: 'وزارة الإسكان',
    nameEn: 'Ministry of Housing',
    url: 'https://www.housing.gov.sa',
    descriptionAr: 'الأنظمة واللوائح العقارية والسياسات الإسكانية',
    descriptionEn: 'Real estate regulations, policies, and housing legislation',
    category: 'government',
    relevantRoles: ['office', 'owner'],
  },
  {
    id: 'fal',
    nameAr: 'فال',
    nameEn: 'Fal',
    url: 'https://www.rega.gov.sa',
    descriptionAr: 'ترخيص الوساطة العقارية والهيئة العامة للعقار',
    descriptionEn: 'Real estate brokerage licensing and General Authority for Real Estate',
    category: 'government',
    relevantRoles: ['office', 'provider'],
  },
  {
    id: 'sadad',
    nameAr: 'سداد',
    nameEn: 'Sadad',
    url: 'https://www.sadad.com',
    descriptionAr: 'نظام المدفوعات الرقمية لسداد الفواتير والمستحقات',
    descriptionEn: 'Digital payments system for paying bills and dues',
    category: 'government',
    relevantRoles: ['office', 'tenant', 'owner'],
  },

  // ─── Useful Tools ───
  {
    id: 'aqar',
    nameAr: 'عقار',
    nameEn: 'Aqar',
    url: 'https://www.aqar.fm',
    descriptionAr: 'منصة البحث عن العقارات للبيع والإيجار',
    descriptionEn: 'Property search platform for sale and rent listings',
    category: 'tools',
    relevantRoles: ['office', 'tenant', 'owner'],
  },
  {
    id: 'munjz',
    nameAr: 'منجز',
    nameEn: 'Munjz',
    url: 'https://www.munjz.com',
    descriptionAr: 'منصة خدمات الصيانة المنزلية وطلب الفنيين',
    descriptionEn: 'Home maintenance services platform for requesting technicians',
    category: 'tools',
    relevantRoles: ['office', 'tenant', 'owner', 'provider'],
  },
  {
    id: 'hungerstation',
    nameAr: 'هنقرستيشن',
    nameEn: 'HungerStation',
    url: 'https://www.hungerstation.com',
    descriptionAr: 'خدمات التوصيل للمطاعم والمتاجر',
    descriptionEn: 'Restaurant and store delivery services',
    category: 'tools',
    relevantRoles: ['tenant'],
  },
  {
    id: 'naqel',
    nameAr: 'نقل',
    nameEn: 'Naqel',
    url: 'https://www.naqelexpress.com',
    descriptionAr: 'خدمات الشحن والنقل السريع',
    descriptionEn: 'Shipping and express delivery services',
    category: 'tools',
    relevantRoles: ['office', 'tenant', 'owner'],
  },
  {
    id: 'absher',
    nameAr: 'أبشر',
    nameEn: 'Absher',
    url: 'https://www.absher.sa',
    descriptionAr: 'بوابة الخدمات الحكومية الإلكترونية',
    descriptionEn: 'Government e-services portal',
    category: 'tools',
    relevantRoles: ['office', 'tenant', 'owner', 'provider'],
  },

  // ─── For Providers ───
  {
    id: 'freelance',
    nameAr: 'منصة العمل الحر',
    nameEn: 'Freelance Platform',
    url: 'https://www.freelance.sa',
    descriptionAr: 'منصة العمل الحر لتسجيل وتنظيم الأعمال المستقلة',
    descriptionEn: 'Freelance work platform for registering and organizing independent work',
    category: 'providers',
    relevantRoles: ['provider'],
  },
  {
    id: 'hadaf',
    nameAr: 'هدف',
    nameEn: 'Hadaf (HRDF)',
    url: 'https://www.hrdf.org.sa',
    descriptionAr: 'صندوق تنمية الموارد البشرية ودعم التوظيف والتدريب',
    descriptionEn: 'Human Resources Development Fund for employment and training support',
    category: 'providers',
    relevantRoles: ['provider', 'office'],
  },
];

/**
 * Filter resources by category and/or role.
 */
export function filterResources(opts?: {
  category?: 'government' | 'tools' | 'providers';
  role?: 'office' | 'tenant' | 'owner' | 'provider';
}): Resource[] {
  let filtered = [...resources];

  if (opts?.category) {
    filtered = filtered.filter((r) => r.category === opts.category);
  }

  if (opts?.role) {
    filtered = filtered.filter((r) => r.relevantRoles.includes(opts.role!));
  }

  return filtered;
}
