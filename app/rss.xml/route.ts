import { getBlogPosts, blogSlug } from '@/lib/blog-source';
import { appName, siteUrl } from '@/lib/shared';

export const revalidate = false;

// Escapes the five reserved XML characters — titles/descriptions are
// free-text and can contain any of them (an apostrophe in "MERGE's", an
// ampersand, etc.).
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toUTCString();
}

export function GET() {
  const posts = getBlogPosts();
  const feedUrl = `${siteUrl}/rss.xml`;
  const blogUrl = `${siteUrl}/blog`;

  const items = posts
    .map((post) => {
      const url = `${blogUrl}/${blogSlug(post.info.path)}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join('');

  const lastBuildDate = posts.length > 0 ? toRfc822(posts[0].date) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(appName)} Blog</title>
    <link>${blogUrl}</link>
    <description>Longer-form T-SQL writing — performance internals, concurrency bugs, and the edge cases that break production queries.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
