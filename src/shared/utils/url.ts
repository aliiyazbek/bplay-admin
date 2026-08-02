/** A compact display label for a profile / website URL — drops the protocol and trailing slash. */
export function formatUrlLabel(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/** The only schemes we will ever put in an `href`, `src` or `window.open`. */
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/** Does the string carry its own scheme (`https:`, `javascript:`, …)? */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * The URL parser DELETES tab, LF and CR from anywhere in the input before
 * parsing, so `/	/evil.com` becomes the protocol-relative `//evil.com`.
 * Strip them first, or a prefix check reads a different string than the browser.
 */
function canonical(url: string): string {
  return url.trim().replace(/[\t\n\r]/g, '');
}

function parse(url: string): { parsed: URL; cleaned: string } | null {
  const cleaned = canonical(url);
  if (cleaned === '') return null;
  try {
    return { parsed: new URL(cleaned, window.location.origin), cleaned };
  } catch {
    return null;
  }
}

/**
 * Is this URL safe to navigate to or embed?
 *
 * User-controlled strings reach the dashboard from every direction — a player's
 * profile link, an owner's website, a feedback attachment. Putting one straight
 * into an `href` lets `javascript:…` run with the admin's session (the access
 * token lives in localStorage), so every such value goes through this gate first
 * and renders as plain text when it fails.
 *
 * The check is made against what the URL PARSER produces, never against the raw
 * prefix: a scheme-less value must still resolve to our own origin, which rejects
 * `//evil.com`, `/\evil.com` and the tab-smuggled variants of both that a naive
 * `startsWith('//')` test lets through.
 */
export function isSafeHttpUrl(url: string | undefined | null): url is string {
  if (typeof url !== 'string') return false;
  const result = parse(url);
  if (!result) return false;
  const { parsed, cleaned } = result;
  if (!SAFE_PROTOCOLS.has(parsed.protocol)) return false;
  // A relative URL may only stay relative — it must not escape to another origin.
  if (!HAS_SCHEME.test(cleaned) && parsed.origin !== window.location.origin) return false;
  return true;
}

/**
 * The NORMALISED absolute URL when it is safe to use, otherwise `undefined`.
 *
 * Returning the parsed `href` (rather than the raw input) is deliberate: it
 * guarantees the string we render a label for is the same one the browser will
 * navigate to.
 */
export function safeHttpUrl(url: string | undefined | null): string | undefined {
  if (!isSafeHttpUrl(url)) return undefined;
  return parse(url)?.parsed.href;
}

/** True when the URL points at this dashboard's own origin. */
export function isSameOriginUrl(url: string | undefined | null): boolean {
  const result = parse(url ?? '');
  return result !== null && result.parsed.origin === window.location.origin;
}
