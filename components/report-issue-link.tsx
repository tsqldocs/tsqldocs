import { FlagIcon } from 'lucide-react';
import { gitConfig, siteUrl } from '@/lib/shared';

// A per-page link to a pre-filled GitHub issue — the cheap half of a
// "was this helpful / report an issue" affordance.
export function ReportIssueLink({ pageUrl, title }: { pageUrl: string; title: string }) {
  const params = new URLSearchParams({
    title: `Docs: ${title}`,
    body: `Page: ${siteUrl}${pageUrl}\n\n**What's wrong, unclear, or missing?**\n\n`,
  });
  const href = `https://github.com/${gitConfig.user}/${gitConfig.repo}/issues/new?${params.toString()}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-md border bg-fd-secondary px-2 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground"
    >
      <FlagIcon />
      Report an issue
    </a>
  );
}
