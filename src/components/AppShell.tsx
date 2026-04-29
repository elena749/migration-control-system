import { TopBar } from './TopBar';
import { MorningBrief } from './MorningBrief';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-bg-canvas">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <MorningBrief />
      </main>
    </div>
  );
}
