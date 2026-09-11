'use client';

import { useState } from 'react';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';

type State = 'idle' | 'submitting' | 'voted' | 'error';

export function WasThisHelpful({ pageUrl }: { pageUrl: string }) {
  const [state, setState] = useState<State>('idle');

  const vote = async (v: 'up' | 'down') => {
    if (state === 'submitting' || state === 'voted') return;
    setState('submitting');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageUrl, vote: v }),
      });
      if (!res.ok) throw new Error('request failed');
      setState('voted');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="not-prose my-8 flex flex-wrap items-center gap-3 rounded-xl border border-fd-border bg-fd-card px-4 py-3 text-sm">
      {state === 'voted' ? (
        <span className="text-fd-muted-foreground">Thanks for the feedback.</span>
      ) : (
        <>
          <span className="text-fd-foreground">Was this page helpful?</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Yes, this page was helpful"
              disabled={state === 'submitting'}
              onClick={() => vote('up')}
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 text-fd-muted-foreground transition hover:border-fd-primary/40 hover:text-fd-primary disabled:opacity-50 [&_svg]:size-3.5"
            >
              <ThumbsUpIcon />
              Yes
            </button>
            <button
              type="button"
              aria-label="No, this page was not helpful"
              disabled={state === 'submitting'}
              onClick={() => vote('down')}
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 text-fd-muted-foreground transition hover:border-fd-primary/40 hover:text-fd-primary disabled:opacity-50 [&_svg]:size-3.5"
            >
              <ThumbsDownIcon />
              No
            </button>
          </div>
          {state === 'error' && (
            <span className="w-full text-xs text-red-500">
              Couldn&rsquo;t record that — try again?
            </span>
          )}
        </>
      )}
    </div>
  );
}
