import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SQL cheat sheet',
  description:
    'One-page SQL syntax reference — SELECT, joins, grouping, window functions, CTEs, DML, transactions, and performance — each linking to a page with runnable examples.',
};

type Card = {
  title: string;
  code: string;
  note: string;
  href: string;
};

const sections: { heading: string; cards: Card[] }[] = [
  {
    heading: 'Reading rows',
    cards: [
      {
        title: 'SELECT shape',
        code: `SELECT col1, col2, agg(col3) AS a
FROM   t
WHERE  predicate            -- rows, pre-group
GROUP BY col1, col2
HAVING agg(col3) > x        -- groups, post-group
ORDER BY a DESC
LIMIT  50 OFFSET 100;`,
        note: 'Written in this order; the engine runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
        href: '/blog/sql-execution-order',
      },
      {
        title: 'WHERE operators',
        code: `x = 1        x <> 1 / x != 1
x IN (1,2,3)         x BETWEEN 1 AND 9
x LIKE 'a%'   x ILIKE 'a%'   -- ILIKE: Postgres
x IS NULL     x IS NOT NULL
a AND b       a OR b       NOT a`,
        note: 'BETWEEN is inclusive on both ends. For timestamps prefer x >= lo AND x < hi.',
        href: '/docs/core/where',
      },
      {
        title: 'DISTINCT',
        code: `SELECT DISTINCT country FROM customers;
SELECT DISTINCT country, region FROM t;  -- whole row
SELECT COUNT(DISTINCT customer_id) FROM orders;`,
        note: 'DISTINCT applies to the entire SELECT list, not one column.',
        href: '/docs/core/distinct',
      },
      {
        title: 'LIMIT / paging',
        code: `LIMIT 20 OFFSET 40           -- Postgres, MySQL, SQLite
FETCH FIRST 20 ROWS ONLY     -- standard, SQL Server, Oracle
TOP 20                       -- SQL Server (after SELECT)`,
        note: 'Deep OFFSET is slow — page by a WHERE key > last_seen instead.',
        href: '/docs/core/limit',
      },
    ],
  },
  {
    heading: 'Combining tables',
    cards: [
      {
        title: 'Joins',
        code: `FROM a JOIN b        ON b.a_id = a.id   -- inner: matches only
FROM a LEFT JOIN b   ON b.a_id = a.id   -- all of a
FROM a FULL JOIN b   ON b.a_id = a.id   -- all of both
-- anti-join: rows of a with no b
FROM a LEFT JOIN b ON b.a_id = a.id
WHERE b.id IS NULL;`,
        note: 'A WHERE on the right table of a LEFT JOIN silently turns it into an inner join — put that condition in ON.',
        href: '/docs/joins/left-join',
      },
      {
        title: 'EXISTS / IN',
        code: `WHERE id IN     (SELECT a_id FROM b)
WHERE EXISTS    (SELECT 1 FROM b WHERE b.a_id = a.id)
WHERE NOT EXISTS(SELECT 1 FROM b WHERE b.a_id = a.id)`,
        note: 'Never NOT IN a subquery whose column is nullable — one NULL makes it return nothing. Use NOT EXISTS.',
        href: '/docs/core/exists-in',
      },
      {
        title: 'Set operations',
        code: `q1 UNION ALL q2     -- concat, keep dups (fast)
q1 UNION q2        -- concat, dedupe (sorts)
q1 INTERSECT q2    -- rows in both
q1 EXCEPT q2       -- in q1, not q2  (MINUS in Oracle)`,
        note: 'Column count and types must line up. UNION ALL unless you actually need the dedupe.',
        href: '/docs/core/set-operations',
      },
      {
        title: 'CTEs (WITH)',
        code: `WITH recent AS (
  SELECT * FROM orders WHERE order_date >= '2026-01-01'
)
SELECT customer_id, COUNT(*) FROM recent GROUP BY customer_id;

WITH RECURSIVE nums(n) AS (
  SELECT 1  UNION ALL  SELECT n + 1 FROM nums WHERE n < 10
)
SELECT n FROM nums;`,
        note: 'Names a subquery so the query reads top-down. RECURSIVE walks hierarchies and series.',
        href: '/docs/core/cte',
      },
    ],
  },
  {
    heading: 'Aggregating',
    cards: [
      {
        title: 'GROUP BY / HAVING',
        code: `SELECT customer_id, COUNT(*) AS n, SUM(amount) AS total
FROM   orders
WHERE  status = 'paid'      -- filter rows first
GROUP BY customer_id
HAVING SUM(amount) > 500;   -- then filter groups`,
        note: 'Every non-aggregated SELECT column must be in GROUP BY. WHERE filters rows, HAVING filters groups.',
        href: '/docs/core/group-by',
      },
      {
        title: 'Aggregate functions',
        code: `COUNT(*)            -- all rows
COUNT(col)          -- non-NULL values of col
COUNT(DISTINCT col)
SUM(col)  AVG(col)  MIN(col)  MAX(col)   -- all skip NULL`,
        note: 'AVG ignores NULLs (not zero). Integer / integer floors — cast one side to get decimals.',
        href: '/docs/functions/avg',
      },
      {
        title: 'CASE',
        code: `CASE WHEN amount > 100 THEN 'big'
     WHEN amount > 0   THEN 'small'
     ELSE 'zero' END

CASE status WHEN 'paid' THEN 1 ELSE 0 END   -- simple form

SUM(CASE WHEN status='paid' THEN amount ELSE 0 END)  -- conditional agg`,
        note: 'First matching WHEN wins. No ELSE means NULL for the misses.',
        href: '/docs/core/case',
      },
      {
        title: 'Pivot without PIVOT',
        code: `SELECT
  customer_id,
  SUM(CASE WHEN status='paid'     THEN amount END) AS paid,
  SUM(CASE WHEN status='refunded' THEN amount END) AS refunded
FROM orders GROUP BY customer_id;`,
        note: 'Conditional aggregation runs the same on every engine — no dialect PIVOT needed.',
        href: '/docs/recipes/pivot',
      },
    ],
  },
  {
    heading: 'Window functions',
    cards: [
      {
        title: 'OVER() anatomy',
        code: `func(...) OVER (
  PARTITION BY grp          -- separate window per group
  ORDER BY sort_key         -- order within the window
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW   -- frame
)`,
        note: 'Rows are kept, not collapsed. PARTITION BY is GROUP BY without the collapse.',
        href: '/blog/sql-window-functions-guide',
      },
      {
        title: 'Ranking',
        code: `ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC)  -- 1,2,3,4  always unique
RANK()       OVER (...)   -- 1,1,3    ties share, then skip
DENSE_RANK() OVER (...)   -- 1,1,2    ties share, no gap`,
        note: 'ROW_NUMBER for exactly one row per group (top-N-per-group). RANK for leaderboards.',
        href: '/docs/functions/row_number',
      },
      {
        title: 'Running total & offsets',
        code: `SUM(x)  OVER (ORDER BY d)                     -- cumulative
SUM(x)  OVER (PARTITION BY g)                 -- group total on each row
LAG(x, 1, 0)  OVER (ORDER BY d)               -- previous row (default 0)
LEAD(x) OVER (ORDER BY d)                     -- next row
NTILE(4) OVER (ORDER BY x)                    -- quartiles by row count`,
        note: 'LAG/LEAD replace a self-join for period-over-period math.',
        href: '/docs/windows/running-total',
      },
    ],
  },
  {
    heading: 'Values & types',
    cards: [
      {
        title: 'NULL handling',
        code: `COALESCE(a, b, c)      -- first non-NULL
NULLIF(a, b)           -- NULL if a = b, else a
a IS NOT DISTINCT FROM b   -- NULL-safe equality (Postgres)
a <=> b                    -- NULL-safe equality (MySQL)`,
        note: 'NULL = NULL is unknown, not true. Any arithmetic or comparison with NULL is NULL.',
        href: '/docs/core/nulls',
      },
      {
        title: 'CAST & coercion',
        code: `CAST(x AS INTEGER)     CAST(x AS TEXT)     CAST(x AS DECIMAL(10,2))
x::integer            -- Postgres shorthand

'10' + 5     -- 15 (MySQL/SQLite), error (Postgres), 15 (SQL Server)
'10' > 9     -- depends: string vs numeric compare`,
        note: 'Implicit conversion rules differ per engine. Cast explicitly when types are mixed.',
        href: '/docs/core/type-coercion',
      },
      {
        title: 'String functions',
        code: `a || b            CONCAT(a, b, c)     -- || propagates NULL; CONCAT treats it as ''
SUBSTR(s, 2, 3)   -- 1-indexed
TRIM(s)  LTRIM(s)  RTRIM(s)   REPLACE(s, from, to)
INSTR(s, sub)     -- 1-indexed, 0 if not found  (POSITION / CHARINDEX elsewhere)
LENGTH(s)         -- LEN() on SQL Server (ignores trailing spaces)`,
        note: 'Positions are 1-indexed everywhere. LEFT/RIGHT/LPAD/RPAD are missing from some engines.',
        href: '/docs/functions/strings',
      },
      {
        title: 'Dates & times',
        code: `CURRENT_DATE   CURRENT_TIMESTAMP
DATE_TRUNC('month', ts)          -- Postgres;  strftime('%Y-%m', ts) SQLite
EXTRACT(YEAR FROM ts)            -- standard;  strftime('%Y', ts)    SQLite
ts + INTERVAL '7 days'           -- Postgres
DATEADD(day, 7, ts)  DATEDIFF(day, a, b)   -- SQL Server`,
        note: 'The least portable area of SQL — concepts transfer, function names do not.',
        href: '/docs/functions/dates',
      },
    ],
  },
  {
    heading: 'Writing data',
    cards: [
      {
        title: 'INSERT',
        code: `INSERT INTO t (a, b) VALUES (1, 2);
INSERT INTO t (a, b) VALUES (1, 2), (3, 4), (5, 6);   -- multi-row
INSERT INTO t (a, b) SELECT a, b FROM staging;        -- from a query
INSERT INTO t (a, b) VALUES (1, 2) RETURNING id;      -- Postgres, SQLite 3.35+`,
        note: 'List columns explicitly. Omitted columns get their DEFAULT or NULL.',
        href: '/docs/dml/insert',
      },
      {
        title: 'UPDATE / DELETE',
        code: `UPDATE t SET status = 'flagged' WHERE amount > 100;
DELETE FROM t WHERE status = 'refunded';

-- no WHERE hits every row. Run the SELECT first.
SELECT COUNT(*) FROM t WHERE amount > 100;`,
        note: 'Wrap risky changes in a transaction, verify, then COMMIT or ROLLBACK.',
        href: '/docs/dml/update',
      },
      {
        title: 'Transactions',
        code: `BEGIN;
  UPDATE accounts SET bal = bal - 100 WHERE id = 1;
  UPDATE accounts SET bal = bal + 100 WHERE id = 2;
COMMIT;              -- or ROLLBACK;

SAVEPOINT sp1;  ...  ROLLBACK TO sp1;   -- partial undo`,
        note: 'Autocommit is the default — BEGIN is what makes several statements one unit. A failed statement usually needs an explicit ROLLBACK.',
        href: '/docs/transactions/basics',
      },
    ],
  },
  {
    heading: 'Performance',
    cards: [
      {
        title: 'Indexes',
        code: `CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_cust_date  ON orders (customer_id, order_date);
CREATE UNIQUE INDEX ...            -- also a constraint`,
        note: 'A composite index only helps filters that start from its leftmost column. Function-wrapping a column (LOWER(col)) defeats a plain index.',
        href: '/docs/performance/indexes',
      },
      {
        title: 'Reading a plan',
        code: `EXPLAIN QUERY PLAN SELECT ...     -- SQLite
EXPLAIN [ANALYZE] SELECT ...      -- Postgres / MySQL 8+
SET STATISTICS PROFILE ON        -- SQL Server`,
        note: 'SCAN / Seq Scan / type=ALL = every row checked. SEARCH / Index Seek = using an index. EXPLAIN ANALYZE actually runs the query.',
        href: '/docs/performance/explain',
      },
    ],
  },
];

export default function CheatsheetPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-4xl">
          SQL cheat sheet
        </h1>
        <p className="mt-3 text-fd-muted-foreground">
          The syntax, on one page. Each block links to a full page with runnable examples,
          dialect notes, and the edge cases. Bookmark this; open the deep page when a query
          misbehaves.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-fd-primary">
              {section.heading}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {section.cards.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col rounded-xl border border-fd-border bg-fd-card p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold text-fd-foreground">{card.title}</h3>
                    <Link
                      href={card.href}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-fd-primary transition hover:underline [&_svg]:size-3"
                    >
                      Full page
                      <ArrowRightIcon />
                    </Link>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-fd-muted/50 p-3 text-[12px] leading-5 text-fd-foreground">
                    <code>{card.code}</code>
                  </pre>
                  <p className="mt-3 text-xs leading-5 text-fd-muted-foreground">{card.note}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Want to run any of this?{' '}
        <Link href="/docs/playground" className="font-medium text-fd-primary hover:underline">
          Open the playground
        </Link>{' '}
        — a seeded SQLite database in your browser.
      </p>
    </main>
  );
}
