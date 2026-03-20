import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'faseel-dev-secret';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

interface UserSession {
  id: string;
  phone: string;
  role: string;
}

/**
 * Verify the JWT token from query params and return the user session.
 */
function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

/**
 * SSE endpoint for real-time notifications.
 *
 * Clients connect with: GET /api/notifications/stream?token=<jwt>
 * The endpoint subscribes to Redis pub/sub channel `notifications:{userId}`
 * and streams events to the client as Server-Sent Events.
 *
 * Works through nginx with proxy_buffering off (already configured).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token is required', code: 'AUTH_REQUIRED' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token', code: 'AUTH_EXPIRED' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const channel = `notifications:${user.id}`;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId: user.id })}\n\n`),
      );

      // Set up heartbeat to keep connection alive (every 30s)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Try to connect to Redis for pub/sub
      let subscriber: import('ioredis').default | null = null;

      try {
        const Redis = (await import('ioredis')).default;
        subscriber = new Redis(REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          },
          lazyConnect: true,
        });

        await subscriber.connect();

        subscriber.subscribe(channel, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${channel}:`, err);
          }
        });

        subscriber.on('message', (_ch: string, message: string) => {
          try {
            controller.enqueue(encoder.encode(`event: notification\ndata: ${message}\n\n`));
          } catch {
            // Stream closed
          }
        });

        subscriber.on('error', (err) => {
          console.error(`Redis subscriber error for ${channel}:`, err);
        });
      } catch (err) {
        console.error('Failed to set up Redis subscriber:', err);
        // Continue without Redis. The client still gets the SSE connection
        // and heartbeats, but won't receive real-time notifications.
        // They can fall back to polling the notifications.list endpoint.
        controller.enqueue(
          encoder.encode(
            `event: warning\ndata: ${JSON.stringify({ message: 'Real-time unavailable, use polling fallback' })}\n\n`,
          ),
        );
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        if (subscriber) {
          subscriber.unsubscribe(channel).catch(() => {});
          subscriber.disconnect();
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // nginx: disable proxy buffering
    },
  });
}
