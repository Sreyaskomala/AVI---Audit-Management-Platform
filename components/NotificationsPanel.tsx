
import React from 'react';
import { mockNotifications } from '../constants';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FileTextIcon } from './icons/FileTextIcon';

const notificationIcons = {
    CAR_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
    AUDIT_UPCOMING: <ClockIcon className="h-5 w-5 text-white" />,
    CAR_SUBMITTED: <FileTextIcon className="h-5 w-5 text-white" />,
    FINDING_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
};

const notificationColors = {
    CAR_DUE: 'bg-danger',
    AUDIT_UPCOMING: 'bg-blue-500',
    CAR_SUBMITTED: 'bg-green-500',
    FINDING_DUE: 'bg-yellow-500',
}

const NotificationsPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Notifications</h2>
      <div className="space-y-4">
        {mockNotifications.map(notification => (
          <div key={notification.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                {notificationIcons[notification.type]}
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-700">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 text-sm text-primary font-semibold hover:underline">
        View all notifications
      </button>
    </div>
  );
};

export default NotificationsPanel;
