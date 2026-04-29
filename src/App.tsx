import { customers } from './data/customers';

export default function App() {
  return (
    <div className="p-8 text-ink-primary bg-bg-canvas font-sans min-h-screen">
      <h1 className="text-xl font-semibold">Migration Control System</h1>
      <p className="mt-2 text-ink-secondary">
        Scaffolding complete. {customers.length} customers loaded.
      </p>
    </div>
  );
}
