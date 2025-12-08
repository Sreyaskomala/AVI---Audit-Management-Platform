
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { XIcon } from './icons/XIcon';
import { Notification } from '../types';

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
    CAR_DUE: <AlertTriangleIcon className="h-4 w-4 text-white" />,
    AUDIT_UPCOMING: <ClockIcon className="h-4 w-4 text-white" />,
    CAR_SUBMITTED: <FileTextIcon className="h-4 w-4 text-white" />,
    FINDING_DUE: <AlertTriangleIcon className="h-4 w-4 text-white" />,
    EXTENSION_REQUEST: <ClockIcon className="h-4 w-4 text-white" />,
    CAR_REJECTED: <XIcon className="h-4 w-4 text-white" />,
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

    if (!isNotificationDrawerOpen) return null;

    return (
        <>
            {/* Transparent Backdrop to detect outside clicks */}
            <div 
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={toggleNotificationDrawer}
            ></div>

            {/* Floating Popup */}
            <div 
                className="fixed top-16 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Notifications</h2>
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {notifications.length}
                    </span>
                </div>

                <div className="overflow-y-auto p-2 space-y-2">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications.</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification.type)}
                                className="flex items-start p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                            >
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${notificationColors[notification.type]}`}>
                                    {notificationIcons[notification.type]}
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug group-hover:text-primary transition-colors">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDrawer;
