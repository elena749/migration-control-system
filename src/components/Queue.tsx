import { useApp } from '../state/AppContext';
import { useCustomers } from '../hooks/useCustomers';
import {
  groupByTier,
  sortByAttention,
} from '../utils/queueLogic';
import type { Customer, Flag, Tier } from '../data/customers';

// TODO: per-role filtering in the next step. For now, all 6 roles see all 12 customers.

const TIER_STRIPE: Record<Tier, string> = {
  senior_migration: 'bg-tier-senior',
  churn_watch: 'bg-tier-churn',
  standard: 'bg-tier-standard',
};

const TIER_LABEL: Record<Tier, string> = {
  senior_migration: 'Senior Migration',
  churn_watch: 'Churn Watch',
  standard: 'Standard',
};

const HEALTH_COLOR = {
  green: 'bg-health-green',
  amber: 'bg-health-amber',
  red: 'bg-health-red',
} as const;

const FLAG_META: Record<Flag, { label: string; className: string }> = {
  legal_escalation: { label: 'Legal Esc.', className: 'text-flag-legal' },
  contract_protected: { label: 'Protected', className: 'text-flag-protected' },
};

interface QueueCardProps {
  customer: Customer;
  pulsingEnabled: boolean;
}

function QueueCard({ customer, pulsingEnabled }: QueueCardProps) {
  const { state, dispatch } = useApp();
  const isSelected = state.selectedAccountId === customer.id;
  const isRed = customer.health.overall === 'red';
  const shouldPulse = pulsingEnabled && isRed;

  const tierStripe = TIER_STRIPE[customer.tier];
  const healthColor = HEALTH_COLOR[customer.health.overall];
  const tierLabel = TIER_LABEL[customer.tier];

  const flagChips = customer.flags.map((f) => FLAG_META[f]);

  const mostPressingAction = customer.activeActions
    .slice()
    .sort((a, b) => b.ageDays - a.ageDays)[0];

  let clockText: string | null = null;
  if (mostPressingAction) {
    const stateWord =
      mostPressingAction.state === 'BLOCKED_BUT_DRIVEN'
        ? 'Blocked'
        : mostPressingAction.state === 'ESCALATING'
          ? 'Escalating'
          : 'Active';
    clockText = `${stateWord} · Day ${mostPressingAction.ageDays}`;
  }
  const clockUrgent = mostPressingAction?.fiveDayBoundaryBreach === true;

  const isCalmEmpty =
    !clockText &&
    customer.health.overall === 'green' &&
    customer.activeActions.length === 0;

  return (
    <button
      type="button"
      onClick={() =>
        dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: customer.id })
      }
      className={`w-full text-left flex items-stretch bg-bg-surface hover:bg-bg-surface-alt border-b border-border-soft transition-colors ${isSelected ? 'ring-2 ring-accent ring-inset' : ''}`}
    >
      <div
        className={`w-1 ${isSelected ? 'bg-accent' : tierStripe}`}
        aria-hidden
      />
      <div className="flex-1 px-3 py-3 min-h-[64px]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${healthColor} ${shouldPulse ? 'animate-pulse-pill' : ''}`}
            aria-hidden
          />
          <span className="text-sm font-semibold text-ink-primary truncate">
            {customer.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary mb-1">
          <span>{tierLabel}</span>
          {flagChips.map((chip) => (
            <span key={chip.label} className={`${chip.className} font-medium`}>
              · {chip.label}
            </span>
          ))}
        </div>
        {clockText && (
          <div
            className={`text-xs font-mono ${clockUrgent ? 'text-accent font-semibold' : 'text-ink-tertiary'}`}
          >
            {clockText}
          </div>
        )}
        {isCalmEmpty && (
          <div className="text-xs text-ink-tertiary">
            No active intervention
          </div>
        )}
      </div>
    </button>
  );
}

interface QueueGroupProps {
  label: string;
  customers: Customer[];
  pulsingEnabled: boolean;
}

function QueueGroup({ label, customers, pulsingEnabled }: QueueGroupProps) {
  return (
    <div className="border-b border-border-soft">
      <div className="px-4 py-2 text-xs font-medium text-ink-tertiary uppercase tracking-wide">
        {label} ({customers.length})
      </div>
      <div>
        {customers.map((c) => (
          <QueueCard key={c.id} customer={c} pulsingEnabled={pulsingEnabled} />
        ))}
      </div>
    </div>
  );
}

export function Queue() {
  const customers = useCustomers();
  const grouped = groupByTier(customers);
  const sortedGroups = {
    seniorMigration: sortByAttention(grouped.seniorMigration),
    churnWatch: sortByAttention(grouped.churnWatch),
    standard: sortByAttention(grouped.standard),
    healthy: sortByAttention(grouped.healthy),
  };

  const redCount = customers.filter((c) => c.health.overall === 'red').length;
  const pulsingEnabled = redCount <= 3;

  return (
    <div className="flex flex-col">
      {redCount > 3 && (
        <div className="px-4 py-2 text-xs text-health-red font-medium border-b border-border-soft">
          {redCount} accounts at risk
        </div>
      )}
      {sortedGroups.seniorMigration.length > 0 && (
        <QueueGroup
          label="Senior Migration"
          customers={sortedGroups.seniorMigration}
          pulsingEnabled={pulsingEnabled}
        />
      )}
      {sortedGroups.churnWatch.length > 0 && (
        <QueueGroup
          label="Churn Watch"
          customers={sortedGroups.churnWatch}
          pulsingEnabled={pulsingEnabled}
        />
      )}
      {sortedGroups.standard.length > 0 && (
        <QueueGroup
          label="Standard Flow"
          customers={sortedGroups.standard}
          pulsingEnabled={pulsingEnabled}
        />
      )}
      {sortedGroups.healthy.length > 0 && (
        <QueueGroup
          label="Healthy"
          customers={sortedGroups.healthy}
          pulsingEnabled={pulsingEnabled}
        />
      )}
    </div>
  );
}
