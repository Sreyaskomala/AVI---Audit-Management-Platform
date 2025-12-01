
import React from 'react';
import { BarChartIcon } from './icons/BarChartIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { FolderIcon } from './icons/FolderIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { XIcon } from './icons/XIcon';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

interface NavLinkProps {
    icon: React.ReactNode;
    text: string;
    pageKey: string;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const { currentPage, setCurrentPage, currentUser } = useAppContext();

    const NavLink: React.FC<NavLinkProps> = ({ icon, text, pageKey }) => (
        <button
            onClick={() => {
                setCurrentPage(pageKey);
                setSidebarOpen(false);
            }}
            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
                currentPage === pageKey
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="ml-4">{text}</span>
        </button>
    );
    
    return (
        <>
            {/* Overlay for mobile */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 shadow-xl z-30 flex flex-col`}>
                <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <svg className="h-10 w-10 text-primary" viewBox="0 0 512 512" fill="currentColor">
                           <path d="M435.8,69.47,256,169.47,76.2,69.47,256,10,435.8,69.47Z"/>
                           <path d="M448,102.53,256,214.67,64,102.53v109l192,112.14,192-112.14V102.53Z"/>
                           <path d="M448,244.67,256,356.8,64,244.67v109L256,465.8,448,353.67V244.67Z"/>
                        </svg>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">AVI</h1>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-grow px-4 py-6 space-y-2">
                   <NavLink icon={<BarChartIcon className="h-5 w-5" />} text="Dashboard" pageKey="dashboard" />
                   {currentUser?.role === UserRole.Auditor && (
                    <>
                        <NavLink icon={<FileTextIcon className="h-5 w-5" />} text="Audit Reports" pageKey="audit-reports" />
                        <NavLink icon={<AlertTriangleIcon className="h-5 w-5" />} text="Findings Tracker" pageKey="findings-tracker" />
                    </>
                   )}
                   <NavLink icon={<ClipboardListIcon className="h-5 w-5" />} text="CAR Management" pageKey="car-management"/>
                   {currentUser?.role === UserRole.Auditor && (
                     <NavLink icon={<FolderIcon className="h-5 w-5" />} text="Audit Planning" pageKey="audit-planning" />
                   )}
                </nav>
                
                <div className="px-4 py-4 border-t-2 border-gray-200 dark:border-gray-700 space-y-2">
                   {currentUser?.role === UserRole.Auditor && (
                        <NavLink icon={<UsersIcon className="h-5 w-5" />} text="User Management" pageKey="user-management" />
                   )}
                   <NavLink icon={<SettingsIcon className="h-5 w-5" />} text="Settings" pageKey="settings" />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
