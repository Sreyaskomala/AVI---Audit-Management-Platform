
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, Finding, FindingLevel, UserRole, AuditType, Location, Attachment, Audit } from '../types';
import Modal from './shared/Modal';
import { FSTD_OPTIONS } from '../constants';

interface CreateAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
    existingAudit?: Audit;
    existingFindings?: Finding[];
}

const CreateAuditModal: React.FC<CreateAuditModalProps> = ({ isOpen, onClose, initialDate, existingAudit, existingFindings }) => {
    const { users, addAudit, updateAudit } = useAppContext();
    
    // Form State
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [additionalDates, setAdditionalDates] = useState<string[]>([]);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [findings, setFindings] = useState<Partial<Finding>[]>([]);
    const [auditType, setAuditType] = useState<AuditType>(AuditType.Internal);
    const [externalEntity, setExternalEntity] = useState('');
    const [location, setLocation] = useState<Location>(Location.LOCATION_1);
    const [fstdId, setFstdId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (existingAudit) {
                // Populate form for editing existing draft
                setTitle(existingAudit.title);
                setDepartment(existingAudit.department);
                setDate(existingAudit.date);
                setAdditionalDates(existingAudit.additionalDates || []);
                setReportDate(existingAudit.reportDate || new Date().toISOString().split('T')[0]);
                setAuditType(existingAudit.type);
                setExternalEntity(existingAudit.externalEntity || '');
                setLocation(existingAudit.location || Location.LOCATION_1);
                setFstdId(existingAudit.fstdId || '');
                // Deep copy findings to avoid mutating context directly before save
                setFindings(existingFindings ? existingFindings.map(f => ({...f})) : []);
            } else {
                // Reset/Init for new audit
                setDate(initialDate || new Date().toISOString().split('T')[0]);
                setTitle(''); setDepartment(''); 
                setFindings([]); setAuditType(AuditType.Internal); 
                setExternalEntity(''); setAdditionalDates([]);
                setReportDate(new Date().toISOString().split('T')[0]); setFstdId('');
            }
        }
    }, [initialDate, isOpen, existingAudit, existingFindings]);

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

    const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newAttachment: Attachment = {
                name: file.name,
                url: '#',
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

    const handleSave = (e: React.FormEvent, targetStatus: AuditStatus) => {
        e.preventDefault();
        
        // Basic Validation
        if (!title || !department) {
             alert('Please fill in Title and Department.');
             return;
        }

        const auditee = users.find(u => u.department === department && u.role === UserRole.Auditee);
        if (!auditee) {
            alert(`No Auditee user found for the '${department}' department. Please create a user for this department first in User Management.`);
            return;
        }

        const auditPayload = {
             title, 
             department, 
             auditeeId: auditee.id, 
             date, 
             additionalDates: additionalDates.filter(d => d),
             reportDate,
             status: targetStatus, // This determines if it's Draft or CARPending
             type: auditType,
             externalEntity: auditType === AuditType.External ? externalEntity : undefined,
             location,
             fstdId: department === 'Engineering' ? fstdId : undefined
        };

        if (existingAudit) {
            // Update existing Draft
            updateAudit(existingAudit.id, auditPayload, findings as Finding[]);
        } else {
            // Create New
            addAudit(auditPayload, findings as Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]);
        }
        
        onClose();
    };

    return (
        <Modal size="custom-xl" title={existingAudit ? `Edit Draft Audit: ${existingAudit.id}` : "Create New Audit Report"} onClose={onClose}>
            <form className="space-y-6">
                
                {/* Audit Type Selection */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Audit Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white hover:shadow-sm transition-all">
                                <input 
                                    type="radio" 
                                    name="auditType" 
                                    value={AuditType.Internal}
                                    checked={auditType === AuditType.Internal} 
                                    onChange={() => setAuditType(AuditType.Internal)}
                                    className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="font-medium">Internal Audit</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white hover:shadow-sm transition-all">
                                <input 
                                    type="radio" 
                                    name="auditType" 
                                    value={AuditType.External}
                                    checked={auditType === AuditType.External} 
                                    onChange={() => setAuditType(AuditType.External)}
                                    className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="font-medium">External Audit</span>
                            </label>
                        </div>
                    </div>
                    
                    {auditType === AuditType.External && (
                        <div>
                            <label className="block text-sm font-medium text-purple-700">External Entity / Authority Name</label>
                            <input 
                                type="text" 
                                value={externalEntity} 
                                onChange={e => setExternalEntity(e.target.value)} 
                                placeholder="e.g., EASA, FAA, CAA"
                                className="mt-1 w-full border border-purple-300 rounded-md p-2 focus:border-purple-500 focus:ring-purple-200" 
                                required 
                            />
                        </div>
                    )}
                </div>

                {/* General Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Audit Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department (Auditee)</label>
                        <select value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Department</option>
                            {[...new Set(users.filter(u => u.role === UserRole.Auditee).map(u => u.department))].map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <select value={location} onChange={e => setLocation(e.target.value as Location)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                            {Object.values(Location).map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {/* Conditional FSTD Dropdown */}
                    {department === 'Engineering' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">FSTD (Optional)</label>
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
                        <h3 className="text-sm font-semibold mb-2 text-gray-700">Audit Execution Dates</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
                                <span className="text-xs text-gray-500 font-medium w-12">Day 1</span>
                            </div>
                            {additionalDates.map((d, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="date" value={d} onChange={e => updateAdditionalDate(idx, e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
                                    <span className="text-xs text-gray-500 font-medium w-12">Day {idx + 2}</span>
                                    <button type="button" onClick={() => setAdditionalDates(additionalDates.filter((_, i) => i !== idx))} className="text-red-500 text-xs hover:text-red-700 font-bold p-1">X</button>
                                </div>
                            ))}
                            <button type="button" onClick={addDate} className="text-sm text-primary hover:underline font-medium">+ Add Another Date</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Report Date</label>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        <p className="text-xs text-gray-500 mt-1">The date this report is finalized.</p>
                    </div>
                </div>

                <hr />
                <h3 className="text-lg font-semibold text-gray-800">Findings</h3>
                {findings.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 border border-dashed rounded-md text-gray-500">
                        No findings added yet. Click the button below to add one.
                    </div>
                )}
                {findings.map((finding, index) => (
                        <div key={index} className="p-4 border rounded-md space-y-4 bg-gray-50 relative group">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-700">Finding #{index + 1}</h4>
                            <button type="button" onClick={() => setFindings(findings.filter((_, i) => i !== index))} className="text-red-500 text-sm hover:text-red-700 font-medium">Remove Finding</button>
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
                                        className="mt-1 w-full border border-purple-300 rounded-md p-2 bg-purple-50 focus:border-purple-500 focus:ring-purple-200" 
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reference Document</label>
                                <input type="text" value={finding.referenceDoc} onChange={e => handleFindingChange(index, 'referenceDoc', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. CAR-147" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reference Clause</label>
                                <input type="text" value={finding.referencePara} onChange={e => handleFindingChange(index, 'referencePara', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. 147.A.100" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Finding Level</label>
                                <select value={finding.level} onChange={e => handleFindingChange(index, 'level', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                    {Object.values(FindingLevel).map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Evidence Attachments</label>
                                <input type="file" onChange={(e) => handleFileUpload(index, e)} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {finding.attachments && finding.attachments.length > 0 && (
                                    <div className="mt-1 text-xs text-blue-600 font-medium">
                                        Attached: {finding.attachments.map(a => a.name).join(', ')}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={finding.description} onChange={e => handleFindingChange(index, 'description', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" rows={3} placeholder="Describe the non-compliance..." required />
                            </div>
                        </div>
                        </div>
                ))}
                
                <button type="button" onClick={handleAddFinding} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-primary hover:text-primary hover:bg-gray-50 transition-all">
                    + Add New Finding
                </button>
                
                <div className="flex justify-between items-center pt-6 border-t">
                     <button type="button" onClick={onClose} className="text-gray-600 font-semibold hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
                     <div className="flex space-x-3">
                        <button 
                            type="button" 
                            onClick={(e) => handleSave(e, AuditStatus.Draft)} 
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button 
                            type="button" 
                            onClick={(e) => handleSave(e, AuditStatus.CARPending)} 
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            Finalize & Submit Report
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default CreateAuditModal;