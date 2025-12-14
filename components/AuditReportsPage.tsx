
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, AuditType, AuditStatus, Location, FindingStatus } from '../types';
import Modal from './shared/Modal';
import AuditReportView from './AuditReportView';
import { FileTextIcon } from './icons/FileTextIcon';
import { EditIcon } from './icons/EditIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import CreateAuditModal from './CreateAuditModal';
import MultiSelect from './shared/MultiSelect';

const AuditReportsPage: React.FC = () => {
    const { audits, users, findings: allFindings, currentUser } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
    const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
    const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Filters State
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    const canCreateAudit = currentUser?.role === UserRole.Auditor || currentUser?.department === 'Quality';

    const getFindingCounts = (auditId: string) => {
        const relevantFindings = allFindings.filter(f => f.auditId === auditId);
        return relevantFindings.length;
    };

    const handleEditDraft = (auditId: string) => {
        setEditingAuditId(auditId);
        setCreateModalOpen(true);
    }

    const toggleExpand = (auditId: string) => {
        setExpandedAuditId(prev => prev === auditId ? null : auditId);
    };
    
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

    // Filter Logic
    const filteredAudits = audits.filter(audit => {
        // Permission Filter: If Auditor, see all. If Auditee, see only assignments.
        const rolePermission = currentUser?.role === UserRole.Auditor 
            ? true 
            : audit.auditeeId === currentUser?.id;

        if (!rolePermission) return false;

        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(audit.status);
        const locationMatch = selectedLocations.length === 0 || (audit.location && selectedLocations.includes(audit.location));
        return statusMatch && locationMatch;
    });

    const exportToCSV = () => {
        const headers = ['Ref No', 'Type', 'Title', 'Location', 'Department', 'Entity/Auditor', 'Date', 'Findings Count', 'Status'];
        
        const rows = filteredAudits.map(audit => {
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Audit Reports</h1>
                <div className="flex flex-wrap gap-3 print:hidden items-center">
                    {/* Filters */}
                    <div className="flex gap-2">
                        <MultiSelect 
                            label="Status" 
                            options={Object.values(AuditStatus)} 
                            selected={selectedStatuses} 
                            onChange={setSelectedStatuses} 
                        />
                        <MultiSelect 
                            label="Location" 
                            options={Object.values(Location)} 
                            selected={selectedLocations} 
                            onChange={setSelectedLocations} 
                        />
                    </div>

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

                    {/* Create Button - Only for Auditors/Quality */}
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
                                <th className="px-4 py-3 w-10"></th>
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
                            {filteredAudits.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-8 text-gray-500 italic">
                                        No audits found matching the selected filters.
                                    </td>
                                </tr>
                            ) : (
                            filteredAudits.map(audit => {
                                const auditor = users.find(u => u.id === audit.auditorId);
                                const isExternal = audit.type === AuditType.External;
                                const isExpanded = expandedAuditId === audit.id;
                                const auditFindings = allFindings.filter(f => f.auditId === audit.id);

                                return (
                                <React.Fragment key={audit.id}>
                                    <tr 
                                        onClick={() => toggleExpand(audit.id)}
                                        className={`border-b dark:border-gray-700 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{audit.id}</td>
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
                                        <td className="px-6 py-4 text-center font-semibold">{auditFindings.length}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${audit.status === AuditStatus.Draft ? 'bg-gray-200 text-gray-700 border border-gray-400 border-dashed dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                                {audit.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 print:hidden" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-3">
                                                {audit.status === AuditStatus.Draft && canCreateAudit ? (
                                                    <button 
                                                        onClick={() => handleEditDraft(audit.id)} 
                                                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-md flex items-center gap-1 font-semibold text-xs"
                                                    >
                                                       <EditIcon className="h-4 w-4" /> Resume Editing
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setSelectedAuditId(audit.id)} className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-primary-dark shadow-sm flex items-center gap-1">
                                                       <FileTextIcon className="h-3 w-3" /> Full Report
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50 dark:bg-gray-800/50 animate-in fade-in duration-200">
                                            <td colSpan={11} className="px-6 py-4 border-b dark:border-gray-700">
                                                <div className="pl-8">
                                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Findings Summary</h4>
                                                    {auditFindings.length > 0 ? (
                                                        <table className="w-full text-xs text-left bg-white dark:bg-gray-800 border rounded-lg overflow-hidden shadow-sm">
                                                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                                <tr>
                                                                    <th className="px-4 py-2">ID</th>
                                                                    <th className="px-4 py-2">Level</th>
                                                                    <th className="px-4 py-2 w-1/2">Description</th>
                                                                    <th className="px-4 py-2">Status</th>
                                                                    <th className="px-4 py-2">Deadline</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {auditFindings.map(f => (
                                                                    <tr key={f.id} className="border-t border-gray-100 dark:border-gray-700">
                                                                        <td className="px-4 py-2 font-medium">{f.customId || f.id}</td>
                                                                        <td className="px-4 py-2">
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${f.level.includes('1') ? 'bg-red-100 text-red-800' : f.level.includes('2') ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                                                {f.level}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 truncate max-w-xs">{f.description}</td>
                                                                        <td className="px-4 py-2">
                                                                            <span className={`text-[10px] font-semibold ${f.status === FindingStatus.Closed ? 'text-green-600' : 'text-blue-600'}`}>
                                                                                {f.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2">{f.deadline ? new Date(f.deadline).toLocaleDateString() : '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p className="text-gray-500 italic text-sm">No findings recorded for this audit.</p>
                                                    )}
                                                    <div className="mt-3 text-right">
                                                         <button onClick={() => setSelectedAuditId(audit.id)} className="text-primary hover:underline text-xs font-semibold">
                                                            View Detailed Findings, CARs & Evidence →
                                                         </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                )
                            }))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAuditId && (
                <Modal size="custom-xl" title={`Audit Report: ${selectedAuditId}`} onClose={() => setSelectedAuditId(null)}>
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
