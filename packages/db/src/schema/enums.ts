import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'OFFICE_ADMIN',
  'OWNER',
  'TENANT',
  'SERVICE_PROVIDER',
]);

export const buildingTypeEnum = pgEnum('building_type', ['RESIDENTIAL', 'COMMERCIAL', 'MIXED']);

export const unitStatusEnum = pgEnum('unit_status', ['OCCUPIED', 'VACANT', 'MAINTENANCE']);

export const contractStatusEnum = pgEnum('contract_status', [
  'ACTIVE',
  'EXPIRED',
  'TERMINATED',
  'PENDING',
]);

export const maintenanceCategoryEnum = pgEnum('maintenance_category', [
  'PLUMBING',
  'ELECTRICAL',
  'HVAC',
  'STRUCTURAL',
  'APPLIANCE',
  'COSMETIC',
  'PAINTING',
  'CARPENTRY',
  'PEST_CONTROL',
  'ELEVATOR',
  'SECURITY',
  'CLEANING',
  'OTHER',
]);

export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const requestStatusEnum = pgEnum('request_status', [
  'SUBMITTED',
  'REVIEWED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const costResponsibilityEnum = pgEnum('cost_responsibility', [
  'OWNER',
  'TENANT',
  'SHARED',
  'OFFICE',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'OVERDUE',
  'CANCELLED',
  'REFUNDED',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'ACTIVE',
  'PAST_DUE',
  'CANCELLED',
  'TRIALING',
]);

export const attachmentTypeEnum = pgEnum('attachment_type', ['IMAGE', 'VIDEO', 'DOCUMENT']);

export const notificationTypeEnum = pgEnum('notification_type', [
  'REQUEST_UPDATE',
  'PAYMENT_DUE',
  'ANNOUNCEMENT',
  'SYSTEM',
]);

export const pushPlatformEnum = pgEnum('push_platform', ['IOS', 'ANDROID', 'WEB']);
