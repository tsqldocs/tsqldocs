import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { highlight } from 'fumadocs-core/highlight';

export const metadata: Metadata = {
  title: 'SQL dialect comparison',
  description:
    'The same ~16 common operations shown side by side across PostgreSQL, MySQL, SQL Server, and SQLite — organized by engine instead of by topic.',
};

async function Code({ code }: { code: string }) {
  return highlight(code, {
    lang: 'sql',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
    components: {
      pre: ({ className, ...props }) => (
        <pre
          {...props}
          className={`${className ?? ''} min-w-0 max-w-full overflow-x-auto !bg-transparent !p-0 text-[12.5px] leading-5`}
        />
      ),
    },
  });
}

type Row = { engine: string; code: string };
type Item = { title: string; note: string; href?: string; rows: Row[] };

const items: Item[] = [
  {
    title: 'Limit rows',
    href: '/docs/core/limit',
    note: 'SQL Server\'s TOP goes right after SELECT, not at the end.',
    rows: [
      { engine: 'PostgreSQL', code: 'LIMIT 20 OFFSET 40' },
      { engine: 'MySQL', code: 'LIMIT 40, 20' },
      { engine: 'SQL Server', code: 'SELECT TOP 20 * FROM t ORDER BY ... OFFSET 40 ROWS' },
      { engine: 'SQLite', code: 'LIMIT 20 OFFSET 40' },
    ],
  },
  {
    title: 'String concatenation',
    href: '/docs/functions/strings',
    note: '|| is standard SQL; MySQL reads it as logical OR by default, so use CONCAT there.',
    rows: [
      { engine: 'PostgreSQL', code: "a || b" },
      { engine: 'MySQL', code: 'CONCAT(a, b)' },
      { engine: 'SQL Server', code: "a + b   -- or CONCAT(a, b)" },
      { engine: 'SQLite', code: 'a || b' },
    ],
  },
  {
    title: 'Current date / time',
    href: '/docs/functions/dates',
    note: 'CURRENT_DATE / CURRENT_TIMESTAMP are the standard forms most engines also accept.',
    rows: [
      { engine: 'PostgreSQL', code: 'now()   -- or CURRENT_TIMESTAMP' },
      { engine: 'MySQL', code: 'NOW()' },
      { engine: 'SQL Server', code: 'GETDATE()' },
      { engine: 'SQLite', code: "datetime('now')" },
    ],
  },
  {
    title: 'Bucket a date (truncate to month)',
    href: '/docs/functions/dates',
    note: 'This is the least portable corner of SQL — expect a different function name everywhere.',
    rows: [
      { engine: 'PostgreSQL', code: "date_trunc('month', ts)" },
      { engine: 'MySQL', code: "DATE_FORMAT(ts, '%Y-%m-01')" },
      { engine: 'SQL Server', code: 'DATETRUNC(month, ts)   -- 2022+' },
      { engine: 'SQLite', code: "strftime('%Y-%m', ts)" },
    ],
  },
  {
    title: 'Add an interval to a date',
    href: '/docs/functions/dates',
    rows: [
      { engine: 'PostgreSQL', code: "ts + INTERVAL '7 days'" },
      { engine: 'MySQL', code: 'DATE_ADD(ts, INTERVAL 7 DAY)' },
      { engine: 'SQL Server', code: 'DATEADD(day, 7, ts)' },
      { engine: 'SQLite', code: "date(ts, '+7 days')" },
    ],
    note: 'Store timestamps in UTC and do this math before formatting for display.',
  },
  {
    title: 'Upsert (insert or update)',
    href: '/docs/dml/upsert',
    note: 'Only PostgreSQL and SQLite share syntax here. MySQL and standard SQL/SQL Server are both genuinely different shapes — see the full page.',
    rows: [
      { engine: 'PostgreSQL', code: 'INSERT ... ON CONFLICT (id) DO UPDATE SET ...' },
      { engine: 'MySQL', code: 'INSERT ... ON DUPLICATE KEY UPDATE ...' },
      { engine: 'SQL Server', code: 'MERGE INTO t USING src ON ... WHEN MATCHED ...' },
      { engine: 'SQLite', code: 'INSERT ... ON CONFLICT (id) DO UPDATE SET ...' },
    ],
  },
  {
    title: 'Auto-incrementing primary key',
    note: 'SQLite doesn\'t need a keyword at all — INTEGER PRIMARY KEY is an alias for the internal rowid and auto-increments on its own.',
    rows: [
      { engine: 'PostgreSQL', code: 'id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY' },
      { engine: 'MySQL', code: 'id INT AUTO_INCREMENT PRIMARY KEY' },
      { engine: 'SQL Server', code: 'id INT IDENTITY(1,1) PRIMARY KEY' },
      { engine: 'SQLite', code: 'id INTEGER PRIMARY KEY' },
    ],
  },
  {
    title: 'Case-insensitive match',
    note: "SQL Server and MySQL's default collations are usually already case-insensitive — this is for when they aren't, or you need it explicitly.",
    rows: [
      { engine: 'PostgreSQL', code: "col ILIKE 'a%'" },
      { engine: 'MySQL', code: "col LIKE 'a%'  -- ci collation by default" },
      { engine: 'SQL Server', code: "col LIKE 'a%'  -- ci collation by default" },
      { engine: 'SQLite', code: "col LIKE 'a%'  -- ASCII case-insensitive by default" },
    ],
  },
  {
    title: 'Find a substring’s position',
    href: '/docs/functions/strings',
    note: 'All 1-indexed; 0 means not found. Watch the argument order — POSITION reads needle-in-haystack, the others read haystack-then-needle.',
    rows: [
      { engine: 'PostgreSQL', code: "POSITION('cd' IN s)   -- or STRPOS(s, 'cd')" },
      { engine: 'MySQL', code: "INSTR(s, 'cd')" },
      { engine: 'SQL Server', code: "CHARINDEX('cd', s)" },
      { engine: 'SQLite', code: "instr(s, 'cd')" },
    ],
  },
  {
    title: 'Extract a substring',
    href: '/docs/functions/strings',
    rows: [
      { engine: 'PostgreSQL', code: 'SUBSTRING(s FROM 2 FOR 3)' },
      { engine: 'MySQL', code: 'SUBSTRING(s, 2, 3)' },
      { engine: 'SQL Server', code: 'SUBSTRING(s, 2, 3)' },
      { engine: 'SQLite', code: 'substr(s, 2, 3)' },
    ],
    note: 'Positions are 1-indexed everywhere.',
  },
  {
    title: 'Split a delimited string',
    href: '/docs/functions/strings',
    note: 'No standard form at all, and SQLite has nothing built in — see the full page for a workaround.',
    rows: [
      { engine: 'PostgreSQL', code: "SPLIT_PART(s, ',', 2)" },
      { engine: 'MySQL', code: "SUBSTRING_INDEX(s, ',', 2)" },
      { engine: 'SQL Server', code: "SELECT value FROM STRING_SPLIT(s, ',')" },
      { engine: 'SQLite', code: 'no built-in — instr()/substr() by hand' },
    ],
  },
  {
    title: 'NULL-safe equality',
    href: '/blog/null-in-sql-guide',
    note: 'Standard = treats two NULLs as unequal (unknown, actually). These operators say "yes, both NULL counts as equal."',
    rows: [
      { engine: 'PostgreSQL', code: 'a IS NOT DISTINCT FROM b' },
      { engine: 'MySQL', code: 'a <=> b' },
      { engine: 'SQL Server', code: '(a = b) OR (a IS NULL AND b IS NULL)' },
      { engine: 'SQLite', code: 'a IS NOT DISTINCT FROM b' },
    ],
  },
  {
    title: 'Read a query plan',
    href: '/docs/performance/explain',
    note: '"ANALYZE" variants actually execute the query — not a dry run on a mutating statement.',
    rows: [
      { engine: 'PostgreSQL', code: 'EXPLAIN [ANALYZE] SELECT ...' },
      { engine: 'MySQL', code: 'EXPLAIN [ANALYZE] SELECT ...   -- 8.0.18+ for ANALYZE' },
      { engine: 'SQL Server', code: 'SET STATISTICS PROFILE ON' },
      { engine: 'SQLite', code: 'EXPLAIN QUERY PLAN SELECT ...' },
    ],
  },
  {
    title: 'Start a transaction',
    href: '/docs/transactions/basics',
    rows: [
      { engine: 'PostgreSQL', code: 'BEGIN;' },
      { engine: 'MySQL', code: 'START TRANSACTION;' },
      { engine: 'SQL Server', code: 'BEGIN TRANSACTION;' },
      { engine: 'SQLite', code: 'BEGIN;' },
    ],
    note: 'COMMIT / ROLLBACK end it the same way on all four.',
  },
  {
    title: 'Quoting an identifier with special characters',
    note: 'Mixing these up is one of the most common cross-engine porting errors — a query with "col" fails outright on MySQL.',
    rows: [
      { engine: 'PostgreSQL', code: '"Order Date"' },
      { engine: 'MySQL', code: '`Order Date`' },
      { engine: 'SQL Server', code: '[Order Date]' },
      { engine: 'SQLite', code: '"Order Date"   -- also accepts [ ] and `' },
    ],
  },
  {
    title: 'Recursive CTE',
    href: '/docs/core/cte',
    rows: [
      { engine: 'PostgreSQL', code: 'WITH RECURSIVE r AS (...) SELECT ...' },
      { engine: 'MySQL', code: 'WITH RECURSIVE r AS (...) SELECT ...   -- 8.0.1+' },
      { engine: 'SQL Server', code: 'WITH r AS (...) SELECT ...   -- no RECURSIVE keyword needed' },
      { engine: 'SQLite', code: 'WITH RECURSIVE r AS (...) SELECT ...' },
    ],
    note: 'SQL Server infers recursion from the CTE referencing itself — it doesn’t use the RECURSIVE keyword at all.',
  },
];

