import type { Metadata } from 'next';
import Link from 'next/link';
import { gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What tsqldocs is, how the examples are tested, and how to report an error or request a page.',
};

const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <article className="prose">
        <h1>About tsqldocs</h1>
        <p>
          tsqldocs is a practical SQL reference: the clauses, functions, joins, window
          functions, data-writing statements, transactions, and performance topics that
          shape real queries — plus copy-paste recipes, a browser SQL playground, and an AI
          assistant that answers from these pages.
        </p>

        <h2>How it&rsquo;s built</h2>
        <ul>
          <li>
            <strong>Every example is runnable.</strong> The green &ldquo;SQL playground&rdquo;
            blocks execute against a real SQLite database (compiled to WebAssembly) in your
            browser, seeded with a small fixed sample schema.
          </li>
          <li>
            <strong>Examples are tested before they ship.</strong> Each runnable query is
            checked against SQLite first; ones that only work on other engines are shown as
            static code with the dialect noted.
          </li>
          <li>
            <strong>Edge cases are the point.</strong> The gotcha that makes a query wrong in
            production — a <code>NULL</code> in a <code>NOT IN</code>, a{' '}
            <code>WHERE</code> that turns a <code>LEFT JOIN</code> into an inner one — gets a
            section, not a footnote.
          </li>
          <li>
            <strong>Dialect differences are called out.</strong> Where PostgreSQL, MySQL, and
            SQL Server diverge from the standard or from each other, the page says so.
          </li>
        </ul>

        <h2>The AI assistant</h2>
        <p>
          The &ldquo;Ask AI&rdquo; assistant is grounded in this documentation — it searches
          these pages and cites the ones it used, rather than answering from training data
          alone. It&rsquo;s rate-limited so it can stay free. It can still be wrong; treat its
          output as a starting point and verify against your own database. See the{' '}
          <Link href="/privacy">privacy page</Link> for what data the assistant sends and
          where.
        </p>

        <h2>Corrections and requests</h2>
        <p>
          Found something wrong, unclear, or missing? That&rsquo;s the most useful feedback
          there is:
        </p>
        <ul>
          <li>
            Open an issue at{' '}
            <a href={repoUrl} target="_blank" rel="noreferrer">
              {repoUrl.replace('https://', '')}
            </a>
          </li>
          <li>
            Or email <a href="mailto:contact@tsqldocs.com">contact@tsqldocs.com</a>
          </li>
        </ul>

        <h2>Independence</h2>
        <p>
          tsqldocs is an independently-run project. It is not affiliated with, endorsed by,
          or sponsored by Oracle, the PostgreSQL Global Development Group, Microsoft, or any
          database vendor. &ldquo;SQL,&rdquo; &ldquo;PostgreSQL,&rdquo; &ldquo;MySQL,&rdquo;
          &ldquo;SQL Server,&rdquo; and related names are trademarks of their respective
          owners and are used here only to describe those systems.
        </p>
      </article>
    </main>
  );
}
