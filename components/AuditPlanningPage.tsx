
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const AuditPlanningPage: React.FC = () => {
    const { audits } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 border border-gray-100 bg-gray-50/50"></div>);
        }

        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            // Find audits on this day (checking main date AND additional dates)
            const daysAudits = audits.filter(a => {
                if (a.date === dateStr) return true;
                if (a.additionalDates && a.additionalDates.includes(dateStr)) return true;
                return false;
            });

            days.push(
                <div key={d} className="h-32 border border-gray-200 bg-white p-2 overflow-y-auto hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${daysAudits.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{d}</span>
                        {daysAudits.length > 0 && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                    </div>
                    <div className="mt-1 space-y-1">
                        {daysAudits.map((audit, idx) => (
                            <div 
                                key={`${audit.id}-${idx}`} 
                                className={`text-xs p-1 rounded truncate cursor-help border-l-2 ${
                                    audit.status === AuditStatus.Completed ? 'bg-green-100 border-green-500 text-green-800' :
                                    audit.status === AuditStatus.Overdue ? 'bg-red-100 border-red-500 text-red-800' :
                                    'bg-blue-100 border-blue-500 text-blue-800'
                                }`}
                                title={`${audit.id}: ${audit.title} (${audit.department})`}
                            >
                                {audit.department}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="container mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Audit Planning Calendar</h1>
                <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronDownIcon className="h-5 w-5 transform rotate-90" />
                    </button>
                    <span className="text-lg font-bold w-48 text-center">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronDownIcon className="h-5 w-5 transform -rotate-90" />
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1 flex flex-col">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1">
                    {renderCalendarDays()}
                </div>
            </div>
            
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border-blue-500 border rounded"></div>
                    <span>Scheduled/In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border-green-500 border rounded"></div>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 border-red-500 border rounded"></div>
                    <span>Overdue</span>
                </div>
            </div>
        </div>
    );
};

export default AuditPlanningPage;
