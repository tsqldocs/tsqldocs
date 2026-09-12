import Stripe from 'stripe';
import { getStripe, stripeConfigured } from '@/lib/stripe';
import { setEntitlement } from '@/lib/subscriber';

// Prefix match, not an explicit event list — covers every subscription
// lifecycle event (created/updated/deleted, and any future one Stripe
// adds) without the dashboard's selected-events list and this switch
// having to stay in sync.
const HANDLED_PREFIX = 'customer.subscription.';

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
    // Explicit SubtleCrypto provider — Cloudflare Workers has Web Crypto,
    // not Node's crypto module that Stripe's SDK assumes by default.
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type.startsWith(HANDLED_PREFIX)) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    try {
      await setEntitlement(customerId, {
        status: subscription.status,
        subscriptionId: subscription.id,
      });
    } catch (err) {
      console.error('[stripe webhook] failed to write entitlement', err);
      // Non-2xx is deliberate — tells Stripe to retry with backoff, covering
      // a transient KV error without us building our own retry logic.
      return Response.json({ error: 'Failed to record subscription state.' }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
