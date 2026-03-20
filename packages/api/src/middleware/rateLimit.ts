import type Redis from 'ioredis';

/**
 * Rate limit configuration for different endpoint types.
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Predefined rate limit configurations.
 */
export const RateLimits = {
  /** auth.sendOtp: 3 requests per 10 minutes per phone */
  AUTH_SEND_OTP: { maxRequests: 3, windowSeconds: 600 } as RateLimitConfig,
  /** auth.verifyOtp: 5 requests per 10 minutes per phone */
  AUTH_VERIFY_OTP: { maxRequests: 5, windowSeconds: 600 } as RateLimitConfig,
  /** General API: 100 requests per minute per user */
  GENERAL_API: { maxRequests: 100, windowSeconds: 60 } as RateLimitConfig,
  /** Public endpoints: 30 requests per minute per IP */
  PUBLIC_API: { maxRequests: 30, windowSeconds: 60 } as RateLimitConfig,
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  total: number;
}

/**
 * Redis-based sliding window rate limiter.
 *
 * Uses a sorted set per key with timestamps as scores.
 * Each request adds a member; expired members are trimmed on each check.
 *
 * Non-blocking: if Redis is unavailable, requests are allowed through
 * to avoid blocking the API due to Redis connectivity issues.
 */
export async function checkRateLimit(
  redis: Redis | null,
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  // If Redis is not available, allow the request
  if (!redis) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      retryAfterSeconds: 0,
      total: config.maxRequests,
    };
  }

  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;
  const redisKey = `rl:${key}`;
  const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    // Use a pipeline for atomicity and performance
    const pipeline = redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(redisKey, 0, windowStart);

    // Count current entries in the window
    pipeline.zcard(redisKey);

    // Add the new request
    pipeline.zadd(redisKey, now, member);

    // Set TTL on the key (slightly longer than window to handle edge cases)
    pipeline.expire(redisKey, config.windowSeconds + 10);

    const results = await pipeline.exec();

    if (!results) {
      // Pipeline failed, allow the request
      return {
        allowed: true,
        remaining: config.maxRequests,
        retryAfterSeconds: 0,
        total: config.maxRequests,
      };
    }

    // results[1] is the ZCARD result (count before adding)
    const currentCount = (results[1]?.[1] as number) ?? 0;

    if (currentCount >= config.maxRequests) {
      // Over the limit: remove the member we just added
      redis.zrem(redisKey, member).catch(() => {
        // Ignore cleanup errors
      });

      // Calculate when the oldest entry in the window will expire
      const oldestResult = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
      const oldestTimestamp = oldestResult.length >= 2 ? parseInt(oldestResult[1]!, 10) : now;
      const retryAfterMs = oldestTimestamp + config.windowSeconds * 1000 - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
        total: config.maxRequests,
      };
    }

    const remaining = config.maxRequests - currentCount - 1;

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      retryAfterSeconds: 0,
      total: config.maxRequests,
    };
  } catch (err) {
    // Redis error: allow the request to avoid blocking
    console.error('Rate limiter Redis error:', err);
    return {
      allowed: true,
      remaining: config.maxRequests,
      retryAfterSeconds: 0,
      total: config.maxRequests,
    };
  }
}

/**
 * Build a rate limit key for phone-based endpoints.
 */
export function phoneLimitKey(endpoint: string, phone: string): string {
  return `${endpoint}:phone:${phone}`;
}

/**
 * Build a rate limit key for user-based endpoints.
 */
export function userLimitKey(endpoint: string, userId: string): string {
  return `${endpoint}:user:${userId}`;
}

/**
 * Build a rate limit key for IP-based endpoints.
 */
export function ipLimitKey(endpoint: string, ip: string): string {
  return `${endpoint}:ip:${ip}`;
}
