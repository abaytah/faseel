import { pgTable, uuid, varchar, integer, timestamp, date, index } from 'drizzle-orm/pg-core';
import { paymentStatusEnum } from './enums';
import { tenantContracts, units } from './buildings';
import { buildings } from './buildings';
import { users } from './users';

export const rentPayments = pgTable(
  'rent_payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contractId: uuid('contract_id')
      .references(() => tenantContracts.id, { onDelete: 'cascade' })
      .notNull(),
    amount: integer('amount').notNull(),
    dueDate: date('due_date').notNull(),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', {
      length: 255,
    }),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('rent_payments_contract_id_idx').on(table.contractId),
    index('rent_payments_status_idx').on(table.status),
  ],
);

export const hoaFees = pgTable(
  'hoa_fees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buildingId: uuid('building_id')
      .references(() => buildings.id, { onDelete: 'cascade' })
      .notNull(),
    unitId: uuid('unit_id').references(() => units.id, {
      onDelete: 'set null',
    }),
    ownerId: uuid('owner_id')
      .references(() => users.id)
      .notNull(),
    amount: integer('amount').notNull(),
    period: varchar('period', { length: 10 }).notNull(), // e.g. "2026-03"
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    dueDate: date('due_date').notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('hoa_fees_building_id_idx').on(table.buildingId),
    index('hoa_fees_owner_id_idx').on(table.ownerId),
    index('hoa_fees_status_idx').on(table.status),
  ],
);
