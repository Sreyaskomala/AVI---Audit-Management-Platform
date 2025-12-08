
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { Notification } from '../types';

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
    CAR_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
    AUDIT_UPCOMING: <ClockIcon className="h-5 w-5 text-white" />,
    CAR_SUBMITTED: <FileTextIcon className="h-5 w-5 text-white" />,
    FINDING_DUE: <AlertTriangleIcon className="h-5 w-5 text-white" />,
    EXTENSION_REQUEST: <ClockIcon className="h-5 w-5 text-white" />,
    CAR_REJECTED: <XIcon className="h-5 w-5 text-white" />,
};

const notificationColors: Record<Notification['type'], string> = {
    CAR_DUE: 'bg-danger',
    AUDIT_UPCOMING: 'bg-info',
    CAR_SUBMITTED: 'bg-success',
    FINDING_DUE: 'bg-warning',
    EXTENSION_REQUEST: 'bg-purple-500',
    CAR_REJECTED: 'bg-red-600',
};

const NotificationDrawer: React.FC = () => {
    const { notifications, isNotificationDrawerOpen, toggleNotificationDrawer, setCurrentPage } = useAppContext();

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
        toggleNotificationDrawer();
    };

    return (
        <>
            {/* Backdrop */}
            {isNotificationDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={toggleNotificationDrawer}
                ></div>
            )}

            {/* Drawer */}
            <div 
                className={`fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    isNotificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Notifications</h2>
                    <button 
                        onClick={toggleNotificationDrawer} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                    {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No notifications.</p>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    onClick={() => handleNotificationClick(notification.type)}
                                    className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                                >
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                                        {notificationIcons[notification.type]}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDrawer;
