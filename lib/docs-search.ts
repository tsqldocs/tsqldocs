import { Document, type DocumentData } from 'flexsearch';

export interface DocsSearchDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

const FIELDS = ['title', 'description', 'content'] as const;
type Field = (typeof FIELDS)[number];

// Title/description matches are worth far more than a passing mention deep
// in a page's content — otherwise a query like "coalesce null values" loses
// the COALESCE page entirely to pages that just say "null" a lot (avg, sum).
const FIELD_WEIGHT: Record<Field, number> = { title: 12, description: 5, content: 1 };

// Deliberately does NOT strip words that double as SQL vocabulary — "not",
// "in", "is", "by", "on", "as", "from", "with" are English filler but also
// real syntax (NOT IN, IS NULL, GROUP BY, JOIN ON, CAST AS); stripping them
// destroyed the "NOT IN" query specifically during tuning.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'am', 'was', 'were', 'be', 'being', 'been', 'do', 'does', 'did',
  'why', 'how', 'what', 'when', 'which', 'who', 'whom', 'my', 'your', 'it', 'this', 'that',
  'of', 'at', 'i', 'you',
  'can', 'will', 'should', 'would', 'could', 'into', 'about', 'return',
]);

function keywords(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  // a query that's entirely stopwords (rare) still needs something to search
  return words.length > 0 ? words : query.toLowerCase().split(/\s+/).filter(Boolean);
}

export function createDocsSearchIndex(): Document<DocsSearchDocument> {
  return new Document<DocsSearchDocument>({
    document: {
      id: 'url',
      index: FIELDS.map((field) => ({ field, tokenize: 'forward' as const })),
      store: true,
    },
  });
}

interface FieldSearchUnit {
  field: Field;
  result: { doc: DocsSearchDocument }[];
}

/**
 * Natural-language-friendly search: scores each query keyword against each
 * field independently (OR across words, not the library default of
 * requiring most/all words in the same field) and weights by field
 * importance, so "why is my index not being used" finds the Indexes page
 * even though none of those exact words co-occur there, and a page with a
 * title hit outranks one that just mentions the words more often in body
 * text. See the git history for the before/after test battery this was
 * tuned against (12/20 → 20/20 top-3 hits on a natural-language query set).
 */
export async function weightedDocsSearch(
  index: Document<DocsSearchDocument>,
  query: string,
  limit: number,
): Promise<DocsSearchDocument[]> {
  const words = keywords(query);
  const scores = new Map<
    string,
    { score: number; doc: DocsSearchDocument; matched: Set<string> }
  >();

  await Promise.all(
    words.flatMap((word) =>
      FIELDS.map(async (field) => {
        const res = (await index.searchAsync(word, {
          field,
          limit: 20,
          enrich: true,
        })) as unknown as FieldSearchUnit[];
        const results = res[0]?.result ?? [];
        results.forEach((r, rank) => {
          const url = r.doc?.url;
          if (!url) return;
          const contribution = FIELD_WEIGHT[field] * (20 - rank);
          const entry = scores.get(url) ?? { score: 0, doc: r.doc, matched: new Set<string>() };
          entry.score += contribution;
          entry.matched.add(word);
          scores.set(url, entry);
        });
      }),
    ),
  );

  // mild bonus for breadth (matching more distinct query words), on top of
  // the field-weighted depth score
  for (const entry of scores.values()) {
    entry.score *= 1 + 0.5 * (entry.matched.size - 1);
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e) => e.doc);
}
