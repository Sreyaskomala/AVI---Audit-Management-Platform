
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, AuditType, AuditStatus } from '../types';
import Modal from './shared/Modal';
import AuditReportView from './AuditReportView';
import { FileTextIcon } from './icons/FileTextIcon';
import { EditIcon } from './icons/EditIcon';
import CreateAuditModal from './CreateAuditModal';

const AuditReportsPage: React.FC = () => {
    const { audits, users, findings: allFindings, currentUser } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
    const [editingAuditId, setEditingAuditId] = useState<string | null>(null);

    const canCreateAudit = currentUser?.role === UserRole.Auditor || currentUser?.department === 'Quality';

    const getFindingCounts = (auditId: string) => {
        const relevantFindings = allFindings.filter(f => f.auditId === auditId);
        return relevantFindings.length
    };

    const handleEditDraft = (auditId: string) => {
        setEditingAuditId(auditId);
        setCreateModalOpen(true);
    }
    
    // Find editing audit object and its findings
    const editingAudit = audits.find(a => a.id === editingAuditId);
    const editingFindings = allFindings.filter(f => f.auditId === editingAuditId);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Audit Reports</h1>
                {canCreateAudit && (
                    <button 
                        onClick={() => { setEditingAuditId(null); setCreateModalOpen(true); }}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        Create New Audit
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Ref No.</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Loc.</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Entity/Auditor</th>
                                <th className="px-6 py-3">Date(s)</th>
                                <th className="px-6 py-3">Findings</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map(audit => {
                                const auditor = users.find(u => u.id === audit.auditorId);
                                const isExternal = audit.type === AuditType.External;
                                return (
                                <tr key={audit.id} className={`bg-white border-b hover:bg-gray-50 ${audit.status === AuditStatus.Draft ? 'bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium">{audit.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isExternal ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {isExternal ? 'EXTERNAL' : 'INTERNAL'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {audit.title}
                                        {audit.fstdId && <div className="text-xs text-gray-500 font-semibold">({audit.fstdId})</div>}
                                    </td>
                                    <td className="px-6 py-4">{audit.location || 'N/A'}</td>
                                    <td className="px-6 py-4">{audit.department}</td>
                                    <td className="px-6 py-4">
                                        {isExternal ? (
                                            <span className="font-semibold text-purple-700">{audit.externalEntity}</span>
                                        ) : (
                                            auditor?.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{new Date(audit.date).toLocaleDateString()}</div>
                                        {audit.additionalDates && audit.additionalDates.length > 0 && (
                                            <div className="text-xs text-gray-500">
                                                + {audit.additionalDates.length} more day(s)
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">{getFindingCounts(audit.id)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${audit.status === AuditStatus.Draft ? 'bg-gray-200 text-gray-700 border border-gray-400 border-dashed' : 'bg-green-100 text-green-800'}`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {audit.status === AuditStatus.Draft && canCreateAudit ? (
                                                <button 
                                                    onClick={() => handleEditDraft(audit.id)} 
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-md flex items-center gap-1 font-semibold text-xs"
                                                >
                                                   <EditIcon className="h-4 w-4" /> Resume Editing
                                                </button>
                                            ) : (
                                                <button onClick={() => setSelectedAuditId(audit.id)} className="text-primary hover:underline flex items-center gap-1">
                                                   <FileTextIcon className="h-4 w-4" /> View Report
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAuditId && (
                <Modal size="4xl" title={`Audit Report: ${selectedAuditId}`} onClose={() => setSelectedAuditId(null)}>
                    <AuditReportView auditId={selectedAuditId} />
                </Modal>
            )}

            {isCreateModalOpen && (
                <CreateAuditModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => { setCreateModalOpen(false); setEditingAuditId(null); }}
                    existingAudit={editingAudit}
                    existingFindings={editingFindings}
                />
            )}
        </div>
    );
};

export default AuditReportsPage;
