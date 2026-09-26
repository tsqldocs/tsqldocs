import { PencilIcon } from 'lucide-react';
import { gitConfig } from '@/lib/shared';

// A direct, always-visible link into GitHub's web editor for this page's
// source file — the same destination the "Open" dropdown's edit option
// points at, just one click instead of two.
export function EditPageLink({ path }: { path: string }) {
  const href = `https://github.com/${gitConfig.user}/${gitConfig.repo}/edit/${gitConfig.branch}/content/docs/${path}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-md border bg-fd-secondary px-2 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground"
    >
      <PencilIcon />
      Edit this page
    </a>
  );
}
