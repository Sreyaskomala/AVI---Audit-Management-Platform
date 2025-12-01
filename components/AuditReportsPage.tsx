
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, Finding, FindingLevel, UserRole, AuditType, Location, Attachment } from '../types';
import Modal from './shared/Modal';
import AuditReportView from './AuditReportView';
import { FileTextIcon } from './icons/FileTextIcon';
import { FSTD_OPTIONS } from '../constants';

const AuditReportsPage: React.FC = () => {
    const { audits, users, addAudit, findings: allFindings, currentUser } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
    
    // Form State
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [auditeeId, setAuditeeId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Main scheduled date
    const [additionalDates, setAdditionalDates] = useState<string[]>([]);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState(AuditStatus.InProgress);
    const [findings, setFindings] = useState<Partial<Finding>[]>([]);
    const [auditType, setAuditType] = useState<AuditType>(AuditType.Internal);
    const [externalEntity, setExternalEntity] = useState('');
    const [location, setLocation] = useState<Location>(Location.GURUGRAM_1);
    const [fstdId, setFstdId] = useState('');

    const canCreateAudit = currentUser?.role === UserRole.Auditor || currentUser?.department === 'Quality';

    const handleAddFinding = () => {
        setFindings([...findings, { 
            referenceDoc: '', 
            referencePara: '', 
            level: FindingLevel.LEVEL2, 
            description: '', 
            customId: '',
            attachments: [] 
        }]);
    };

    const handleFindingChange = (index: number, field: keyof Finding, value: any) => {
        const newFindings = [...findings];
        newFindings[index] = {
            ...newFindings[index],
            [field]: value
        };
        setFindings(newFindings);
    };

    // Simulate file upload
    const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newAttachment: Attachment = {
                name: file.name,
                url: '#', // In a real app, upload and get URL
                type: file.type.includes('image') ? 'image' : 'document'
            };
            const currentAttachments = findings[index].attachments || [];
            handleFindingChange(index, 'attachments', [...currentAttachments, newAttachment]);
        }
    };

    const addDate = () => {
        setAdditionalDates([...additionalDates, '']);
    };

    const updateAdditionalDate = (index: number, value: string) => {
        const newDates = [...additionalDates];
        newDates[index] = value;
        setAdditionalDates(newDates);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const auditee = users.find(u => u.department === department && u.role === UserRole.Auditee);
        
        if (title && department && auditee && (auditType === AuditType.Internal || (auditType === AuditType.External && externalEntity))) {
             addAudit({ 
                 title, 
                 department, 
                 auditeeId: auditee.id, 
                 date, 
                 additionalDates: additionalDates.filter(d => d),
                 reportDate,
                 status,
                 type: auditType,
                 externalEntity: auditType === AuditType.External ? externalEntity : undefined,
                 location,
                 fstdId: department === 'Engineering' ? fstdId : undefined
            }, findings as Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]);
            
            setCreateModalOpen(false);
            // Reset form
            setTitle(''); setDepartment(''); setDate(new Date().toISOString().split('T')[0]); setFindings([]);
            setAuditType(AuditType.Internal); setExternalEntity(''); setAdditionalDates([]);
            setReportDate(new Date().toISOString().split('T')[0]); setFstdId('');
        } else {
            alert('Please fill all required fields and ensure an auditee exists for the selected department.');
        }
    };

    const getFindingCounts = (auditId: string) => {
        const relevantFindings = allFindings.filter(f => f.auditId === auditId);
        return relevantFindings.length
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Audit Reports</h1>
                {canCreateAudit && (
                    <button 
                        onClick={() => setCreateModalOpen(true)}
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
                                <tr key={audit.id} className="bg-white border-b hover:bg-gray-50">
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
                                    <td className="px-6 py-4">{audit.status}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedAuditId(audit.id)} className="text-primary hover:underline flex items-center gap-1">
                                           <FileTextIcon className="h-4 w-4" /> View
                                        </button>
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
                <Modal size="custom-xl" title="Create New Audit Report" onClose={() => setCreateModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Audit Type Selection */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Audit Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="auditType" 
                                            value={AuditType.Internal}
                                            checked={auditType === AuditType.Internal} 
                                            onChange={() => setAuditType(AuditType.Internal)}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span>Internal Audit</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="auditType" 
                                            value={AuditType.External}
                                            checked={auditType === AuditType.External} 
                                            onChange={() => setAuditType(AuditType.External)}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span>External Audit</span>
                                    </label>
                                </div>
                            </div>
                            
                            {auditType === AuditType.External && (
                                <div>
                                    <label className="block text-sm font-medium">External Entity / Authority Name</label>
                                    <input 
                                        type="text" 
                                        value={externalEntity} 
                                        onChange={e => setExternalEntity(e.target.value)} 
                                        placeholder="e.g., EASA, FAA, CAA"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2" 
                                        required 
                                    />
                                </div>
                            )}
                        </div>

                        {/* General Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Audit Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Department (Auditee)</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                    <option value="">Select Department</option>
                                    {[...new Set(users.filter(u => u.role === UserRole.Auditee).map(u => u.department))].map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Location</label>
                                <select value={location} onChange={e => setLocation(e.target.value as Location)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                    {Object.values(Location).map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional FSTD Dropdown */}
                            {department === 'Engineering' && (
                                <div>
                                    <label className="block text-sm font-medium">FSTD (Optional)</label>
                                    <select value={fstdId} onChange={e => setFstdId(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                                        <option value="">Select FSTD...</option>
                                        {FSTD_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        {/* Dates Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Audit Execution Dates</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
                                        <span className="text-xs text-gray-500">Day 1</span>
                                    </div>
                                    {additionalDates.map((d, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input type="date" value={d} onChange={e => updateAdditionalDate(idx, e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
                                            <button type="button" onClick={() => setAdditionalDates(additionalDates.filter((_, i) => i !== idx))} className="text-red-500 text-xs">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addDate} className="text-sm text-primary hover:underline">+ Add Another Date</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Report Date</label>
                                <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                                <p className="text-xs text-gray-500 mt-1">The date this report is finalized.</p>
                            </div>
                        </div>

                        <hr />
                        <h3 className="text-lg font-semibold">Findings</h3>
                        {findings.map((finding, index) => (
                             <div key={index} className="p-4 border rounded-md space-y-4 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-700">Finding #{index + 1}</h4>
                                    <button type="button" onClick={() => setFindings(findings.filter((_, i) => i !== index))} className="text-red-500 text-xs hover:underline">Remove Finding</button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Custom ID for External */}
                                    {auditType === AuditType.External && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-purple-700">Custom Finding ID (External Ref)</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., EXT-2025-001"
                                                value={finding.customId} 
                                                onChange={e => handleFindingChange(index, 'customId', e.target.value)} 
                                                className="mt-1 w-full border border-purple-300 rounded-md p-2 bg-purple-50" 
                                                required 
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm">Reference Document</label>
                                        <input type="text" value={finding.referenceDoc} onChange={e => handleFindingChange(index, 'referenceDoc', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Reference Clause</label>
                                        <input type="text" value={finding.referencePara} onChange={e => handleFindingChange(index, 'referencePara', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Finding Level</label>
                                        <select value={finding.level} onChange={e => handleFindingChange(index, 'level', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                            {Object.values(FindingLevel).map(level => <option key={level} value={level}>{level}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm">Evidence Attachments</label>
                                        <input type="file" onChange={(e) => handleFileUpload(index, e)} className="mt-1 w-full text-sm text-gray-500" />
                                        {finding.attachments && finding.attachments.length > 0 && (
                                            <div className="mt-1 text-xs text-blue-600">
                                                Attached: {finding.attachments.map(a => a.name).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm">Description</label>
                                        <textarea value={finding.description} onChange={e => handleFindingChange(index, 'description', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" rows={3} required />
                                    </div>
                                </div>
                             </div>
                        ))}
                        
                        <button type="button" onClick={handleAddFinding} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors">
                            + Add Another Finding
                        </button>
                        
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg">Cancel</button>
                            <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg">Submit Audit Report</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AuditReportsPage;
