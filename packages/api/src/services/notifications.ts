import type { Database } from '@faseel/db';
import { notifications } from '@faseel/db';
import type Redis from 'ioredis';

type NotificationType = 'REQUEST_UPDATE' | 'PAYMENT_DUE' | 'ANNOUNCEMENT' | 'SYSTEM';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  titleAr: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  data?: Record<string, unknown>;
}

/**
 * Create a single notification and publish it to Redis for real-time delivery.
 */
export async function createNotification(
  db: Database,
  redis: Redis | null,
  payload: NotificationPayload,
): Promise<string> {
  const [inserted] = await db
    .insert(notifications)
    .values({
      userId: payload.userId,
      type: payload.type,
      titleAr: payload.titleAr,
      titleEn: payload.titleEn,
      bodyAr: payload.bodyAr,
      bodyEn: payload.bodyEn,
      data: payload.data ?? null,
    })
    .returning({ id: notifications.id });

  const notificationId = inserted!.id;

  // Publish to Redis for SSE real-time delivery
  if (redis) {
    const event = JSON.stringify({
      id: notificationId,
      type: payload.type,
      titleAr: payload.titleAr,
      titleEn: payload.titleEn,
      bodyAr: payload.bodyAr,
      bodyEn: payload.bodyEn,
      data: payload.data,
      createdAt: new Date().toISOString(),
    });

    redis.publish(`notifications:${payload.userId}`, event).catch((err) => {
      console.error(`Failed to publish notification to Redis for user ${payload.userId}:`, err);
    });
  }

  return notificationId;
}

/**
 * Create notifications for multiple users at once (e.g., all tenants in a building).
 */
export async function createBulkNotifications(
  db: Database,
  redis: Redis | null,
  userIds: string[],
  type: NotificationType,
  titleAr: string,
  titleEn?: string,
  bodyAr?: string,
  bodyEn?: string,
  data?: Record<string, unknown>,
): Promise<string[]> {
  if (userIds.length === 0) return [];

  const rows = userIds.map((userId) => ({
    userId,
    type,
    titleAr,
    titleEn,
    bodyAr,
    bodyEn,
    data: data ?? null,
  }));

  const inserted = await db
    .insert(notifications)
    .values(rows)
    .returning({ id: notifications.id, userId: notifications.userId });

  // Publish each notification to Redis (non-blocking)
  if (redis) {
    const event = JSON.stringify({
      type,
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      data,
      createdAt: new Date().toISOString(),
    });

    for (const row of inserted) {
      const enrichedEvent = JSON.stringify({
        ...JSON.parse(event),
        id: row.id,
      });
      redis.publish(`notifications:${row.userId}`, enrichedEvent).catch((err) => {
        console.error(`Failed to publish bulk notification to Redis for user ${row.userId}:`, err);
      });
    }
  }

  return inserted.map((r) => r.id);
}

/**
 * Notify relevant parties when a maintenance request status changes.
 * - Tenant gets notified on all status changes
 * - Provider gets notified when assigned
 * - Office gets notified when completed
 */
export async function notifyRequestUpdate(
  db: Database,
  redis: Redis | null,
  request: {
    id: string;
    tenantId: string;
    assignedProviderId?: string | null;
    officeId: string;
    titleAr: string;
    titleEn?: string | null;
  },
  fromStatus: string | null,
  toStatus: string,
): Promise<void> {
  const statusLabelsAr: Record<string, string> = {
    SUBMITTED: 'مقدم',
    REVIEWED: 'قيد المراجعة',
    ASSIGNED: 'تم التعيين',
    IN_PROGRESS: 'قيد التنفيذ',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
  };

  const statusLabelsEn: Record<string, string> = {
    SUBMITTED: 'Submitted',
    REVIEWED: 'Under Review',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const statusAr = statusLabelsAr[toStatus] ?? toStatus;
  const statusEn = statusLabelsEn[toStatus] ?? toStatus;

  const notificationData = {
    requestId: request.id,
    fromStatus,
    toStatus,
  };

  // Always notify tenant
  await createNotification(db, redis, {
    userId: request.tenantId,
    type: 'REQUEST_UPDATE',
    titleAr: `تحديث طلب الصيانة: ${request.titleAr}`,
    titleEn: request.titleEn ? `Maintenance Update: ${request.titleEn}` : undefined,
    bodyAr: `تم تحديث حالة الطلب إلى: ${statusAr}`,
    bodyEn: `Request status updated to: ${statusEn}`,
    data: notificationData,
  });

  // Notify provider when assigned or status changes on their request
  if (request.assignedProviderId && (toStatus === 'ASSIGNED' || toStatus === 'IN_PROGRESS')) {
    await createNotification(db, redis, {
      userId: request.assignedProviderId,
      type: 'REQUEST_UPDATE',
      titleAr: `طلب صيانة جديد: ${request.titleAr}`,
      titleEn: request.titleEn ? `New Maintenance Request: ${request.titleEn}` : undefined,
      bodyAr: `تم تعيينك لطلب صيانة - الحالة: ${statusAr}`,
      bodyEn: `You have been assigned a maintenance request - Status: ${statusEn}`,
      data: notificationData,
    });
  }
}

/**
 * Notify all tenants in a building (or all buildings in an office) about a new announcement.
 */
export async function notifyNewAnnouncement(
  db: Database,
  redis: Redis | null,
  announcement: {
    id: string;
    officeId: string;
    buildingId?: string | null;
    titleAr: string;
    titleEn?: string | null;
    bodyAr: string;
    bodyEn?: string | null;
  },
): Promise<void> {
  // Find tenant user IDs for the relevant building(s)
  // This query joins units -> buildings to find tenants
  // If buildingId is specified, filter to that building; otherwise, all buildings in the office
  const { sql } = await import('drizzle-orm');

  let tenantQuery;
  if (announcement.buildingId) {
    tenantQuery = db.execute(sql`
      SELECT DISTINCT u.tenant_id
      FROM units u
      JOIN buildings b ON u.building_id = b.id
      WHERE b.id = ${announcement.buildingId}
        AND u.tenant_id IS NOT NULL
    `);
  } else {
    tenantQuery = db.execute(sql`
      SELECT DISTINCT u.tenant_id
      FROM units u
      JOIN buildings b ON u.building_id = b.id
      WHERE b.office_id = ${announcement.officeId}
        AND u.tenant_id IS NOT NULL
    `);
  }

  const tenants = await tenantQuery;
  const tenantIds = (tenants as unknown as Array<{ tenant_id: string }>).map((t) => t.tenant_id);

  if (tenantIds.length === 0) return;

  await createBulkNotifications(
    db,
    redis,
    tenantIds,
    'ANNOUNCEMENT',
    announcement.titleAr,
    announcement.titleEn ?? undefined,
    announcement.bodyAr,
    announcement.bodyEn ?? undefined,
    { announcementId: announcement.id },
  );
}
