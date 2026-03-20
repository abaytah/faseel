export const MaintenanceCategory = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  HVAC: 'HVAC',
  STRUCTURAL: 'STRUCTURAL',
  APPLIANCE: 'APPLIANCE',
  COSMETIC: 'COSMETIC',
} as const;

export type MaintenanceCategoryType =
  (typeof MaintenanceCategory)[keyof typeof MaintenanceCategory];

export const CATEGORY_LABELS_AR: Record<MaintenanceCategoryType, string> = {
  PLUMBING: 'سباكة',
  ELECTRICAL: 'كهرباء',
  HVAC: 'تكييف وتبريد',
  STRUCTURAL: 'أعمال إنشائية',
  APPLIANCE: 'أجهزة',
  COSMETIC: 'تشطيبات',
};

export const CATEGORY_LABELS_EN: Record<MaintenanceCategoryType, string> = {
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  HVAC: 'HVAC',
  STRUCTURAL: 'Structural',
  APPLIANCE: 'Appliance',
  COSMETIC: 'Cosmetic',
};

export const CATEGORY_ICONS: Record<MaintenanceCategoryType, string> = {
  PLUMBING: 'droplets',
  ELECTRICAL: 'zap',
  HVAC: 'thermometer',
  STRUCTURAL: 'building',
  APPLIANCE: 'washing-machine',
  COSMETIC: 'paint-bucket',
};
