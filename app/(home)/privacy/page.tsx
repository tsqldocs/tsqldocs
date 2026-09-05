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
        <p className="text-sm text-fd-muted-foreground">Last updated: September 5, 2026</p>

        <p>
          tsqldocs is a documentation site. It has no accounts, no login, and no advertising
          or cross-site tracking cookies. This page describes the small amount of data that
          is processed when you use it.
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
          beyond standard short-lived server logs.
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
          <li>no cross-site tracking cookies</li>
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
