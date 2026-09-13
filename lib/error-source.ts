import { defineCollections } from 'fumadocs-mdx/macro';
import { z } from 'zod';

export const errorSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  // Which engines this exact error text applies to — shown as badges and
  // used to keep the content honest about where behavior actually differs.
  engines: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// One page per specific error message, addressed by slug — same flat shape
// as the blog collection, just under content/errors and served at /fix/*.
export const errors = defineCollections({
  type: 'doc',
  dir: 'content/errors',
  schema: errorSchema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export function errorSlug(path: string): string {
  return path.replace(/\.mdx?$/, '');
}

export function getErrorPages() {
  return [...errors.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getErrorPage(slug: string) {
  return errors.entries.find((entry) => errorSlug(entry.info.path) === slug);
}
