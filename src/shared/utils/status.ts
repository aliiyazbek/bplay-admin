import type { BadgeVariant } from '@ui/Badge/Badge';

/**
 * The single mapping from a domain status string to a Badge variant.
 * Every status render uses this — never inline-pick a variant.
 */
export function statusToBadgeVariant(status: string | null | undefined): BadgeVariant {
  const s = (status ?? '').toLowerCase();
  if (['active', 'approved', 'paid', 'confirmed', 'success', 'completed', 'verified'].includes(s)) {
    return 'success';
  }
  if (['pending', 'review', 'under_review', 'processing', 'in_review'].includes(s)) {
    return 'warning';
  }
  if (['rejected', 'suspended', 'blocked', 'failed', 'banned', 'expired'].includes(s)) {
    return 'danger';
  }
  if (['inactive', 'maintenance', 'cancelled', 'canceled', 'disabled', 'archived'].includes(s)) {
    return 'neutral';
  }
  return 'info';
}
