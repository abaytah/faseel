import type { Database } from '@faseel/db';
import { auditLogs } from '@faseel/db';

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Log an audit entry asynchronously.
 * Does not block the response; errors are caught and logged.
 */
export function logAudit(db: Database, entry: AuditEntry): void {
  // Fire and forget: don't await, don't block the response
  const doInsert = async () => {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        changes: entry.changes ?? null,
        ipAddress: entry.ipAddress ?? null,
      });
    } catch (err) {
      console.error('Audit log insert failed:', err);
    }
  };

  doInsert();
}

/**
 * Compute a diff between old and new objects for audit logging.
 * Returns only the fields that changed, with before/after values.
 */
export function computeChanges(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> | null {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of Object.keys(newObj)) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Skip internal fields
    if (key === 'updatedAt' || key === 'createdAt') continue;

    // Compare stringified values to handle objects/arrays
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { from: oldVal, to: newVal };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Create an audit middleware factory for tRPC mutations.
 * Use this in router procedures to automatically log mutations.
 *
 * Example usage in a router:
 *   .mutation(async ({ ctx, input }) => {
 *     const result = await doSomething(input);
 *     logAudit(ctx.db, {
 *       userId: ctx.user.id,
 *       action: 'create',
 *       entityType: 'building',
 *       entityId: result.id,
 *       changes: input,
 *       ipAddress: ctx.ip,
 *     });
 *     return result;
 *   })
 */
export function createAuditLogger(db: Database) {
  return {
    logCreate(
      userId: string | null,
      entityType: string,
      entityId: string,
      data?: Record<string, unknown>,
      ip?: string,
    ) {
      logAudit(db, {
        userId,
        action: 'create',
        entityType,
        entityId,
        changes: data ? { created: data } : null,
        ipAddress: ip,
      });
    },

    logUpdate(
      userId: string | null,
      entityType: string,
      entityId: string,
      oldData: Record<string, unknown>,
      newData: Record<string, unknown>,
      ip?: string,
    ) {
      const changes = computeChanges(oldData, newData);
      if (changes) {
        logAudit(db, {
          userId,
          action: 'update',
          entityType,
          entityId,
          changes,
          ipAddress: ip,
        });
      }
    },

    logDelete(userId: string | null, entityType: string, entityId: string, ip?: string) {
      logAudit(db, {
        userId,
        action: 'delete',
        entityType,
        entityId,
        ipAddress: ip,
      });
    },
  };
}
