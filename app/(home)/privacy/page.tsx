import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What tsqldocs collects (very little), what it sends to third parties, and what it does not do.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <article className="prose">
        <h1>Privacy</h1>
        <p className="text-sm text-fd-muted-foreground">Last updated: September 12, 2026</p>

        <p>
          tsqldocs is a documentation site. It has no accounts, no passwords, and no
          advertising or cross-site tracking cookies. Subscribing to raise the AI question
          limit uses Stripe and sets one functional cookie — see{' '}
          <a href="#subscriptions">Subscriptions and billing</a> below. This page describes
          the data that is processed when you use the site.
        </p>

        <h2>Analytics</h2>
        <p>
          The site uses <strong>Cloudflare Web Analytics</strong>, which reports aggregate
          page views and performance metrics (such as load time). It is cookie-less, does not
          fingerprint your device, and does not build a profile of you across sites. It is
          not possible to identify an individual visitor from this data. See{' '}
          <a
            href="https://www.cloudflare.com/web-analytics/"
            target="_blank"
            rel="noreferrer"
          >
            Cloudflare Web Analytics
          </a>
          .
        </p>

        <h2>The AI assistant</h2>
        <p>
          If you use the &ldquo;Ask AI&rdquo; assistant, the following is sent to{' '}
          <strong>Anthropic</strong>, which provides the underlying model, in order to
          generate a response:
        </p>
        <ul>
          <li>the message text you submit, and the conversation so far</li>
          <li>the URL of the page you asked from</li>
          <li>relevant excerpts from this documentation, retrieved to ground the answer</li>
        </ul>
        <p>
          Do not include passwords, personal data, or confidential information in messages to
          the assistant. Your messages are not used by tsqldocs to train any model. Anthropic
          processes the request under its API terms; see{' '}
          <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
            Anthropic&rsquo;s privacy policy
          </a>
          . tsqldocs does not store your conversations beyond what is needed to serve the
          request and short-lived operational logs.
        </p>

        <h2>Rate limiting</h2>
        <p>
          So the free assistant stays available, requests are counted per visitor using a key
          derived from your IP address. That counter is stored temporarily (it expires within
          24 hours) in Cloudflare Workers KV. Your raw IP address is not retained by tsqldocs
          beyond standard short-lived server logs. If you&rsquo;re subscribed, requests are
          counted against your subscription token instead of your IP, so your higher limit
          isn&rsquo;t affected by anyone else on your network.
        </p>

        <h2>Hosting</h2>
        <p>
          The site runs on <strong>Cloudflare</strong> (Workers). As the network handling
          every request, Cloudflare processes connection metadata and may keep short-term
          logs for security and reliability. See{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noreferrer"
          >
            Cloudflare&rsquo;s privacy policy
          </a>
          .
        </p>

        <h2 id="subscriptions">Subscriptions and billing</h2>
        <p>
          Subscribing to raise the AI question limit is handled entirely by{' '}
          <strong>Stripe</strong>. Your card details and email go directly to Stripe&rsquo;s
          checkout page — tsqldocs never sees or stores your card number, and does not store
          your email at all. What tsqldocs keeps, in the same Cloudflare KV store used for
          rate limiting, is only: your subscription&rsquo;s status (active, past due, or
          canceled) and Stripe&rsquo;s internal customer/subscription IDs, so the AI assistant
          knows to apply the higher limit.
        </p>
        <p>
          A successful subscription sets one functional, cryptographically signed cookie in
          your browser containing Stripe&rsquo;s customer reference (not your email, name, or
          card details) and can&rsquo;t be edited or forged client-side. Canceling (via the
          &ldquo;Manage subscription&rdquo; link, which opens Stripe&rsquo;s own billing
          portal) updates your status, which this cookie is re-checked against periodically.
          See{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            Stripe&rsquo;s privacy policy
          </a>{' '}
          for what Stripe itself collects as your payment processor.
        </p>

        <h2>The playground</h2>
        <p>
          The SQL playground and the runnable examples execute entirely in your browser
          against a small fixed sample dataset. The SQL you type there is not sent to any
          server (unless you choose to ask the AI about it).
        </p>

        <h2>What tsqldocs does not do</h2>
        <ul>
          <li>no accounts, no passwords, no email lists</li>
          <li>no advertising, no ad networks, no retargeting</li>
          <li>no selling or sharing of data with data brokers</li>
          <li>no cross-site tracking cookies (the one subscription cookie is functional only)</li>
          <li>never sees or stores your card number or your email</li>
        </ul>

        <h2>Children</h2>
        <p>The site is not directed at children under 13 and does not knowingly collect their data.</p>

        <h2>Changes</h2>
        <p>
          If this policy changes, the updated version and its date will be posted here.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy: <a href="mailto:contact@tsqldocs.com">contact@tsqldocs.com</a>.
        </p>
      </article>
    </main>
  );
}
