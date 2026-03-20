import type { UserRoleType } from '../constants/roles';

export interface User {
  id: string;
  phone: string;
  email?: string;
  nameAr: string;
  nameEn?: string;
  role: UserRoleType;
  avatarUrl?: string;
  isActive: boolean;
  officeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string;
  role: UserRoleType;
  officeId?: string;
  iat: number;
  exp: number;
}
