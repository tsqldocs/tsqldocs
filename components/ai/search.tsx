'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import type { Tool, UIMessage } from 'ai';
import { cn } from '../../lib/cn';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

export interface PendingAsk {
  location: string;
  text: string;
}

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  pending: PendingAsk | null;
  setPending: (pending: PendingAsk | null) => void;
} | null>(null);

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAsk | null>(null);
  useHotKey(open, setOpen);

  return <Context value={{ open, setOpen, pending, setPending }}>{children}</Context>;
}

/**
 * Opens the AI chat panel and queues a message for it to send once it has
 * mounted — the chat itself only loads lazily on first open, so callers
 * outside the panel (code blocks, Query Doctor, the playground) can't reach
 * into a live `useChat` instance directly.
 */
export function useAskAI() {
  const ctx = useAISearchContext();

  return (text: string) => {
    if (!ctx) return;
    ctx.setOpen(true);
    ctx.setPending({ location: location.href, text });
  };
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed bottom-4 gap-3 w-24 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20 transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

// The chat panel pulls in the AI SDK, the markdown/shiki rendering pipeline,
// and zod — several hundred KB that most visitors never need. It's loaded
// only once the user actually opens the panel, instead of on every docs page.
const LazyChatPanel = dynamic(() => import('./chat-panel').then((m) => m.ChatPanel), {
  ssr: false,
});

export function AISearchPanel() {
  const { open } = useAISearchContext();
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  if (!everOpened) return null;
  return <LazyChatPanel />;
}

function useHotKey(open: boolean, setOpen: (open: boolean) => void) {
  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);
}

export function useAISearchContext() {
  return use(Context)!;
}
