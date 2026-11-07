'use client';

import { useState } from 'react';
import { ArrowRightIcon, TriangleAlertIcon } from 'lucide-react';
import {
  ALL_TYPES,
  compareTypes,
  isIndexKillingStringMismatch,
} from '@/lib/type-precedence';

function TypeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-medium text-fd-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm text-fd-foreground"
      >
        {ALL_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TypePrecedenceTool() {
  const [typeA, setTypeA] = useState('varchar');
  const [typeB, setTypeB] = useState('nvarchar');

  const result = compareTypes(typeA, typeB);
  const indexWarning = isIndexKillingStringMismatch(typeA, typeB);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <TypeSelect label="Type A" value={typeA} onChange={setTypeA} />
        <div className="hidden pb-2.5 text-fd-muted-foreground sm:block">vs</div>
        <TypeSelect label="Type B" value={typeB} onChange={setTypeB} />
      </div>

      <div className="border-t border-fd-border bg-fd-muted/30 p-4">
        {result.kind === 'same' && (
          <p className="text-sm text-fd-muted-foreground">
            Same type — no precedence question, no implicit conversion needed.
          </p>
        )}

        {result.kind === 'ranked' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <code className="rounded bg-fd-primary/10 px-2 py-0.5 font-mono text-fd-primary">
                {result.winner}
              </code>
              <span className="text-fd-muted-foreground">wins</span>
              <ArrowRightIcon className="size-4 text-fd-muted-foreground" />
              <code className="rounded bg-fd-muted px-2 py-0.5 font-mono text-fd-muted-foreground line-through decoration-fd-muted-foreground/50">
                {result.loser}
              </code>
              <span className="text-fd-muted-foreground">gets converted</span>
            </div>
            <p className="text-xs text-fd-muted-foreground">
              Precedence rank {result.winnerRank} beats rank {result.loserRank} (1 = highest).
              Every <code>{result.loser}</code> value involved in this comparison is implicitly
              converted to <code>{result.winner}</code> before the comparison runs.
            </p>
          </div>
        )}

        {result.kind === 'unranked-vs-string' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <code className="rounded bg-fd-primary/10 px-2 py-0.5 font-mono text-fd-primary">
                {result.winner}
              </code>
              <span className="text-fd-muted-foreground">wins</span>
              <ArrowRightIcon className="size-4 text-fd-muted-foreground" />
              <code className="rounded bg-fd-muted px-2 py-0.5 font-mono text-fd-muted-foreground line-through decoration-fd-muted-foreground/50">
                {result.loser}
              </code>
              <span className="text-fd-muted-foreground">gets converted</span>
            </div>
            <p className="text-xs text-fd-muted-foreground">
              Microsoft documents <code>{result.winner}</code> as ranking above the string and
              binary types, without publishing an exact numeric position in the main table.
            </p>
          </div>
        )}

        {result.kind === 'unranked-vs-unranked' && (
          <p className="text-sm text-fd-muted-foreground">
            Microsoft doesn&rsquo;t publish an exact relative ranking for this pair —{' '}
            <code>hierarchyid</code>, <code>geometry</code>, and <code>geography</code> are only
            documented as ranking above the string and binary types, not against each other or
            against the numeric/date types.
          </p>
        )}

        {indexWarning && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>
              If one of these is a column with an index on it, this conversion is the classic
              index-killer — the column gets wrapped in an implicit <code>CONVERT</code>, which
              usually turns a seek into a scan.{' '}
              <a
                href="/blog/implicit-conversion-kills-index"
                className="font-medium underline underline-offset-2"
              >
                Full explanation
              </a>
              .
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
