import { ImageResponse } from 'next/og';
import { appName } from '@/lib/shared';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CYAN = '#22d3ee';
const BG = '#0b0b0c';
const FG = '#ececee';
const MUTED = '#a1a1aa';
const NEUTRAL = 'rgba(148,163,184,0.45)';

// Default OG/Twitter image for any route that doesn't define its own —
// same "highlighted table cell" mark as the nav logo and favicon, just bigger.
export default function OpengraphImage() {
  const cell = (filled: boolean) => ({
    width: 52,
    height: 52,
    borderRadius: 12,
    background: filled ? CYAN : 'transparent',
    border: filled ? 'none' : `2.5px solid ${NEUTRAL}`,
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
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 116, gap: 12, marginBottom: 48 }}>
          <div style={cell(false)} />
          <div style={cell(false)} />
          <div style={cell(false)} />
          <div style={cell(true)} />
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, color: FG, letterSpacing: -2 }}>
          {appName}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: MUTED, marginTop: 20, maxWidth: 920 }}>
          The practical SQL reference for analytics and product teams
        </div>
      </div>
    ),
    size,
  );
}