export default function DialectsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-4xl">
          SQL dialect comparison
        </h1>
        <p className="mt-3 text-fd-muted-foreground">
          The same operation, four ways. Organized by engine instead of by topic — for when
          you know what you want to do and just need the syntax for a specific database.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex min-w-0 flex-col rounded-xl border border-fd-border bg-fd-card p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-fd-foreground">{item.title}</h2>
              {item.href && (
                <Link
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-fd-primary transition hover:underline [&_svg]:size-3"
                >
                  Full page
                  <ArrowRightIcon />
                </Link>
              )}
            </div>

            <dl className="mt-3 space-y-2">
              {item.rows.map((row) => (
                <div key={row.engine} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                  <dt className="w-24 shrink-0 text-xs font-medium text-fd-muted-foreground">
                    {row.engine}
                  </dt>
                  <dd className="min-w-0 flex-1 rounded-md bg-fd-muted/50 px-2 py-1">
                    <Code code={row.code} />
                  </dd>
                </div>
              ))}
            </dl>

            {item.note && (
              <p className="mt-3 text-xs leading-5 text-fd-muted-foreground">{item.note}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Prefer to browse by topic instead?{' '}
        <Link href="/cheatsheet" className="font-medium text-fd-primary hover:underline">
          Open the cheat sheet
        </Link>{' '}
        or{' '}
        <Link href="/docs" className="font-medium text-fd-primary hover:underline">
          the full reference
        </Link>
        .
      </p>
    </main>
  );
}
