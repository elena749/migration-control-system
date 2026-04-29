import type { Customer } from '../data/customers';
import type { Role } from '../state/AppContext';

/**
 * Returns the customers visible to a given role.
 * For the demo, simplified portfolio assignments — production would use the
 * auth/assignment layer.
 */
export function filterCustomersByRole(
  customers: Customer[],
  role: Role,
): Customer[] {
  switch (role) {
    case 'migration_lead':
      return customers;

    case 'csm':
      return customers.filter((c) =>
        [2, 7, 8, 10, 11, 12].includes(c.id),
      );

    case 'ae':
      return customers.filter(
        (c) =>
          c.quoteSLA?.active === true ||
          c.disposition === 'release' ||
          c.tier === 'churn_watch' ||
          c.tier === 'senior_migration',
      );

    case 'specialist':
      return customers.filter(
        (c) =>
          c.specialistsEngaged.length > 0 ||
          c.activeActions.some((a) => a.ownerRole.includes('Payroll IM')),
      );

    case 'function_lead':
      return customers.filter((c) => c.specialistsEngaged.length > 0);

    case 'vp_operations':
      return customers.filter(
        (c) =>
          c.tierTransition === 'auto_promoted' ||
          c.owners.crossFunctionalEscalationActive === true,
      );

    default:
      return customers;
  }
}
