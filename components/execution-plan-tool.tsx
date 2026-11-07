'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, TriangleAlertIcon, InfoIcon } from 'lucide-react';
import { analyzePlan, type PlanFinding } from '@/lib/plan-analyzer';
import { useAskAI } from '@/components/ai/search';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const PLACEHOLDER = `Paste plan XML here — in SSMS: right-click the graphical plan → "Show Execution Plan XML...", or open a saved .sqlplan file in a text editor and paste its contents.`;

function FindingCard({ finding }: { finding: PlanFinding }) {
  const Icon = finding.severity === 'flag' ? TriangleAlertIcon : InfoIcon;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 text-sm',
        finding.severity === 'flag'
          ? 'border-amber-500/30 bg-amber-500/10'
          : 'border-fd-border bg-fd-muted/30',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          finding.severity === 'flag' ? 'text-amber-600 dark:text-amber-400' : 'text-fd-muted-foreground',
        )}
      />
      <div className="min-w-0">
        <p className="font-medium text-fd-foreground">{finding.title}</p>
        <p className="mt-1 text-fd-muted-foreground">{finding.detail}</p>
        {finding.relatedHref && (
          <Link
            href={finding.relatedHref}
            className="mt-1.5 inline-block font-medium text-fd-primary hover:underline"
          >
            {finding.relatedLabel ?? 'Learn more'} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function ExecutionPlanTool() {
  const [xml, setXml] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzePlan> | null>(null);
  const askAI = useAskAI();

  const analyze = () => {
    setResult(analyzePlan(xml));
  };

  const askAIAboutPlan = () => {
    if (!result || result.error) return;
    const summary = result.findings
      .map((f) => `- ${f.title}: ${f.detail}`)
      .join('\n');
    askAI(
      `I ran a SQL Server execution plan through the plan analyzer tool on this site. ` +
        `It found:\n\n${summary}\n\nCan you help me think through what to actually do about this, ` +
        `given the specifics of my query?`,
    );
  };

  return (
    <div className="not-prose my-6 flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          spellCheck={false}
          className="w-full resize-y bg-transparent p-3 font-mono text-xs text-fd-foreground placeholder:text-fd-muted-foreground/70 focus-visible:outline-none"
        />
        <div className="flex items-center justify-between border-t border-fd-border bg-fd-muted/30 px-3 py-2">
          <p className="text-xs text-fd-muted-foreground">
            Runs entirely in your browser — nothing is sent anywhere unless you ask the AI below.
          </p>
          <button
            type="button"
            onClick={analyze}
            disabled={xml.trim().length === 0}
            className={cn(buttonVariants({ color: 'primary', size: 'sm' }), 'disabled:opacity-50')}
          >
            Analyze
          </button>
        </div>
      </div>

      {result?.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="flex flex-col gap-3">
          {result.findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
          {result.findings[0]?.id !== 'none' && (
            <button
              type="button"
              onClick={askAIAboutPlan}
              className={cn(
                buttonVariants({ color: 'secondary', size: 'sm' }),
                'w-fit gap-1.5',
              )}
            >
              <SparklesIcon className="size-3.5" />
              Ask AI to help think through these findings
            </button>
          )}
        </div>
      )}
    </div>
  );
}
