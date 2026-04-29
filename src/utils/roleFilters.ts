import type { Customer } from '../data/customers';
import type { Role } from '../state/AppContext';

/**
 * Returns the customers visible to a given role.
 *
 * - CSM: full cohort (the operational morning brief).
 * - Implementation Manager: same cohort as CSM for now. v2 will flip the
 *   data shape to be implementation-task-centric rather than account-centric.
 * - Ghostbuster: only escalated/break-glass cases — Churn Watch tier OR
 *   any escalation event at Tier 3+.
 */
export function filterCustomersByRole(
  customers: Customer[],
  role: Role,
): Customer[] {
  switch (role) {
    case 'csm':
      return customers;

    case 'implementation_manager':
      // v2: data shape flips to implementation-task-centric. For v1, share the CSM cohort.
      return customers;

    case 'ghostbuster':
      return customers.filter(
        (c) =>
          c.tier === 'churn_watch' ||
          (c.escalationEvents?.some((e) => e.tier >= 3) ?? false),
      );

    default:
      return customers;
  }
}
