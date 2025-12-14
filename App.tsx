
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useAppContext } from './contexts/AppContext';
import LoginPage from './components/LoginPage';
import AuditReportsPage from './components/AuditReportsPage';
import CarManagementPage from './components/CarManagementPage';
import FindingsTrackerPage from './components/FindingsTrackerPage';
import UserManagementPage from './components/UserManagementPage';
import ProfilePage from './components/ProfilePage';
import AuditPlanningPage from './components/AuditPlanningPage';
import NotificationDrawer from './components/NotificationDrawer';
import HelpPage from './components/HelpPage';
import TermsPage from './components/TermsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const { currentUser, currentPage, setCurrentPage } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define public pages that don't require login
  const publicPages = ['help', 'terms', 'privacy'];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'audit-reports':
        return <AuditReportsPage />;
      case 'car-management':
        return <CarManagementPage />;
      case 'findings-tracker':
        return <FindingsTrackerPage />;
      case 'audit-planning':
        return <AuditPlanningPage />;
      case 'user-management':
        return <UserManagementPage />;
      case 'profile':
        return <ProfilePage />;
      case 'help':
        return <HelpPage />;
      case 'terms':
        return <TermsPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      default:
        return <Dashboard />;
    }
  };

  // 1. Handle Public View (Not Logged In, accessing Help/Terms/Privacy)
  if (!currentUser && publicPages.includes(currentPage)) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
             <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                     <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('login')}>
                         <Logo className="h-8 w-auto text-gray-800 dark:text-white" />
                     </div>
                     <button 
                        onClick={() => setCurrentPage('login')}
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1"
                     >
                         <span>←</span> Back to Login
                     </button>
                 </div>
             </header>
             <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {renderPage()}
             </main>
          </div>
      );
  }

  // 2. Handle Login View
  if (!currentUser) {
    return <LoginPage />;
  }

  // 3. Handle Authenticated App View
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {renderPage()}
        </main>
      </div>
      <NotificationDrawer />
    </div>
  );
};

export default App;
