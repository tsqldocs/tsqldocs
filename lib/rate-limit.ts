import { getCloudflareContext } from '@opennextjs/cloudflare';

const DEFAULT_WINDOW_SECONDS = 60 * 60; // 1 hour

/**
 * Per-IP counter in the RATE_LIMIT KV namespace, key-prefixed by route so
 * different endpoints don't share a budget. Non-atomic read-then-write — a
 * race can let a couple of extra requests through under heavy concurrency
 * from the same IP, which is fine for "bound worst-case cost," not meant to
 * be an exact quota.
 */
export async function checkRateLimit(
  request: Request,
  routeKey: string,
  limit: number,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
): Promise<{ allowed: boolean; remaining: number }> {
  const id = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const key = `ratelimit:${routeKey}:${id}`;

  const { env } = await getCloudflareContext({ async: true });
  const current = Number((await env.RATE_LIMIT.get(key)) ?? '0');

  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - current - 1 };
}
