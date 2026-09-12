import Stripe from 'stripe';
import { getStripe, stripeConfigured } from '@/lib/stripe';
import { getTokenForSubscription, setEntitlement, type Entitlement } from '@/lib/subscriber';

function mapStatus(status: Stripe.Subscription.Status): Entitlement['status'] {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due') return 'past_due';
  return 'canceled';
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  // Nothing to update if this subscription was never linked to a token —
  // that link is created on the success-page redirect right after
  // checkout, so it's normal for the very first `customer.subscription.
  // created` webhook to race ahead of it and find nothing yet.
  const token = await getTokenForSubscription(subscription.id);
  if (!token) return;

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  await setEntitlement(token, {
    status: mapStatus(subscription.status),
    customerId,
    subscriptionId: subscription.id,
  });
}

export async function POST(req: Request) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Billing is not configured yet.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    // Async variant: signature verification uses Web Crypto here, not
    // Node's crypto module, which is what Cloudflare Workers actually has.
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(event.data.object);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
