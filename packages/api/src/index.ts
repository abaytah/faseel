export { appRouter, type AppRouter } from './router';
export { createContext, type Context, type UserSession } from './context';
export { createCallerFactory } from './trpc';

// Auth Services
export { createSmsService, type SmsService } from './services/sms';
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  hashToken,
  type JwtPayload,
} from './services/jwt';

// Services
export {
  createNotification,
  createBulkNotifications,
  notifyRequestUpdate,
  notifyNewAnnouncement,
} from './services/notifications';
export { sendPush, sendPushToUser, sendPushToUsers } from './services/push';
export {
  validateContentType,
  generateKey,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
} from './services/storage';

// Middleware
export {
  checkRateLimit,
  RateLimits,
  phoneLimitKey,
  userLimitKey,
  ipLimitKey,
} from './middleware/rateLimit';
export type { RateLimitConfig, RateLimitResult } from './middleware/rateLimit';
export { logAudit, computeChanges, createAuditLogger } from './middleware/audit';
export type { AuditAction, AuditEntry } from './middleware/audit';

// Validators
export * from './validators';

// Errors
export {
  FaseelError,
  ErrorCodes,
  throwNotFound,
  throwForbidden,
  throwLimitExceeded,
  throwRateLimited,
} from './errors';
export type { FaseelErrorCode } from './errors';
