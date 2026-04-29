import type { Customer } from '../data/customers';

export interface GroupedCustomers {
  seniorMigration: Customer[];
  churnWatch: Customer[];
  standard: Customer[];
  healthy: Customer[];
}

function isHealthy(c: Customer): boolean {
  return c.health.overall === 'green' && c.activeActions.length === 0;
}

export function groupByTier(customers: Customer[]): GroupedCustomers {
  const seniorMigration: Customer[] = [];
  const churnWatch: Customer[] = [];
  const standard: Customer[] = [];
  const healthy: Customer[] = [];

  for (const c of customers) {
    if (isHealthy(c)) {
      healthy.push(c);
      continue;
    }
    if (c.tier === 'senior_migration') seniorMigration.push(c);
    else if (c.tier === 'churn_watch') churnWatch.push(c);
    else standard.push(c);
  }

  return { seniorMigration, churnWatch, standard, healthy };
}

export function attentionScore(c: Customer): number {
  let score = 0;
  if (c.health.overall === 'red') score += 1000;
  if (c.activeActions.some((a) => a.fiveDayBoundaryBreach)) score += 500;
  if (c.health.overall === 'amber') score += 250;
  if (c.customerFacingSLA.active) score += 100;
  for (const a of c.activeActions) {
    if (a.state === 'BLOCKED_BUT_DRIVEN') score += 50;
    if (a.state === 'ESCALATING') score += 25;
    score += 1;
  }
  return score;
}

export function sortByAttention(customers: Customer[]): Customer[] {
  return customers
    .slice()
    .sort((a, b) => attentionScore(b) - attentionScore(a));
}
