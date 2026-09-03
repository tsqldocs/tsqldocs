import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    links: [
      { type: 'main', url: '/docs', text: 'Docs' },
      { type: 'main', url: '/docs/functions', text: 'Functions' },
      { type: 'main', url: '/docs/recipes', text: 'Recipes' },
      { type: 'main', url: '/docs/playground', text: 'Playground' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
