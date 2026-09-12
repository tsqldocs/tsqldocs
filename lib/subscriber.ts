import { getCloudflareContext } from '@opennextjs/cloudflare';

export const SUBSCRIBER_COOKIE = 'tsql_sub';

// Free tier is unmetered everywhere except the AI assistant. Subscribers
// get a much higher ceiling, not "unlimited" — each turn costs real
// Anthropic API tokens (system prompt + search results + history), so an
// unmetered subscriber could cost more per month than the subscription
// covers. 50/day is a real ~16x jump that still bounds worst-case cost.
export const FREE_CHAT_RATE_LIMIT = 3;
export const SUBSCRIBER_CHAT_RATE_LIMIT = 50;

export interface Entitlement {
  status: 'active' | 'canceled' | 'past_due' | 'incomplete_expired';
  customerId: string;
  subscriptionId: string;
}

const entitlementKey = (token: string) => `subscriber:token:${token}`;

/** Reads a cookie value directly off the raw Cookie header — this runs in
 * plain Route Handlers (Request in, Response out), not just Server
 * Components, so it doesn't rely on next/headers' request-scoped cookies(). */
export function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export async function getEntitlement(token: string | undefined): Promise<Entitlement | null> {
  if (!token) return null;
  const { env } = await getCloudflareContext({ async: true });
  const raw = await env.RATE_LIMIT.get(entitlementKey(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Entitlement;
  } catch {
    return null;
  }
}

export async function isActiveSubscriber(token: string | undefined): Promise<boolean> {
  const entitlement = await getEntitlement(token);
  return entitlement?.status === 'active';
}

/** No expiry — an entitlement is corrected by the next webhook event
 * (renewal, cancellation, payment failure), not by a TTL guess. */
export async function setEntitlement(token: string, entitlement: Entitlement): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.RATE_LIMIT.put(entitlementKey(token), JSON.stringify(entitlement));
}

/** Reverse lookup so the webhook (which only knows the Stripe subscription
 * id) can find and update the right entitlement token without Stripe ever
 * knowing our cookie value. */
const subscriptionIndexKey = (subscriptionId: string) => `subscriber:by-subscription:${subscriptionId}`;

export async function linkSubscriptionToToken(subscriptionId: string, token: string): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.RATE_LIMIT.put(subscriptionIndexKey(subscriptionId), token);
}

export async function getTokenForSubscription(subscriptionId: string): Promise<string | null> {
  const { env } = await getCloudflareContext({ async: true });
  return env.RATE_LIMIT.get(subscriptionIndexKey(subscriptionId));
}
