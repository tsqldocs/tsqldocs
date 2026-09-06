import Link from 'next/link';
import { Logo } from '@/components/logo';
import { gitConfig } from '@/lib/shared';

const columns: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: 'Docs',
    links: [
      { label: 'Reference', href: '/docs' },
      { label: 'Cheat sheet', href: '/cheatsheet' },
      { label: 'Recipes', href: '/docs/recipes' },
      { label: 'Playground', href: '/docs/playground' },
      { label: 'Query Doctor', href: '/fix' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      {
        label: 'GitHub',
        href: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
        external: true,
      },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border bg-fd-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-fd-muted-foreground">
            A practical, runnable SQL reference — clauses, joins, window functions, and the
            edge cases that break production queries.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-fd-muted-foreground">
              {col.heading}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fd-foreground/80 transition hover:text-fd-primary"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-fd-foreground/80 transition hover:text-fd-primary"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-5 text-xs text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} tsqldocs.com — an independent project.</p>
          <p>
            Not affiliated with Oracle, PostgreSQL, MySQL, or Microsoft. Engine names are
            trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
