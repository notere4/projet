import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, CheckCircle, AlertCircle, Info, User } from 'lucide-react';

export function NotificationCenter() {
  const { state, dispatch } = useAppContext();
  const recentNotifications = state.notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'doctor_available':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'patient_ready':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseClasses = isRead ? 'bg-gray-50' : 'bg-white border-l-4';
    
    if (isRead) return baseClasses;

    switch (type) {
      case 'doctor_available':
        return `${baseClasses} border-l-green-400`;
      case 'urgent':
        return `${baseClasses} border-l-red-400`;
      default:
        return `${baseClasses} border-l-blue-400`;
    }
  };

  const markAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  if (recentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          Notifications récentes
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {recentNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 ${getNotificationColor(notification.type, notification.isRead)} transition-colors`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                  {notification.message}
                </p>
                
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}