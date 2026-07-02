/**
 * Response-envelope helpers. The backend is inconsistent about how it wraps
 * payloads ({ data: { data } }, { data: { admins } }, { data }, or a raw value),
 * so every service unwraps through here instead of re-implementing the ladder.
 */
export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** Unwrap a single object from any of the known envelope shapes. */
export function unwrap<T>(payload: unknown): T {
  const obj = payload as Record<string, unknown> | null;
  if (obj && typeof obj === 'object' && 'data' in obj) {
    const inner = obj.data as Record<string, unknown> | null;
    if (inner && typeof inner === 'object' && 'data' in inner) {
      return inner.data as T;
    }
    return inner as T;
  }
  return payload as T;
}

/** Unwrap a list from any of the known envelope shapes. `keys` are extra list keys to try (e.g. "admins"). */
export function unwrapList<T>(payload: unknown, keys: string[] = []): T[] {
  const obj = (payload ?? {}) as Record<string, unknown>;
  const data = (obj.data ?? {}) as Record<string, unknown>;
  const candidates: unknown[] = [data.data, ...keys.map((k) => data[k]), obj.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return [];
}
