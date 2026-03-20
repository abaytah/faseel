import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { router, publicProcedure, officeProcedure } from '../trpc';
import { subscriptionPlans, subscriptions, offices } from '@faseel/db';
import {
  createCheckoutSession,
  createBillingPortalSession,
  getSubscriptionUsage,
} from '../services/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const subscriptionsRouter = router({
  getPlans: publicProcedure.query(async ({ ctx }) => {
    const plans = await ctx.db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));

    return plans.map((plan) => ({
      id: plan.id,
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      priceSar: plan.priceSar,
      maxBuildings: plan.maxBuildings,
      maxUnits: plan.maxUnits,
      maxAdmins: plan.maxAdmins,
      roleType: plan.roleType,
    }));
  }),

  createCheckout: officeProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.officeId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'No office associated with your account.',
            messageAr: 'لا يوجد مكتب مرتبط بحسابك.',
            code: 'NO_OFFICE',
          }),
        });
      }

      try {
        const checkoutUrl = await createCheckoutSession(
          ctx.db,
          ctx.user.officeId,
          input.planId,
          `${APP_URL}/dashboard/subscription?success=true`,
          `${APP_URL}/dashboard/subscription?cancelled=true`,
        );

        return { checkoutUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify({
            message: `Failed to create checkout session: ${message}`,
            messageAr: 'فشل في إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى.',
            code: 'CHECKOUT_FAILED',
          }),
        });
      }
    }),

  /**
   * Get current subscription for the authenticated user's office.
   * Returns null if no subscription exists.
   * Trial subscriptions have stripeSubscriptionId = null.
   */
  getCurrent: officeProcedure.query(async ({ ctx }) => {
    if (!ctx.user.officeId) {
      return null;
    }

    const [sub] = await ctx.db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        planId: subscriptions.planId,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.officeId, ctx.user.officeId), eq(subscriptions.status, 'ACTIVE')))
      .limit(1);

    if (!sub) return null;

    // Get plan details
    const [plan] = await ctx.db
      .select({
        nameAr: subscriptionPlans.nameAr,
        nameEn: subscriptionPlans.nameEn,
        maxBuildings: subscriptionPlans.maxBuildings,
        maxUnits: subscriptionPlans.maxUnits,
        maxAdmins: subscriptionPlans.maxAdmins,
        priceSar: subscriptionPlans.priceSar,
      })
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, sub.planId))
      .limit(1);

    const isTrial = !sub.stripeSubscriptionId;
    const daysRemaining = sub.currentPeriodEnd
      ? Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...sub,
      isTrial,
      daysRemaining,
      plan: plan ?? null,
    };
  }),

  getUsage: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const usage = await getSubscriptionUsage(ctx.db, input.officeId);
      return usage;
    }),

  getPortalUrl: officeProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.officeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify({
          message: 'No office associated with your account.',
          messageAr: 'لا يوجد مكتب مرتبط بحسابك.',
          code: 'NO_OFFICE',
        }),
      });
    }

    const [office] = await ctx.db
      .select()
      .from(offices)
      .where(eq(offices.id, ctx.user.officeId))
      .limit(1);

    if (!office?.stripeCustomerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify({
          message: 'No Stripe customer found. Please subscribe first.',
          messageAr: 'لم يتم العثور على حساب دفع. يرجى الاشتراك أولاً.',
          code: 'NO_STRIPE_CUSTOMER',
        }),
      });
    }

    const portalUrl = await createBillingPortalSession(
      office.stripeCustomerId,
      `${APP_URL}/dashboard/subscription`,
    );

    return { portalUrl };
  }),
});
