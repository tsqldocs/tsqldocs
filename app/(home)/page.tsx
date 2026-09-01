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
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
          SQL reference • for data teams • built for shipping
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-6xl">
              The modern SQL reference for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                analytics and product teams
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Learn the clauses, functions, joins, and edge cases that shape production queries — with clear examples and a review-first mindset.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Open docs
              </Link>
              <Link
                href="/docs/playground"
                className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
              >
                Try the playground
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3 font-mono text-sm text-slate-700 dark:text-slate-300">
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                  SELECT customer_id, SUM(amount)
                </div>
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                  FROM orders
                </div>
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
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
              className="group rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-500/40"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                →
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white/60 p-6 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
              What’s inside
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200"
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
