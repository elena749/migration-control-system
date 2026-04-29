import { AppProvider } from './state/AppContext';
import { AppShell } from './components/AppShell';

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
