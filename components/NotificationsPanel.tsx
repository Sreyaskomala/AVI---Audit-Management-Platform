
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { XIcon } from './icons/XIcon';
import { useAppContext } from '../contexts/AppContext';
import { Notification } from '../types';

export const notificationIcons: Record<Notification['type'], React.ReactNode> = {
    CAR_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
    AUDIT_UPCOMING: <ClockIcon className="h-5 w-5 text-white" />,
    CAR_SUBMITTED: <FileTextIcon className="h-5 w-5 text-white" />,
    FINDING_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
    EXTENSION_REQUEST: <ClockIcon className="h-5 w-5 text-white" />,
    CAR_REJECTED: <XIcon className="h-5 w-5 text-white" />,
};

export const notificationColors: Record<Notification['type'], string> = {
    CAR_DUE: 'bg-danger',
    AUDIT_UPCOMING: 'bg-info',
    CAR_SUBMITTED: 'bg-success',
    FINDING_DUE: 'bg-warning',
    EXTENSION_REQUEST: 'bg-purple-500',
    CAR_REJECTED: 'bg-red-600',
}

const NotificationsPanel: React.FC = () => {
    const { notifications, setCurrentPage, toggleNotificationDrawer } = useAppContext();
    
    // Show only the top 5 recent notifications in the dashboard panel
    const recentNotifications = notifications.slice(0, 5);

    const handleNotificationClick = (type: Notification['type']) => {
        switch (type) {
            case 'CAR_DUE':
            case 'FINDING_DUE':
            case 'CAR_REJECTED':
            case 'CAR_SUBMITTED':
            case 'EXTENSION_REQUEST':
                setCurrentPage('car-management');
                break;
            case 'AUDIT_UPCOMING':
                setCurrentPage('audit-reports');
                break;
            default:
                break;
        }
    };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Notifications & Reminders</h2>
      <div className="space-y-4 flex-1">
        {recentNotifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No new notifications.</p>
        ) : (
            recentNotifications.map(notification => (
            <div 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification.type)}
                className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transition-colors"
            >
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                    {notificationIcons[notification.type]}
                </div>
                <div className="ml-4 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time} • Email sent</p>
                </div>
            </div>
            ))
        )}
      </div>
      {notifications.length > 0 && (
        <button onClick={toggleNotificationDrawer} className="w-full mt-6 text-sm text-primary font-semibold hover:underline">
            View all history ({notifications.length})
        </button>
      )}
    </div>
  );
};

export default NotificationsPanel;
