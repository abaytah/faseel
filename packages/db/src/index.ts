import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

type DB = PostgresJsDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL ?? '';

const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : (null as unknown as DB);

export type Database = DB;
