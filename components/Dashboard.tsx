
import React, { useState } from 'react';
import MetricCard from './MetricCard';
import RecentAuditsTable from './RecentAuditsTable';
import NotificationsPanel from './NotificationsPanel';
import { FileTextIcon } from './icons/FileTextIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, FindingStatus, UserRole, Location } from '../types';

const Dashboard: React.FC = () => {
  const { audits, findings, cars, setCurrentPage, currentUser } = useAppContext();
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Filter data based on selected Location
  const filteredAudits = selectedLocation === 'All' 
    ? audits 
    : audits.filter(a => a.location === selectedLocation);

  const filteredAuditIds = filteredAudits.map(a => a.id);
  const filteredFindings = findings.filter(f => filteredAuditIds.includes(f.auditId));
  const filteredCars = cars.filter(c => filteredAuditIds.includes(c.auditId));

  const activeAudits = filteredAudits.filter(a => a.status === AuditStatus.InProgress || a.status === AuditStatus.Scheduled).length;
  const openFindings = filteredFindings.filter(f => f.status === FindingStatus.Open || f.status === FindingStatus.Rejected).length;
  const pendingCARs = filteredCars.filter(c => c.status === 'Pending Review').length;
  const completedAudits = filteredAudits.filter(a => a.status === AuditStatus.Completed).length;

  const canCreateAudit = currentUser?.role === UserRole.Auditor || currentUser?.department === 'Quality';

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="mt-4 md:mt-0">
              <label className="mr-2 text-gray-600 font-medium">Filter Location:</label>
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-primary focus:border-primary"
              >
                  <option value="All">All Locations</option>
                  {Object.values(Location).map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                  ))}
              </select>
          </div>
      </div>
      
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
                {canCreateAudit && (
                    <button onClick={() => setCurrentPage('audit-reports')} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                        Create New Audit
                    </button>
                )}
                <button onClick={() => setCurrentPage('car-management')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                    Submit CAR
                </button>
                <button onClick={() => setCurrentPage('findings-tracker')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                    Track Findings
                </button>
                {canCreateAudit && (
                    <button onClick={() => setCurrentPage('audit-reports')} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-transform transform hover:scale-105">
                        Generate Report
                    </button>
                )}
            </div>
          </div>

          {/* Recent Audits Table (Filtered) */}
          <RecentAuditsTable audits={filteredAudits} />
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
