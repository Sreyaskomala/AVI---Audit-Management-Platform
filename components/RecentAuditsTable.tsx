
import React from 'react';
import { Audit, AuditStatus, FindingStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface RecentAuditsTableProps {
  audits: Audit[];
}

const statusColorClasses: Record<AuditStatus, string> = {
  [AuditStatus.Draft]: 'bg-gray-100 text-gray-600 border border-gray-300 border-dashed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500',
  [AuditStatus.Scheduled]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [AuditStatus.InProgress]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  [AuditStatus.CARPending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [AuditStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [AuditStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const RecentAuditsTable: React.FC<RecentAuditsTableProps> = ({ audits }) => {
  const { findings } = useAppContext();

  const getFindingCounts = (auditId: string) => {
    const relevantFindings = findings.filter(f => f.auditId === auditId);
    return {
      open: relevantFindings.filter(f => f.status !== FindingStatus.Closed).length,
      closed: relevantFindings.filter(f => f.status === FindingStatus.Closed).length,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Audits</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">Ref No.</th>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3 text-center">Findings (Open/Closed)</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => {
              const counts = getFindingCounts(audit.id);
              return (
                <tr key={audit.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {audit.id}
                  </th>
                  <td className="px-6 py-4">{audit.title}</td>
                  <td className="px-6 py-4">{audit.department}</td>
                  <td className="px-6 py-4">{new Date(audit.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                      <span className="text-danger font-semibold">{counts.open}</span> / 
                      <span className="text-success font-semibold">{counts.closed}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorClasses[audit.status]}`}>
                      {audit.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAuditsTable;
