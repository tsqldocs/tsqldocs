import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { Metadata } from 'next';
import { appName, siteUrl } from '@/lib/shared';

// Cloudflare Web Analytics. Set NEXT_PUBLIC_CF_BEACON_TOKEN at build time to
// enable — leave it unset if you turn analytics on via the Cloudflare
// dashboard instead (that auto-injects its own beacon; don't run both).
const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} — practical SQL reference`,
    template: `%s | ${appName}`,
  },
  description:
    'A practical SQL reference for analytics and product teams: clauses, functions, joins, window patterns, and the edge cases that break production queries.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/*
          OpenNext bundles the server with esbuild `keepNames`, which rewrites
          nested `function x(){}` to `function x(){} __name(x,"x")`. next-themes
          serialises its theme-init function to a string for an inline <script>,
          so that `__name(...)` call ships to the browser without its helper and
          throws `ReferenceError: __name is not defined` before the theme class
          is applied. Define a no-op `__name` first so the inline script runs.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'globalThis.__name||(globalThis.__name=function(f){return f});',
          }}
        />
        <RootProvider>{children}</RootProvider>
        {cfBeaconToken && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={`{"token": "${cfBeaconToken}"}`}
          />
        )}
      </body>
    </html>
  );
}
