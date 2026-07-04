import type { Owner, OwnerAction } from '../api/owner.types';

/** Which status actions are valid for an owner given its current status. */
export function availableActions(owner: Owner): OwnerAction[] {
  const actions: OwnerAction[] = [];
  const pendingLike =
    owner.verificationStatus === 'pending' || owner.verificationStatus === 'review';

  if (pendingLike) {
    actions.push('approve', 'reject');
  }
  if (owner.status !== 'active' && owner.status !== 'blocked') {
    actions.push('activate');
  }
  if (owner.status !== 'inactive' && owner.status !== 'blocked') {
    actions.push('disable');
  }
  if (owner.status !== 'blocked') {
    actions.push('block');
  }
  return actions;
}

/**
 * The ConfirmDialog variant for a given action: 'disable' pauses an owner into the
 * Suspended state, so it uses the caution (orange) tone; reject/block are danger.
 */
export function actionVariant(action: OwnerAction): 'primary' | 'danger' | 'caution' {
  if (action === 'disable') return 'caution';
  return action === 'reject' || action === 'block' ? 'danger' : 'primary';
}
