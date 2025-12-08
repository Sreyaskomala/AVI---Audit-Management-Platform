
import React, { useState } from 'react';
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
    
    // Extension within CAR submission
    const [requestExtensionWithCar, setRequestExtensionWithCar] = useState(false);
    const [extensionDateWithCar, setExtensionDateWithCar] = useState('');
    const [extensionReasonWithCar, setExtensionReasonWithCar] = useState('');
    
    // State for Extension (Stand alone)
    const [extensionFinding, setExtensionFinding] = useState<Finding | null>(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');

    // State for CAR review
    const [remarks, setRemarks] = useState('');
    const [rootCauseRemarks, setRootCauseRemarks] = useState('');
    const [correctiveActionRemarks, setCorrectiveActionRemarks] = useState('');
    const [closeFinding, setCloseFinding] = useState(false);

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
            reviewCar(selectedCar.id, remarks, rootCauseRemarks, correctiveActionRemarks, closeFinding);
            setSelectedCar(null);
            setRemarks(''); setRootCauseRemarks(''); setCorrectiveActionRemarks(''); setCloseFinding(false);
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

    const extensionsToReview = findings.filter(f => {
        const audit = useAppContext().audits.find(a => a.id === f.auditId);
        return audit?.auditorId === currentUser?.id && f.extensionStatus === ExtensionStatus.Pending;
    });

    // --- Auditee View ---
    if (currentUser?.role === UserRole.Auditee) {
        return (
            <div className="container mx-auto">
                <div className="flex space-x-4 mb-6">
                    <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'submissions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>My Findings & Actions</button>
                    <button onClick={() => setActiveTab('extensions')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'extensions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>Extension Requests</button>
                </div>

                {activeTab === 'submissions' && (
                    <div className="space-y-4">
                        {auditeeFindings.length === 0 && <p className="text-gray-500">No open findings requiring action.</p>}
                        {auditeeFindings.map(finding => {
                            const findingCars = cars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                            
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
                                            </div>
                                            <p className="text-gray-600 mt-1">{finding.description}</p>
                                            <p className="text-xs text-red-500 mt-1 font-semibold">Deadline: {new Date(finding.deadline!).toLocaleDateString()}</p>
                                            
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
                                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto shadow-md"
                                            >
                                                {findingCars.length > 0 ? '+ Add Update / CAR' : 'Submit Initial CAR'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'extensions' && (
                    <div className="space-y-4">
                         {auditeeFindings.map(finding => (
                             <div key={finding.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                                 <div>
                                    <p className="font-bold">{finding.customId || finding.id}</p>
                                    <p className="text-sm">Current Deadline: {new Date(finding.deadline!).toLocaleDateString()}</p>
                                    {finding.extensionStatus !== ExtensionStatus.None && (
                                        <p className={`text-xs font-bold ${finding.extensionStatus === ExtensionStatus.Approved ? 'text-green-600' : finding.extensionStatus === ExtensionStatus.Rejected ? 'text-red-600' : 'text-yellow-600'}`}>
                                            Extension Status: {finding.extensionStatus}
                                        </p>
                                    )}
                                 </div>
                                 {finding.extensionStatus !== ExtensionStatus.Pending && finding.extensionStatus !== ExtensionStatus.Approved && (
                                    <button onClick={() => setExtensionFinding(finding)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">Request Extension</button>
                                 )}
                             </div>
                         ))}
                    </div>
                )}

                {/* Submit CAR Modal */}
                {selectedFinding && (
                    <Modal title={`Submit CAR for Finding: ${selectedFinding.id}`} onClose={() => setSelectedFinding(null)}>
                        <form onSubmit={handleSubmitCar} className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
                                You are submitting an update for this finding. This will create a chronological entry in the finding history.
                            </div>

                            <div><label className="block text-sm font-medium">Root Cause Analysis</label><textarea value={rootCause} onChange={e => setRootCause(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div><label className="block text-sm font-medium">Corrective Action Taken</label><textarea value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div><label className="block text-sm font-medium">Evidence Description</label><textarea value={evidence} onChange={e => setEvidence(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            
                            {/* Evidence Upload */}
                            <div>
                                <label className="block text-sm font-medium">Evidence Upload (Photo/Doc)</label>
                                <input type="file" onChange={handleFileUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {attachments.length > 0 && <p className="text-xs text-gray-500 mt-1">{attachments.length} file(s) attached.</p>}
                            </div>

                            <div><label className="block text-sm font-medium">Proposed Closure Date</label><input type="date" value={proposedClosureDate} onChange={e => setProposedClosureDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            
                            {/* Integrated Extension Request */}
                            <div className="mt-6 border-t pt-4">
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
                                    <div className="mt-3 pl-6 space-y-3 bg-yellow-50 p-3 rounded">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Requested New Deadline</label>
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

                {/* Request Extension Modal (Standalone) */}
                {extensionFinding && (
                    <Modal title={`Request Extension: ${extensionFinding.id}`} onClose={() => setExtensionFinding(null)} size="md">
                        <form onSubmit={handleSubmitExtension} className="space-y-4">
                            <p className="text-sm text-gray-600">Current Deadline: {new Date(extensionFinding.deadline!).toLocaleDateString()}</p>
                            <div>
                                <label className="block text-sm font-medium">New Requested Date</label>
                                <input type="date" value={extensionDate} onChange={e => setExtensionDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Reason for Delay</label>
                                <textarea value={extensionReason} onChange={e => setExtensionReason(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" rows={3} placeholder="e.g., Logistic delay, waiting for parts..." required />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setExtensionFinding(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">Request</button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        );
    }

    // --- Auditor View ---
    return (
         <div className="container mx-auto">
            <div className="flex space-x-4 mb-6">
                <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'submissions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                    CAR Reviews <span className="ml-2 bg-white text-primary text-xs px-2 py-0.5 rounded-full">{carsToReview.length}</span>
                </button>
                <button onClick={() => setActiveTab('extensions')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'extensions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                    Extension Requests <span className="ml-2 bg-white text-primary text-xs px-2 py-0.5 rounded-full">{extensionsToReview.length}</span>
                </button>
            </div>

            {activeTab === 'submissions' && (
                <div className="space-y-4">
                    {carsToReview.length === 0 && <p className="text-gray-500">No pending CARs to review.</p>}
                    {carsToReview.map(car => (
                        <div key={car.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">CAR {car.carNumber} <span className="text-sm font-normal text-gray-500">(for {car.findingId})</span></p>
                                <p className="text-gray-600 text-sm">Submitted on {new Date(car.submissionDate).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedCar(car)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Review CAR</button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'extensions' && (
                <div className="space-y-4">
                     {extensionsToReview.length === 0 && <p className="text-gray-500">No pending extension requests.</p>}
                     {extensionsToReview.map(finding => (
                         <div key={finding.id} className="bg-white p-4 rounded-lg shadow-sm border space-y-2">
                             <div className="flex justify-between">
                                 <h3 className="font-bold">{finding.customId || finding.id}</h3>
                                 <span className="text-sm bg-yellow-100 text-yellow-800 px-2 rounded">Extension Requested</span>
                             </div>
                             <p className="text-sm">Current Deadline: <span className="font-medium">{new Date(finding.deadline!).toLocaleDateString()}</span></p>
                             <p className="text-sm">Requested Deadline: <span className="font-bold text-primary">{new Date(finding.requestedDeadline!).toLocaleDateString()}</span></p>
                             <p className="text-sm bg-gray-50 p-2 rounded border">Reason: {finding.extensionReason}</p>
                             <div className="flex justify-end space-x-2">
                                 <button onClick={() => processExtension(finding.id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                                 <button onClick={() => processExtension(finding.id, 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                             </div>
                         </div>
                     ))}
                </div>
            )}

             {selectedCar && (
                <Modal title={`Review CAR ${selectedCar.carNumber} for ${selectedCar.findingId}`} onClose={() => setSelectedCar(null)}>
                     <form onSubmit={handleReviewCar} className="space-y-6">
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
                            <div className="bg-blue-50 p-4 rounded-md">
                                <h4 className="font-semibold text-blue-900 text-sm mb-2">Attached Evidence</h4>
                                <div className="flex gap-2">
                                    {selectedCar.attachments.map((att, i) => (
                                        <div key={i} className="bg-white border p-2 rounded text-xs flex items-center">
                                            <span className="truncate max-w-[150px]">{att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Root Cause Section */}
                        <div className="space-y-2">
                             <h4 className="font-semibold text-gray-700">1. Root Cause Analysis</h4>
                             <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap">{selectedCar.rootCause}</div>
                             <textarea 
                                placeholder="Auditor remarks on Root Cause..." 
                                value={rootCauseRemarks} 
                                onChange={e => setRootCauseRemarks(e.target.value)}
                                className="w-full border-gray-300 rounded-md text-sm p-2"
                                rows={2}
                             />
                        </div>

                        {/* Corrective Action Section */}
                         <div className="space-y-2">
                             <h4 className="font-semibold text-gray-700">2. Corrective Action Plan</h4>
                             <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap">{selectedCar.correctiveAction}</div>
                             <textarea 
                                placeholder="Auditor remarks on Corrective Action..." 
                                value={correctiveActionRemarks} 
                                onChange={e => setCorrectiveActionRemarks(e.target.value)}
                                className="w-full border-gray-300 rounded-md text-sm p-2"
                                rows={2}
                             />
                        </div>

                        <div className="space-y-1 text-sm">
                            <h4 className="font-semibold text-gray-700">3. Evidence Description</h4>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800">{selectedCar.evidence}</div>
                        </div>

                        {/* Decision */}
                        <div className="border-t pt-6 bg-gray-50 -mx-6 px-6 pb-2 rounded-b-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Remarks</label>
                            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 mb-4" rows={3} required />

                            <div className="flex items-center gap-4 bg-white p-3 rounded border mb-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={closeFinding} 
                                        onChange={e => setCloseFinding(e.target.checked)}
                                        className="h-5 w-5 text-success focus:ring-success rounded"
                                    />
                                    <span className="font-bold text-gray-800">Close this Finding?</span>
                                </label>
                                <span className="text-xs text-gray-500">
                                    (Check this if the CAR fully resolves the issue. Leave unchecked if further action/CARs are required.)
                                </span>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setSelectedCar(null)} className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Submit Review</button>
                            </div>
                        </div>
                    </form>
                </Modal>
             )}
        </div>
    );
};

export default CarManagementPage;
