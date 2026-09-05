import Link from 'next/link';
import {
  ArrowRightIcon,
  BookOpenIcon,
  GaugeIcon,
  PencilRulerIcon,
  PlayIcon,
  SparklesIcon,
  StethoscopeIcon,
  TerminalIcon,
} from 'lucide-react';
import { SqlRunner } from '@/components/sql-runner';
import { HeroFlow } from '@/components/hero-flow';
import { getBlogPosts, blogSlug, formatBlogDate } from '@/lib/blog-source';

const HERO_QUERY = `SELECT
  c.name,
  COUNT(o.order_id) AS orders,
  SUM(o.amount)     AS spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.name
ORDER BY spent DESC;`;

const sections = [
  {
    icon: BookOpenIcon,
    title: 'Reference',
    text: 'Core clauses, functions, joins, and window functions — each with the edge cases that break production queries.',
    href: '/docs',
  },
  {
    icon: TerminalIcon,
    title: 'Recipes',
    text: 'Copy-paste solutions to the problems people actually hit: top-N per group, dedup, pivot, gaps and islands.',
    href: '/docs/recipes',
  },
  {
    icon: PlayIcon,
    title: 'Playground',
    text: 'A full SQL editor running real SQLite in your browser, against a seeded database. No signup.',
    href: '/docs/playground',
  },
  {
    icon: StethoscopeIcon,
    title: 'Query Doctor',
    text: 'Paste a broken query and its error. Get the root cause, a corrected query, and how to avoid it next time.',
    href: '/fix',
  },
  {
    icon: PencilRulerIcon,
    title: 'Writing & transactions',
    text: 'INSERT, UPDATE, DELETE — plus BEGIN/COMMIT/ROLLBACK and isolation levels for changes that must not half-apply.',
    href: '/docs/dml',
  },
  {
    icon: GaugeIcon,
    title: 'Performance',
    text: 'What an index actually does, the patterns that silently defeat one, and how to read a query plan on any engine.',
    href: '/docs/performance',
  },
];

const differentiators = [
  {
    title: 'Runnable, not just described',
    text: 'Every example executes against a real database, right on the page. Edit it, run it, break it.',
  },
  {
    title: "AI that's grounded",
    text: 'The assistant answers from these exact docs and links the page it used — not a guess from training data.',
  },
  {
    title: 'Edge cases first',
    text: 'The gotcha that makes the query wrong in production is the point of the page, not a footnote at the bottom.',
  },
];

export default function HomePage() {
  const posts = getBlogPosts().slice(0, 3);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--color-fd-primary), transparent 70%)' }}
          />
          <HeroFlow />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 pb-10 pt-20 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-primary/25 bg-fd-primary/10 px-3 py-1.5 text-xs font-medium text-fd-primary">
            <SparklesIcon className="size-3.5" />
            Runnable SQL reference, with an AI that knows it
          </span>

          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-fd-foreground md:text-6xl lg:text-7xl">
            Every SQL pattern,{' '}
            <span className="bg-gradient-to-r from-fd-primary to-sky-400 bg-clip-text text-transparent">
              runnable in your browser
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-fd-muted-foreground">
            A practical reference for the clauses, joins, window functions, and edge cases that
            break production queries — each one with a live example you can edit and run, and an AI
            assistant grounded in every page.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
            >
              Open the docs
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/docs/playground"
              className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-5 py-3 text-sm font-medium text-fd-foreground transition hover:border-fd-primary/40"
            >
              Try the playground
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 px-2 py-3 text-sm font-medium text-fd-muted-foreground transition hover:text-fd-foreground"
            >
              Read the blog
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Live demo */}
        <div className="mx-auto w-full max-w-3xl px-6 pb-16">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.12em] text-fd-muted-foreground">
            This runs real SQLite — edit it
          </p>
          <SqlRunner query={HERO_QUERY} />
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-fd-foreground">
          Everything in one place
        </h2>
        <p className="mt-2 text-fd-muted-foreground">
          Reference, runnable examples, an AI assistant, and a diagnostic tool for the query that
          won&rsquo;t cooperate.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex flex-col rounded-2xl border border-fd-border bg-fd-card p-5 transition hover:-translate-y-1 hover:border-fd-primary/40"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary [&_svg]:size-5">
                <s.icon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fd-foreground group-hover:text-fd-primary">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-fd-muted-foreground">{s.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-y border-fd-border bg-fd-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          {differentiators.map((d) => (
            <div key={d.title}>
              <div className="mb-3 h-px w-8 bg-fd-primary" />
              <h3 className="text-base font-semibold text-fd-foreground">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-fd-muted-foreground">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-fd-foreground">
              From the blog
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary transition hover:underline"
            >
              All posts
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {posts.map((post) => {
              const slug = blogSlug(post.info.path);
              return (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group flex flex-col rounded-2xl border border-fd-border bg-fd-card p-5 transition hover:border-fd-primary/40"
                >
                  <p className="text-xs text-fd-muted-foreground">{formatBlogDate(post.date)}</p>
                  <h3 className="mt-1.5 font-semibold tracking-[-0.01em] text-fd-foreground group-hover:text-fd-primary">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-fd-muted-foreground">
                    {post.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-6 py-20 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-4xl">
            Start with the clause that&rsquo;s biting you
          </h2>
          <p className="max-w-xl text-fd-muted-foreground">
            Or open the playground and paste the query you&rsquo;re stuck on.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
            >
              Open the docs
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/fix"
              className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-5 py-3 text-sm font-medium text-fd-foreground transition hover:border-fd-primary/40"
            >
              Diagnose a query
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
