import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The terms for using tsqldocs — provided as-is, verify before production, and do not abuse the assistant.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <article className="prose">
        <h1>Terms of use</h1>
        <p className="text-sm text-fd-muted-foreground">Last updated: September 5, 2026</p>

        <p>By using tsqldocs, you agree to the following.</p>

        <h2>No warranty; verify before production</h2>
        <p>
          The documentation, examples, and AI-generated answers are provided for reference
          and education, <strong>&ldquo;as is,&rdquo;</strong> with no warranty of
          correctness, completeness, or fitness for a particular purpose. SQL behavior varies
          by engine and version. Test anything you take from this site against your own
          database before relying on it — the same review-first approach the site itself
          recommends.
        </p>

        <h2>The AI assistant</h2>
        <p>
          The assistant can be wrong, can produce SQL that does not run, and can suggest
          changes that are unsafe for your data. Treat its output as a starting point to
          review, not as authoritative advice. Do not paste credentials, personal data, or
          confidential information into the assistant or the playground.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>
            Do not attempt to overload the site, circumvent or automate around the
            assistant&rsquo;s rate limits, or bulk-scrape its content or responses.
          </li>
          <li>Do not use the site to do anything unlawful.</li>
          <li>
            Do not misrepresent the site&rsquo;s content or the assistant&rsquo;s output as
            being endorsed by any database vendor.
          </li>
        </ul>

        <h2>Content and intellectual property</h2>
        <p>
          The written explanations and page structure are &copy; the tsqldocs project. The
          SQL code examples are provided for you to copy and use freely, without attribution.
          Database names and trademarks referenced on the site belong to their respective
          owners.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, the tsqldocs project and its maintainer are
          not liable for any loss or damage arising from use of the site or reliance on its
          content or AI output, including lost data, lost profits, or business interruption.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may change; the current version and its date are posted here. Continued
          use after a change means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href="mailto:contact@tsqldocs.com">contact@tsqldocs.com</a>.
        </p>
      </article>
    </main>
  );
}
