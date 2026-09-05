'use client';

import { useEffect, useRef } from 'react';

// A perspective wire-mesh for the homepage hero: two fans of curves that
// radiate from off-screen corners, bunched near their origin and spreading
// out — the density gradient reads as a twisted ribbon in space. No
// dependencies, theme-aware, and static (one frame) under
// prefers-reduced-motion.
//
// Kept cheap so it never fights the scroll thread: ~30fps, skips frames
// while the page is being scrolled, and stops entirely whenever the hero is
// off-screen or the tab is hidden.
export function HeroFlow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0;
    let h = 0;
    let raf = 0;
    let primary = '#0891b2';
    let dark = false;

    // gates
    let onScreen = true;
    let tabVisible = document.visibilityState === 'visible';
    let scrolling = false;
    let scrollTimer = 0;
    let lastDraw = 0;
    const FRAME_MS = 33; // ~30fps is plenty for a background flow

    const active = () => onScreen && tabVisible && !reduced.matches;

    const readTheme = () => {
      const root = document.documentElement;
      dark =
        root.classList.contains('dark') ||
        (!root.classList.contains('light') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      primary =
        getComputedStyle(root).getPropertyValue('--color-fd-primary').trim() || '#0891b2';
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const STEPS = 34;

    const drawFan = (
      t: number,
      ox: number,
      oy: number,
      angle: number,
      spread: number,
      reach: number,
      lines: number,
      strength: number,
    ) => {
      const secondary = dark ? '#7dd3fc' : '#0ea5e9';
      const g = ctx.createLinearGradient(
        ox,
        oy,
        ox + Math.cos(angle) * reach,
        oy + Math.sin(angle) * reach,
      );
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.12, primary);
      g.addColorStop(0.55, secondary);
      g.addColorStop(0.9, primary);
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;

      for (let i = 0; i < lines; i++) {
        const f = i / (lines - 1);
        const lineAngle = angle + spread * (f - 0.5);
        const twist = 0.16 * (0.4 + f);
        const phase = t * 0.00022 + i * 0.19;
        const accent = i % 3 === 0;

        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const u = s / STEPS;
          const r = Math.pow(u, 0.82) * reach;
          const a =
            lineAngle +
            twist * Math.sin(u * Math.PI * 1.6 + phase) +
            twist * 0.4 * Math.sin(u * Math.PI * 3.3 - phase * 1.4);
          const x = ox + Math.cos(a) * r;
          const y = oy + Math.sin(a) * r;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineWidth = accent ? 4 : 3;
        ctx.globalAlpha = (dark ? 0.05 : 0.03) * strength;
        ctx.stroke();
        ctx.lineWidth = accent ? 1.5 : 1;
        ctx.globalAlpha = (dark ? 0.4 : 0.22) * strength * (accent ? 1.3 : 1);
        ctx.stroke();
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      const diag = Math.hypot(w, h);
      drawFan(t, w * 1.02, h * -0.06, Math.PI * 0.82, 0.62, diag * 1.15, 16, 1);
      drawFan(t * 0.9, w * -0.04, h * 1.08, -Math.PI * 0.2, 0.5, diag * 1.0, 10, 0.5);
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!active()) return;
      if (scrolling) return; // don't compete with the scroll thread
      if (t - lastDraw < FRAME_MS) return;
      lastDraw = t;
      draw(t);
    };

    readTheme();
    resize();
    draw(0);
    if (!reduced.matches) raf = requestAnimationFrame(tick);

    // --- gates ---
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '120px' },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const onScroll = () => {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
      }, 160);
    };
    const onVis = () => {
      tabVisible = document.visibilityState === 'visible';
    };
    const onTheme = () => {
      readTheme();
      draw(performance.now());
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const colorMq = window.matchMedia('(prefers-color-scheme: dark)');
    colorMq.addEventListener('change', onTheme);
    reduced.addEventListener('change', onTheme);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(scrollTimer);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      colorMq.removeEventListener('change', onTheme);
      reduced.removeEventListener('change', onTheme);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full [mask-image:radial-gradient(130%_130%_at_85%_0%,black,transparent_75%)]"
    />
  );
}
