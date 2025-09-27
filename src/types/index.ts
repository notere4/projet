export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cin: string; // Carte d'Identité Nationale
  dateOfBirth: string;
  phone: string;
  email?: string;
  address?: string;
  allergies?: string[];
  currentTreatments?: string[];
  lastConsultationReason?: string;
  createdAt: string;
  updatedAt: string;
  // API response fields
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  allergies_list?: string[];
  current_treatments_list?: string[];
  last_consultation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  isAvailable: boolean;
}

export interface QueueItem {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'waiting' | 'in_consultation' | 'completed';
  arrivalTime: string;
  calledTime?: string;
  completedTime?: string;
  priority: 'normal' | 'urgent';
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  observations: string;
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptions?: Prescription[];
  exams?: ExamRequest[];
  documents?: Document[];
  status: 'in_progress' | 'completed';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface ExamRequest {
  id: string;
  type: string;
  description: string;
  urgent: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  type: 'doctor_available' | 'patient_ready' | 'urgent' | 'info';
  title: string;
  message: string;
  doctorId?: string;
  patientId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'secretary' | 'doctor';
  specialty?: string; // For doctors
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
}