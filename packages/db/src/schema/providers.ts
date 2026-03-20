import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { offices } from './offices';

export const serviceProviders = pgTable(
  'service_providers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    specialties: text('specialties').array().notNull(),
    rating: numeric('rating').default('0').notNull(),
    totalJobs: integer('total_jobs').default(0).notNull(),
    completedJobs: integer('completed_jobs').default(0).notNull(),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('service_providers_user_id_idx').on(table.userId)],
);

export const providerOfficeLinks = pgTable(
  'provider_office_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    providerId: uuid('provider_id')
      .references(() => serviceProviders.id, { onDelete: 'cascade' })
      .notNull(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'active' | 'pending' | 'blocked'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('provider_office_links_unique_idx').on(table.providerId, table.officeId),
    index('provider_office_links_provider_id_idx').on(table.providerId),
    index('provider_office_links_office_id_idx').on(table.officeId),
  ],
);

export const providerContracts = pgTable(
  'provider_contracts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    providerId: uuid('provider_id')
      .references(() => serviceProviders.id, { onDelete: 'cascade' })
      .notNull(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    categories: text('categories').array().notNull(),
    hourlyRate: integer('hourly_rate'),
    fixedRate: integer('fixed_rate'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('provider_contracts_provider_id_idx').on(table.providerId),
    index('provider_contracts_office_id_idx').on(table.officeId),
  ],
);
