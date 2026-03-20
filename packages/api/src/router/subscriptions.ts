import { z } from 'zod';
import { router, publicProcedure, officeProcedure } from '../trpc';

export const subscriptionsRouter = router({
  /**
   * Get available subscription plans.
   */
  getPlans: publicProcedure.query(async () => {
    // TODO: Fetch plans from DB or Stripe products
    return [] as Array<{
      id: string;
      name: string;
      priceMonthly: number;
      priceYearly: number;
      maxUnits: number;
      features: string[];
    }>;
  }),

  /**
   * Create a Stripe checkout session for a subscription.
   */
  createCheckout: officeProcedure
    .input(
      z.object({
        planId: z.string(),
        interval: z.enum(['monthly', 'yearly']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Create Stripe checkout session, return URL
      void ctx.db;
      void input;
      return { checkoutUrl: '' };
    }),

  /**
   * Get current usage stats for the office subscription.
   */
  getUsage: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Aggregate usage (units, users, requests) vs plan limits
      void ctx.db;
      void input;
      return {
        plan: '',
        unitsUsed: 0,
        unitsLimit: 0,
        currentPeriodEnd: new Date(),
      };
    }),

  /**
   * Get Stripe customer portal URL for managing subscription.
   */
  getPortalUrl: officeProcedure.mutation(async ({ ctx }) => {
    // TODO: Create Stripe billing portal session, return URL
    void ctx.db;
    return { portalUrl: '' };
  }),
});
