import Link from 'next/link';
import { FlaskConicalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/* --------------------------------------------------------------------- *
 * <TryPlayground> — callout linking to the interactive playground.
 * --------------------------------------------------------------------- */
export function TryPlayground({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-fd-primary/25 bg-fd-primary/[0.06] px-4 py-3 text-sm">
      <FlaskConicalIcon className="size-4 shrink-0 text-fd-primary" />
      <span className="text-fd-muted-foreground">
        {children ?? 'Run these examples against a live SQLite database in your browser.'}
      </span>
      <Link
        href="/docs/playground"
        className="ml-auto shrink-0 font-medium text-fd-primary transition hover:underline"
      >
        Open the playground →
      </Link>
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * <Parameters> / <Param> — consistent argument tables on function pages.
 *
 *   <Parameters>
 *     <Param name="expression" type="numeric" required>What it is.</Param>
 *     <Param name="PARTITION BY" type="expression">Optional. …</Param>
 *   </Parameters>
 * --------------------------------------------------------------------- */
export function Parameters({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose my-5 overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-fd-muted/40 text-left text-fd-muted-foreground">
            <th className="px-3 py-2 font-medium">Parameter</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Param({
  name,
  type,
  required = false,
  children,
}: {
  name: string;
  type?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <tr className="border-t border-fd-border align-top">
      <td className="whitespace-nowrap px-3 py-2 font-mono text-[13px] text-fd-foreground">
        {name}
        {required && (
          <span className="ml-1 text-fd-primary" title="required">
            *
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-[13px] text-fd-muted-foreground">
        {type ?? '—'}
      </td>
      <td className="px-3 py-2 text-fd-muted-foreground">{children}</td>
    </tr>
  );
}

/* --------------------------------------------------------------------- *
 * <Related> — accent-bulleted list of related pages. Wrap a markdown list:
 *
 *   ## Related
 *   <Related>
 *   - [RANK](/docs/functions/rank) — same ties, but leaves gaps.
 *   </Related>
 * --------------------------------------------------------------------- */
export function Related({ children }: { children?: ReactNode }) {
  return (
    <div className="my-5 text-sm text-fd-muted-foreground [&_a:hover]:underline [&_a]:font-medium [&_a]:text-fd-primary [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-fd-primary [&_li]:before:content-['–'] [&_ul]:m-0 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:p-0">
      {children}
    </div>
  );
}
