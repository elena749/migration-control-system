import { useApp, type Role } from '../state/AppContext';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'migration_lead', label: 'Migration Lead' },
  { value: 'csm', label: 'CSM' },
  { value: 'ae', label: 'AE' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'function_lead', label: 'Function Lead' },
  { value: 'vp_operations', label: 'VP Operations' },
];

export function TopBar() {
  const { state, dispatch } = useApp();

  const demoDisabled =
    state.northwindFlipped || state.northwindFlipInProgress;

  function handleDemoClick() {
    console.log('[demo] START_NORTHWIND_FLIP');
    dispatch({ type: 'START_NORTHWIND_FLIP' });
    window.setTimeout(() => {
      console.log('[demo] COMPLETE_NORTHWIND_FLIP');
      dispatch({ type: 'COMPLETE_NORTHWIND_FLIP' });
    }, 2200);
  }

  function handleResetClick() {
    const ok = window.confirm(
      'Reset demo to initial state? Any unsaved changes will be lost.',
    );
    if (ok) {
      console.log('[demo] RESET_DEMO');
      dispatch({ type: 'RESET_DEMO' });
    }
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    dispatch({ type: 'SET_ROLE', payload: e.target.value as Role });
  }

  return (
    <header
      className="flex items-center justify-between bg-bg-surface border-b border-border-default px-4"
      style={{ height: 56 }}
    >
      <div className="text-xl font-semibold text-ink-primary">
        Migration Control System
      </div>

      <div className="flex items-center gap-2 text-sm text-ink-secondary">
        <label htmlFor="role-select">Viewing as:</label>
        <select
          id="role-select"
          value={state.selectedRole}
          onChange={handleRoleChange}
          className="border border-border-default rounded-md px-2 py-1 bg-bg-surface text-ink-primary text-sm"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDemoClick}
          disabled={demoDisabled}
          className="border border-accent text-accent rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Simulate Northwind degradation
        </button>
        <button
          type="button"
          onClick={handleResetClick}
          className="text-accent text-sm font-medium px-2 py-1 hover:underline"
        >
          Reset demo
        </button>
      </div>
    </header>
  );
}
