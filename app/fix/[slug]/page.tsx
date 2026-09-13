import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { BlogTOC } from '@/components/blog-toc';
import { ReadingProgress } from '@/components/reading-progress';
import { errors, errorSlug, getErrorPage } from '@/lib/error-source';
import { siteUrl } from '@/lib/shared';

export default async function ErrorPage(props: PageProps<'/fix/[slug]'>) {
  const { slug } = await props.params;
  const entry = getErrorPage(slug);
  if (!entry) notFound();

  const MDX = entry.body;

  return (
    <main className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-12 md:py-16">
      <ReadingProgress />
      <article className="prose min-w-0 flex-1">
        {entry.engines.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5 not-prose">
            {entry.engines.map((engine) => (
              <span
                key={engine}
                className="rounded-full border border-fd-border px-2.5 py-0.5 text-[11px] font-medium text-fd-muted-foreground"
              >
                {engine}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[1.75em] font-semibold">{entry.title}</h1>
        <p className="mb-8 text-lg text-fd-muted-foreground">{entry.description}</p>
        <MDX components={getMDXComponents()} />
      </article>
      <BlogTOC toc={entry.toc} />
    </main>
  );
}

export async function generateStaticParams() {
  return errors.entries.map((entry) => ({ slug: errorSlug(entry.info.path) }));
}

export async function generateMetadata(
  props: PageProps<'/fix/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = getErrorPage(slug);
  if (!entry) notFound();

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `${siteUrl}/fix/${slug}` },
  };
}
