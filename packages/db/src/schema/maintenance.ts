import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import {
  maintenanceCategoryEnum,
  requestStatusEnum,
  priorityEnum,
  costResponsibilityEnum,
  attachmentTypeEnum,
} from './enums';
import { offices } from './offices';
import { buildings, units } from './buildings';
import { users } from './users';

export const maintenanceRequests = pgTable(
  'maintenance_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    buildingId: uuid('building_id')
      .references(() => buildings.id, { onDelete: 'cascade' })
      .notNull(),
    unitId: uuid('unit_id')
      .references(() => units.id, { onDelete: 'cascade' })
      .notNull(),
    tenantId: uuid('tenant_id')
      .references(() => users.id)
      .notNull(),
    assignedProviderId: uuid('assigned_provider_id').references(() => users.id),
    category: maintenanceCategoryEnum('category').notNull(),
    status: requestStatusEnum('status').default('SUBMITTED').notNull(),
    priority: priorityEnum('priority').default('MEDIUM').notNull(),
    titleAr: varchar('title_ar', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    descriptionAr: text('description_ar').notNull(),
    descriptionEn: text('description_en'),
    estimatedCost: integer('estimated_cost'),
    actualCost: integer('actual_cost'),
    costResponsibility: costResponsibilityEnum('cost_responsibility'),
    tenantRating: integer('tenant_rating'),
    tenantFeedback: text('tenant_feedback'),
    scheduledDate: timestamp('scheduled_date'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('maintenance_requests_office_id_idx').on(table.officeId),
    index('maintenance_requests_building_id_idx').on(table.buildingId),
    index('maintenance_requests_unit_id_idx').on(table.unitId),
    index('maintenance_requests_tenant_id_idx').on(table.tenantId),
    index('maintenance_requests_status_idx').on(table.status),
    index('maintenance_requests_provider_idx').on(table.assignedProviderId),
  ],
);

export const requestAttachments = pgTable(
  'request_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .references(() => maintenanceRequests.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    type: attachmentTypeEnum('type').notNull(),
    caption: varchar('caption', { length: 255 }),
    uploadedBy: uuid('uploaded_by')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('request_attachments_request_id_idx').on(table.requestId)],
);

export const statusLog = pgTable(
  'status_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .references(() => maintenanceRequests.id, { onDelete: 'cascade' })
      .notNull(),
    fromStatus: requestStatusEnum('from_status'),
    toStatus: requestStatusEnum('to_status').notNull(),
    changedBy: uuid('changed_by')
      .references(() => users.id)
      .notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('status_log_request_id_idx').on(table.requestId)],
);

export const costRules = pgTable(
  'cost_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    category: maintenanceCategoryEnum('category').notNull(),
    ownerSharePercent: integer('owner_share_percent').notNull(),
    tenantSharePercent: integer('tenant_share_percent').notNull(),
    maxAmountSar: integer('max_amount_sar'),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('cost_rules_office_id_idx').on(table.officeId)],
);
