import { getStripe, stripeConfigured } from '@/lib/stripe';
import { linkSubscriptionToToken, setEntitlement, SUBSCRIBER_COOKIE } from '@/lib/subscriber';
import { siteUrl } from '@/lib/shared';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // just over a year, the max most browsers allow

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');

  if (!stripeConfigured() || !sessionId) {
    return Response.redirect(`${siteUrl}/pricing`, 303);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  const subscription = session.subscription;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (session.payment_status !== 'paid' || !subscription || typeof subscription === 'string' || !customerId) {
    return Response.redirect(`${siteUrl}/pricing?canceled=1`, 303);
  }

  // Opaque, unguessable token — not a JWT. Its only job is to be a KV key;
  // there's nothing to forge since the entitlement it points to lives
  // server-side and is only ever set by us (here and in the webhook).
  const token = crypto.randomUUID();
  await setEntitlement(token, {
    status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'past_due',
    customerId,
    subscriptionId: subscription.id,
  });
  await linkSubscriptionToToken(subscription.id, token);

  // Response.redirect() returns a Response with immutable headers — trying
  // to .append() a Set-Cookie onto it throws ("Can't modify immutable
  // headers") rather than failing to compile, so it only surfaces at
  // runtime. Building the redirect manually gives a mutable headers object.
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${siteUrl}/pricing?success=1`,
      'Set-Cookie': `${SUBSCRIBER_COOKIE}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}
