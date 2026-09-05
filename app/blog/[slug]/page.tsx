import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { BlogTOC } from '@/components/blog-toc';
import { ReadingProgress } from '@/components/reading-progress';
import { blog, blogSlug, formatBlogDate, getBlogPost } from '@/lib/blog-source';
import { siteUrl } from '@/lib/shared';

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const MDX = post.body;

  return (
    <main className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-12 md:py-16">
      <ReadingProgress />
      <article className="prose min-w-0 flex-1">
        <p className="text-sm text-fd-muted-foreground">{formatBlogDate(post.date)}</p>
        <h1 className="text-[1.75em] font-semibold">{post.title}</h1>
        <p className="mb-8 text-lg text-fd-muted-foreground">{post.description}</p>
        <MDX components={getMDXComponents()} />
      </article>
      <BlogTOC toc={post.toc} />
    </main>
  );
}

export async function generateStaticParams() {
  return blog.entries.map((entry) => ({ slug: blogSlug(entry.info.path) }));
}

export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
  };
}
