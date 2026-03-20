import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, gte, desc } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  users,
  userRoles,
  otpCodes,
  refreshTokens,
  subscriptions,
  subscriptionPlans,
  offices,
} from '@faseel/db';
import { createSmsService } from '../services/sms';
import { generateAccessToken, generateRefreshToken, hashToken } from '../services/jwt';

/**
 * Auto-create a 30-day trial subscription when a new OFFICE_ADMIN signs up.
 */
async function ensureTrialForOffice(db: import('@faseel/db').Database, officeId: string) {
  // Check if office already has a subscription
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.officeId, officeId))
    .limit(1);

  if (existingSub) return; // Already has a subscription

  // Find or create a trial plan
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.isActive, true), eq(subscriptionPlans.roleType, 'office')))
    .limit(1);

  let planId: string;

  if (plan) {
    planId = plan.id;
  } else {
    // Create a default trial plan
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values({
        nameAr: 'تجريبي',
        nameEn: 'Trial',
        roleType: 'office',
        maxBuildings: 5,
        maxUnits: 75,
        maxAdmins: 3,
        priceSar: 0,
        isActive: true,
      })
      .returning();
    planId = newPlan!.id;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await db.insert(subscriptions).values({
    officeId,
    planId,
    stripeSubscriptionId: null,
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });
}

const smsService = createSmsService();

