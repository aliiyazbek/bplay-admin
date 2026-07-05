import type { Owner, OwnerAction } from '../api/owner.types';

/**
 * Which account-level actions are valid for an owner. A blocked owner offers
 * only "unblock"; otherwise the set follows the account status, plus "block".
 */
export function availableActions(owner: Owner): OwnerAction[] {
  if (owner.isBlocked) return ['unblock'];

  const actions: OwnerAction[] = [];
  switch (owner.accountStatus) {
    case 'under_review':
      actions.push('approve', 'reject');
      break;
    case 'rejected':
      actions.push('approve');
      break;
    case 'active':
      actions.push('suspend');
      break;
    case 'suspended':
      actions.push('activate');
      break;
  }
  actions.push('block');
  return actions;
}

/** Actions that require a mandatory reason (opened via ReasonDialog). */
export function actionNeedsReason(action: OwnerAction): boolean {
  return action === 'reject' || action === 'suspend' || action === 'block';
}

/** ConfirmDialog / button variant per action. */
export function actionVariant(action: OwnerAction): 'primary' | 'danger' | 'caution' {
  if (action === 'suspend') return 'caution';
  return action === 'reject' || action === 'block' ? 'danger' : 'primary';
}
