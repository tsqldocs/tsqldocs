import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { getPageImageUrl, source } from '@/lib/source';
import { appName } from '@/lib/shared';

const size = { width: 1200, height: 630 };

const CYAN = '#22d3ee';
const BG = '#0b0b0c';
const FG = '#ececee';
const MUTED = '#a1a1aa';
const NEUTRAL = 'rgba(148,163,184,0.45)';

// Per-page OG image: the same "highlighted table cell" mark as the site
// default (app/opengraph-image.tsx), plus this page's actual title and
// description. next/og (Satori/WASM) runs fine on the Workers runtime, unlike
// the takumi-based route this replaces (native module, can't run on Workers).
export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1)); // drop the trailing "image.png" segment
  if (!page) notFound();

  const cell = (filled: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: 9,
    background: filled ? CYAN : 'transparent',
    border: filled ? 'none' : `2px solid ${NEUTRAL}`,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: BG,
          padding: '0 96px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 92, gap: 12, marginBottom: 36 }}>
          <div style={cell(false)} />
          <div style={cell(false)} />
          <div style={cell(false)} />
          <div style={cell(true)} />
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            fontWeight: 700,
            color: FG,
            letterSpacing: -1.5,
            maxWidth: 1000,
          }}
        >
          {page.data.title}
        </div>
        {page.data.description && (
          <div style={{ display: 'flex', fontSize: 28, color: MUTED, marginTop: 20, maxWidth: 920 }}>
            {page.data.description}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 22, color: MUTED, marginTop: 48, letterSpacing: 1 }}>
          {appName.toUpperCase()} · TSQLDOCS.COM
        </div>
      </div>
    ),
    size,
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
