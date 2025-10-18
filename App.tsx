import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useAppContext } from './contexts/AppContext';
import LoginPage from './components/LoginPage';
import AuditReportsPage from './components/AuditReportsPage';
import CarManagementPage from './components/CarManagementPage';
import FindingsTrackerPage from './components/FindingsTrackerPage';

const App: React.FC = () => {
  const { currentUser, currentPage } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
