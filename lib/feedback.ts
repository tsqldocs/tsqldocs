import { getCloudflareContext } from '@opennextjs/cloudflare';

// 30 days is long enough to stop a bored refresh-spam, short enough that a
// genuine return visit a few months later can vote again.
const VOTE_DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 30;

export type FeedbackVote = 'up' | 'down';

/**
 * Per-page thumbs up/down counter, reusing the RATE_LIMIT KV namespace with
 * its own key prefix rather than provisioning a new binding. Same
 * non-atomic read-then-write tradeoff as checkRateLimit: fine for a rough
 * signal, not an exact count under heavy concurrent voting (which this
 * feature will never see).
 */
export async function recordFeedback(
  request: Request,
  pageUrl: string,
  vote: FeedbackVote,
): Promise<{ ok: true; alreadyVoted: boolean }> {
  const id = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const dedupeKey = `feedback:voted:${id}:${pageUrl}`;
  const countKey = `feedback:count:${pageUrl}:${vote}`;

  const { env } = await getCloudflareContext({ async: true });

  const alreadyVoted = (await env.RATE_LIMIT.get(dedupeKey)) !== null;
  if (alreadyVoted) {
    return { ok: true, alreadyVoted: true };
  }

  const current = Number((await env.RATE_LIMIT.get(countKey)) ?? '0');
  await env.RATE_LIMIT.put(countKey, String(current + 1));
  await env.RATE_LIMIT.put(dedupeKey, vote, { expirationTtl: VOTE_DEDUPE_TTL_SECONDS });

  return { ok: true, alreadyVoted: false };
}
