import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { Logo } from '@/components/logo';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
    },
    links: [
      { type: 'main', url: '/docs', text: 'Docs' },
      { type: 'main', url: '/docs/recipes', text: 'Recipes' },
      { type: 'main', url: '/docs/playground', text: 'Playground' },
      { type: 'main', url: '/fix', text: 'Query Doctor' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
