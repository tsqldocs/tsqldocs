import type { Metadata } from 'next';
import Link from 'next/link';
import { ScanSearchIcon } from 'lucide-react';
import { ExecutionPlanTool } from '@/components/execution-plan-tool';

export const metadata: Metadata = {
  title: 'SQL Server Execution Plan Explainer',
  description:
    'Paste a SQL Server execution plan and get the Key Lookup, Spool, missing-index, and estimate-vs-actual patterns flagged in plain English.',
};

export default function ExecutionPlanExplainerPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 md:py-20">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fd-primary/25 bg-fd-primary/10 px-3 py-1.5 text-xs font-medium text-fd-primary">
          <ScanSearchIcon className="size-3.5" />
          Runs in your browser — the XML never leaves your machine
        </div>

        <div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-fd-foreground md:text-5xl">
            Execution plan explainer
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
            Paste a SQL Server execution plan's XML and get the handful of specific,
            well-known patterns this site writes about flagged directly — Key Lookups,
            Spools, SQL Server's own warnings, missing-index suggestions, and a cached
            plan whose row estimates don't match reality.
          </p>
        </div>

        <ExecutionPlanTool />

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            What this checks for
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-fd-muted-foreground">
            <li>
              <strong className="text-fd-foreground">Key / RID Lookups</strong> — an index
              got you to the right rows, but not every column the query needs.
            </li>
            <li>
              <strong className="text-fd-foreground">Spool operators</strong> — usually
              Halloween Problem protection on an UPDATE/DELETE.
            </li>
            <li>
              <strong className="text-fd-foreground">SQL Server&rsquo;s own warnings</strong>{' '}
              and <strong className="text-fd-foreground">missing-index suggestions</strong> —
              surfaced directly, not inferred.
            </li>
            <li>
              <strong className="text-fd-foreground">Large estimate-vs-actual gaps</strong> —
              a sign the cached plan was compiled for different data than this run saw.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            What this doesn&rsquo;t do
          </h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            This checks for a specific, known list of patterns — it isn&rsquo;t a general
            performance review of the plan, and a plan that triggers none of these checks
            isn&rsquo;t necessarily a good plan. Unlike the live SQL examples elsewhere on
            this site (verified against a real database engine), there&rsquo;s no SQL
            Server available to generate or validate plans against here — this was built
            from{' '}
            <a
              href="https://learn.microsoft.com/en-us/sql/relational-databases/showplan-logical-and-physical-operators-reference"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-fd-foreground"
            >
              the documented showplan XML schema
            </a>{' '}
            and tested against hand-written sample plans, not a captured real one. Treat it
            as a starting point for reading the plan, not a replacement for reading it.
          </p>
        </div>

        <p className="text-xs text-fd-muted-foreground">
          Get the XML in SSMS: right-click the graphical plan →{' '}
          <em>Show Execution Plan XML...</em>, or open a saved <code>.sqlplan</code> file
          in a text editor.
        </p>

        <p className="text-sm text-fd-muted-foreground">
          See also:{' '}
          <Link href="/blog/reading-a-sql-server-execution-plan" className="font-medium text-fd-primary hover:underline">
            Reading a SQL Server execution plan
          </Link>
          ,{' '}
          <Link href="/blog/halloween-problem" className="font-medium text-fd-primary hover:underline">
            The Halloween Problem
          </Link>
          , and{' '}
          <Link href="/blog/parameter-sniffing" className="font-medium text-fd-primary hover:underline">
            Parameter sniffing
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
