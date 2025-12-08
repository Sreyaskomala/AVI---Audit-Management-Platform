
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, AuditType, AuditStatus } from '../types';
import Modal from './shared/Modal';
import AuditReportView from './AuditReportView';
import { FileTextIcon } from './icons/FileTextIcon';
import { EditIcon } from './icons/EditIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import CreateAuditModal from './CreateAuditModal';

const AuditReportsPage: React.FC = () => {
    const { audits, users, findings: allFindings, currentUser } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
    const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

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

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const exportToCSV = () => {
        const headers = ['Ref No', 'Type', 'Title', 'Location', 'Department', 'Entity/Auditor', 'Date', 'Findings Count', 'Status'];
        
        const rows = audits.map(audit => {
            const auditor = users.find(u => u.id === audit.auditorId);
            const isExternal = audit.type === AuditType.External;
            const auditorName = isExternal ? audit.externalEntity : auditor?.name;
            const findingCount = getFindingCounts(audit.id);
            
            // Handle commas in fields by wrapping in quotes
            const clean = (str: string | undefined | number) => `"${String(str || '').replace(/"/g, '""')}"`;

            return [
                clean(audit.id),
                clean(audit.type),
                clean(audit.title),
                clean(audit.location),
                clean(audit.department),
                clean(auditorName),
                clean(audit.date),
                clean(findingCount),
                clean(audit.status)
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_reports_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const handlePrintList = () => {
        setIsExportMenuOpen(false);
        window.print();
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Audit Reports</h1>
                <div className="flex gap-3 print:hidden">
                    {/* Export Button */}
                    <div className="relative" ref={exportMenuRef}>
                         <button 
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm flex items-center gap-2"
                         >
                            <DownloadIcon className="h-5 w-5" />
                            Export
                            <ChevronDownIcon className="h-4 w-4" />
                         </button>
                         {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <button onClick={exportToCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <span className="font-medium">CSV Format</span>
                                </button>
                                <button onClick={handlePrintList} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <span className="font-medium">PDF (Print)</span>
                                </button>
                            </div>
                         )}
                    </div>

                    {/* Create Button */}
                    {canCreateAudit && (
                        <button 
                            onClick={() => { setEditingAuditId(null); setCreateModalOpen(true); }}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            Create New Audit
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg print:shadow-none print:border print:border-gray-300">
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
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
                                <th className="px-6 py-3 print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map(audit => {
                                const auditor = users.find(u => u.id === audit.auditorId);
                                const isExternal = audit.type === AuditType.External;
                                return (
                                <tr key={audit.id} className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${audit.status === AuditStatus.Draft ? 'bg-gray-50 dark:bg-gray-900' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{audit.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isExternal ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
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
                                            <span className="font-semibold text-purple-700 dark:text-purple-300">{audit.externalEntity}</span>
                                        ) : (
                                            auditor?.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{new Date(audit.date).toLocaleDateString()}</div>
                                        {audit.additionalDates && audit.additionalDates.length > 0 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                + {audit.additionalDates.length} more day(s)
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">{getFindingCounts(audit.id)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${audit.status === AuditStatus.Draft ? 'bg-gray-200 text-gray-700 border border-gray-400 border-dashed dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 print:hidden">
                                        <div className="flex gap-3">
                                            {audit.status === AuditStatus.Draft && canCreateAudit ? (
                                                <button 
                                                    onClick={() => handleEditDraft(audit.id)} 
                                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-md flex items-center gap-1 font-semibold text-xs"
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
