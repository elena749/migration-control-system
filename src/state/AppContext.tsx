import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

export type Role =
  | 'migration_lead'
  | 'csm'
  | 'ae'
  | 'specialist'
  | 'function_lead'
  | 'vp_operations';

export interface AppState {
  selectedRole: Role;
  selectedAccountId: number | null;
  northwindFlipped: boolean;
  northwindFlipInProgress: boolean;
}

export type AppAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: number | null }
  | { type: 'START_NORTHWIND_FLIP' }
  | { type: 'COMPLETE_NORTHWIND_FLIP' }
  | { type: 'RESET_DEMO' };

export const initialState: AppState = {
  selectedRole: 'migration_lead',
  selectedAccountId: 2, // Halfbrick
  northwindFlipped: false,
  northwindFlipInProgress: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, selectedRole: action.payload };
    case 'SET_SELECTED_ACCOUNT':
      return { ...state, selectedAccountId: action.payload };
    case 'START_NORTHWIND_FLIP':
      return { ...state, northwindFlipInProgress: true };
    case 'COMPLETE_NORTHWIND_FLIP':
      return {
        ...state,
        northwindFlipInProgress: false,
        northwindFlipped: true,
      };
    case 'RESET_DEMO':
      return initialState;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
