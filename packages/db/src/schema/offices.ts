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
import { paymentStatusEnum, subscriptionStatusEnum } from './enums';

export const offices = pgTable('offices', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  crNumber: varchar('cr_number', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  logoUrl: text('logo_url'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  roleType: text('role_type').notNull(), // 'office' | 'owner' | 'provider'
  maxBuildings: integer('max_buildings'),
  maxUnits: integer('max_units'),
  maxAdmins: integer('max_admins'),
  priceSar: integer('price_sar').notNull(), // in halalas (cents)
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Forward-reference users to avoid circular import
// users is referenced by userId but offices doesn't need to import users
// subscriptions references both offices and users
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    officeId: uuid('office_id').references(() => offices.id, {
      onDelete: 'cascade',
    }),
    userId: uuid('user_id'), // FK added via relations to avoid circular import
    planId: uuid('plan_id')
      .references(() => subscriptionPlans.id)
      .notNull(),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    status: subscriptionStatusEnum('status').notNull(),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('subscriptions_office_id_idx').on(table.officeId),
    index('subscriptions_user_id_idx').on(table.userId),
  ],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id')
      .references(() => subscriptions.id, { onDelete: 'cascade' })
      .notNull(),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
    amountSar: integer('amount_sar').notNull(),
    status: paymentStatusEnum('status').notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('invoices_subscription_id_idx').on(table.subscriptionId)],
);
