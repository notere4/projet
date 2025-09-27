import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, Stethoscope, Bell, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state } = useAppContext();
  const { state: authState, logout } = useAuth();
  const unreadNotifications = state.notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">CabinetFlow</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
              
              {/* User Info & Logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {authState.currentUser?.role === 'secretary' ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {authState.currentUser?.firstName} {authState.currentUser?.lastName}
                    </div>
                    <div className="text-gray-500">
                      {authState.currentUser?.role === 'secretary' ? 'Secrétariat' : 'Médecin'}
                      {authState.currentUser?.specialty && ` - ${authState.currentUser.specialty}`}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}