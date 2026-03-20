import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { notificationTypeEnum, pushPlatformEnum } from './enums';
import { offices } from './offices';
import { buildings } from './buildings';
import { users } from './users';

export const announcements = pgTable(
  'announcements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    buildingId: uuid('building_id').references(() => buildings.id, {
      onDelete: 'cascade',
    }),
    titleAr: varchar('title_ar', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    bodyAr: text('body_ar').notNull(),
    bodyEn: text('body_en'),
    type: varchar('type', { length: 20 }).default('general').notNull(), // 'general' | 'maintenance' | 'payment' | 'emergency'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('announcements_office_id_idx').on(table.officeId),
    index('announcements_building_id_idx').on(table.buildingId),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: notificationTypeEnum('type').notNull(),
    titleAr: varchar('title_ar', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    bodyAr: text('body_ar'),
    bodyEn: text('body_en'),
    data: jsonb('data'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_is_read_idx').on(table.isRead),
  ],
);

export const pushTokens = pgTable(
  'push_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: text('token').notNull(),
    platform: pushPlatformEnum('platform').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('push_tokens_unique_idx').on(table.userId, table.token),
    index('push_tokens_user_id_idx').on(table.userId),
  ],
);
