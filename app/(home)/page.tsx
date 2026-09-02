import Link from 'next/link';

const cards = [
  { title: 'Functions', href: '/docs/functions', text: 'Reference pages, syntax, edge cases, and examples.' },
  { title: 'Core SQL', href: '/docs/sql-reference', text: 'The core clauses and semantics that shape every production query.' },
  { title: 'Playground', href: '/docs/playground', text: 'Test SQL snippets and compare behavior in real time.' },
];

const features = [
  'NULL-safe patterns and edge-case logic',
  'Window functions and ranking semantics',
  'Join patterns for real relational data',
  'Production-ready SQL review checklist',
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
          SQL reference • for data teams • built for shipping
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.06em] text-zinc-900 dark:text-white md:text-6xl">
              The modern SQL reference for{' '}
              <span className="bg-gradient-to-r from-cyan-500 to-sky-400 bg-clip-text text-transparent">
                analytics and product teams
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
              Learn the clauses, functions, joins, and edge cases that shape production queries — with clear examples and a review-first mindset.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-zinc-900/15 transition hover:-tranzinc-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Open docs
              </Link>
              <Link
                href="/docs/playground"
                className="rounded-full border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-medium text-zinc-700 backdrop-blur-sm transition hover:-tranzinc-y-0.5 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-white"
              >
                Try the playground
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/70">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/60">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
                  SELECT customer_id, SUM(amount)
                </div>
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
                  FROM orders
                </div>
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
                  GROUP BY customer_id
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:-tranzinc-y-1 hover:border-cyan-200 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-cyan-500/40"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                →
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-zinc-200 bg-white/60 p-6 dark:border-zinc-700 dark:bg-zinc-900/60">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-cyan-600 dark:text-cyan-300">
              What’s inside
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
