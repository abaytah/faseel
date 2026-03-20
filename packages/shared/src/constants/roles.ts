export const UserRole = {
  /** مدير المكتب — Office administrator managing buildings */
  OFFICE_ADMIN: 'OFFICE_ADMIN',
  /** مالك العقار — Property owner */
  OWNER: 'OWNER',
  /** مستأجر — Tenant living in a unit */
  TENANT: 'TENANT',
  /** مقدم خدمة — Service provider (plumber, electrician, etc.) */
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const ROLE_LABELS_AR: Record<UserRoleType, string> = {
  OFFICE_ADMIN: 'مدير المكتب',
  OWNER: 'مالك العقار',
  TENANT: 'مستأجر',
  SERVICE_PROVIDER: 'مقدم خدمة',
};

export const ROLE_LABELS_EN: Record<UserRoleType, string> = {
  OFFICE_ADMIN: 'Office Admin',
  OWNER: 'Owner',
  TENANT: 'Tenant',
  SERVICE_PROVIDER: 'Service Provider',
};
