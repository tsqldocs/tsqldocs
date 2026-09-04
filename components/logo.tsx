/**
 * The site mark: a 2x2 grid of table cells, three empty (bordered) and one
 * filled with the brand cyan — "the row you were looking for." Reused, redrawn
 * with inline styles (Satori can't read Tailwind/global.css), by app/icon.tsx
 * and app/opengraph-image.tsx so the nav logo, favicon, and OG image all match.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <span className="grid grid-cols-2 gap-[3px]" aria-hidden="true">
        <span className="size-[7px] rounded-[2px] border border-fd-foreground/35" />
        <span className="size-[7px] rounded-[2px] border border-fd-foreground/35" />
        <span className="size-[7px] rounded-[2px] border border-fd-foreground/35" />
        <span className="size-[7px] rounded-[2px] bg-fd-primary" />
      </span>
      <span className="font-semibold tracking-tight">SQL Docs</span>
    </span>
  );
}
