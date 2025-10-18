import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { FindingStatus } from '../types';

const statusColorClasses: Record<FindingStatus, string> = {
  [FindingStatus.Open]: 'bg-blue-100 text-blue-800',
  [FindingStatus.CARSubmitted]: 'bg-yellow-100 text-yellow-800',
  [FindingStatus.UnderReview]: 'bg-indigo-100 text-indigo-800',
  [FindingStatus.Closed]: 'bg-green-100 text-green-800',
  [FindingStatus.Rejected]: 'bg-red-100 text-red-800',
};

const FindingsTrackerPage: React.FC = () => {
    const { findings, audits, users } = useAppContext();

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Findings Tracker</h1>
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Finding ID</th>
                                <th className="px-6 py-3">Audit Ref</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Level</th>
                                <th className="px-6 py-3">Deadline</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findings.map(finding => {
                                const audit = audits.find(a => a.id === finding.auditId);
                                return (
                                <tr key={finding.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{finding.id}</td>
                                    <td className="px-6 py-4">{finding.auditId}</td>
                                    <td className="px-6 py-4">{audit?.department}</td>
                                    <td className="px-6 py-4 max-w-sm truncate">{finding.description}</td>
                                    <td className="px-6 py-4">{finding.level}</td>
                                    <td className="px-6 py-4">{new Date(finding.deadline).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorClasses[finding.status]}`}>
                                            {finding.status}
                                        </span>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FindingsTrackerPage;
