import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuditStatus, Finding, FindingLevel, UserRole } from '../types';
import Modal from './shared/Modal';

const AuditReportsPage: React.FC = () => {
    const { audits, users, addAudit, findings: allFindings } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [auditeeId, setAuditeeId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState(AuditStatus.InProgress);
    const [findings, setFindings] = useState<Partial<Finding>[]>([]);

    const handleAddFinding = () => {
        // FIX: Changed FindingLevel.Minor to FindingLevel.LEVEL2 as 'Minor' is not a valid FindingLevel.
        setFindings([...findings, { referenceDoc: '', referencePara: '', level: FindingLevel.LEVEL2, description: '' }]);
    };

    const handleFindingChange = (index: number, field: keyof Finding, value: any) => {
        // FIX: The direct assignment was causing a TypeScript error and mutating state.
        // Creating a new object for the updated finding solves both issues.
        const newFindings = [...findings];
        newFindings[index] = {
            ...newFindings[index],
            [field]: value
        };
        setFindings(newFindings);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const auditee = users.find(u => u.department === department && u.role === UserRole.Auditee);
        if (title && department && auditee) {
             addAudit({ title, department, auditeeId: auditee.id, date, status }, findings as Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]);
            setCreateModalOpen(false);
            // Reset form
            setTitle(''); setDepartment(''); setDate(new Date().toISOString().split('T')[0]); setFindings([]);
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
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Create New Audit
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Ref No.</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Auditor</th>
                                <th className="px-6 py-3">Auditee</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Findings</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map(audit => {
                                const auditor = users.find(u => u.id === audit.auditorId);
                                const auditee = users.find(u => u.id === audit.auditeeId);
                                return (
                                <tr key={audit.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{audit.id}</td>
                                    <td className="px-6 py-4">{audit.title}</td>
                                    <td className="px-6 py-4">{audit.department}</td>
                                    <td className="px-6 py-4">{auditor?.name}</td>
                                    <td className="px-6 py-4">{auditee?.name}</td>
                                    <td className="px-6 py-4">{new Date(audit.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getFindingCounts(audit.id)}</td>
                                    <td className="px-6 py-4">{audit.status}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateModalOpen && (
                <Modal title="Create New Audit Report" onClose={() => setCreateModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Department</label>
                            <select value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                <option value="">Select Department</option>
                                {[...new Set(users.filter(u => u.role === UserRole.Auditee).map(u => u.department))].map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Audit Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        </div>
                        <hr />
                        <h3 className="text-lg font-semibold">Findings</h3>
                        {findings.map((finding, index) => (
                             <div key={index} className="p-4 border rounded-md space-y-2">
                                <h4 className="font-medium">Finding #{index + 1}</h4>
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
                                    <label className="block text-sm">Description</label>
                                    <textarea value={finding.description} onChange={e => handleFindingChange(index, 'description', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                                </div>
                             </div>
                        ))}
                        <button type="button" onClick={handleAddFinding} className="text-primary hover:underline">
                            + Add Finding
                        </button>
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Save Audit</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AuditReportsPage;