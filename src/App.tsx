import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useAppContext } from './context/AppContext';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/Layout';
import { SecretaryDashboard } from './components/secretary/SecretaryDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';

function AppContent() {
  const { state: authState } = useAuth();
  const { state } = useAppContext();

  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      {authState.currentUser?.role === 'secretary' ? <SecretaryDashboard /> : <DoctorDashboard />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;