import { useApp } from '../state/AppContext';
import { useCustomers } from '../hooks/useCustomers';
import { filterCustomersByRole } from '../utils/roleFilters';
import { sortByRoleAttention } from '../utils/queueLogic';
import { AccountCard } from './AccountCard';

export function MorningBrief() {
  const { state } = useApp();
  const customers = useCustomers();

  const visibleCustomers = filterCustomersByRole(customers, state.selectedRole);
  const sortedCustomers = sortByRoleAttention(visibleCustomers, state.selectedRole);

  // Pulsing rule based on visible red customers
  const redCount = visibleCustomers.filter((c) => c.health.overall === 'red').length;
  const pulsingEnabled = redCount <= 3;

  if (visibleCustomers.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-sm text-ink-secondary">
          No accounts in your morning brief.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <BriefHeader
        accountCount={visibleCustomers.length}
        redCount={redCount}
      />

      <div className="space-y-3">
        {sortedCustomers.map((customer) => (
          <AccountCard
            key={customer.id}
            customer={customer}
            pulsingEnabled={pulsingEnabled}
          />
        ))}
      </div>
    </div>
  );
}

function BriefHeader({ accountCount, redCount }: { accountCount: number; redCount: number }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mb-6 pb-4 border-b border-border-default">
      <div className="text-xs uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
        Morning Brief — {today}
      </div>
      <div className="text-lg font-semibold text-ink-primary">
        {accountCount} account{accountCount === 1 ? '' : 's'} in your brief
        {redCount > 0 && (
          <span className="text-health-red font-medium ml-2">
            · {redCount} need{redCount === 1 ? 's' : ''} attention today
          </span>
        )}
      </div>
    </div>
  );
}
