import { db, type Database } from '@faseel/db';
import { verifyAccessToken, type JwtPayload } from './services/jwt';

export interface UserSession {
  id: string;
  phone: string;
  role: 'tenant' | 'office' | 'provider' | 'owner';
  officeId?: string;
}

export interface Context {
  db: Database;
  user: UserSession | null;
}

function getUserFromHeader(authorization?: string): UserSession | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice(7);
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.userId,
    phone: '', // Phone is not stored in JWT; callers that need it should query DB
    role: decoded.role as UserSession['role'],
    officeId: decoded.officeId,
  };
}

export function createContext(opts: { headers: Headers }): Context {
  const authorization = opts.headers.get('authorization') ?? undefined;
  const user = getUserFromHeader(authorization);

  return {
    db,
    user,
  };
}
