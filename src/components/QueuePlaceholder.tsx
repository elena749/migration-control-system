import { useCustomers } from '../hooks/useCustomers';

export function QueuePlaceholder() {
  const customers = useCustomers();
  return (
    <div className="p-6 text-sm text-ink-secondary">
      Queue: {customers.length} accounts (left rail content goes here)
    </div>
  );
}
