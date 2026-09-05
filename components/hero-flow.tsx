'use client';

import { useEffect, useRef } from 'react';

// A perspective wire-mesh for the homepage hero: two fans of curves that
// radiate from off-screen corners, bunched near their origin and spreading
// out — the density gradient reads as a twisted ribbon in space. No
// dependencies, theme-aware, and static (one frame) under
// prefers-reduced-motion.
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
    let running = true;
    let primary = '#0891b2';
    let dark = false;

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const STEPS = 40;

    // One fan of curves radiating from (ox, oy) toward `angle`, spreading by
    // `spread` radians, each line twisting on its own phase. A single
    // gradient is built per fan (along its axis) and reused for every line.
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
        const f = i / (lines - 1); // 0..1 across the fan
        const lineAngle = angle + spread * (f - 0.5);
        const twist = 0.16 * (0.4 + f);
        const phase = t * 0.00022 + i * 0.19;
        const accent = i % 3 === 0;

        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const u = s / STEPS;
          const r = Math.pow(u, 0.82) * reach; // bunch near the origin
          const a =
            lineAngle +
            twist * Math.sin(u * Math.PI * 1.6 + phase) +
            twist * 0.4 * Math.sin(u * Math.PI * 3.3 - phase * 1.4);
          const x = ox + Math.cos(a) * r;
          const y = oy + Math.sin(a) * r;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // wide soft pass then crisp bright pass — stacks into a glow under
        // the "lighter" composite in dark mode
        ctx.lineWidth = accent ? 5 : 3.5;
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
      // main fan — from just past the top-right corner, sweeping down-left
      drawFan(t, w * 1.02, h * -0.06, Math.PI * 0.82, 0.62, diag * 1.15, 16, 1);
      // counter fan — from the bottom-left corner, sweeping up-right, fainter
      drawFan(t * 0.9, w * -0.04, h * 1.08, -Math.PI * 0.2, 0.5, diag * 1.0, 10, 0.5);

      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    readTheme();
    resize();
    if (reduced.matches) draw(0);
    else raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced.matches) draw(0);
    });
    ro.observe(canvas);

    const onVis = () => {
      const vis = document.visibilityState === 'visible';
      if (vis && !running && !reduced.matches) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!vis) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const onTheme = () => {
      readTheme();
      if (reduced.matches) draw(0);
    };
    const onReducedChange = () => {
      if (reduced.matches) {
        running = false;
        cancelAnimationFrame(raf);
        draw(0);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('visibilitychange', onVis);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const colorMq = window.matchMedia('(prefers-color-scheme: dark)');
    colorMq.addEventListener('change', onTheme);
    reduced.addEventListener('change', onReducedChange);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      colorMq.removeEventListener('change', onTheme);
      reduced.removeEventListener('change', onReducedChange);
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
