// Client-side analysis of a SQL Server execution plan (the XML from
// "Show Execution Plan XML" / a saved .sqlplan file). Runs entirely in
// the browser via DOMParser — nothing is sent anywhere.
//
// Scope, deliberately: this checks for a handful of specific, well-known
// patterns (the ones covered on this site's execution-plan posts) rather
// than attempting a general-purpose plan analyzer. It can't be verified
// against a real SQL Server instance the way this site's other live
// examples are (there's no SQL Server to generate one from in this
// environment) — it's built from the documented showplan XML schema and
// tested against hand-authored sample plans, not a captured real one.
// Treat its findings as a starting point for reading the plan yourself,
// not a replacement for it.

export interface PlanFinding {
  id: string;
  severity: 'flag' | 'info';
  title: string;
  detail: string;
  relatedHref?: string;
  relatedLabel?: string;
}

export interface AnalyzeResult {
  findings: PlanFinding[];
  error?: string;
}

function directChildrenByTag(el: Element, tag: string): Element[] {
  return Array.from(el.children).filter((c) => c.tagName === tag);
}

function allByTag(doc: Document, tag: string): Element[] {
  return Array.from(doc.getElementsByTagName(tag));
}

function closestRelOpAncestor(el: Element): Element | null {
  let current = el.parentElement;
  while (current) {
    if (current.tagName === 'RelOp') return current;
    current = current.parentElement;
  }
  return null;
}

// Sums ActualRows across this RelOp's own RunTimeCountersPerThread
// entries (parallel plans report one counter per thread) — not any
// nested child RelOp's counters, which is why this only looks at a
// RunTimeInformation that's a direct child of `relOp` itself.
function actualRowsFor(relOp: Element): number | null {
  const runtimeInfo = directChildrenByTag(relOp, 'RunTimeInformation')[0];
  if (!runtimeInfo) return null;
  const counters = directChildrenByTag(runtimeInfo, 'RunTimeCountersPerThread');
  if (counters.length === 0) return null;
  return counters.reduce((sum, c) => sum + Number(c.getAttribute('ActualRows') ?? 0), 0);
}

