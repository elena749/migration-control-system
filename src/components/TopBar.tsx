import { useApp, type Role } from '../state/AppContext';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'csm', label: 'CSM' },
  { value: 'implementation_manager', label: 'Implementation Manager' },
  { value: 'ghostbuster', label: 'Ghostbuster' },
];

export function TopBar() {
  const { state, dispatch } = useApp();

  const demoDisabled =
    state.northwindFlipped || state.northwindFlipInProgress;

  const demoLabel = state.northwindFlipped
    ? 'Northwind degradation simulated'
    : state.northwindFlipInProgress
      ? 'Simulating…'
      : 'Simulate Northwind degradation';

  function handleDemoClick() {
    dispatch({ type: 'START_NORTHWIND_FLIP' });

    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_TICKETS', payload: 'amber' }),
      200,
    );
    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_TICKETS', payload: 'red' }),
      400,
    );

    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_MILESTONE', payload: 'amber' }),
      800,
    );
    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_MILESTONE', payload: 'red' }),
      1000,
    );

    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_STAKEHOLDER', payload: 'amber' }),
      1400,
    );
    setTimeout(
      () => dispatch({ type: 'FLIP_NORTHWIND_STAKEHOLDER', payload: 'red' }),
      1600,
    );
    setTimeout(() => dispatch({ type: 'SHOW_NORTHWIND_BANNER' }), 1600);

    setTimeout(() => dispatch({ type: 'COMPLETE_NORTHWIND_FLIP' }), 2200);
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
      <div className="text-sm font-normal text-neutral-500 tracking-tight">
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
          {demoLabel}
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
