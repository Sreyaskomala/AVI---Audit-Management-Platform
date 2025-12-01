
import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { XIcon } from './icons/XIcon';
import { useAppContext } from '../contexts/AppContext';
import { Notification, UserRole, ExtensionStatus, FindingStatus } from '../types';

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
}

const NotificationsPanel: React.FC = () => {
    const { currentUser, audits, findings, cars } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        const generatedNotifications: Notification[] = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0); 

        const daysBetween = (date1: Date, date2: Date) => {
            const oneDay = 1000 * 60 * 60 * 24;
            const d1 = new Date(date1);
            d1.setHours(0,0,0,0);
            const d2 = new Date(date2);
            d2.setHours(0,0,0,0);
            const diffInTime = d2.getTime() - d1.getTime();
            return Math.ceil(diffInTime / oneDay);
        };
        
        // 1. CARs submitted for review (Auditor)
        if (currentUser.role === UserRole.Auditor) {
            cars.forEach(car => {
                const audit = audits.find(a => a.id === car.auditId);
                if (car.status === 'Pending Review' && audit?.auditorId === currentUser.id) {
                    generatedNotifications.push({
                        id: generatedNotifications.length + 1,
                        type: 'CAR_SUBMITTED',
                        message: `New CAR submitted for ${car.findingId}.`,
                        time: 'Just now'
                    });
                }
            });
            // Extension Requests
            findings.forEach(finding => {
                const audit = audits.find(a => a.id === finding.auditId);
                if (finding.extensionStatus === ExtensionStatus.Pending && audit?.auditorId === currentUser.id) {
                    generatedNotifications.push({
                         id: generatedNotifications.length + 1,
                         type: 'EXTENSION_REQUEST',
                         message: `Extension requested for Finding ${finding.customId || finding.id}.`,
                         time: 'Just now'
                    });
                }
            });
        }
        
        // 2. Upcoming Audits
        audits.forEach(audit => {
            const auditDate = new Date(audit.date);
            const daysUntil = daysBetween(now, auditDate);
            if (daysUntil >= 0 && daysUntil <= 7) {
                 if ((currentUser.role === UserRole.Auditor && currentUser.id === audit.auditorId) || (currentUser.role === UserRole.Auditee && currentUser.id === audit.auditeeId)) {
                    generatedNotifications.push({
                        id: generatedNotifications.length + 1,
                        type: 'AUDIT_UPCOMING',
                        message: `Audit ${audit.id} is scheduled in ${daysUntil} day(s).`,
                        time: 'Just now'
                    });
                }
            }
        });

        // 3. Findings deadlines (Auditee)
        if (currentUser.role === UserRole.Auditee) {
            // Deadlines
            findings.forEach(finding => {
                const audit = audits.find(a => a.id === finding.auditId);
                if (!finding.deadline || !audit || audit.auditeeId !== currentUser.id) return;
                
                if (finding.status === 'Open' || finding.status === 'Rejected') {
                    const deadlineDate = new Date(finding.deadline);
                    const daysUntil = daysBetween(now, deadlineDate);

                    if (daysUntil < 0) {
                        generatedNotifications.push({
                            id: generatedNotifications.length + 1,
                            type: 'CAR_DUE',
                            message: `Action for finding ${finding.customId || finding.id} is overdue by ${Math.abs(daysUntil)} day(s). Please submit CAR immediately.`,
                            time: 'Just now'
                        });
                    } else if (daysUntil >= 0 && daysUntil <= 3) {
                        generatedNotifications.push({
                            id: generatedNotifications.length + 1,
                            type: 'FINDING_DUE',
                            message: `Action for finding ${finding.customId || finding.id} is due ${daysUntil === 0 ? 'today' : `in ${daysUntil} day(s)`}.`,
                            time: 'Just now'
                        });
                    }
                }
            });

            // Rejected CARs
            cars.forEach(car => {
                if (car.status === 'Rejected' && car.submittedById === currentUser.id) {
                     // Check if finding is still in Rejected state (meaning no new CAR submitted yet)
                     const finding = findings.find(f => f.id === car.findingId);
                     if (finding && finding.status === FindingStatus.Rejected) {
                        generatedNotifications.push({
                            id: generatedNotifications.length + 1,
                            type: 'CAR_REJECTED',
                            message: `CAR for finding ${finding.customId || finding.id} was rejected. Please review auditor remarks and resubmit.`,
                            time: 'Action Required'
                        });
                     }
                }
            });
        }

        setNotifications(generatedNotifications.slice(0, 10)); // Limit to 10
    }, [currentUser, audits, findings, cars]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Notifications & Reminders</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No new notifications.</p>
        ) : (
            notifications.map(notification => (
            <div key={notification.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                    {notificationIcons[notification.type]}
                </div>
                <div className="ml-4 flex-1">
                <p className="text-sm text-gray-700 font-medium">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time} • Email sent</p>
                </div>
            </div>
            ))
        )}
      </div>
      {notifications.length > 0 && (
        <button className="w-full mt-6 text-sm text-primary font-semibold hover:underline">
            View all history
        </button>
      )}
    </div>
  );
};

export default NotificationsPanel;