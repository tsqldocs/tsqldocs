import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpDownIcon } from 'lucide-react';
import { TypePrecedenceTool } from '@/components/type-precedence-tool';
import { TYPE_PRECEDENCE, UNRANKED_HIGHER_THAN_STRING } from '@/lib/type-precedence';

export const metadata: Metadata = {
  title: 'T-SQL Data Type Precedence Checker',
  description:
    "Pick two T-SQL data types and see which one wins SQL Server's implicit-conversion precedence — and why it matters for index usage.",
};

export default function TypePrecedencePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 md:py-20">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fd-primary/25 bg-fd-primary/10 px-3 py-1.5 text-xs font-medium text-fd-primary">
          <ArrowUpDownIcon className="size-3.5" />
          Deterministic — straight from Microsoft's own precedence table
        </div>

        <div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-fd-foreground md:text-5xl">
            Data type precedence checker
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
            When T-SQL compares, joins, or combines two different data types, the
            lower-precedence one gets implicitly converted to match the higher-precedence
            one — regardless of which side of the expression it's on. Pick two types below
            to see which one wins.
          </p>
        </div>

        <TypePrecedenceTool />

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            Why this matters more than it looks
          </h2>
          <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
            This isn't just trivia — it's the mechanism behind one of the most common
            real-world T-SQL performance bugs. If a <strong className="text-fd-foreground">column</strong>{' '}
            is the lower-precedence side of a comparison, SQL Server converts the column's
            values (not the other side), which usually makes an index on that column
            unusable — a seek silently becomes a scan, with no error to flag it. The
            single most common trigger: ADO.NET and most ORMs default a plain{' '}
            <code>string</code> parameter to <code>NVARCHAR</code>, so comparing it against
            a <code>VARCHAR</code> column hits this on every call.{' '}
            <Link href="/blog/implicit-conversion-kills-index" className="font-medium text-fd-primary hover:underline">
              Full explanation, with the exact plan predicate to look for →
            </Link>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            The full precedence order
          </h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            Highest to lowest. Length/precision (<code>varchar(50)</code> vs{' '}
            <code>varchar(200)</code>) never affects this — only the base type does.
          </p>
          <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-fd-muted-foreground sm:grid-cols-3">
            {TYPE_PRECEDENCE.map((type, i) => (
              <li key={type} className="flex items-baseline gap-2">
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-fd-muted-foreground/60">
                  {i + 1}
                </span>
                <code className="text-fd-foreground">{type}</code>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-fd-muted-foreground">
            <code>{UNRANKED_HIGHER_THAN_STRING.join('</code>, <code>')}</code> all rank above
            the string and binary types above, but Microsoft doesn't publish their exact
            position relative to the numeric/date types or to each other.
          </p>
        </div>

        <p className="text-xs text-fd-muted-foreground">
          Source:{' '}
          <a
            href="https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-fd-foreground"
          >
            Microsoft's Data Type Precedence documentation
          </a>
          . This list reflects the current published order — Microsoft has changed it before
          (adding <code>json</code> and <code>vector</code>), so re-check against the source
          if this page is old.
        </p>
      </section>
    </main>
  );
}
