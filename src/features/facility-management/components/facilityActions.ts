import type { FacilityAction, FacilityStatus } from '../api/facility.types';

/** The minimal facility shape the action components need (Facility or FacilityListItem). */
export interface FacilityActionTarget {
  id: string;
  name: string;
  status: FacilityStatus;
}

/**
 * Which admin actions are valid for a facility in a given status (SRS 09 / §8).
 * Note: 'owner_suspended' still allows an admin suspend — the administrative
 * suspension OVERRIDES the owner's pause (SRS FC6). 'rejected' offers nothing:
 * the owner must edit & resubmit from the app.
 */
export function availableActions(status: FacilityStatus): FacilityAction[] {
  switch (status) {
    case 'pending':
      return ['approve', 'reject'];
    case 'active':
      return ['suspend'];
    case 'suspended':
      return ['reactivate'];
    case 'owner_suspended':
      return ['suspend'];
    case 'rejected':
      return [];
  }
}

/** The dialog/button variant for a given action (destructive ones are danger). */
export function actionVariant(action: FacilityAction): 'primary' | 'danger' {
  return action === 'approve' || action === 'reactivate' ? 'primary' : 'danger';
}
