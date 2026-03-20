import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '@faseel/db';
import { subscriptions, invoices, offices } from '@faseel/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as Record<string, unknown>;
        const metadata = session.metadata as Record<string, string> | undefined;
        const officeId = metadata?.officeId;
        const planId = metadata?.planId;

        if (!officeId || !planId) {
          console.error('Missing metadata in checkout session:', session.id);
          break;
        }

        // Link Stripe customer to office
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : (session.customer as { id: string } | null)?.id;

        if (customerId) {
          await db
            .update(offices)
            .set({ stripeCustomerId: customerId })
            .where(eq(offices.id, officeId));
        }

        // Get subscription details
        const stripeSubId =
          typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription as { id: string } | null)?.id;

        if (stripeSubId) {
          const stripeSub = (await stripe.subscriptions.retrieve(stripeSubId)) as unknown as {
            current_period_start: number;
            current_period_end: number;
          };

          await db.insert(subscriptions).values({
            officeId,
            planId,
            stripeSubscriptionId: stripeSubId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          });
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subField = invoice.subscription;
        const stripeSubId =
          typeof subField === 'string' ? subField : (subField as { id: string } | null)?.id;

        if (!stripeSubId) break;

        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
          .limit(1);

        if (sub) {
          await db.insert(invoices).values({
            subscriptionId: sub.id,
            stripeInvoiceId: invoice.id as string,
            amountSar: (invoice.amount_paid as number) ?? 0,
            status: 'PAID',
            paidAt: new Date(),
          });

          await db
            .update(subscriptions)
            .set({ status: 'ACTIVE' })
            .where(eq(subscriptions.id, sub.id));
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subField = invoice.subscription;
        const stripeSubId =
          typeof subField === 'string' ? subField : (subField as { id: string } | null)?.id;

        if (!stripeSubId) break;

        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
          .limit(1);

        if (sub) {
          await db.insert(invoices).values({
            subscriptionId: sub.id,
            stripeInvoiceId: invoice.id as string,
            amountSar: (invoice.amount_due as number) ?? 0,
            status: 'OVERDUE',
          });

          await db
            .update(subscriptions)
            .set({ status: 'PAST_DUE' })
            .where(eq(subscriptions.id, sub.id));
        }

        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as unknown as {
          id: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };

        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
          .limit(1);

        if (sub) {
          const statusMap: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING'> = {
            active: 'ACTIVE',
            past_due: 'PAST_DUE',
            canceled: 'CANCELLED',
            trialing: 'TRIALING',
          };

          await db
            .update(subscriptions)
            .set({
              status: statusMap[stripeSub.status] ?? 'ACTIVE',
              currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            })
            .where(eq(subscriptions.id, sub.id));
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as unknown as { id: string };

        await db
          .update(subscriptions)
          .set({ status: 'CANCELLED' })
          .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
