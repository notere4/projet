import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, AuthState } from '../types';

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  loading: false
};

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: 'sec1',
    email: 'secretaire@cabinet.fr',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'secretary',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'doc1',
    email: 'dr.martin@cabinet.fr',
    firstName: 'Dr. Sophie',
    lastName: 'Martin',
    role: 'doctor',
    specialty: 'Médecine Générale',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'doc2',
    email: 'dr.durand@cabinet.fr',
    firstName: 'Dr. Pierre',
    lastName: 'Durand',
    role: 'doctor',
    specialty: 'Médecine Générale',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload,
        loading: false
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
        loading: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
        loading: false
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'password123') { // Mock password
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}