export const SAUDI_CITIES = [
  'جدة',
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الطائف',
  'تبوك',
  'أبها',
  'القصيم',
  'حائل',
  'نجران',
  'جازان',
  'الجوف',
  'ينبع',
  'الأحساء',
  'القطيف',
] as const;

export type SaudiCity = (typeof SAUDI_CITIES)[number];
