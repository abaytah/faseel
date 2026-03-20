import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { buildingTypeEnum, unitStatusEnum, contractStatusEnum } from './enums';
import { offices } from './offices';
import { users } from './users';

export const buildings = pgTable(
  'buildings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    ownerId: uuid('owner_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    nameAr: varchar('name_ar', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    city: varchar('city', { length: 100 }),
    district: varchar('district', { length: 100 }),
    address: text('address'),
    type: buildingTypeEnum('type').default('RESIDENTIAL').notNull(),
    totalUnits: integer('total_units').notNull(),
    floors: integer('floors'),
    yearBuilt: integer('year_built'),
    latitude: numeric('latitude'),
    longitude: numeric('longitude'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('buildings_office_id_idx').on(table.officeId),
    index('buildings_owner_id_idx').on(table.ownerId),
  ],
);

export const units = pgTable(
  'units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buildingId: uuid('building_id')
      .references(() => buildings.id, { onDelete: 'cascade' })
      .notNull(),
    unitNumber: varchar('unit_number', { length: 50 }).notNull(),
    floor: integer('floor'),
    tenantId: uuid('tenant_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    status: unitStatusEnum('status').default('VACANT').notNull(),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    areaSqm: numeric('area_sqm'),
    monthlyRent: integer('monthly_rent'), // SAR in halalas
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('units_building_id_idx').on(table.buildingId),
    index('units_tenant_id_idx').on(table.tenantId),
  ],
);

export const tenantContracts = pgTable(
  'tenant_contracts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id')
      .references(() => units.id, { onDelete: 'cascade' })
      .notNull(),
    tenantId: uuid('tenant_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    officeId: uuid('office_id')
      .references(() => offices.id, { onDelete: 'cascade' })
      .notNull(),
    ejarNumber: varchar('ejar_number', { length: 100 }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    monthlyRent: integer('monthly_rent').notNull(),
    status: contractStatusEnum('status').default('ACTIVE').notNull(),
    contractUrl: text('contract_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('tenant_contracts_unit_id_idx').on(table.unitId),
    index('tenant_contracts_tenant_id_idx').on(table.tenantId),
    index('tenant_contracts_office_id_idx').on(table.officeId),
  ],
);
