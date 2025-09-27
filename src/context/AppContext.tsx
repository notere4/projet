import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Patient, Doctor, QueueItem, Consultation, Notification } from '../types';
import { useAuth } from './AuthContext';

interface AppState {
  patients: Patient[];
  doctors: Doctor[];
  queue: QueueItem[];
  consultations: Consultation[];
  notifications: Notification[];
  selectedDoctorId?: string;
  selectedPatient?: Patient;
  currentConsultation?: Consultation;
}

type AppAction = 
  | { type: 'SET_SELECTED_DOCTOR'; payload: string }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'ADD_TO_QUEUE'; payload: QueueItem }
  | { type: 'UPDATE_QUEUE_ITEM'; payload: QueueItem }
  | { type: 'SEND_PATIENT_TO_DOCTOR'; payload: { queueItemId: string; patientId: string } }
  | { type: 'START_CONSULTATION'; payload: Consultation }
  | { type: 'UPDATE_CONSULTATION'; payload: Consultation }
  | { type: 'COMPLETE_CONSULTATION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_SELECTED_PATIENT'; payload: Patient | undefined };

const initialState: AppState = {
  patients: [
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dubois',
      dateOfBirth: '1985-03-15',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      allergies: ['Pénicilline', 'Arachides'],
      currentTreatments: ['Doliprane 1000mg'],
      lastConsultationReason: 'Grippe saisonnière',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      firstName: 'Jean',
      lastName: 'Martin',
      dateOfBirth: '1970-07-22',
      phone: '06 98 76 54 32',
      email: 'jean.martin@email.com',
      allergies: [],
      currentTreatments: ['Tension'],
      lastConsultationReason: 'Contrôle tension',
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-14T14:30:00Z'
    }
  ],
  doctors: [
    {
      id: 'doc1',
      firstName: 'Dr. Sophie',
      lastName: 'Martin',
      specialty: 'Médecine Générale',
      isAvailable: true
    },
    {
      id: 'doc2',
      firstName: 'Dr. Pierre',
      lastName: 'Durand',
      specialty: 'Médecine Générale',
      isAvailable: false
    }
  ],
  queue: [
    {
      id: 'q1',
      patientId: '1',
      doctorId: 'doc1',
      status: 'waiting',
      arrivalTime: new Date().toISOString(),
      priority: 'normal'
    },
    {
      id: 'q2',
      patientId: '2',
      doctorId: 'doc1',
      status: 'waiting',
      arrivalTime: new Date(Date.now() - 300000).toISOString(),
      priority: 'normal'
    }
  ],
  consultations: [],
  notifications: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SELECTED_DOCTOR':
      return { ...state, selectedDoctorId: action.payload };
    
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload]
      };
    
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload]
      };
    
    case 'UPDATE_QUEUE_ITEM':
      return {
        ...state,
        queue: state.queue.map(q => 
          q.id === action.payload.id ? action.payload : q
        )
      };
    
    case 'SEND_PATIENT_TO_DOCTOR':
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      return {
        ...state,
        queue: state.queue.map(q => 
          q.id === action.payload.queueItemId 
            ? { ...q, status: 'in_consultation' as const, calledTime: new Date().toISOString() }
            : q
        ),
        selectedPatient: patient,
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            type: 'patient_ready',
            title: 'Nouveau patient',
            message: `${patient?.firstName} ${patient?.lastName} est envoyé en consultation`,
            patientId: action.payload.patientId,
            timestamp: new Date().toISOString(),
            isRead: false
          }
        ]
      };
    
    case 'START_CONSULTATION':
      return {
        ...state,
        consultations: [...state.consultations, action.payload],
        currentConsultation: action.payload
      };
    
    case 'UPDATE_CONSULTATION':
      return {
        ...state,
        consultations: state.consultations.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
        currentConsultation: action.payload
      };
    
    case 'COMPLETE_CONSULTATION':
      const completedQueue = state.queue.find(q => 
        q.patientId === state.selectedPatient?.id && q.status === 'in_consultation'
      );
      
      return {
        ...state,
        queue: state.queue.map(q => 
          q.patientId === state.selectedPatient?.id && q.status === 'in_consultation'
            ? { ...q, status: 'completed' as const, completedTime: new Date().toISOString() }
            : q
        ),
        consultations: state.consultations.map(c => 
          c.id === action.payload ? { ...c, status: 'completed' as const } : c
        ),
        selectedPatient: undefined,
        currentConsultation: undefined,
        doctors: state.doctors.map(d => 
          d.id === completedQueue?.doctorId ? { ...d, isAvailable: true } : d
        ),
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            type: 'doctor_available',
            title: 'Médecin disponible',
            message: `Le médecin est libre pour le prochain patient`,
            doctorId: completedQueue?.doctorId,
            timestamp: new Date().toISOString(),
            isRead: false
          }
        ]
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, isRead: true } : n
        )
      };
    
    case 'SET_SELECTED_PATIENT':
      return {
        ...state,
        selectedPatient: action.payload
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}