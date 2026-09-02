'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ *
 * Minimal sql.js typings (the package ships none).
 * ------------------------------------------------------------------ */
interface SqlJsResult {
  columns: string[];
  values: unknown[][];
}
interface SqlJsDatabase {
  exec(sql: string): SqlJsResult[];
  run(sql: string): void;
}
interface SqlJsStatic {
  Database: new (data?: ArrayLike<number> | Buffer | null) => SqlJsDatabase;
}
type InitSqlJs = (config?: {
  locateFile?: (file: string) => string;
}) => Promise<SqlJsStatic>;

/* ------------------------------------------------------------------ *
 * Seed database — shared by every <SqlRunner> on the page.
 * The tables match the examples used throughout the docs.
 * ------------------------------------------------------------------ */
const SEED_SQL = `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT,
  country     TEXT
);
INSERT INTO customers VALUES
  (1,'Acme Corp','US'),
  (2,'Globex','US'),
  (3,'Initech','CA'),
  (4,'Umbrella','GB'),
  (5,'Stark Industries','US'),
  (6,'Wayne Enterprises','US'),
  (7,'Soylent','CA');

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER,
  order_date   TEXT,
  amount       REAL,
  status       TEXT,
  cancelled_at TEXT
);
INSERT INTO orders VALUES
  (101,1,'2026-01-05', 120.00,'paid',NULL),
  (102,1,'2026-01-22', 80.00,'paid',NULL),
  (103,1,'2026-02-14', 200.00,'refunded','2026-02-20'),
  (104,2,'2026-01-09', 50.00,'paid',NULL),
  (105,2,'2026-03-01', 50.00,'paid',NULL),
  (106,3,'2026-02-02', 300.00,'paid',NULL),
  (107,3,'2026-02-02', 300.00,'paid',NULL),
  (108,4,'2026-03-18', 1000.00,'pending',NULL),
  (109,5,'2026-01-30', 0.00,'paid',NULL),
  (110,5,'2026-02-28', 640.00,'paid',NULL),
  (111,5,'2026-03-15', 175.00,'refunded','2026-03-19');

CREATE TABLE employees (
  employee_id   INTEGER PRIMARY KEY,
  name          TEXT,
  department_id INTEGER,
  salary        INTEGER
);
INSERT INTO employees VALUES
  (1,'Ada',10,145000),
  (2,'Grace',10,145000),
  (3,'Linus',10,120000),
  (4,'Margaret',20,160000),
  (5,'Dennis',20,155000),
  (6,'Ken',20,155000),
  (7,'Barbara',30,98000);

CREATE TABLE product_sales (
  product_id   INTEGER PRIMARY KEY,
  category_id  INTEGER,
  product_name TEXT,
  sales        INTEGER
);
INSERT INTO product_sales VALUES
  (1,1,'Widget',  400),
  (2,1,'Gadget',  400),
  (3,1,'Gizmo',   250),
  (4,2,'Sprocket',900),
  (5,2,'Cog',     120),
  (6,3,'Bolt',     75);

CREATE TABLE monthly_revenue (
  month   TEXT PRIMARY KEY,
  revenue INTEGER
);
INSERT INTO monthly_revenue VALUES
  ('2026-01',12000),
  ('2026-02',15500),
  ('2026-03',14100),
  ('2026-04',18800);
`;

const SCHEMA_HINT = [
  'customers(customer_id, name, country)',
  'orders(order_id, customer_id, order_date, amount, status, cancelled_at)',
  'employees(employee_id, name, department_id, salary)',
  'product_sales(product_id, category_id, product_name, sales)',
  'monthly_revenue(month, revenue)',
];

const DEFAULT_QUERY = `SELECT
  customer_id,
  COUNT(*)      AS orders,
  SUM(amount)   AS total_spend
FROM orders
GROUP BY customer_id
ORDER BY total_spend DESC;`;

/* ------------------------------------------------------------------ *
 * Lazily initialise sql.js once and keep one seeded DB for the page.
 * ------------------------------------------------------------------ */
let dbPromise: Promise<SqlJsDatabase> | null = null;

function getDatabase(): Promise<SqlJsDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const mod = await import('sql.js');
      const initSqlJs = (mod.default ?? mod) as unknown as InitSqlJs;
      const SQL = await initSqlJs({ locateFile: (file) => `/${file}` });
      const db = new SQL.Database();
      db.run(SEED_SQL);
      return db;
    })();
  }
  return dbPromise;
}

/* ------------------------------------------------------------------ */

type RunState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; results: SqlJsResult[]; ms: number }
  | { status: 'error'; message: string };

export function SqlRunner({ query = DEFAULT_QUERY }: { query?: string }) {
  const [sql, setSql] = useState(query.trim());
  const [state, setState] = useState<RunState>({ status: 'idle' });
  const [showSchema, setShowSchema] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setState({ status: 'loading' });
    try {
      const db = await getDatabase();
      const t0 = performance.now();
      const results = db.exec(sql);
      const ms = Math.round(performance.now() - t0);
      setState({ status: 'ok', results, ms });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      runningRef.current = false;
    }
  }, [sql]);

  // Warm up sql.js in the background so the first run feels instant.
  useEffect(() => {
    void getDatabase().catch(() => {});
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void run();
    }
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex items-center justify-between gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
        <span className="text-xs font-medium text-fd-muted-foreground">SQL playground</span>
        <button
          type="button"
          onClick={() => setShowSchema((v) => !v)}
          className="text-xs text-fd-muted-foreground underline-offset-2 hover:text-fd-foreground hover:underline"
        >
          {showSchema ? 'hide tables' : 'tables'}
        </button>
      </div>

      {showSchema && (
        <ul className="border-b border-fd-border bg-fd-muted/20 px-3 py-2 font-mono text-[11px] leading-5 text-fd-muted-foreground">
          {SCHEMA_HINT.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}

      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        rows={Math.min(16, Math.max(4, sql.split('\n').length + 1))}
        className="block w-full resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 text-fd-foreground outline-none"
      />

      <div className="flex items-center gap-3 border-t border-fd-border bg-fd-muted/40 px-3 py-2">
        <button
          type="button"
          onClick={() => void run()}
          disabled={state.status === 'loading'}
          className="rounded-md bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {state.status === 'loading' ? 'Running…' : 'Run'}
        </button>
        <span className="text-[11px] text-fd-muted-foreground">⌘/Ctrl + Enter</span>
        {state.status === 'ok' && (
          <span className="ml-auto text-[11px] text-fd-muted-foreground">{state.ms} ms</span>
        )}
      </div>

      {state.status === 'error' && (
        <pre className="overflow-x-auto border-t border-fd-border bg-red-500/10 px-3 py-2 text-xs text-red-500">
          {state.message}
        </pre>
      )}

      {state.status === 'ok' && <Results results={state.results} />}
    </div>
  );
}

function Results({ results }: { results: SqlJsResult[] }) {
  if (results.length === 0) {
    return (
      <p className="border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground">
        Statement ran. No rows returned.
      </p>
    );
  }

  return (
    <div className="border-t border-fd-border">
      {results.map((r, i) => (
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-fd-muted/30 text-left">
                {r.columns.map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap px-3 py-1.5 font-medium text-fd-muted-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.values.map((row, ri) => (
                <tr key={ri} className="border-t border-fd-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="whitespace-nowrap px-3 py-1.5 font-mono">
                      {cell === null ? (
                        <span className="text-fd-muted-foreground italic">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-1.5 text-[11px] text-fd-muted-foreground">
            {r.values.length} row{r.values.length === 1 ? '' : 's'}
          </p>
        </div>
      ))}
    </div>
  );
}
