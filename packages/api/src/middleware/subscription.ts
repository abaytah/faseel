import { TRPCError } from '@trpc/server';
import { eq, and, count } from 'drizzle-orm';
import { middleware } from '../trpc';
import { subscriptions, subscriptionPlans, buildings, units } from '@faseel/db';

/**
 * Trial configuration: Growth plan limits for 30-day trial.
 */
const TRIAL_DURATION_DAYS = 30;
const TRIAL_PLAN_LIMITS = {
  maxBuildings: 5,
  maxUnits: 75,
  maxAdmins: 3,
};

/**
 * Auto-creates a 30-day trial subscription for an office that has no subscription.
 * Trial = Growth plan limits, stripeSubscriptionId: null, status: ACTIVE.
 * Returns the newly created trial subscription.
 */
async function autoCreateTrial(db: import('@faseel/db').Database, officeId: string) {
  // Find the Growth plan (or the first active office plan to use as trial plan)
  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.isActive, true), eq(subscriptionPlans.roleType, 'office')));

  // Prefer a plan named "Growth" or with matching limits; otherwise use first available
  let trialPlan = plans.find(
    (p) =>
      (p.nameEn?.toLowerCase().includes('growth') || p.nameAr?.includes('نمو')) &&
      p.maxBuildings === TRIAL_PLAN_LIMITS.maxBuildings,
  );

  if (!trialPlan) {
    // Fallback: pick any active office plan, preferring one with the right limits
    trialPlan = plans.find((p) => p.maxBuildings === TRIAL_PLAN_LIMITS.maxBuildings) ?? plans[0];
  }

  if (!trialPlan) {
    // No plans exist at all; create a minimal trial plan
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values({
        nameAr: 'تجريبي',
        nameEn: 'Trial',
        roleType: 'office',
        maxBuildings: TRIAL_PLAN_LIMITS.maxBuildings,
        maxUnits: TRIAL_PLAN_LIMITS.maxUnits,
        maxAdmins: TRIAL_PLAN_LIMITS.maxAdmins,
        priceSar: 0,
        isActive: true,
      })
      .returning();
    trialPlan = newPlan!;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + TRIAL_DURATION_DAYS);

  const [trial] = await db
    .insert(subscriptions)
    .values({
      officeId,
      planId: trialPlan.id,
      stripeSubscriptionId: null, // null = trial (no Stripe billing)
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })
    .returning();

  return trial!;
}

/**
 * Middleware that checks the office has an active subscription.
 * If no subscription exists, auto-creates a 30-day trial.
 * Attach to procedures that require a paid plan.
 */
export const requireActiveSubscription = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const officeId = ctx.user.officeId;
  if (!officeId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: 'No office associated with your account.',
        messageAr: 'لا يوجد مكتب مرتبط بحسابك.',
        code: 'NO_OFFICE',
      }),
    });
  }

  let [activeSub] = await ctx.db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  // Auto-create trial if no subscription exists at all
  if (!activeSub) {
    // Check if there was ever any subscription (expired, cancelled, etc.)
    const [anySub] = await ctx.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.officeId, officeId))
      .limit(1);

    if (!anySub) {
      // First time: auto-create trial
      activeSub = await autoCreateTrial(ctx.db, officeId);
    } else {
      // Had a subscription before but it's no longer active
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: JSON.stringify({
          message: 'An active subscription is required. Please subscribe to continue.',
          messageAr: 'يلزم وجود اشتراك فعال. يرجى الاشتراك للمتابعة.',
          code: 'SUBSCRIPTION_REQUIRED',
        }),
      });
    }
  }

  // Check if subscription period has ended
  if (activeSub.currentPeriodEnd && new Date() > activeSub.currentPeriodEnd) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: 'Your subscription has expired. Please renew to continue.',
        messageAr: 'انتهت صلاحية اشتراكك. يرجى التجديد للمتابعة.',
        code: 'SUBSCRIPTION_EXPIRED',
      }),
    });
  }

  return next({ ctx });
});

/**
 * Checks if the office can add more buildings based on their plan limits.
 * Call this before creating a building.
 */
export async function enforceBuildingLimit(
  db: import('@faseel/db').Database,
  officeId: string,
): Promise<void> {
  const [activeSub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  if (!activeSub) return; // No subscription = no enforcement (trial/free)

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, activeSub.planId))
    .limit(1);

  if (!plan?.maxBuildings) return; // null = unlimited

  const buildingCountRows = await db
    .select({ value: count() })
    .from(buildings)
    .where(eq(buildings.officeId, officeId));

  const currentCount = buildingCountRows[0]?.value ?? 0;

  if (currentCount >= plan.maxBuildings) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: `You have reached the maximum number of buildings (${plan.maxBuildings}) for your plan. Please upgrade to add more.`,
        messageAr: `لقد وصلت إلى الحد الأقصى لعدد المباني (${plan.maxBuildings}) في خطتك. يرجى الترقية لإضافة المزيد.`,
        code: 'BUILDING_LIMIT_REACHED',
      }),
    });
  }
}

/**
 * Checks if the office can add more units based on their plan limits.
 * Call this before creating a unit.
 */
export async function enforceUnitLimit(
  db: import('@faseel/db').Database,
  officeId: string,
): Promise<void> {
  const [activeSub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  if (!activeSub) return;

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, activeSub.planId))
    .limit(1);

  if (!plan?.maxUnits) return;

  const unitCountRows = await db
    .select({ value: count() })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(buildings.officeId, officeId));

  const currentUnitCount = unitCountRows[0]?.value ?? 0;

  if (currentUnitCount >= plan.maxUnits) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: `You have reached the maximum number of units (${plan.maxUnits}) for your plan. Please upgrade to add more.`,
        messageAr: `لقد وصلت إلى الحد الأقصى لعدد الوحدات (${plan.maxUnits}) في خطتك. يرجى الترقية لإضافة المزيد.`,
        code: 'UNIT_LIMIT_REACHED',
      }),
    });
  }
}
