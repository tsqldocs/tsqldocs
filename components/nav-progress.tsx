'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// A GitHub-style progress bar across the very top of the viewport during
// client-side navigation. Two independent signals decide when it runs:
//  - start: an <a> click to a different same-tab, same-origin URL, or a
//    programmatic history.pushState/replaceState call (covers router.push
//    from things like form redirects).
//  - done: pathname/searchParams changing is the App Router's own signal
//    that the new route has actually rendered.
// Between those it "trickles" toward 90% so it never looks stuck, then
// snaps to 100% and fades out once the real navigation lands.
// Almost every route on this site is static and prefetched, so most
// navigations finish in well under 100ms — without a floor, the bar would
// flash for a frame and vanish before anyone could register it.
const MIN_VISIBLE_MS = 350;

export function NavProgress() {
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDoneRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const start = useRef(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (pendingDoneRef.current) clearTimeout(pendingDoneRef.current);

    startedAtRef.current = Date.now();
    setVisible(true);
    setValue(0.08);

    trickleRef.current = setInterval(() => {
      setValue((v) => (v >= 0.9 ? v : v + (0.9 - v) * 0.1));
    }, 200);
  });

  const finish = useRef(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    setVisible((wasVisible) => {
      if (!wasVisible) return wasVisible;
      setValue(1);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setValue(0);
      }, 200);
      return wasVisible;
    });
  });

  const done = useRef(() => {
    if (pendingDoneRef.current) clearTimeout(pendingDoneRef.current);

    const remaining = MIN_VISIBLE_MS - (Date.now() - startedAtRef.current);
    if (remaining > 0) {
      pendingDoneRef.current = setTimeout(finish.current, remaining);
    } else {
      finish.current();
    }
  });

  // Navigation completed: the App Router only updates these once the new
  // route has rendered, so this is the reliable "done" signal.
  useEffect(() => {
    done.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }

      if (url.origin !== location.origin) return;
      if (url.pathname + url.search === location.pathname + location.search) return;

      start.current();
    }

    function patchHistory(method: 'pushState' | 'replaceState') {
      const original = history[method];
      history[method] = function (...args: Parameters<History[typeof method]>) {
        start.current();
        return original.apply(history, args);
      };
      return () => {
        history[method] = original;
      };
    }

    document.addEventListener('click', onClick);
    const unpatchPush = patchHistory('pushState');
    const unpatchReplace = patchHistory('replaceState');

    return () => {
      document.removeEventListener('click', onClick);
      unpatchPush();
      unpatchReplace();
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (pendingDoneRef.current) clearTimeout(pendingDoneRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-fd-primary origin-left"
        style={{
          transform: `scaleX(${value})`,
          opacity: visible ? 1 : 0,
          transition: visible
            ? 'transform 200ms ease-out, opacity 100ms ease-out'
            : 'opacity 200ms ease-in',
        }}
      />
    </div>
  );
}
