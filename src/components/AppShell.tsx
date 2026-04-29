import { TopBar } from './TopBar';
import { Queue } from './Queue';
import { DetailPlaceholder } from './DetailPlaceholder';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-bg-canvas">
      <TopBar />
      <div className="flex flex-row flex-1 min-h-0">
        <aside className="w-[360px] border-r border-border-default bg-bg-canvas overflow-y-auto">
          <Queue />
        </aside>
        <main className="flex-1 bg-bg-canvas overflow-y-auto">
          <DetailPlaceholder />
        </main>
      </div>
    </div>
  );
}
