import { getStripe, stripeConfigured } from '@/lib/stripe';
import { siteUrl } from '@/lib/shared';

export async function POST() {
  if (!stripeConfigured()) {
    return Response.json(
      { error: 'Billing is not configured yet.' },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${siteUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pricing?canceled=1`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return Response.json({ error: 'Could not start checkout.' }, { status: 502 });
  }

  return Response.redirect(session.url, 303);
}
