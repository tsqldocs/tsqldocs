import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { blogSlug, getBlogPosts } from '@/lib/blog-source';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // /fix and /blog are the only real pages outside content/docs — everything
  // else, including /docs and /docs/recipes themselves, comes from
  // source.getPages() below so each URL appears exactly once.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/fix`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const docsRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    changeFrequency: 'monthly',
    priority:
      page.url === '/docs'
        ? 0.9 // the docs landing page
        : page.slugs.length <= 1
          ? 0.8 // section index pages (/docs/recipes, /docs/functions, ...)
          : 0.7, // leaf reference/recipe pages
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${blogSlug(post.info.path)}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...docsRoutes, ...blogRoutes];
}
