import type { Customer } from '../data/customers';
import type { Role } from '../state/AppContext';

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

// Migration Lead — operational throat-to-choke
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

export function csmAttentionScore(c: Customer): number {
  let score = 0;
  if (c.health.overall === 'red') score += 1000;
  if (c.tierTransition === 'auto_promoted') score += 500;
  if (c.health.overall === 'amber') score += 250;
  if (c.customerFacingSLA.active) score += 200;
  if (c.health.stakeholderEngagement === 'red') score += 150;
  if (c.health.stakeholderEngagement === 'amber') score += 75;
  if (c.health.responsiveness === 'red') score += 100;
  return score;
}

export function aeAttentionScore(c: Customer): number {
  let score = 0;
  if (c.quoteSLA?.active && c.quoteSLA.daysUntilDeadline <= 2) score += 1000;
  if (c.tierTransition === 'auto_promoted') score += 500;
  if (c.disposition === 'release') score += 400;
  if (c.tier === 'churn_watch') score += 300;
  if (c.quoteSLA?.active) score += 200;
  if (c.tier === 'senior_migration') score += 100;
  return score;
}

export function specialistAttentionScore(c: Customer): number {
  let score = 0;
  const oldestActionAge = Math.max(
    0,
    ...c.activeActions.map((a) => a.ageDays),
  );
  const has5dBreach = c.activeActions.some((a) => a.fiveDayBoundaryBreach);
  if (has5dBreach) score += 1000;
  score += oldestActionAge * 50;
  return score;
}

export function functionLeadAttentionScore(c: Customer): number {
  let score = 0;
  score += c.specialistsEngaged.length * 100;
  score += c.activeActions.length * 50;
  if (c.tierTransition === 'auto_promoted') score += 500;
  return score;
}

export function vpOpsAttentionScore(c: Customer): number {
  let score = 0;
  const oldestActionAge = Math.max(
    0,
    ...c.activeActions.map((a) => a.ageDays),
  );
  score += oldestActionAge * 100;
  score += c.arrUsd / 1000;
  if (c.owners.crossFunctionalEscalationActive) score += 500;
  if (c.tierTransition === 'auto_promoted') score += 300;
  return score;
}

export function sortByRoleAttention(
  customers: Customer[],
  role: Role,
): Customer[] {
  const scoreFn =
    role === 'migration_lead'
      ? attentionScore
      : role === 'csm'
        ? csmAttentionScore
        : role === 'ae'
          ? aeAttentionScore
          : role === 'specialist'
            ? specialistAttentionScore
            : role === 'function_lead'
              ? functionLeadAttentionScore
              : role === 'vp_operations'
                ? vpOpsAttentionScore
                : attentionScore;

  return [...customers].sort((a, b) => scoreFn(b) - scoreFn(a));
}

// Kept for backwards compatibility with anything still importing the
// non-role-aware sort.
export function sortByAttention(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => attentionScore(b) - attentionScore(a));
}
