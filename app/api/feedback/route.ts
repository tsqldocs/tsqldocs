import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordFeedback } from '@/lib/feedback';

const bodySchema = z.object({
  pageUrl: z.string().min(1).max(300),
  vote: z.enum(['up', 'down']),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = await recordFeedback(req, parsed.data.pageUrl, parsed.data.vote);
  return NextResponse.json(result);
}
