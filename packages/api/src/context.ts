import jwt from 'jsonwebtoken';

// TODO: Import actual db client from @faseel/db once it exports one
// import { db } from "@faseel/db";

// TODO: Import actual Redis client once configured
// import Redis from "ioredis";

const JWT_SECRET = process.env.JWT_SECRET ?? 'faseel-dev-secret';

export interface UserSession {
  id: string;
  phone: string;
  role: 'tenant' | 'office' | 'provider' | 'owner';
  officeId?: string;
}

export interface Context {
  db: unknown; // TODO: Replace with actual Drizzle DB type from @faseel/db
  user: UserSession | null;
  redis: unknown; // TODO: Replace with Redis type once configured
}

/**
 * Extracts and verifies JWT from the Authorization header.
 */
function getUserFromHeader(authorization?: string): UserSession | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Creates the tRPC context from an incoming request.
 */
export function createContext(opts: { headers: Headers }): Context {
  const authorization = opts.headers.get('authorization') ?? undefined;
  const user = getUserFromHeader(authorization);

  return {
    db: null, // TODO: Wire up @faseel/db client
    user,
    redis: null, // TODO: Wire up ioredis client
  };
}
