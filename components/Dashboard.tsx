
import React from 'react';
import MetricCard from './MetricCard';
import RecentAuditsTable from './RecentAuditsTable';
import NotificationsPanel from './NotificationsPanel';
import { FileTextIcon } from './icons/FileTextIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, FindingStatus } from '../types';

const Dashboard: React.FC = () => {
  const { audits, findings, cars, setCurrentPage } = useAppContext();

  const activeAudits = audits.filter(a => a.status === AuditStatus.InProgress || a.status === AuditStatus.Scheduled).length;
  const openFindings = findings.filter(f => f.status === FindingStatus.Open || f.status === FindingStatus.Rejected).length;
  const pendingCARs = cars.filter(c => c.status === 'Pending Review').length;
  const completedAudits = audits.filter(a => a.status === AuditStatus.Completed).length;


  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Active Audits" value={activeAudits} icon={<FileTextIcon className="h-8 w-8 text-primary" />} color="primary" />
        <MetricCard title="Open Findings" value={openFindings} icon={<AlertTriangleIcon className="h-8 w-8 text-warning" />} color="warning" />
        <MetricCard title="Pending CARs" value={pendingCARs} icon={<ClipboardListIcon className="h-8 w-8 text-danger" />} color="danger" />
        <MetricCard title="Completed Audits" value={completedAudits} icon={<CheckCircleIcon className="h-8 w-8 text-success" />} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Recent Audits & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => setCurrentPage('audit-reports')} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    Create New Audit
                </button>
                <button onClick={() => setCurrentPage('car-management')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                    Submit CAR
                </button>
                <button onClick={() => setCurrentPage('findings-tracker')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                    Track Findings
                </button>
                <button onClick={() => setCurrentPage('audit-reports')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                    Generate Report
                </button>
            </div>
          </div>

          {/* Recent Audits Table */}
          <RecentAuditsTable audits={audits} />
        </div>

        {/* Side Panel: Notifications */}
        <div className="lg:col-span-1">
          <NotificationsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;