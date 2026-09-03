import { createAnthropic } from '@ai-sdk/anthropic';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { ChatUIMessage, SearchTool } from '../../../components/ai/search';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}
const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = [
  'You are the SQL assistant for tsqldocs.com — a practical SQL reference with an',
  'in-browser SQLite playground. Be precise, concise, and correctness-first.',
  '',
  'ALWAYS call the `search` tool before answering anything non-trivial, and ground',
  'your answer in what it returns. Cite the pages you used as markdown links with',
  "the document's `url` field, e.g. [Top N per group](/docs/recipes/top-n-per-group).",
  'If search finds nothing relevant, say so and suggest a better query rather than guessing.',
  '',
  'When you give SQL:',
  '- Put it in a ```sql fenced block, formatted to read well.',
  '- Prefer standard SQL; call out where engines differ (Postgres / MySQL / SQL Server / SQLite).',
  '- Explain *why*, not just *what* — the failure mode, the gotcha, the safer form.',
  '',
  'The playground database has these tables the reader can run queries against:',
  '  customers(customer_id, name, country)',
  '  orders(order_id, customer_id, order_date, amount, status, cancelled_at)',
  '  employees(employee_id, name, department_id, salary)',
  '  product_sales(product_id, category_id, product_name, sales)',
  '  monthly_revenue(month, revenue)',
  'When it helps, write examples against these so the reader can paste and run them.',
  '',
  'If the user pastes a broken query and an error message, diagnose the root cause',
  'first, then give a corrected query they can run as-is, then note how to avoid it.',
].join('\n');

export async function POST(req: Request, ctx: RouteContext<"/api/chat">) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI is not configured: ANTHROPIC_API_KEY is missing on the server.' },
      { status: 503 },
    );
  }

  const reqJson = await req.json();

  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'),
    system: systemPrompt,
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    messages: await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    }),
    toolChoice: 'auto',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // Surface the real reason instead of the SDK's generic "An error occurred."
      onError: (error) => {
        console.error('[api/chat]', error);
        if (error == null) return 'Unknown error';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    }),
  });
}

const searchTool = tool({
  description: 'Search the docs content and return raw JSON results.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    return await search.searchAsync(query, { limit, merge: true, enrich: true });
  },
}) satisfies SearchTool;