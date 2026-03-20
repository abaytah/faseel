'use client';

const ACCESS_TOKEN_KEY = 'faseel-access-token';
const REFRESH_TOKEN_KEY = 'faseel-refresh-token';
const USER_KEY = 'faseel-user';
const ROLES_KEY = 'faseel-roles';

export interface StoredUser {
  id: string;
  phone: string;
  nameAr: string | null;
  nameEn: string | null;
}

export interface StoredRole {
  role: string;
  officeId: string | null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setUser(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setRoles(roles: StoredRole[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function getRoles(): StoredRole[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCurrentRole(): string | null {
  return getUserRole();
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLES_KEY);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  // Check JWT expiry without verifying signature (client-side check)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    const exp = payload.exp;
    if (!exp) return true; // No expiry claim, assume valid
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

/**
 * Parse the role from the stored JWT access token.
 * Returns the session role: 'tenant' | 'office' | 'provider' | 'owner'
 */
export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Parse the officeId from the stored JWT access token.
 */
export function getOfficeId(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return payload.officeId ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the redirect path for a given role after login.
 */
export function getDashboardPath(role: string): string {
  switch (role) {
    case 'office':
      return '/office/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    case 'provider':
      return '/provider/dashboard';
    case 'owner':
      return '/owner/dashboard';
    default:
      return '/office/dashboard';
  }
}
