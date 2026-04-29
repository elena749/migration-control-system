import { useState } from 'react';
import { nextMoveForCustomer } from '../utils/directives';
import type {
  Customer,
  HealthSignal,
  Action,
  Tier,
  RoutingState,
  EscalationEvent,
} from '../data/customers';

interface AccountCardProps {
  customer: Customer;
  pulsingEnabled: boolean;
}

export function AccountCard({ customer, pulsingEnabled }: AccountCardProps) {
  const [expanded, setExpanded] = useState(customer.id === 2); // Halfbrick expanded by default
  const directive = nextMoveForCustomer(customer);

  // Tier color stripe
  const tierColorClass =
    customer.tier === 'senior_migration' ? 'bg-tier-senior' :
    customer.tier === 'churn_watch' ? 'bg-tier-churn' :
    'bg-tier-standard';

  // Status badge text
  const statusBadge = computeStatusBadge(customer);

  // Pulsing indicator
  const isRed = customer.health.overall === 'red';
  const shouldPulse = pulsingEnabled && isRed;

  return (
    <div className="bg-bg-surface border border-border-default rounded-md overflow-hidden">
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-stretch hover:bg-bg-surface-alt transition-colors"
      >
        {/* Tier color stripe */}
        <div className={`w-1 ${tierColorClass}`} aria-hidden />

        {/* Card content */}
        <div className="flex-1 px-5 py-4">
          {/* Top row: name + status badge + expand chevron */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <HealthDot signal={customer.health.overall} pulse={shouldPulse} />
              <span className="text-base font-semibold text-ink-primary">
                {customer.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={statusBadge} />
              <span className="text-ink-tertiary text-sm" aria-hidden>
                {expanded ? '▾' : '▸'}
              </span>
            </div>
          </div>

          {/* Next Move section — the actionable content */}
          <div className="mb-2">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              Today's Move
            </div>
            <div className="text-sm text-ink-primary leading-relaxed mb-2">
              {directive.text}
            </div>
            <div className="text-xs text-ink-tertiary">
              {directive.ownerSummary}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded content — evidence */}
      {expanded && (
        <div className="border-t border-border-soft bg-bg-surface-alt px-5 py-4">
          <ExpandedEvidence customer={customer} />
        </div>
      )}
    </div>
  );
}

// =====================
// Status badge
// =====================

function computeStatusBadge(customer: Customer): { text: string; color: string } {
  if (customer.tierTransition === 'auto_promoted' && customer.tierTransitionDayOffset !== undefined) {
    const daysAgo = Math.abs(customer.tierTransitionDayOffset);
    return {
      text: daysAgo === 0
        ? 'AUTO-PROMOTED'
        : `AUTO-PROMOTED · DAY ${daysAgo}`,
      color: 'text-health-amber',
    };
  }

  if (customer.tier === 'churn_watch') {
    return { text: 'CHURN WATCH', color: 'text-tier-churn' };
  }

  if (customer.tier === 'senior_migration') {
    return { text: 'SENIOR MIGRATION', color: 'text-tier-senior' };
  }

  if (customer.health.overall === 'green' && customer.activeActions.length === 0) {
    return { text: 'STEADY STATE', color: 'text-health-green' };
  }

  return { text: 'STANDARD', color: 'text-ink-tertiary' };
}

function StatusBadge({ status }: { status: { text: string; color: string } }) {
  return (
    <span className={`text-xs uppercase tracking-wider font-semibold ${status.color}`}>
      {status.text}
    </span>
  );
}

// =====================
// Profile chips
// =====================

function AccountBlock({ customer }: { customer: Customer }) {
  const arrFormatted = `$${(customer.arrUsd / 1000).toFixed(0)}K ARR`;
  const countriesLabel = `${customer.countriesCount} countries`;
  const workersLabel = `${customer.workersTotal} workers`;
  return (
    <div>
      <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
        Account
      </div>
      <div className="text-sm text-neutral-700">
        {countriesLabel} · {workersLabel} · {arrFormatted}
      </div>
    </div>
  );
}

// =====================
// Health dot
// =====================

function HealthDot({ signal, pulse = false }: { signal: HealthSignal; pulse?: boolean }) {
  const colorClass =
    signal === 'red' ? 'bg-health-red ring-health-red/20' :
    signal === 'amber' ? 'bg-health-amber ring-health-amber/20' :
    'bg-health-green ring-health-green/20';
  return (
    <span
      className={`
        inline-block w-3 h-3 rounded-full ring-2 transition-colors duration-200
        ${colorClass}
        ${pulse ? 'animate-pulse-pill' : ''}
      `}
      aria-hidden
    />
  );
}

// =====================
// Expanded evidence
// =====================

function ExpandedEvidence({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <AccountBlock customer={customer} />
      <RoutingSection customer={customer} />
      {customer.escalationEvents && customer.escalationEvents.length > 0 && (
        <EscalationSection events={customer.escalationEvents} />
      )}
    </div>
  );
}

// =====================
// Auto-promotion context
// =====================

export function AutoPromotionContext({ customer }: { customer: Customer }) {
  const tierLabel: Record<Tier, string> = {
    senior_migration: 'Senior Migration',
    churn_watch: 'Churn Watch',
    standard: 'Standard Flow',
  };
  const originalLabel = customer.originalTier
    ? tierLabel[customer.originalTier]
    : 'Standard Flow';
  const daysAgo = Math.abs(customer.tierTransitionDayOffset ?? 0);

  return (
    <div className="
      px-4 py-3 bg-amber-50 border border-amber-300 rounded-md
      flex items-start gap-2 animate-banner-slide-in
    ">
      <span className="text-amber-700 text-base mt-0.5" aria-hidden>⚠</span>
      <div className="text-xs">
        <div className="font-semibold text-ink-primary mb-0.5">
          Auto-promoted {daysAgo === 0 ? 'just now' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}
        </div>
        <div className="text-ink-secondary">
          Originally tiered as: {originalLabel}. Health degraded → 2+ red signals → moved to Churn Watch tier.
        </div>
      </div>
    </div>
  );
}

// =====================
// Routing section
// =====================

function RoutingSection({ customer }: { customer: Customer }) {
  const csmSeniority = customer.owners.accountOwner.seniority;
  const csmDisplay =
    csmSeniority === 'named' ? 'Named senior CSM' :
    csmSeniority === 'pooled' ? 'Pooled CSM' :
    'Omnipresent CSM (handover not started)';

  return (
    <div>
      <SectionHeading>Routing</SectionHeading>

      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink-primary">
          CSM (Account Owner)
        </span>
        <span className="text-xs text-ink-tertiary">{csmDisplay}</span>
      </div>

      {customer.routingState && customer.routingState.length > 0 ? (
        <ul className="space-y-2">
          {customer.routingState.map((r, idx) => (
            <RoutingRow key={idx} state={r} />
          ))}
        </ul>
      ) : (
        <div className="text-xs text-ink-tertiary">
          {customer.specialistsEngaged.length > 0
            ? `Routes to: ${customer.specialistsEngaged.map((s) =>
                s.countrySpecialty
                  ? `${formatType(s.type)} (${s.countrySpecialty})`
                  : formatType(s.type)
              ).join(', ')}`
            : 'No active routing.'}
        </div>
      )}

      {(customer.owners.retentionSpecialistPaired ||
        customer.owners.crossFunctionalEscalationActive) && (
        <div className="mt-3 pt-3 border-t border-border-soft space-y-1">
          {customer.owners.retentionSpecialistPaired && (
            <div className="text-xs text-health-amber font-medium">
              · Retention specialist paired
            </div>
          )}
          {customer.owners.crossFunctionalEscalationActive && (
            <div className="text-xs text-health-red font-medium">
              · Cross-functional escalation channel active
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoutingRow({ state }: { state: RoutingState }) {
  const waitingLabel =
    state.waitingOn === 'customer' ? 'Waiting on customer' :
    state.waitingOn === 'deel_internal' ? 'Waiting on Deel internal' :
    state.waitingOn === 'third_party' ? 'Waiting on third party' :
    null;

  const waitingColor =
    state.waitingOn === 'customer' ? 'text-health-amber' :
    state.waitingOn === 'deel_internal' ? 'text-accent' :
    state.waitingOn === 'third_party' ? 'text-ink-tertiary' :
    'text-ink-tertiary';

  return (
    <li className="text-xs">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-ink-primary font-medium">{state.role}</span>
        {waitingLabel && state.waitingSinceDays !== undefined && (
          <span className={`${waitingColor} font-mono`}>
            {waitingLabel} · {state.waitingSinceDays}d
          </span>
        )}
      </div>
      <div className="text-ink-secondary">
        {state.reason}
      </div>
      {state.lastAction && (
        <div className="text-ink-tertiary mt-0.5 italic">
          Last: {state.lastAction}
        </div>
      )}
      {state.nextActionOwner && (
        <div className="text-ink-tertiary mt-0.5">
          Next: {state.nextActionOwner}
        </div>
      )}
    </li>
  );
}

function formatType(type: string): string {
  return type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// =====================
// Actions section
// =====================

export function ActionsSection({ customer }: { customer: Customer }) {
  return (
    <div>
      <SectionHeading>
        Active actions ({customer.activeActions.length})
      </SectionHeading>
      <ul className="space-y-2">
        {customer.activeActions.map((action) => (
          <ActionRow key={action.id} action={action} />
        ))}
      </ul>
    </div>
  );
}

function ActionRow({ action }: { action: Action }) {
  const stateBadgeColor =
    action.state === 'BLOCKED_BUT_DRIVEN' ? 'bg-health-red/10 text-health-red' :
    action.state === 'ESCALATING' ? 'bg-health-amber/10 text-health-amber' :
    'bg-health-green/10 text-health-green';

  const stateBadgeLabel =
    action.state === 'BLOCKED_BUT_DRIVEN' ? 'BLOCKED' :
    action.state === 'ESCALATING' ? 'ESCALATING' :
    'ACTIVE';

  const blockerLabel = action.blockerCategory
    ? action.blockerCategory.replace('_', ' ').toLowerCase()
    : null;

  return (
    <li className="flex items-start gap-3 py-1">
      <span className={`
        text-xs font-semibold px-1.5 py-0.5 rounded
        ${stateBadgeColor} flex-shrink-0
      `}>
        {stateBadgeLabel}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink-primary">{action.description}</div>
        <div className="text-xs text-ink-tertiary mt-0.5 font-mono">
          Day {action.ageDays}
          {blockerLabel && ` · ${blockerLabel}`}
          {action.fiveDayBoundaryBreach && ' · ⚠ past 5d'}
          {action.ownerRole && ` · ${action.ownerRole}`}
        </div>
      </div>
    </li>
  );
}

// =====================
// Health section
// =====================

export function HealthSection({ customer }: { customer: Customer }) {
  const signals = [
    { label: 'Responsiveness', value: customer.health.responsiveness, key: 'responsiveness' as const },
    { label: 'Tickets', value: customer.health.ticketVolume, key: 'ticketVolume' as const },
    { label: 'Milestone', value: customer.health.milestoneProgress, key: 'milestoneProgress' as const },
    { label: 'Stakeholder', value: customer.health.stakeholderEngagement, key: 'stakeholderEngagement' as const },
  ];

  return (
    <div>
      <SectionHeading>Health</SectionHeading>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {signals.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-2"
            title={customer.health.notes[s.key] || ''}
          >
            <span className="text-xs text-ink-secondary flex-1">{s.label}</span>
            <HealthDot signal={s.value} />
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================
// Escalation section
// =====================

function EscalationSection({ events }: { events: EscalationEvent[] }) {
  return (
    <div>
      <SectionHeading>Active escalations</SectionHeading>
      <ul className="space-y-1">
        {events.map((event, idx) => (
          <li key={idx} className="text-xs">
            <span className="font-medium text-ink-primary">
              Tier {event.tier}: {event.targetRole}
            </span>
            <span className="text-ink-tertiary ml-2">
              · Triggered {event.triggeredDaysAgo}d ago
            </span>
            <span className={`ml-2 font-medium ${
              event.acknowledgementState === 'acknowledged' ? 'text-health-green' :
              event.acknowledgementState === 'pending' ? 'text-health-amber' :
              'text-ink-tertiary'
            }`}>
              · {event.acknowledgementState}
            </span>
            <div className="text-ink-secondary mt-0.5">{event.triggeredBy}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =====================
// Helpers
// =====================

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-wider text-ink-tertiary font-semibold mb-2">
      {children}
    </h2>
  );
}
