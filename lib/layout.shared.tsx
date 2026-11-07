import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ArrowUpDownIcon, PlayIcon, ScanSearchIcon, StethoscopeIcon, WrenchIcon } from 'lucide-react';
import { gitConfig } from './shared';
import { Logo } from '@/components/logo';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
    },
    links: [
      { type: 'main', url: '/docs', text: 'Docs' },
      { type: 'main', url: '/tutorials', text: 'Tutorials' },
      { type: 'main', url: '/cheatsheet', text: 'Cheat sheet' },
      { type: 'main', url: '/docs/recipes', text: 'Recipes' },
      {
        type: 'menu',
        text: 'Tools',
        icon: <WrenchIcon />,
        items: [
          {
            url: '/docs/playground',
            icon: <PlayIcon />,
            text: 'Playground',
            description: 'A full SQL editor running real SQLite in your browser.',
          },
          {
            url: '/fix',
            icon: <StethoscopeIcon />,
            text: 'Query Doctor',
            description: 'Paste a broken query and its error, get the root cause.',
          },
          {
            url: '/tools/type-precedence',
            icon: <ArrowUpDownIcon />,
            text: 'Type Precedence',
            description: "Pick two T-SQL types, see which one wins and why.",
          },
          {
            url: '/tools/execution-plan-explainer',
            icon: <ScanSearchIcon />,
            text: 'Plan Explainer',
            description: 'Paste a plan’s XML, get Key Lookups and Spools flagged.',
          },
        ],
      },
      { type: 'main', url: '/blog', text: 'Blog' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
