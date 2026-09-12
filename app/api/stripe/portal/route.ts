import { getStripe, stripeConfigured } from '@/lib/stripe';
import { getCookie, getEntitlement, SUBSCRIBER_COOKIE } from '@/lib/subscriber';
import { siteUrl } from '@/lib/shared';

export async function POST(req: Request) {
  const token = getCookie(req, SUBSCRIBER_COOKIE);
  const entitlement = await getEntitlement(token);

  if (!stripeConfigured() || !entitlement) {
    return Response.redirect(`${siteUrl}/pricing`, 303);
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: entitlement.customerId,
    return_url: `${siteUrl}/pricing`,
  });

  return Response.redirect(session.url, 303);
}
