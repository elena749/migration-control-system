/**
 * Layer 7 — Next Move Directive Generation
 *
 * Converts a customer's state into a single-sentence directive.
 * Computed at render time, not stored. The directive cannot drift
 * from the underlying state.
 */

import type { Customer, Action, ActionState } from '../data/customers';

// =====================
// Public API
// =====================

export interface Directive {
  text: string;
  ownerSummary: string; // "CSM owns. Routing: ..." short summary line
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Generate the Next Move directive for a customer.
 * This is the single source of truth for "what should happen next on this account."
 */
export function nextMoveForCustomer(customer: Customer): Directive {
  // 1. Healthy + no actions
  if (
    customer.health.overall === 'green' &&
    customer.activeActions.length === 0
  ) {
    return {
      text: 'No action required. Re-check at next scheduled health review.',
      ownerSummary: 'CSM monitoring (no active routing).',
      urgency: 'low',
    };
  }

  // 2. Cross-functional escalation past 7d on active escalating actions
  const longEscalations = customer.activeActions.filter(
    (a) => a.state === 'ESCALATING' && a.ageDays >= 7,
  );
  if (longEscalations.length > 0) {
    const a = longEscalations[0];
    return {
      text: `Escalation past 7-day boundary on ${a.description.toLowerCase()}. Ghostbuster intervention recommended. COO awareness required.`,
      ownerSummary: 'Ghostbuster engagement triggered. CSM remains account owner.',
      urgency: 'critical',
    };
  }

  // 3. Auto-promoted accounts — frame around the retention play
  if (
    customer.tierTransition === 'auto_promoted' &&
    customer.tierTransitionDayOffset !== undefined &&
    customer.tierTransitionDayOffset >= -30
  ) {
    const daysAgo = Math.abs(customer.tierTransitionDayOffset);
    const channelStatus = customer.owners.crossFunctionalEscalationActive
      ? 'active'
      : 'standby';

    // If the auto-promoted account also has a most-pressing blocked action,
    // surface that in the directive instead of the general retention frame
    const mostPressing = mostPressingAction(customer.activeActions);
    if (
      mostPressing &&
      (mostPressing.state === 'BLOCKED_BUT_DRIVEN' ||
        mostPressing.fiveDayBoundaryBreach)
    ) {
      return directiveForAction(mostPressing);
    }

    return {
      text: `Account auto-promoted ${daysAgo} days ago. Retention play active. CSM driving exec sponsor engagement and unblocking compounding actions. Cross-functional channel ${channelStatus}.`,
      ownerSummary:
        'CSM owns retention. Routing: AE (commercial), Implementation Lead, engaged specialists.',
      urgency: 'high',
    };
  }

  // 4. Track B quote SLA pressure (< 3 days remaining)
  if (customer.quoteSLA?.active && customer.quoteSLA.state === 'pending') {
    const daysLeft = customer.quoteSLA.daysUntilDeadline;
    if (daysLeft <= 3) {
      const countries = customer.quoteSLA.affectedCountries.join(', ');
      return {
        text: `Track B re-quote pending customer response on ${countries}. ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining on 7-day window. AE prepares fall-through plan by EOD if no response within 48h.`,
        ownerSummary: 'AE owns commercial decision. CSM coordinates customer comms.',
        urgency: daysLeft <= 1 ? 'critical' : 'high',
      };
    }
  }

  // 5. Customer-facing SLA breaching 50% of window
  if (
    customer.customerFacingSLA.active &&
    customer.customerFacingSLA.hoursElapsed >=
      customer.customerFacingSLA.responseWindowHours * 0.5
  ) {
    return {
      text: `Customer-facing SLA active (${customer.customerFacingSLA.hoursElapsed} hours into ${customer.customerFacingSLA.responseWindowHours}h window). CSM drives response by EOD.`,
      ownerSummary: 'CSM owns customer response.',
      urgency: 'high',
    };
  }

  // 6. Most pressing active action determines the directive
  const mostPressing = mostPressingAction(customer.activeActions);
  if (mostPressing) {
    return directiveForAction(mostPressing);
  }

  // 7. Fallback — has actions but none pressing, in steady management
  return {
    text: 'Account in active migration. Standard health monitoring active.',
    ownerSummary: 'CSM monitoring. Routing engaged per active workstreams.',
    urgency: 'low',
  };
}

// =====================
// Helpers
// =====================

function mostPressingAction(actions: Action[]): Action | null {
  if (actions.length === 0) return null;

  return actions.slice().sort((a, b) => {
    const aBreach = a.fiveDayBoundaryBreach ? 1 : 0;
    const bBreach = b.fiveDayBoundaryBreach ? 1 : 0;
    if (aBreach !== bBreach) return bBreach - aBreach;

    const stateRank: Record<ActionState, number> = {
      BLOCKED_BUT_DRIVEN: 3,
      ESCALATING: 2,
      ACTING: 1,
    };
    if (stateRank[a.state] !== stateRank[b.state]) {
      return stateRank[b.state] - stateRank[a.state];
    }

    return b.ageDays - a.ageDays;
  })[0];
}

function directiveForAction(action: Action): Directive {
  const desc = action.description.toLowerCase();
  const owner = action.ownerRole;
  const by = action.nextMoveBy ?? defaultNextMoveBy(action);

  if (action.state === 'ESCALATING') {
    if (action.ageDays >= 5 && action.ageDays < 7) {
      return {
        text: `Escalation aging — ${action.ageDays} days in cross-functional channel on ${desc}. Head of CS engagement recommended by ${by}.`,
        ownerSummary: `${owner} drives. CSM oversees. Head of CS visibility required.`,
        urgency: 'high',
      };
    }
    return {
      text: `${owner} actively driving cross-functional resolution on ${desc}. Status update to CSM by ${by}.`,
      ownerSummary: `${owner} drives. CSM owns account, monitors progress.`,
      urgency: 'medium',
    };
  }

  if (action.state === 'BLOCKED_BUT_DRIVEN') {
    if (action.blockerCategory === 'CUSTOMER_SIDE') {
      if (action.ageDays >= 5) {
        return {
          text: `Customer-side blocker past 5-day boundary on ${desc}. Engage customer exec sponsor today. CSM Manager engagement required if no resolution by EOD.`,
          ownerSummary: `${owner} drives. CSM escalates to exec sponsor and CSM Manager.`,
          urgency: 'critical',
        };
      }
      if (action.ageDays >= 3) {
        return {
          text: `Customer-side blocker ${action.ageDays} days old on ${desc}. Escalate to customer exec sponsor by ${by} if ${owner} cannot unstick.`,
          ownerSummary: `${owner} drives. CSM coordinates exec sponsor escalation.`,
          urgency: 'high',
        };
      }
      return {
        text: `Drive customer-side response on ${desc} by ${by}. ${owner} owns. CSM coordinates.`,
        ownerSummary: `${owner} drives. CSM coordinates customer-side communication.`,
        urgency: 'medium',
      };
    }

    if (action.blockerCategory === 'DEEL_INTERNAL') {
      return {
        text: `Deel-internal blocker on ${desc}. ${owner} drives resolution. CSM escalates to function head by ${by} if not resolved.`,
        ownerSummary: `${owner} drives. CSM escalates internally if blocked.`,
        urgency: action.fiveDayBoundaryBreach ? 'critical' : 'high',
      };
    }

    if (action.blockerCategory === 'THIRD_PARTY') {
      return {
        text: `Third-party blocker on ${desc}. ${owner} drives partner coordination. Status update to CSM by ${by}.`,
        ownerSummary: `${owner} drives partner-side. CSM monitors timeline.`,
        urgency: action.fiveDayBoundaryBreach ? 'high' : 'medium',
      };
    }

    if (action.blockerCategory === 'LEGAL_COMPLIANCE') {
      return {
        text: `Legal/compliance review pending on ${desc}. ${owner} drives to position. CSM informs customer of expected timeline by ${by}.`,
        ownerSummary: `${owner} drives legal/compliance. CSM owns customer comms.`,
        urgency: 'medium',
      };
    }

    return {
      text: `Blocked on ${desc}. ${owner} drives resolution by ${by}.`,
      ownerSummary: `${owner} drives. CSM monitors.`,
      urgency: 'medium',
    };
  }

  // ACTING
  return {
    text: `Continue execution on ${desc}. ${owner} drives to completion by ${by}.`,
    ownerSummary: `${owner} drives. CSM monitors progress.`,
    urgency: 'low',
  };
}

function defaultNextMoveBy(action: Action): string {
  if (action.fiveDayBoundaryBreach) return 'EOD today';
  if (action.state === 'BLOCKED_BUT_DRIVEN' && action.ageDays >= 3)
    return 'EOD today';
  if (action.state === 'BLOCKED_BUT_DRIVEN') return 'EOD tomorrow';
  if (action.state === 'ESCALATING' && action.ageDays >= 5) return 'EOD today';
  if (action.state === 'ESCALATING') return 'within 48h';
  return 'this week';
}
