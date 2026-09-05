import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts, blogSlug, formatBlogDate } from '@/lib/blog-source';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Longer-form writing on SQL — pulling the reference material together into guides worth reading start to finish.',
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16 md:py-20">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-fd-foreground md:text-5xl">
            Blog
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
            Longer writing that pulls the reference material together into one
            narrative, with the specifics linked back to the docs.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const slug = blogSlug(post.info.path);
            return (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                className="group rounded-xl border border-fd-border bg-fd-card p-5 transition hover:border-fd-primary/40"
              >
                <p className="text-xs text-fd-muted-foreground">{formatBlogDate(post.date)}</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-fd-foreground group-hover:text-fd-primary">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm text-fd-muted-foreground">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-fd-border px-2 py-0.5 text-[11px] text-fd-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
