/** A compact display label for a profile / website URL — drops the protocol and trailing slash. */
export function formatUrlLabel(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
