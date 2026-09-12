import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CheckIcon } from 'lucide-react';
import {
  FREE_CHAT_RATE_LIMIT,
  SUBSCRIBER_CHAT_RATE_LIMIT,
  SUBSCRIBER_COOKIE,
  isActiveSubscriber,
} from '@/lib/subscriber';
import { stripeConfigured } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'tsqldocs is free — the reference, playground, and tools always are. Subscribing only raises the daily limit on the AI assistant.',
};

const FREE_FEATURES = [
  'The full reference, recipes, cheat sheet, dialect comparison, and tutorials',
  'The in-browser SQL playground',
  'Query Doctor',
  `${FREE_CHAT_RATE_LIMIT} AI questions per day`,
];

const SUPPORTER_FEATURES = [
  'Everything in Free',
  `${SUBSCRIBER_CHAT_RATE_LIMIT} AI questions per day`,
];

export default async function PricingPage({
  searchParams,
}: PageProps<'/pricing'>) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(SUBSCRIBER_COOKIE)?.value;
  const subscriber = await isActiveSubscriber(token);
  const billingReady = stripeConfigured();

  const success = params?.success === '1';
  const canceled = params?.canceled === '1';

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-4xl">
          Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-fd-muted-foreground">
          The reference, playground, and every tool on this site are free — always. Subscribing
          only raises the daily limit on the AI assistant.
        </p>
      </header>

      {success && (
        <p className="mt-6 rounded-lg border border-fd-primary/25 bg-fd-primary/10 px-4 py-3 text-center text-sm text-fd-primary">
          You&rsquo;re subscribed — thanks for the support.
        </p>
      )}
      {canceled && (
        <p className="mt-6 rounded-lg border border-fd-border bg-fd-muted/50 px-4 py-3 text-center text-sm text-fd-muted-foreground">
          Checkout was canceled — nothing was charged.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-fd-border bg-fd-card p-6">
          <h2 className="text-lg font-semibold text-fd-foreground">Free</h2>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-fd-foreground">
            $0
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-fd-muted-foreground">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-fd-primary/40 bg-fd-card p-6 ring-1 ring-fd-primary/20">
          <h2 className="text-lg font-semibold text-fd-foreground">Supporter</h2>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-fd-foreground">
            $4.99<span className="text-base font-normal text-fd-muted-foreground">/mo</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {SUPPORTER_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-fd-foreground">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-fd-primary" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {subscriber ? (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-full border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium text-fd-foreground transition hover:border-fd-primary/40"
                >
                  Manage subscription
                </button>
              </form>
            ) : billingReady ? (
              <form action="/api/stripe/checkout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="text-center text-xs text-fd-muted-foreground">Coming soon.</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-fd-muted-foreground">
        Cancel anytime from the same button above. No effect on anything else on the site — the
        free tier never expires.
      </p>
    </main>
  );
}
