import Stripe from 'stripe';
import { eq, and, count } from 'drizzle-orm';
import type { Database } from '@faseel/db';
import { offices, subscriptions, subscriptionPlans, buildings, units } from '@faseel/db';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key);
}

export async function createCheckoutSession(
  db: Database,
  officeId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const [office] = await db.select().from(offices).where(eq(offices.id, officeId)).limit(1);

  if (!office) {
    throw new Error('Office not found');
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  if (!plan?.stripePriceId) {
    throw new Error('Invalid plan or missing Stripe price ID');
  }

  let customerId = office.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      name: office.nameEn ?? office.nameAr,
      email: office.email ?? undefined,
      phone: office.phone ?? undefined,
      metadata: { officeId },
    });
    customerId = customer.id;

    await db.update(offices).set({ stripeCustomerId: customerId }).where(eq(offices.id, officeId));
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { officeId, planId },
  });

  return session.url ?? '';
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function getSubscriptionUsage(
  db: Database,
  officeId: string,
): Promise<{
  plan: string;
  buildingsUsed: number;
  buildingsLimit: number | null;
  unitsUsed: number;
  unitsLimit: number | null;
  currentPeriodEnd: Date | null;
}> {
  const [activeSub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  const [buildingCount] = await db
    .select({ value: count() })
    .from(buildings)
    .where(eq(buildings.officeId, officeId));

  const unitRows = await db
    .select({ value: count() })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(buildings.officeId, officeId));

  const unitsUsed = unitRows[0]?.value ?? 0;

  let planRecord = null;
  if (activeSub) {
    const [p] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, activeSub.planId))
      .limit(1);
    planRecord = p ?? null;
  }

  return {
    plan: planRecord?.nameEn ?? 'None',
    buildingsUsed: buildingCount?.value ?? 0,
    buildingsLimit: planRecord?.maxBuildings ?? null,
    unitsUsed,
    unitsLimit: planRecord?.maxUnits ?? null,
    currentPeriodEnd: activeSub?.currentPeriodEnd ?? null,
  };
}

export { getStripe };
