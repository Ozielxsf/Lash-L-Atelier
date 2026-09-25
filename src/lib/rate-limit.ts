/**
 * Fixed-window rate limiter with a durable store when available.
 *
 * When Vercel KV / Upstash REST credentials are present in the
 * environment (`KV_REST_API_URL` + `KV_REST_API_TOKEN`), counts live in
 * Redis — shared across every serverless instance and surviving cold
 * starts, so the limit actually holds in production.
 *
 * Without those credentials it falls back to a per-instance in-memory
 * Map. That fallback is best-effort (resets on cold start, not shared
 * across instances) but keeps local dev and un-provisioned deploys
 * working exactly as before.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const memory = new Map<string, { count: number; reset: number }>();

function memoryLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now > entry.reset) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

async function kvLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `ratelimit:${key}`;

  // Atomic pipeline: increment the counter, then set the TTL only if the
  // key has no expiry yet (NX) — this anchors the window to the first hit.
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, windowSec, "NX"],
    ]),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`KV responded ${res.status}`);

  const data = (await res.json()) as { result: number }[];
  const count = data[0]?.result ?? 0;
  return count > limit;
}

/**
 * Returns true if `key` has exceeded `limit` requests within `windowMs`.
 * Never throws — any KV failure degrades gracefully to the in-memory path.
 */
export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (KV_URL && KV_TOKEN) {
    try {
      return await kvLimited(key, limit, windowMs);
    } catch (err) {
      console.error("Rate-limit KV error, falling back to memory:", err);
    }
  }
  return memoryLimited(key, limit, windowMs);
}