export const authRouter = router({
  sendOtp: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10).max(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { phone } = input;

      // Rate limit: max 3 OTPs per phone per 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentOtps = await ctx.db
        .select()
        .from(otpCodes)
        .where(and(eq(otpCodes.phone, phone), gte(otpCodes.createdAt, tenMinutesAgo)));

      if (recentOtps.length >= 3) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: JSON.stringify({
            message: 'Too many OTP requests. Please wait before trying again.',
            messageAr: 'طلبات كثيرة لرمز التحقق. يرجى الانتظار قبل المحاولة مرة أخرى.',
            code: 'OTP_RATE_LIMIT',
          }),
        });
      }

      // Generate 6-digit code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await ctx.db.insert(otpCodes).values({
        phone,
        code,
        expiresAt,
      });

      await smsService.sendOtp(phone, code);

      return { success: true, expiresIn: 300 };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10).max(15),
        code: z.string().length(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { phone, code } = input;

      // Find latest unused OTP for this phone
      const [otp] = await ctx.db
        .select()
        .from(otpCodes)
        .where(and(eq(otpCodes.phone, phone), eq(otpCodes.isUsed, false)))
        .orderBy(desc(otpCodes.createdAt))
        .limit(1);

      if (!otp) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'No OTP found for this phone number.',
            messageAr: 'لم يتم العثور على رمز تحقق لهذا الرقم.',
            code: 'OTP_NOT_FOUND',
          }),
        });
      }

      // Check expiry
      if (new Date() > otp.expiresAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'OTP has expired. Please request a new one.',
            messageAr: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
            code: 'OTP_EXPIRED',
          }),
        });
      }

      // Check max attempts
      if (otp.attempts >= 5) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: JSON.stringify({
            message: 'Too many failed attempts. Please request a new OTP.',
            messageAr: 'محاولات فاشلة كثيرة. يرجى طلب رمز تحقق جديد.',
            code: 'OTP_MAX_ATTEMPTS',
          }),
        });
      }

      // Increment attempts
      await ctx.db
        .update(otpCodes)
        .set({ attempts: otp.attempts + 1 })
        .where(eq(otpCodes.id, otp.id));

      // Validate code
      if (otp.code !== code) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Invalid OTP code.',
            messageAr: 'رمز التحقق غير صحيح.',
            code: 'OTP_INVALID',
          }),
        });
      }

      // Mark as used
      await ctx.db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, otp.id));

      // Find or create user
      let [existingUser] = await ctx.db.select().from(users).where(eq(users.phone, phone)).limit(1);

      let needsOnboarding = false;

      if (!existingUser) {
        const [newUser] = await ctx.db
          .insert(users)
          .values({
            phone,
            nameAr: phone, // Placeholder until onboarding
          })
          .returning();

        existingUser = newUser!;
        needsOnboarding = true;
        // No auto-assigned roles; user picks roles during onboarding
      }

      // Get user roles with office names
      const userRoleRows = await ctx.db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, existingUser.id));

      // Enrich roles with office names where applicable
      const enrichedRoles: Array<{
        role: string;
        officeId: string | null;
        officeName: string | null;
      }> = [];

      for (const r of userRoleRows) {
        let officeName: string | null = null;
        if (r.officeId) {
          const [office] = await ctx.db
            .select({ nameAr: offices.nameAr })
            .from(offices)
            .where(eq(offices.id, r.officeId))
            .limit(1);
          officeName = office?.nameAr ?? null;
        }
        enrichedRoles.push({
          role: r.role,
          officeId: r.officeId,
          officeName,
        });
      }

      // For existing users with roles, mark onboarding as complete
      if (!needsOnboarding && userRoleRows.length === 0) {
        // Existing user record but no roles (edge case: cleanup)
        needsOnboarding = true;
      }

      const primaryRole = userRoleRows[0];
      const roleName = mapRoleToSession(primaryRole?.role ?? 'TENANT');

      // If user is OFFICE_ADMIN with an officeId, ensure trial subscription exists
      if (primaryRole?.role === 'OFFICE_ADMIN' && primaryRole.officeId) {
        try {
          await ensureTrialForOffice(ctx.db, primaryRole.officeId);
        } catch {
          // Non-critical; don't block login if trial creation fails
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: existingUser.id,
        role: roleName,
        officeId: primaryRole?.officeId ?? undefined,
      });

      const refresh = generateRefreshToken();

      await ctx.db.insert(refreshTokens).values({
        userId: existingUser.id,
        tokenHash: refresh.hash,
        expiresAt: refresh.expiresAt,
      });

      return {
        accessToken,
        refreshToken: refresh.token,
        user: {
          id: existingUser.id,
          phone: existingUser.phone,
          nameAr: existingUser.nameAr,
          nameEn: existingUser.nameEn,
        },
        roles: enrichedRoles,
        needsOnboarding,
      };
    }),

  refreshToken: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokenHash = hashToken(input.refreshToken);

      const [storedToken] = await ctx.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

      if (!storedToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: JSON.stringify({
            message: 'Invalid refresh token.',
            messageAr: 'رمز التحديث غير صالح.',
            code: 'INVALID_REFRESH_TOKEN',
          }),
        });
      }

      if (new Date() > storedToken.expiresAt) {
        // Clean up expired token
        await ctx.db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: JSON.stringify({
            message: 'Refresh token has expired. Please log in again.',
            messageAr: 'انتهت صلاحية رمز التحديث. يرجى تسجيل الدخول مرة أخرى.',
            code: 'REFRESH_TOKEN_EXPIRED',
          }),
        });
      }

      // Get user roles for the token
      const roles = await ctx.db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, storedToken.userId));

      const primaryRole = roles[0];
      const roleName = mapRoleToSession(primaryRole?.role ?? 'TENANT');

      // Generate new tokens
      const accessToken = generateAccessToken({
        userId: storedToken.userId,
        role: roleName,
        officeId: primaryRole?.officeId ?? undefined,
      });

      const newRefresh = generateRefreshToken();

      // Delete old, insert new (rotation)
      await ctx.db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      await ctx.db.insert(refreshTokens).values({
        userId: storedToken.userId,
        tokenHash: newRefresh.hash,
        expiresAt: newRefresh.expiresAt,
      });

      return {
        accessToken,
        refreshToken: newRefresh.token,
      };
    }),

  switchRole: protectedProcedure
    .input(
      z.object({
        role: z.enum(['tenant', 'office', 'provider', 'owner']),
        officeId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbRole = mapSessionToRole(input.role) as
        | 'OFFICE_ADMIN'
        | 'OWNER'
        | 'TENANT'
        | 'SERVICE_PROVIDER';

      // Verify user has this role
      const baseCondition = and(eq(userRoles.userId, ctx.user.id), eq(userRoles.role, dbRole));

      const whereClause = input.officeId
        ? and(baseCondition, eq(userRoles.officeId, input.officeId))
        : baseCondition;

      const [matchingRole] = await ctx.db.select().from(userRoles).where(whereClause).limit(1);

      if (!matchingRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have this role.',
            messageAr: 'ليس لديك هذا الدور.',
            code: 'ROLE_NOT_ASSIGNED',
          }),
        });
      }

      const accessToken = generateAccessToken({
        userId: ctx.user.id,
        role: input.role,
        officeId: matchingRole.officeId ?? undefined,
      });

      return { accessToken };
    }),

  logout: protectedProcedure
    .input(
      z
        .object({
          refreshToken: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      if (input?.refreshToken) {
        const tokenHash = hashToken(input.refreshToken);
        await ctx.db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
      } else {
        // Delete all refresh tokens for user (full logout)
        await ctx.db.delete(refreshTokens).where(eq(refreshTokens.userId, ctx.user.id));
      }
      return { success: true };
    }),
});

function mapRoleToSession(dbRole: string): 'tenant' | 'office' | 'provider' | 'owner' {
  switch (dbRole) {
    case 'OFFICE_ADMIN':
      return 'office';
    case 'OWNER':
      return 'owner';
    case 'TENANT':
      return 'tenant';
    case 'SERVICE_PROVIDER':
      return 'provider';
    default:
      return 'tenant';
  }
}

function mapSessionToRole(sessionRole: string): string {
  switch (sessionRole) {
    case 'office':
      return 'OFFICE_ADMIN';
    case 'owner':
      return 'OWNER';
    case 'tenant':
      return 'TENANT';
    case 'provider':
      return 'SERVICE_PROVIDER';
    default:
      return 'TENANT';
  }
}
