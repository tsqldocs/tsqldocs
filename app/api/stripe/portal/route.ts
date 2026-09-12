import { getStripe, stripeConfigured } from '@/lib/stripe';
import { checkSubscriber } from '@/lib/subscriber';
import { siteUrl } from '@/lib/shared';

export async function POST(req: Request) {
  const subscriber = await checkSubscriber(req);

  if (!stripeConfigured() || !subscriber.isSubscriber || !subscriber.customerId) {
    return Response.redirect(`${siteUrl}/pricing`, 303);
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscriber.customerId,
    return_url: `${siteUrl}/pricing`,
  });

  return Response.redirect(session.url, 303);
}
