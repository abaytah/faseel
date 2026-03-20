import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
        // TODO: Activate subscription, link Stripe customer to office
        const _session = event.data.object;
        break;
      }

      case 'invoice.paid': {
        // TODO: Record payment, extend subscription period
        const _invoice = event.data.object;
        break;
      }

      case 'invoice.payment_failed': {
        // TODO: Notify office of failed payment, mark subscription at risk
        const _invoice = event.data.object;
        break;
      }

      case 'customer.subscription.updated': {
        // TODO: Sync plan changes (upgrade/downgrade)
        const _subscription = event.data.object;
        break;
      }

      case 'customer.subscription.deleted': {
        // TODO: Deactivate subscription, restrict access
        const _subscription = event.data.object;
        break;
      }

      default:
        // Unhandled event type, log for visibility
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
