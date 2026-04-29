import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { HealthSignal } from '../data/customers';

export type Role = 'csm' | 'implementation_manager' | 'ghostbuster';

export interface NorthwindFlipProgress {
  ticketsState: HealthSignal;
  milestoneState: HealthSignal;
  stakeholderState: HealthSignal;
  bannerVisible: boolean;
}

export interface AppState {
  selectedRole: Role;
  selectedAccountId: number | null;
  northwindFlipped: boolean;
  northwindFlipInProgress: boolean;
  northwindFlipProgress: NorthwindFlipProgress;
}

export type AppAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: number | null }
  | { type: 'START_NORTHWIND_FLIP' }
  | { type: 'COMPLETE_NORTHWIND_FLIP' }
  | { type: 'FLIP_NORTHWIND_TICKETS'; payload: 'amber' | 'red' }
  | { type: 'FLIP_NORTHWIND_MILESTONE'; payload: 'amber' | 'red' }
  | { type: 'FLIP_NORTHWIND_STAKEHOLDER'; payload: 'amber' | 'red' }
  | { type: 'SHOW_NORTHWIND_BANNER' }
  | { type: 'RESET_DEMO' };

const initialFlipProgress: NorthwindFlipProgress = {
  ticketsState: 'green',
  milestoneState: 'green',
  stakeholderState: 'green',
  bannerVisible: false,
};

export const initialState: AppState = {
  selectedRole: 'csm',
  selectedAccountId: 2,
  northwindFlipped: false,
  northwindFlipInProgress: false,
  northwindFlipProgress: initialFlipProgress,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, selectedRole: action.payload };
    case 'SET_SELECTED_ACCOUNT':
      return { ...state, selectedAccountId: action.payload };
    case 'START_NORTHWIND_FLIP':
      return {
        ...state,
        northwindFlipInProgress: true,
        northwindFlipProgress: { ...initialFlipProgress },
      };
    case 'COMPLETE_NORTHWIND_FLIP':
      return {
        ...state,
        northwindFlipInProgress: false,
        northwindFlipped: true,
      };
    case 'FLIP_NORTHWIND_TICKETS':
      return {
        ...state,
        northwindFlipProgress: {
          ...state.northwindFlipProgress,
          ticketsState: action.payload,
        },
      };
    case 'FLIP_NORTHWIND_MILESTONE':
      return {
        ...state,
        northwindFlipProgress: {
          ...state.northwindFlipProgress,
          milestoneState: action.payload,
        },
      };
    case 'FLIP_NORTHWIND_STAKEHOLDER':
      return {
        ...state,
        northwindFlipProgress: {
          ...state.northwindFlipProgress,
          stakeholderState: action.payload,
        },
      };
    case 'SHOW_NORTHWIND_BANNER':
      return {
        ...state,
        northwindFlipProgress: {
          ...state.northwindFlipProgress,
          bannerVisible: true,
        },
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
