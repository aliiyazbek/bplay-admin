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

/** The ConfirmDialog variant for a given action (destructive ones are danger). */
export function actionVariant(action: OwnerAction): 'primary' | 'danger' {
  return action === 'reject' || action === 'block' || action === 'disable' ? 'danger' : 'primary';
}
