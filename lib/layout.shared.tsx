import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Link from 'next/link';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
      children: (
        <nav className="hidden items-center gap-5 text-sm text-fd-muted-foreground md:flex">
          <Link href="/docs" className="transition-colors hover:text-fd-foreground">
            Docs
          </Link>
          <Link href="/docs/sql-reference" className="transition-colors hover:text-fd-foreground">
            Reference
          </Link>
          <Link href="/docs/playground" className="transition-colors hover:text-fd-foreground">
            Playground
          </Link>
          <Link href="/docs/functions" className="transition-colors hover:text-fd-foreground">
            Functions
          </Link>
        </nav>
      ),
    },
    links: [
      { type: 'main', url: '/docs', text: 'Docs' },
      { type: 'main', url: '/docs/sql-reference', text: 'SQL Reference' },
      { type: 'main', url: '/docs/functions', text: 'Functions' },
      { type: 'main', url: '/docs/playground', text: 'Playground' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
