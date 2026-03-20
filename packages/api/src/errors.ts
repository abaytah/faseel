import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

/**
 * Standard Faseel error codes with bilingual messages.
 */
export const ErrorCodes = {
  AUTH_REQUIRED: {
    code: 'UNAUTHORIZED' as TRPC_ERROR_CODE_KEY,
    ar: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
    en: 'You must be logged in to access this resource',
  },
  AUTH_EXPIRED: {
    code: 'UNAUTHORIZED' as TRPC_ERROR_CODE_KEY,
    ar: 'انتهت صلاحية جلستك، يرجى تسجيل الدخول مرة أخرى',
    en: 'Your session has expired, please log in again',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN' as TRPC_ERROR_CODE_KEY,
    ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
    en: 'You do not have permission to perform this action',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND' as TRPC_ERROR_CODE_KEY,
    ar: 'المورد المطلوب غير موجود',
    en: 'The requested resource was not found',
  },
  LIMIT_EXCEEDED: {
    code: 'TOO_MANY_REQUESTS' as TRPC_ERROR_CODE_KEY,
    ar: 'تم تجاوز الحد المسموح',
    en: 'Limit exceeded',
  },
  VALIDATION_ERROR: {
    code: 'BAD_REQUEST' as TRPC_ERROR_CODE_KEY,
    ar: 'بيانات غير صالحة',
    en: 'Invalid input data',
  },
  RATE_LIMITED: {
    code: 'TOO_MANY_REQUESTS' as TRPC_ERROR_CODE_KEY,
    ar: 'عدد كبير من الطلبات، يرجى المحاولة لاحقاً',
    en: 'Too many requests, please try again later',
  },
} as const;

export type FaseelErrorCode = keyof typeof ErrorCodes;

/**
 * Custom error class for Faseel that wraps TRPCError with bilingual messages.
 */
export class FaseelError extends TRPCError {
  public readonly messageAr: string;
  public readonly messageEn: string;
  public readonly faseelCode: FaseelErrorCode;

  constructor(
    faseelCode: FaseelErrorCode,
    opts?: {
      messageAr?: string;
      messageEn?: string;
      cause?: unknown;
    },
  ) {
    const errorDef = ErrorCodes[faseelCode];
    const messageAr = opts?.messageAr ?? errorDef.ar;
    const messageEn = opts?.messageEn ?? errorDef.en;

    super({
      code: errorDef.code,
      message: `${messageEn} | ${messageAr}`,
      cause: opts?.cause,
    });

    this.messageAr = messageAr;
    this.messageEn = messageEn;
    this.faseelCode = faseelCode;
  }
}

/**
 * Throw a NOT_FOUND error with the entity name in both languages.
 */
export function throwNotFound(entityAr: string, entityEn: string): never {
  throw new FaseelError('NOT_FOUND', {
    messageAr: `${entityAr} غير موجود`,
    messageEn: `${entityEn} not found`,
  });
}

/**
 * Throw a FORBIDDEN error.
 */
export function throwForbidden(messageAr?: string, messageEn?: string): never {
  throw new FaseelError('FORBIDDEN', {
    messageAr,
    messageEn,
  });
}

/**
 * Throw a LIMIT_EXCEEDED error with the limit description in both languages.
 */
export function throwLimitExceeded(limitAr: string, limitEn: string): never {
  throw new FaseelError('LIMIT_EXCEEDED', {
    messageAr: `تم تجاوز الحد: ${limitAr}`,
    messageEn: `Limit exceeded: ${limitEn}`,
  });
}

/**
 * Throw a RATE_LIMITED error with Retry-After info.
 */
export function throwRateLimited(retryAfterSeconds: number): never {
  throw new FaseelError('RATE_LIMITED', {
    messageAr: `عدد كبير من الطلبات، حاول بعد ${retryAfterSeconds} ثانية`,
    messageEn: `Too many requests, retry after ${retryAfterSeconds} seconds`,
  });
}
