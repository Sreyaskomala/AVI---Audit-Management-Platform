
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, Finding, CAR, FindingStatus, Attachment, ExtensionStatus } from '../types';
import Modal from './shared/Modal';

const CarManagementPage: React.FC = () => {
    const { currentUser, findings, cars, users, submitCar, reviewCar, requestExtension, processExtension } = useAppContext();
    const [activeTab, setActiveTab] = useState<'submissions' | 'extensions'>('submissions');

    // State for CAR
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
    const [selectedCar, setSelectedCar] = useState<CAR | null>(null);
    const [rootCause, setRootCause] = useState('');
    const [correctiveAction, setCorrectiveAction] = useState('');
    const [evidence, setEvidence] = useState('');
    const [proposedClosureDate, setProposedClosureDate] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    
    // New: Auditee Intent
    const [auditeeStatus, setAuditeeStatus] = useState<'Open' | 'Closed'>('Open');

    // Extension within CAR submission
    const [requestExtensionWithCar, setRequestExtensionWithCar] = useState(false);
    const [extensionDateWithCar, setExtensionDateWithCar] = useState('');
    const [extensionReasonWithCar, setExtensionReasonWithCar] = useState('');
    
    // State for Extension (Stand alone - rarely used now but kept for legacy)
    const [extensionFinding, setExtensionFinding] = useState<Finding | null>(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');

    // State for CAR review
    const [remarks, setRemarks] = useState('');
    const [rootCauseRemarks, setRootCauseRemarks] = useState('');
    const [correctiveActionRemarks, setCorrectiveActionRemarks] = useState('');
    const [closeFinding, setCloseFinding] = useState(false);
    const [approveExtension, setApproveExtension] = useState<boolean | null>(null); // null = no action, true = approve, false = reject

    // Reset fields when finding is selected
    useEffect(() => {
        if (selectedFinding) {
            // If finding already has a root cause, pre-fill it
            if (selectedFinding.rootCause) {
                setRootCause(selectedFinding.rootCause);
            } else {
                setRootCause('');
            }
            setCorrectiveAction('');
            setEvidence('');
            setProposedClosureDate('');
            setAttachments([]);
            setAuditeeStatus('Open');
        }
    }, [selectedFinding]);

    // Set initial close state based on Auditee's request when reviewing
    useEffect(() => {
        if (selectedCar) {
            setCloseFinding(selectedCar.auditeeStatus === 'Closed');
        }
    }, [selectedCar]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newAttachment: Attachment = {
                name: file.name,
                url: '#',
                type: file.type.includes('image') ? 'image' : 'document'
            };
            setAttachments([...attachments, newAttachment]);
        }
    };

    const handleSubmitCar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFinding && rootCause && correctiveAction && evidence && proposedClosureDate) {
            submitCar({
                findingId: selectedFinding.id,
                rootCause,
                correctiveAction,
                evidence,
                attachments,
                proposedClosureDate,
                auditeeStatus
            }, requestExtensionWithCar ? { date: extensionDateWithCar, reason: extensionReasonWithCar } : undefined);
            
            setSelectedFinding(null);
            // Reset fields
            setRootCause(''); setCorrectiveAction(''); setEvidence(''); setProposedClosureDate(''); setAttachments([]);
            setRequestExtensionWithCar(false); setExtensionDateWithCar(''); setExtensionReasonWithCar('');
        }
    };
    
    const handleSubmitExtension = (e: React.FormEvent) => {
        e.preventDefault();
        if (extensionFinding && extensionDate && extensionReason) {
            requestExtension(extensionFinding.id, extensionDate, extensionReason);
            setExtensionFinding(null);
            setExtensionDate(''); setExtensionReason('');
        }
    }
    
    const handleReviewCar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCar && remarks) {
            reviewCar(
                selectedCar.id, 
                remarks, 
                rootCauseRemarks, 
                correctiveActionRemarks, 
                closeFinding, 
                approveExtension === true ? 'Approved' : approveExtension === false ? 'Rejected' : undefined
            );
            setSelectedCar(null);
            setRemarks(''); setRootCauseRemarks(''); setCorrectiveActionRemarks(''); setCloseFinding(false); setApproveExtension(null);
        }
    };

    const auditeeFindings = findings.filter(f => {
        const audit = useAppContext().audits.find(a => a.id === f.auditId);
        return audit?.auditeeId === currentUser?.id && (f.status !== FindingStatus.Closed);
    });

    const carsToReview = cars.filter(c => {
        const audit = useAppContext().audits.find(a => a.id === c.auditId);
        return audit?.auditorId === currentUser?.id && c.status === 'Pending Review';
    });

    // --- Auditee View ---
    if (currentUser?.role === UserRole.Auditee) {
        return (
            <div className="container mx-auto">
                <div className="flex space-x-4 mb-6">
                    <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'submissions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>My Findings & Actions</button>
                </div>

                {activeTab === 'submissions' && (
                    <div className="space-y-4">
                        {auditeeFindings.length === 0 && <p className="text-gray-500">No open findings requiring action.</p>}
                        {auditeeFindings.map(finding => {
                            const findingCars = cars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                            const nextCarNumber = findingCars.length + 1;
                            
                            return (
                                <div key={finding.id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-lg text-gray-800">{finding.customId || finding.id}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    finding.status === FindingStatus.Open ? 'bg-blue-100 text-blue-800' :
                                                    finding.status === FindingStatus.CARSubmitted ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {finding.status}
                                                </span>
                                                {finding.extensionStatus !== ExtensionStatus.None && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                                        finding.extensionStatus === ExtensionStatus.Pending ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                        finding.extensionStatus === ExtensionStatus.Approved ? 'bg-green-100 text-green-800 border-green-200' :
                                                        'bg-red-100 text-red-800 border-red-200'
                                                    }`}>
                                                        Extension: {finding.extensionStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mt-1">{finding.description}</p>
                                            <p className="text-xs text-red-500 mt-1 font-semibold">
                                                Deadline: {new Date(finding.deadline!).toLocaleDateString()}
                                                {finding.extensionStatus === ExtensionStatus.Approved && " (Extended)"}
                                            </p>
                                            
                                            {/* History of CARs */}
                                            {findingCars.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Action History</p>
                                                    {findingCars.map(car => (
                                                        <div key={car.id} className="text-sm bg-gray-50 border p-3 rounded-md">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-gray-700">CAR {car.carNumber} ({new Date(car.submissionDate).toLocaleDateString()})</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${car.status === 'Pending Review' ? 'bg-yellow-200' : 'bg-green-200'}`}>{car.status}</span>
                                                            </div>
                                                            <p className="text-gray-600 mt-1"><span className="font-semibold">Action:</span> {car.correctiveAction}</p>
                                                            {car.auditorRemarks && (
                                                                <div className="mt-2 text-xs bg-white p-2 border rounded">
                                                                    <span className="font-bold text-blue-700">Auditor:</span> {car.auditorRemarks}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 md:mt-0 md:ml-4">
                                            <button 
                                                onClick={() => setSelectedFinding(finding)} 
                                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto shadow-md whitespace-nowrap"
                                            >
                                                {findingCars.length > 0 ? `+ Add Update (CAR ${nextCarNumber})` : 'Submit Initial CAR'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Submit CAR Modal */}
                {selectedFinding && (
                    <Modal title={`Submit CAR Update for: ${selectedFinding.id}`} onClose={() => setSelectedFinding(null)}>
                        <form onSubmit={handleSubmitCar} className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
                                Please provide the Corrective Action Report details below. You can also request a deadline extension if the issue requires more time to resolve.
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Root Cause Analysis</label>
                                {selectedFinding.rootCause ? (
                                    <div className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-700">
                                        {selectedFinding.rootCause}
                                        <div className="text-xs text-gray-500 mt-1 italic">Root cause established in previous CAR. Read-only.</div>
                                    </div>
                                ) : (
                                    <textarea value={rootCause} onChange={e => setRootCause(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required placeholder="Enter the root cause of the finding..." />
                                )}
                            </div>
                            
                            <div><label className="block text-sm font-medium">Corrective Action Taken / Update</label><textarea value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required placeholder="What actions have been taken since last update?" /></div>
                            <div><label className="block text-sm font-medium">Evidence Description</label><textarea value={evidence} onChange={e => setEvidence(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            
                            {/* Evidence Upload */}
                            <div>
                                <label className="block text-sm font-medium">Evidence Upload (Photo/Doc)</label>
                                <input type="file" onChange={handleFileUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {attachments.length > 0 && <p className="text-xs text-gray-500 mt-1">{attachments.length} file(s) attached.</p>}
                            </div>

                            <div><label className="block text-sm font-medium">Proposed Closure Date</label><input type="date" value={proposedClosureDate} onChange={e => setProposedClosureDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            
                            {/* Submission Status Intent */}
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                <label className="block text-sm font-medium mb-2">Submission Status</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="auditeeStatus" checked={auditeeStatus === 'Open'} onChange={() => setAuditeeStatus('Open')} className="text-primary focus:ring-primary" />
                                        <span>Work in Progress (Keep Open)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="auditeeStatus" checked={auditeeStatus === 'Closed'} onChange={() => setAuditeeStatus('Closed')} className="text-primary focus:ring-primary" />
                                        <span className="font-bold text-green-700">Corrective Action Complete (Ready for Closure Verification)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Integrated Extension Request */}
                            <div className="mt-6 border-t pt-4 bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="reqExt" 
                                        checked={requestExtensionWithCar} 
                                        onChange={e => setRequestExtensionWithCar(e.target.checked)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="reqExt" className="ml-2 block text-sm font-bold text-gray-700">Request Deadline Extension with this submission?</label>
                                </div>
                                {requestExtensionWithCar && (
                                    <div className="mt-3 pl-6 space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Requested New Deadline (Date)</label>
                                            <input type="date" value={extensionDateWithCar} onChange={e => setExtensionDateWithCar(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required={requestExtensionWithCar} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Reason for Extension</label>
                                            <input type="text" value={extensionReasonWithCar} onChange={e => setExtensionReasonWithCar(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" placeholder="Why do you need more time?" required={requestExtensionWithCar} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={() => setSelectedFinding(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Submit Update</button></div>
                        </form>
                    </Modal>
                )}
            </div>
        );
    }

    // --- Auditor View ---
    return (
         <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">CAR Reviews</h1>
            
            <div className="space-y-4">
                {carsToReview.length === 0 && <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">No pending CARs to review.</div>}
                
                {carsToReview.map(car => {
                    const finding = findings.find(f => f.id === car.findingId);
                    return (
                    <div key={car.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">CAR #{car.carNumber}</span>
                                {finding?.extensionStatus === ExtensionStatus.Pending && (
                                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded border border-purple-200 animate-pulse">Extension Requested</span>
                                )}
                                {car.auditeeStatus === 'Closed' && (
                                     <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">Closure Requested</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">{car.findingId}</h3>
                            <p className="text-gray-600 text-sm mt-1">Submitted: {new Date(car.submissionDate).toLocaleDateString()}</p>
                            <div className="mt-2 text-sm">
                                <span className="font-semibold text-gray-700">Action:</span> {car.correctiveAction.substring(0, 100)}...
                            </div>
                        </div>
                        <button onClick={() => setSelectedCar(car)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg shadow transition-transform transform hover:scale-105">
                            Review CAR
                        </button>
                    </div>
                )})}
            </div>

             {selectedCar && (
                <Modal title={`Review CAR ${selectedCar.carNumber} for ${selectedCar.findingId}`} onClose={() => setSelectedCar(null)}>
                     <form onSubmit={handleReviewCar} className="space-y-6">
                        
                        {/* Status Requested Banner */}
                        <div className={`p-4 rounded border-l-4 ${selectedCar.auditeeStatus === 'Closed' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-blue-50 border-blue-500 text-blue-800'}`}>
                            <h4 className="font-bold flex items-center gap-2">
                                Auditee Status: {selectedCar.auditeeStatus === 'Closed' ? 'Ready for Closure Verification' : 'Work in Progress (Update Only)'}
                            </h4>
                            <p className="text-sm mt-1">
                                {selectedCar.auditeeStatus === 'Closed' 
                                    ? "The auditee believes corrective actions are complete. Please verify evidence and decide whether to Close the finding." 
                                    : "This is a progress update. The finding is expected to remain Open."}
                            </p>
                        </div>

                        {/* Extension Request Section inside Review Modal */}
                        {findings.find(f => f.id === selectedCar.findingId)?.extensionStatus === ExtensionStatus.Pending && (
                            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded shadow-sm">
                                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                                    <span className="text-xl">⏳</span> Extension Requested
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-600 block">Requested Deadline:</span>
                                        <span className="font-bold text-gray-900">
                                            {new Date(findings.find(f => f.id === selectedCar.findingId)?.requestedDeadline || '').toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 block">Reason:</span>
                                        <span className="italic text-gray-900">
                                            "{findings.find(f => f.id === selectedCar.findingId)?.extensionReason}"
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center bg-white p-2 rounded border border-purple-100">
                                    <span className="font-semibold text-gray-700 text-sm">Decision:</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="extDecision" onChange={() => setApproveExtension(true)} className="text-green-600 focus:ring-green-500" />
                                        <span className="text-sm text-green-700 font-medium">Approve</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="extDecision" onChange={() => setApproveExtension(false)} className="text-red-600 focus:ring-red-500" />
                                        <span className="text-sm text-red-700 font-medium">Reject</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* History Context */}
                        {cars.filter(c => c.findingId === selectedCar.findingId && c.id !== selectedCar.id).length > 0 && (
                            <div className="bg-gray-100 p-3 rounded-md mb-4 max-h-40 overflow-y-auto">
                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Previous History</h4>
                                {cars.filter(c => c.findingId === selectedCar.findingId && c.id !== selectedCar.id).map(c => (
                                    <div key={c.id} className="text-xs mb-2 border-b pb-1">
                                        <span className="font-bold">CAR {c.carNumber}:</span> {c.status}
                                        <p className="truncate text-gray-600">{c.correctiveAction}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Evidence Display */}
                        {selectedCar.attachments && selectedCar.attachments.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="font-semibold text-blue-900 text-sm mb-2">Attached Evidence</h4>
                                <div className="flex gap-2">
                                    {selectedCar.attachments.map((att, i) => (
                                        <div key={i} className="bg-white border p-2 rounded text-xs flex items-center text-blue-700">
                                            <span className="truncate max-w-[150px]">📎 {att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Root Cause Section */}
                        <div className="space-y-2">
                             <h4 className="font-semibold text-gray-700">1. Root Cause Analysis (Submitted by Auditee)</h4>
                             <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap">{selectedCar.rootCause || findings.find(f => f.id === selectedCar.findingId)?.rootCause}</div>
                             <textarea 
                                placeholder="Auditor remarks on Root Cause..." 
                                value={rootCauseRemarks} 
                                onChange={e => setRootCauseRemarks(e.target.value)}
                                className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-primary focus:border-primary"
                                rows={2}
                             />
                        </div>

                        {/* Corrective Action Section */}
                         <div className="space-y-2">
                             <h4 className="font-semibold text-gray-700">2. Corrective Action Plan (Submitted by Auditee)</h4>
                             <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap">{selectedCar.correctiveAction}</div>
                             <textarea 
                                placeholder="Auditor remarks on Corrective Action..." 
                                value={correctiveActionRemarks} 
                                onChange={e => setCorrectiveActionRemarks(e.target.value)}
                                className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-primary focus:border-primary"
                                rows={2}
                             />
                        </div>

                        <div className="space-y-1 text-sm">
                            <h4 className="font-semibold text-gray-700">3. Evidence Description</h4>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800">{selectedCar.evidence}</div>
                        </div>

                        {/* Decision */}
                        <div className="border-t pt-6 bg-gray-50 -mx-6 px-6 pb-2 rounded-b-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Auditor Remarks</label>
                            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-primary focus:border-primary" rows={3} required />

                            <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={closeFinding} 
                                        onChange={e => setCloseFinding(e.target.checked)}
                                        className="h-6 w-6 text-success focus:ring-success rounded border-gray-300"
                                    />
                                    <div>
                                        <span className="font-bold text-gray-800 block">
                                            {selectedCar.auditeeStatus === 'Closed' ? 'Verify & Close Finding' : 'Force Close Finding'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {selectedCar.auditeeStatus === 'Closed' 
                                                ? "Auditee requested closure. Check box to confirm." 
                                                : "Auditee did NOT request closure. Only check this if you disagree and want to close it now."}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setSelectedCar(null)} className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark shadow-lg">Submit Review</button>
                            </div>
                        </div>
                    </form>
                </Modal>
             )}
        </div>
    );
};

export default CarManagementPage;
