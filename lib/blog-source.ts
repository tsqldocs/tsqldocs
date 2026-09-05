import { defineCollections } from 'fumadocs-mdx/macro';
import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
});

// A flat collection — blog posts don't need a page tree (no meta.json,
// no sidebar nesting), just individually-addressable long-form entries
// sorted by date.
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: blogSchema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export function blogSlug(path: string): string {
  return path.replace(/\.mdx?$/, '');
}

export function getBlogPosts() {
  return [...blog.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getBlogPost(slug: string) {
  return blog.entries.find((entry) => blogSlug(entry.info.path) === slug);
}

// `new Date('2026-09-05')` parses as UTC midnight, which can render as the
// previous day once formatted in a timezone behind UTC. Appending a local
// time component avoids that off-by-one.
export function formatBlogDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