export function analyzePlan(xmlText: string): AnalyzeResult {
  const trimmed = xmlText.trim();
  if (!trimmed) return { findings: [], error: 'Paste a plan first.' };

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(trimmed, 'application/xml');
  } catch {
    return { findings: [], error: "That doesn't parse as XML." };
  }

  if (doc.getElementsByTagName('parsererror').length > 0) {
    return {
      findings: [],
      error:
        "That doesn't parse as valid XML — paste the raw plan XML (right-click the plan in SSMS → Show Execution Plan XML, or the contents of a saved .sqlplan file), not a screenshot description or the graphical view.",
    };
  }

  const relOps = allByTag(doc, 'RelOp');
  if (relOps.length === 0) {
    return {
      findings: [],
      error:
        "That's valid XML, but no <RelOp> elements were found — this doesn't look like a SQL Server showplan XML document.",
    };
  }

  const findings: PlanFinding[] = [];

  // 1. SQL Server's own <Warnings> elements — highest confidence, since
  // this is the engine itself flagging something, not an inference.
  const warningEls = allByTag(doc, 'Warnings');
  for (const w of warningEls) {
    const relOp = closestRelOpAncestor(w);
    const opName = relOp?.getAttribute('PhysicalOp') ?? 'an operator';
    for (const child of Array.from(w.children)) {
      findings.push({
        id: `warning-${findings.length}`,
        severity: 'flag',
        title: `SQL Server flagged this itself: ${child.tagName}`,
        detail: `On the "${opName}" operator. This is the engine's own warning, not an inference from this tool — worth investigating directly regardless of anything else on this page.`,
      });
    }
  }

  // 2. Missing index suggestions.
  for (const group of allByTag(doc, 'MissingIndexGroup')) {
    const impact = group.getAttribute('Impact');
    const indexEl = directChildrenByTag(group, 'MissingIndex')[0];
    if (!indexEl) continue;
    const table = indexEl.getAttribute('Table') ?? 'the table';
    const equality = Array.from(allByTag(doc, 'ColumnGroup'))
      .filter((cg) => cg.parentElement === indexEl && cg.getAttribute('Usage') === 'EQUALITY')
      .flatMap((cg) => directChildrenByTag(cg, 'Column').map((c) => c.getAttribute('Name')));
    const include = Array.from(allByTag(doc, 'ColumnGroup'))
      .filter((cg) => cg.parentElement === indexEl && cg.getAttribute('Usage') === 'INCLUDE')
      .flatMap((cg) => directChildrenByTag(cg, 'Column').map((c) => c.getAttribute('Name')));
    findings.push({
      id: `missing-index-${findings.length}`,
      severity: 'flag',
      title: `SQL Server suggests an index on ${table}`,
      detail: `Estimated impact: ${impact ? `${Number(impact).toFixed(1)}%` : 'not reported'}. Key column(s): ${equality.join(', ') || '(none)'}${include.length ? `, with INCLUDE (${include.join(', ')})` : ''}. Verify this is actually selective before creating it — the suggestion is based on this one query's plan, not your overall workload.`,
    });
  }

  // 3. Key Lookup / RID Lookup under Nested Loops — the pattern from
  // the execution-plan blog post.
  for (const relOp of relOps) {
    const op = relOp.getAttribute('PhysicalOp') ?? '';
    if (op !== 'Key Lookup' && op !== 'RID Lookup') continue;
    const parent = closestRelOpAncestor(relOp);
    const underNestedLoops = parent?.getAttribute('PhysicalOp') === 'Nested Loops';
    const actual = actualRowsFor(relOp);
    findings.push({
      id: `key-lookup-${findings.length}`,
      severity: 'flag',
      title: `${op}${underNestedLoops ? ' under Nested Loops' : ''}`,
      detail: `An index got the engine to the right rows, but it didn't contain every column the query needs — so it goes back to the full table once per matching row${actual !== null ? ` (${actual.toLocaleString()} times, here)` : ''}. Usually fixed by adding the missing columns to the index with INCLUDE, turning it into a covering index.`,
      relatedHref: '/blog/reading-a-sql-server-execution-plan',
      relatedLabel: 'Full explanation of this pattern',
    });
  }

  // 4. Spool operators — Halloween Problem protection.
  for (const relOp of relOps) {
    const op = relOp.getAttribute('PhysicalOp') ?? '';
    if (!op.includes('Spool')) continue;
    findings.push({
      id: `spool-${findings.length}`,
      severity: 'info',
      title: `${op} present`,
      detail:
        "Often the engine protecting against the Halloween Problem — materializing the rows to change before changing them, so the update can't re-encounter a row it already moved. Real I/O cost, and usually a sign this statement writes to a column that's also used to find its own rows.",
      relatedHref: '/blog/halloween-problem',
      relatedLabel: 'What the Halloween Problem actually is',
    });
  }

  // 5. Estimate vs actual row-count mismatches — the parameter-sniffing
  // / stale-statistics tell. Only flag an order-of-magnitude-or-more
  // gap, and only when the numbers are large enough to matter.
  for (const relOp of relOps) {
    const estimate = Number(relOp.getAttribute('EstimateRows') ?? NaN);
    const actual = actualRowsFor(relOp);
    if (actual === null || !Number.isFinite(estimate) || estimate <= 0 || actual <= 0) continue;
    const ratio = actual / estimate;
    if (ratio < 10 && ratio > 0.1) continue;
    if (Math.max(actual, estimate) < 100) continue; // too small to matter
    const op = relOp.getAttribute('PhysicalOp') ?? 'this operator';
    findings.push({
      id: `estimate-actual-${findings.length}`,
      severity: 'flag',
      title: `Estimated ${Math.round(estimate).toLocaleString()} rows, actual ${actual.toLocaleString()}`,
      detail: `On "${op}" — a gap this large usually means stale statistics or a cached plan compiled for different parameter values than this execution used. The rest of the plan's shape was chosen based on the estimate, not the real row count.`,
      relatedHref: '/blog/parameter-sniffing',
      relatedLabel: 'Why a cached plan can be wrong for the current call',
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: 'none',
      severity: 'info',
      title: 'No red flags from the patterns this tool checks for',
      detail:
        "That doesn't mean the plan is optimal — only that it didn't match the specific patterns this tool looks for (Key/RID Lookups, Spools, SQL Server's own warnings or missing-index suggestions, or a large estimate-vs-actual gap). Worth reading the rest of the plan directly for anything outside that list.",
    });
  }

  return { findings };
}
