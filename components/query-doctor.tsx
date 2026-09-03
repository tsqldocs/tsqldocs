'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { StethoscopeIcon } from 'lucide-react';
import { useAISearchContext } from '@/components/ai/search';

const SqlEditor = dynamic(() => import('./sql-editor'), {
  ssr: false,
  loading: () => (
    <pre className="px-3 py-6 font-mono text-[13px] text-fd-muted-foreground">Loading editor…</pre>
  ),
});

const ENGINES = ['PostgreSQL', 'MySQL', 'SQL Server', 'SQLite', 'BigQuery', 'Other / not sure'];

const SAMPLE = `SELECT customer_id, name, SUM(amount) AS total
FROM orders
JOIN customers USING (customer_id)
WHERE total > 100
GROUP BY customer_id;`;

export function QueryDoctor() {
  const [sql, setSql] = useState(SAMPLE);
  const [error, setError] = useState('');
  const [engine, setEngine] = useState(ENGINES[0]);
  const { resolvedTheme } = useTheme();
  const ai = useAISearchContext();

  const diagnose = useCallback(() => {
    if (!ai) return;
    const text = [
      `Diagnose this ${engine} query. Explain the root cause, give a corrected`,
      `query I can run as-is, and tell me how to avoid the mistake.`,
      '',
      '```sql',
      sql.trim(),
      '```',
      error.trim() ? `\nError message:\n\n${error.trim()}` : '\n(No error message — it runs but the result is wrong or unexpected.)',
    ].join('\n');

    ai.setOpen(true);
    void ai.chat.sendMessage({
      role: 'user',
      parts: [
        { type: 'data-client', data: { location: location.href } },
        { type: 'text', text },
      ],
    });
  }, [ai, sql, error, engine]);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
        <StethoscopeIcon className="size-4 text-fd-primary" />
        <span className="text-xs font-medium text-fd-muted-foreground">Query Doctor</span>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          className="ml-auto rounded-md border border-fd-border bg-fd-background px-2 py-1 text-xs text-fd-foreground"
        >
          {ENGINES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="border-b border-fd-border">
        <p className="px-3 pt-2 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">
          Your query
        </p>
        <SqlEditor value={sql} onChange={setSql} onRun={diagnose} dark={resolvedTheme === 'dark'} />
      </div>

      <div className="border-b border-fd-border p-3">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">
          Error message <span className="normal-case text-fd-muted-foreground/70">(optional)</span>
        </p>
        <textarea
          value={error}
          onChange={(e) => setError(e.target.value)}
          rows={2}
          placeholder="Paste the exact error, or leave blank if it runs but the result is wrong"
          className="block w-full resize-y rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-xs text-fd-foreground outline-none placeholder:text-fd-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-3 bg-fd-muted/40 px-3 py-2">
        <button
          type="button"
          onClick={diagnose}
          disabled={!ai}
          className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <StethoscopeIcon className="size-3.5" />
          Diagnose
        </button>
        <span className="text-[11px] text-fd-muted-foreground">
          Opens the AI panel with a fix grounded in the docs.
        </span>
      </div>
    </div>
  );
}
