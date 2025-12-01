
import React from 'react';
import { Audit, AuditStatus, FindingStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface RecentAuditsTableProps {
  audits: Audit[];
}

const statusColorClasses: Record<AuditStatus, string> = {
  [AuditStatus.Draft]: 'bg-gray-100 text-gray-600 border border-gray-300 border-dashed',
  [AuditStatus.Scheduled]: 'bg-blue-100 text-blue-800',
  [AuditStatus.InProgress]: 'bg-indigo-100 text-indigo-800',
  [AuditStatus.CARPending]: 'bg-yellow-100 text-yellow-800',
  [AuditStatus.Completed]: 'bg-green-100 text-green-800',
  [AuditStatus.Overdue]: 'bg-red-100 text-red-800',
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
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Audits</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
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
                <tr key={audit.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
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
