import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

const CYAN = '#22d3ee';
const NEUTRAL = 'rgba(148,163,184,0.6)';

// Same 2x2 "highlighted cell" mark as components/logo.tsx, redrawn with
// inline styles for the browser-tab favicon — Satori has no access to
// Tailwind/global.css, so it can't reuse the component directly.
export default function Icon() {
  const cell = (filled: boolean) => ({
    width: 13,
    height: 13,
    borderRadius: 3,
    background: filled ? CYAN : 'transparent',
    border: filled ? 'none' : `1.5px solid ${NEUTRAL}`,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <div style={cell(false)} />
        <div style={cell(false)} />
        <div style={cell(false)} />
        <div style={cell(true)} />
      </div>
    ),
    size,
  );
}
