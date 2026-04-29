import { customers, northwindPostFlipState, type Customer } from '../data/customers';
import { useApp } from '../state/AppContext';

const NORTHWIND_ID = 8;

export function useCustomers(): Customer[] {
  const { state } = useApp();

  if (!state.northwindFlipped) {
    return customers;
  }

  return customers.map((c) =>
    c.id === NORTHWIND_ID ? { ...c, ...northwindPostFlipState } : c,
  );
}
