import { useApp } from '../state/AppContext';
import { useCustomers } from '../hooks/useCustomers';

export function DetailPlaceholder() {
  const { state } = useApp();
  const customers = useCustomers();

  const selected =
    state.selectedAccountId !== null
      ? customers.find((c) => c.id === state.selectedAccountId)
      : null;

  return (
    <div className="p-6 text-sm text-ink-secondary">
      {selected
        ? `Selected: ${selected.name} (detail pane content goes here)`
        : 'No account selected.'}
    </div>
  );
}
