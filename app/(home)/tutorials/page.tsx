import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tutorials',
  description:
    'Guided learning paths through the SQL reference — fundamentals, window functions, writing data, troubleshooting, and performance, in the order worth learning them.',
};

type Step = { title: string; text: string; href: string; kind?: 'guide' };

type Track = {
  title: string;
  blurb: string;
  steps: Step[];
};

const tracks: Track[] = [
  {
    title: 'SQL fundamentals',
    blurb:
      'Start here if WHERE, GROUP BY, and JOIN are still a little shaky. Each step builds on the last.',
    steps: [
      { title: 'NULL handling', text: 'The three-valued logic that shapes everything downstream.', href: '/docs/core/nulls' },
      { title: 'WHERE', text: 'Filtering rows before anything else happens.', href: '/docs/core/where' },
      { title: 'DISTINCT', text: 'Removing duplicates — and why it applies to the whole row.', href: '/docs/core/distinct' },
      { title: 'ORDER BY', text: 'Making result order deterministic and intentional.', href: '/docs/core/order-by' },
      { title: 'GROUP BY', text: 'Collapsing rows into groups.', href: '/docs/core/group-by' },
      { title: 'HAVING', text: 'Filtering groups, after they’re formed.', href: '/docs/core/having' },
      { title: 'CASE', text: 'Branching logic inside a query.', href: '/docs/core/case' },
      { title: 'INNER JOIN', text: 'Combining rows that match in both tables.', href: '/docs/joins/inner-join' },
      { title: 'LEFT JOIN', text: 'Keeping every row from one side, matched or not.', href: '/docs/joins/left-join' },
    ],
  },
  {
    title: 'Window functions',
    blurb:
      'For once WHERE/GROUP BY/JOIN feel natural. Window functions unlock a whole class of "rank within a group" and "running total" problems.',
    steps: [
      { title: 'The complete guide to window functions', text: 'Start with the narrative — OVER(), PARTITION BY, and how ranking, running totals, and frames all fit together.', href: '/blog/sql-window-functions-guide', kind: 'guide' },
      { title: 'ROW_NUMBER', text: 'One row per group, no duplicates — the base for top-N-per-group.', href: '/docs/functions/row_number' },
      { title: 'RANK / DENSE_RANK', text: 'Ranking with ties — two different tie-breaking rules.', href: '/docs/functions/rank' },
      { title: 'Running total', text: 'A windowed SUM that keeps row-level detail.', href: '/docs/windows/running-total' },
      { title: 'LAG / LEAD', text: 'Comparing a row to the one before or after it, no self-join.', href: '/docs/windows/lag-lead' },
      { title: 'Window frames', text: 'Controlling exactly which rows a window aggregate sees.', href: '/docs/windows/frames' },
    ],
  },
  {
    title: 'Writing and protecting data',
    blurb: 'Everything above reads data. This is how it changes — safely.',
    steps: [
      { title: 'INSERT', text: 'Single row, multi-row, and INSERT … SELECT.', href: '/docs/dml/insert' },
      { title: 'UPDATE', text: 'Changing existing rows — and the WHERE clause that stops it from changing every row.', href: '/docs/dml/update' },
      { title: 'DELETE', text: 'Removing rows, and how it differs from TRUNCATE.', href: '/docs/dml/delete' },
      { title: 'BEGIN, COMMIT, ROLLBACK', text: 'Grouping statements so they succeed or fail together.', href: '/docs/transactions/basics' },
      { title: 'Isolation levels', text: 'What one transaction can see of another running at the same time.', href: '/docs/transactions/isolation-levels' },
    ],
  },
  {
    title: 'Diagnosing a query that’s wrong',
    blurb: 'The query runs, but the result is wrong, or a rule you swore was true just broke. Start with the symptom that matches.',
    steps: [
      { title: 'Why your query returns the wrong number of rows', text: 'A join multiplying rows, or a WHERE silently undoing a LEFT JOIN.', href: '/blog/wrong-number-of-rows', kind: 'guide' },
      { title: 'NULL in SQL: the complete guide', text: 'Why a query that looks right returns nothing, or a comparison you expected to fail just vanished.', href: '/blog/null-in-sql-guide', kind: 'guide' },
      { title: 'EXISTS and IN', text: 'The NOT IN + NULL trap that returns zero rows with no error.', href: '/docs/core/exists-in' },
      { title: 'Type coercion', text: 'Why a comparison or sort gives a different answer than expected.', href: '/docs/core/type-coercion' },
      { title: 'The order SQL actually runs in', text: 'Why WHERE can’t see a SELECT alias, and other order-of-execution errors.', href: '/blog/sql-execution-order', kind: 'guide' },
      { title: 'Query Doctor', text: 'Paste the broken query and its error — get the root cause and a fix.', href: '/fix' },
    ],
  },
  {
    title: 'Performance basics',
    blurb: 'Once queries are correct, make them fast — and prove it.',
    steps: [
      { title: 'Indexes', text: 'What an index does, and the patterns that silently defeat one.', href: '/docs/performance/indexes' },
      { title: 'Reading query plans', text: 'EXPLAIN across engines — what a scan vs. a search actually means.', href: '/docs/performance/explain' },
    ],
  },
];

export default function TutorialsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-4xl">
          Tutorials
        </h1>
        <p className="mt-3 text-fd-muted-foreground">
          Guided paths through the reference, in the order worth learning them. Every step
          links to a full page with runnable examples — nothing here is new content, just a
          map through what already exists.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {tracks.map((track, i) => (
          <section key={track.title}>
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-semibold text-fd-primary">Track {i + 1}</span>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-fd-foreground">
                {track.title}
              </h2>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-fd-muted-foreground">{track.blurb}</p>

            <ol className="mt-5 space-y-2">
              {track.steps.map((step, si) => (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className="group flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-3.5 transition hover:border-fd-primary/40 sm:items-center sm:gap-4"
                  >
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-fd-muted text-xs font-medium text-fd-muted-foreground sm:mt-0">
                      {si + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-fd-foreground group-hover:text-fd-primary">
                          {step.title}
                        </span>
                        {step.kind === 'guide' && (
                          <span className="rounded-full border border-fd-primary/25 bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fd-primary">
                            Guide
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-fd-muted-foreground">{step.text}</p>
                    </div>
                    <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-fd-primary sm:mt-0" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Prefer to look something up directly?{' '}
        <Link href="/cheatsheet" className="font-medium text-fd-primary hover:underline">
          Open the cheat sheet
        </Link>{' '}
        or{' '}
        <Link href="/docs" className="font-medium text-fd-primary hover:underline">
          browse the full reference
        </Link>
        .
      </p>
    </main>
  );
}
