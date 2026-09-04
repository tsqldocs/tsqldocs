import type { Metadata } from 'next';
import Link from 'next/link';
import { StethoscopeIcon } from 'lucide-react';
import { QueryDoctor } from '@/components/query-doctor';

export const metadata: Metadata = {
  title: 'Query Doctor',
  description:
    'Paste a broken SQL query and its error — get the root cause, a corrected query you can run, and how to avoid it next time.',
};

const COMMON = [
  ['Aggregate / GROUP BY mismatches', '"column must appear in the GROUP BY clause"'],
  ['A SELECT alias used in WHERE or HAVING', 'aliases aren’t visible yet at that stage'],
  ['LEFT JOIN silently turned into an INNER JOIN', 'a WHERE filter on the right table'],
  ['NOT IN returning nothing', 'the subquery has a NULL'],
  ['Window function in WHERE', 'needs a subquery / CTE'],
  ['Ambiguous column name', 'after a join, unqualified'],
  ['Integer division flooring to 0', 'missing a numeric cast'],
];

export default function QueryDoctorPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 md:py-20">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fd-primary/25 bg-fd-primary/10 px-3 py-1.5 text-xs font-medium text-fd-primary">
          <StethoscopeIcon className="size-3.5" />
          Grounded in the tsqldocs reference
        </div>

        <div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-fd-foreground md:text-5xl">
            Query Doctor
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
            Paste the query that&rsquo;s misbehaving and the exact error message
            (or leave the error blank if it runs but the result is wrong).
            <strong className="text-fd-foreground"> Diagnose</strong> opens the
            AI assistant with an answer grounded in these docs.
          </p>
        </div>

        <QueryDoctor />

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            What you get back
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-fd-muted-foreground">
            <li>
              <strong className="text-fd-foreground">Root cause</strong> — the actual reason, not
              just &ldquo;syntax error near&hellip;&rdquo;.
            </li>
            <li>
              <strong className="text-fd-foreground">A corrected query</strong> — formatted, ready
              to paste into the{' '}
              <Link href="/docs/playground" className="text-fd-primary hover:underline">
                playground
              </Link>
              .
            </li>
            <li>
              <strong className="text-fd-foreground">How to avoid it</strong> — the rule or habit
              that prevents the class of bug, linked to the relevant reference page.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            Common ones it&rsquo;s good at
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {COMMON.map(([title, note]) => (
              <div
                key={title}
                className="rounded-xl border border-fd-border bg-fd-card p-4 text-sm"
              >
                <p className="font-medium text-fd-foreground">{title}</p>
                <p className="mt-1 text-fd-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
