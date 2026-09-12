import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  SUBSCRIBER_COOKIE,
  signSubscriberCookie,
  verifySubscriberCookie,
  buildSetCookie,
  buildClearCookie,
} from '@/lib/subscriber-cookie';

export { SUBSCRIBER_COOKIE };

// Free tier is unmetered everywhere except the AI assistant. Subscribers
// get a much higher ceiling, not "unlimited" — each turn costs real
// Anthropic API tokens (system prompt + search results + history), so an
// unmetered subscriber could cost more per month than the subscription
// covers. 50/day is a real ~16x jump that still bounds worst-case cost.
export const FREE_CHAT_RATE_LIMIT = 3;
export const SUBSCRIBER_CHAT_RATE_LIMIT = 50;

// How long a signed cookie is trusted before re-checking KV. Bounds how
// long a canceled subscriber can keep access on a stale-but-validly-signed
// cookie — a deliberate tradeoff (fewer KV reads on the hot path) rather
// than an oversight.
const REVALIDATE_AFTER_SECONDS = 60 * 60 * 6;

// A failed-payment retry (past_due) still counts as entitled — losing
// access the instant a card fails, before Stripe's own dunning emails even
// go out, is harsher than intended. Only a fully lapsed/canceled
// subscription drops the limit back to free.
const ENTITLED_STATUSES = new Set(['active', 'trialing', 'past_due']);

export interface SubscriptionRecord {
  status: string;
  subscriptionId: string;
}

export interface SubscriberCheck {
  isSubscriber: boolean;
  customerId?: string;
  /** Present when the cookie should be (re)issued or cleared on the
   * response — callers must attach it via a Set-Cookie header themselves;
   * this function never mutates a Response directly. */
  setCookieHeader?: string;
}

const entitlementKey = (customerId: string) => `sub:${customerId}`;

export async function getEntitlement(customerId: string): Promise<SubscriptionRecord | null> {
  const { env } = await getCloudflareContext({ async: true });
  const raw = await env.RATE_LIMIT.get(entitlementKey(customerId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SubscriptionRecord;
  } catch {
    return null;
  }
}

export async function setEntitlement(customerId: string, record: SubscriptionRecord): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.RATE_LIMIT.put(entitlementKey(customerId), JSON.stringify(record));
}

/**
 * Verifies the subscriber cookie's signature (cheap, no I/O) and, only once
 * per REVALIDATE_AFTER_SECONDS, re-checks the actual entitlement in KV —
 * so a canceled subscription is caught within a few hours, not instantly,
 * in exchange for not hitting KV on every single request from an active
 * subscriber. Takes the raw cookie value directly (not a Request) so it
 * works equally from a Route Handler (getCookie(request, ...)) or a Server
 * Component (next/headers cookies().get(...)?.value).
 */
export async function checkSubscriberCookie(raw: string | undefined): Promise<SubscriberCheck> {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret || !raw) return { isSubscriber: false };

  const payload = await verifySubscriberCookie(raw, secret);
  if (!payload) return { isSubscriber: false };

  const age = Math.floor(Date.now() / 1000) - payload.iat;
  if (age < REVALIDATE_AFTER_SECONDS) {
    return { isSubscriber: true, customerId: payload.cid };
  }

  try {
    const record = await getEntitlement(payload.cid);
    if (record && ENTITLED_STATUSES.has(record.status)) {
      return {
        isSubscriber: true,
        customerId: payload.cid,
        setCookieHeader: buildSetCookie(await signSubscriberCookie(payload.cid, secret)),
      };
    }
    return { isSubscriber: false, setCookieHeader: buildClearCookie() };
  } catch {
    // KV outage — fail open for this one request rather than locking out a
    // real subscriber, but don't refresh the cookie's issued-at, so the
    // very next request retries the re-validation instead of extending
    // trust indefinitely on a guess.
    return { isSubscriber: true, customerId: payload.cid };
  }
}

export async function checkSubscriber(request: Request): Promise<SubscriberCheck> {
  return checkSubscriberCookie(getCookie(request, SUBSCRIBER_COOKIE));
}

export function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
