
import React, { useState } from 'react';
import MetricCard from './MetricCard';
import RecentAuditsTable from './RecentAuditsTable';
import NotificationsPanel from './NotificationsPanel';
import { FileTextIcon } from './icons/FileTextIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, FindingStatus, UserRole, Location } from '../types';
import CreateAuditModal from './CreateAuditModal';
import Modal from './shared/Modal';

type DrilldownType = 'active-audits' | 'open-findings' | 'pending-cars' | 'completed-audits' | null;

const Dashboard: React.FC = () => {
  const { audits, findings, cars, setCurrentPage, currentUser } = useAppContext();
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [drilldownType, setDrilldownType] = useState<DrilldownType>(null);

  // Filter data based on selected Location
  const filteredAudits = selectedLocation === 'All' 
    ? audits 
    : audits.filter(a => a.location === selectedLocation);

  const filteredAuditIds = filteredAudits.map(a => a.id);
  const filteredFindings = findings.filter(f => filteredAuditIds.includes(f.auditId));
  const filteredCars = cars.filter(c => filteredAuditIds.includes(c.auditId));

  // Derived Lists for Drilldowns
  const activeAuditsList = filteredAudits.filter(a => a.status === AuditStatus.InProgress || a.status === AuditStatus.Scheduled);
  const openFindingsList = filteredFindings.filter(f => f.status === FindingStatus.Open || f.status === FindingStatus.Rejected);
  const pendingCARsList = filteredCars.filter(c => c.status === 'Pending Review');
  const completedAuditsList = filteredAudits.filter(a => a.status === AuditStatus.Completed);

  const activeAudits = activeAuditsList.length;
  const openFindings = openFindingsList.length;
  const pendingCARs = pendingCARsList.length;
  const completedAudits = completedAuditsList.length;

  const canCreateAudit = currentUser?.role === UserRole.Auditor || currentUser?.department === 'Quality';

  const getDrilldownTitle = (type: DrilldownType) => {
      switch(type) {
          case 'active-audits': return 'Active Audits Details';
          case 'open-findings': return 'Open Findings Details';
          case 'pending-cars': return 'Pending CARs Details';
          case 'completed-audits': return 'Completed Audits Details';
          default: return '';
      }
  };

  const renderDrilldownContent = () => {
      switch(drilldownType) {
          case 'active-audits':
              return (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                              <tr>
                                  <th className="px-6 py-3">Audit ID</th>
                                  <th className="px-6 py-3">Title</th>
                                  <th className="px-6 py-3">Department</th>
                                  <th className="px-6 py-3">Date</th>
                                  <th className="px-6 py-3">Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              {activeAuditsList.map(a => (
                                  <tr key={a.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{a.id}</td>
                                      <td className="px-6 py-4">{a.title}</td>
                                      <td className="px-6 py-4">{a.department}</td>
                                      <td className="px-6 py-4">{new Date(a.date).toLocaleDateString()}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${a.status === AuditStatus.InProgress ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>
                                              {a.status}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                              {activeAuditsList.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center">No active audits found.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              );
          case 'open-findings':
              return (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                              <tr>
                                  <th className="px-6 py-3">Finding ID</th>
                                  <th className="px-6 py-3">Audit Ref</th>
                                  <th className="px-6 py-3">Description</th>
                                  <th className="px-6 py-3">Level</th>
                                  <th className="px-6 py-3">Deadline</th>
                              </tr>
                          </thead>
                          <tbody>
                              {openFindingsList.map(f => (
                                  <tr key={f.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{f.customId || f.id}</td>
                                      <td className="px-6 py-4">{f.auditId}</td>
                                      <td className="px-6 py-4 max-w-xs truncate" title={f.description}>{f.description}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 text-xs font-bold rounded ${f.level.includes('1') ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                              {f.level}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">{f.deadline ? new Date(f.deadline).toLocaleDateString() : 'N/A'}</td>
                                  </tr>
                              ))}
                              {openFindingsList.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center">No open findings found.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              );
          case 'pending-cars':
              return (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                              <tr>
                                  <th className="px-6 py-3">CAR Ref</th>
                                  <th className="px-6 py-3">Finding ID</th>
                                  <th className="px-6 py-3">Submitted Date</th>
                                  <th className="px-6 py-3">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {pendingCARsList.map(c => (
                                  <tr key={c.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">CAR #{c.carNumber}</td>
                                      <td className="px-6 py-4">{c.findingId}</td>
                                      <td className="px-6 py-4">{new Date(c.submissionDate).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 truncate max-w-xs">{c.correctiveAction}</td>
                                  </tr>
                              ))}
                              {pendingCARsList.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No pending CARs found.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              );
            case 'completed-audits':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Audit ID</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Completed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedAuditsList.map(a => (
                                    <tr key={a.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{a.id}</td>
                                        <td className="px-6 py-4">{a.title}</td>
                                        <td className="px-6 py-4">{a.department}</td>
                                        <td className="px-6 py-4">{a.reportDate ? new Date(a.reportDate).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                                {completedAuditsList.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center">No completed audits found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                );
          default:
              return null;
      }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
              {canCreateAudit && (
                  <button 
                      onClick={() => setCreateModalOpen(true)}
                      className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-transform transform hover:scale-105"
                  >
                      <span>+</span> Schedule New Audit
                  </button>
              )}
              <button 
                onClick={() => setCurrentPage('help')}
                className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
                title="View User Guide"
              >
                  <HelpCircleIcon className="h-4 w-4" /> Need Help?
              </button>
              <div>
                <label className="mr-2 text-gray-600 dark:text-gray-300 font-medium hidden sm:inline">Filter Location:</label>
                <select 
                    value={selectedLocation} 
                    onChange={(e) => setSelectedLocation(e.target.value)} 
                    className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"
                >
                    <option value="All">All Locations</option>
                    {Object.values(Location).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
              </div>
          </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard 
            title="Active Audits" 
            value={activeAudits} 
            icon={<FileTextIcon className="h-8 w-8 text-primary" />} 
            color="primary" 
            onClick={() => setDrilldownType('active-audits')}
        />
        <MetricCard 
            title="Open Findings" 
            value={openFindings} 
            icon={<AlertTriangleIcon className="h-8 w-8 text-warning" />} 
            color="warning" 
            onClick={() => setDrilldownType('open-findings')}
        />
        <MetricCard 
            title="Pending CARs" 
            value={pendingCARs} 
            icon={<ClipboardListIcon className="h-8 w-8 text-danger" />} 
            color="danger" 
            onClick={() => setDrilldownType('pending-cars')}
        />
        <MetricCard 
            title="Completed Audits" 
            value={completedAudits} 
            icon={<CheckCircleIcon className="h-8 w-8 text-success" />} 
            color="success" 
            onClick={() => setDrilldownType('completed-audits')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Recent Audits & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
                {canCreateAudit && (
                    <button onClick={() => setCreateModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                        Create New Audit
                    </button>
                )}
                <button onClick={() => setCurrentPage('car-management')} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition-transform transform hover:scale-105">
                    Submit CAR
                </button>
                <button onClick={() => setCurrentPage('findings-tracker')} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition-transform transform hover:scale-105">
                    Track Findings
                </button>
                {canCreateAudit && (
                    <button onClick={() => setCurrentPage('audit-reports')} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition-transform transform hover:scale-105">
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

      {isCreateModalOpen && (
        <CreateAuditModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setCreateModalOpen(false)} 
        />
      )}

      {drilldownType && (
          <Modal title={getDrilldownTitle(drilldownType)} onClose={() => setDrilldownType(null)} size="4xl">
              {renderDrilldownContent()}
              <div className="mt-6 flex justify-end">
                  <button onClick={() => setDrilldownType(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-bold">
                      Close
                  </button>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default Dashboard;
