import { getStripe, stripeConfigured } from '@/lib/stripe';
import { setEntitlement } from '@/lib/subscriber';
import { buildSetCookie, signSubscriberCookie } from '@/lib/subscriber-cookie';
import { siteUrl } from '@/lib/shared';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');
  const secret = process.env.COOKIE_SIGNING_SECRET;

  if (!stripeConfigured() || !sessionId || !secret) {
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

  await setEntitlement(customerId, {
    status: subscription.status,
    subscriptionId: subscription.id,
  });
  const cookieValue = await signSubscriberCookie(customerId, secret);

  // Response.redirect() returns a Response with immutable headers — trying
  // to .append() a Set-Cookie onto it throws ("Can't modify immutable
  // headers") rather than failing to compile, so it only surfaces at
  // runtime. Building the redirect manually gives a mutable headers object
  // (learned this the hard way against a live test purchase).
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${siteUrl}/pricing?success=1`,
      'Set-Cookie': buildSetCookie(cookieValue),
    },
  });
}
