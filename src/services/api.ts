// API service for Django backend integration
const API_BASE_URL = 'http://localhost:8000/api';

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API client class
class ApiClient {
  private baseURL: string;
  private csrfToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Get CSRF token for Django
  async getCSRFToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    
    try {
      const response = await fetch(`${this.baseURL}/auth/login/`, {
        credentials: 'include',
      });
      const csrfToken = this.getCookieValue('csrftoken');
      if (csrfToken) {
        this.csrfToken = csrfToken;
        return csrfToken;
      }
    } catch (error) {
      console.warn('Could not get CSRF token:', error);
    }
    return '';
  }

  private getCookieValue(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get CSRF token for POST/PUT/DELETE requests
    const csrfToken = await this.getCSRFToken();
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      defaultHeaders['X-CSRFToken'] = csrfToken;
    }

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${options.method || 'GET'} ${url}`, error);
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Patient API methods
export const patientApi = {
  // Get all patients
  getAll: () => apiClient.get<PaginatedResponse<any>>('/patients/'),
  
  // Get patient by ID
  getById: (id: string) => apiClient.get<any>(`/patients/${id}/`),
  
  // Search patient by CIN
  searchByCIN: (cin: string) => apiClient.get<any>(`/patients/search_by_cin/?cin=${cin}`),
  
  // Advanced search
  advancedSearch: (searchData: {
    cin?: string;
    name?: string;
    phone?: string;
  }) => apiClient.post<any[]>('/patients/advanced_search/', searchData),
  
  // Create patient
  create: (patientData: any) => apiClient.post<any>('/patients/', patientData),
  
  // Update patient
  update: (id: string, patientData: any) => apiClient.put<any>(`/patients/${id}/`, patientData),
  
  // Delete patient
  delete: (id: string) => apiClient.delete<void>(`/patients/${id}/`),
  
  // Get consultation history
  getConsultationHistory: (id: string) => apiClient.get<any>(`/patients/${id}/consultation_history/`),
};

// Doctor API methods
export const doctorApi = {
  // Get all doctors
  getAll: () => apiClient.get<any[]>('/patients/doctors/'),
  
  // Get available doctors
  getAvailable: () => apiClient.get<any[]>('/patients/doctors/available/'),
  
  // Toggle doctor availability
  toggleAvailability: (id: string) => apiClient.post<any>(`/patients/doctors/${id}/toggle_availability/`),
};

// Queue API methods
export const queueApi = {
  // Get all queue items
  getAll: () => apiClient.get<any[]>('/queue/'),
  
  // Get waiting patients
  getWaiting: () => apiClient.get<any[]>('/queue/waiting/'),
  
  // Get patients in consultation
  getInConsultation: () => apiClient.get<any[]>('/queue/in_consultation/'),
  
  // Get urgent patients
  getUrgent: () => apiClient.get<any[]>('/queue/urgent/'),
  
  // Add patient to queue
  addToQueue: (queueData: any) => apiClient.post<any>('/queue/', queueData),
  
  // Call patient for consultation
  callPatient: (id: string) => apiClient.post<any>(`/queue/${id}/call_patient/`),
  
  // Complete consultation
  completeConsultation: (id: string) => apiClient.post<any>(`/queue/${id}/complete_consultation/`),
  
  // Reassign patient to another doctor
  reassignDoctor: (id: string, doctorId: string) => 
    apiClient.post<any>(`/queue/${id}/reassign_doctor/`, { doctor_id: doctorId }),
  
  // Get queue statistics
  getStats: () => apiClient.get<any>('/queue/stats/'),
};

// Consultation API methods
export const consultationApi = {
  // Get all consultations
  getAll: () => apiClient.get<any[]>('/consultations/'),
  
  // Get consultations in progress
  getInProgress: () => apiClient.get<any[]>('/consultations/in_progress/'),
  
  // Get consultations by patient
  getByPatient: (patientId: string) => 
    apiClient.get<any[]>(`/consultations/by_patient/?patient_id=${patientId}`),
  
  // Create consultation
  create: (consultationData: any) => apiClient.post<any>('/consultations/', consultationData),
  
  // Update consultation
  update: (id: string, consultationData: any) => 
    apiClient.put<any>(`/consultations/${id}/`, consultationData),
  
  // Complete consultation
  complete: (id: string) => apiClient.post<any>(`/consultations/${id}/complete/`),
  
  // Add prescription
  addPrescription: (id: string, prescriptionData: any) => 
    apiClient.post<any>(`/consultations/${id}/add_prescription/`, prescriptionData),
  
  // Add exam request
  addExamRequest: (id: string, examData: any) => 
    apiClient.post<any>(`/consultations/${id}/add_exam_request/`, examData),
};

// Notification API methods
export const notificationApi = {
  // Get all notifications
  getAll: () => apiClient.get<any[]>('/queue/notifications/'),
  
  // Get unread notifications
  getUnread: () => apiClient.get<any[]>('/queue/notifications/unread/'),
  
  // Mark notification as read
  markRead: (id: string) => apiClient.post<any>(`/queue/notifications/${id}/mark_read/`),
  
  // Mark all notifications as read
  markAllRead: () => apiClient.post<any>('/queue/notifications/mark_all_read/'),
};

// Authentication API methods
export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    // For Django session authentication, we'll use a simple approach
    // In a real app, you might want to implement proper token authentication
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: email, password }),
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },
};