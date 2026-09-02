'use client';

import { useRef, useState, type ComponentProps } from 'react';
import {
  CodeBlock as FumaCodeBlock,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import { SparklesIcon, WrapTextIcon } from 'lucide-react';
import { useAISearchContext } from '@/components/ai/search';

const actionBtn =
  'inline-flex items-center justify-center rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5';

export default function CodeBlock(props: ComponentProps<'pre'>) {
  const figureRef = useRef<HTMLElement>(null);
  const [wrap, setWrap] = useState(false);
  const ai = useAISearchContext();

  const askAI = () => {
    if (!ai) return;
    const code = figureRef.current?.querySelector('pre')?.textContent ?? '';
    ai.setOpen(true);
    void ai.chat.sendMessage({
      role: 'user',
      parts: [
        { type: 'data-client', data: { location: location.href } },
        {
          type: 'text',
          text:
            `Walk me through this SQL from the docs — what it does, ` +
            `line by line where it matters, and any gotchas:\n\n\`\`\`sql\n${code}\n\`\`\``,
        },
      ],
    });
  };

  return (
    <FumaCodeBlock
      ref={figureRef}
      {...props}
      viewportProps={{
        className: wrap
          ? '[&_pre]:!w-full [&_pre]:whitespace-pre-wrap [&_.line]:whitespace-pre-wrap [&_pre]:break-words'
          : undefined,
      }}
      Actions={({ className, children }) => (
        <div className={className}>
          <button
            type="button"
            aria-label={wrap ? 'Disable line wrap' : 'Enable line wrap'}
            aria-pressed={wrap}
            onClick={() => setWrap((w) => !w)}
            className={`${actionBtn} ${wrap ? 'bg-fd-accent text-fd-accent-foreground' : ''}`}
          >
            <WrapTextIcon />
          </button>
          {ai && (
            <button type="button" aria-label="Ask AI about this snippet" onClick={askAI} className={actionBtn}>
              <SparklesIcon className="text-fd-primary" />
            </button>
          )}
          {children}
        </div>
      )}
    >
      <Pre>{props.children}</Pre>
    </FumaCodeBlock>
  );
}
