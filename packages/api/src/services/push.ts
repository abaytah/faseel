import type { Database } from '@faseel/db';
import { pushTokens } from '@faseel/db';
import { eq } from 'drizzle-orm';

/**
 * Firebase Cloud Messaging (FCM) HTTP v1 API push notification service.
 *
 * This is a scaffold. Actual Firebase credentials (service account JSON)
 * must be configured via GOOGLE_APPLICATION_CREDENTIALS env var for production use.
 */

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface FcmConfig {
  projectId: string;
  accessToken: string;
}

/**
 * Get FCM config from environment.
 * Returns null if Firebase is not configured (dev mode).
 */
function getFcmConfig(): FcmConfig | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const accessToken = process.env.FIREBASE_ACCESS_TOKEN;

  if (!projectId || !accessToken) {
    return null;
  }

  return { projectId, accessToken };
}

/**
 * Send a push notification to a single device token via FCM HTTP v1 API.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  const config = getFcmConfig();

  if (!config) {
    // Dev mode: log instead of sending
    console.log(`[DEV PUSH] token=${token.slice(0, 20)}... title="${title}" body="${body}"`);
    return true;
  }

  const url = `https://fcm.googleapis.com/v1/projects/${config.projectId}/messages:send`;

  const message = {
    message: {
      token,
      notification: {
        title,
        body,
      },
      data: data ?? {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'faseel_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`FCM push failed: ${response.status} ${errorBody}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('FCM push error:', err);
    return false;
  }
}

/**
 * Send a push notification to all registered devices for a user.
 * Looks up push tokens from the database and sends to each.
 */
export async function sendPushToUser(
  db: Database,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ sent: number; failed: number }> {
  const tokens = await db
    .select({ token: pushTokens.token })
    .from(pushTokens)
    .where(eq(pushTokens.userId, userId));

  if (tokens.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  // Send to all tokens in parallel
  const results = await Promise.allSettled(tokens.map((t) => sendPush(t.token, title, body, data)));

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send a push notification to multiple users.
 */
export async function sendPushToUsers(
  db: Database,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ sent: number; failed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  // Process in parallel but with a concurrency limit
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((userId) => sendPushToUser(db, userId, title, body, data)),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        totalSent += result.value.sent;
        totalFailed += result.value.failed;
      } else {
        totalFailed++;
      }
    }
  }

  return { sent: totalSent, failed: totalFailed };
}
