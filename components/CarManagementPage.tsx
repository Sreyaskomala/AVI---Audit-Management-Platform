
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, Finding, CAR, FindingStatus, Attachment, ExtensionStatus } from '../types';
import Modal from './shared/Modal';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import AuditReportView from './AuditReportView';

const CarManagementPage: React.FC = () => {
    const { currentUser, findings, cars, users, submitCar, reviewCar, requestExtension, processExtension } = useAppContext();
    
    // Tabs state
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    // State for CAR Submission (Auditee)
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
    const [rootCause, setRootCause] = useState('');
    const [correctiveAction, setCorrectiveAction] = useState('');
    const [evidence, setEvidence] = useState('');
    const [proposedClosureDate, setProposedClosureDate] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [auditeeStatus, setAuditeeStatus] = useState<'Open' | 'Closed'>('Open');

    // Extension within CAR submission
    const [requestExtensionWithCar, setRequestExtensionWithCar] = useState(false);
    const [extensionDateWithCar, setExtensionDateWithCar] = useState('');
    const [extensionReasonWithCar, setExtensionReasonWithCar] = useState('');
    
    // State for CAR review (Auditor)
    const [selectedCar, setSelectedCar] = useState<CAR | null>(null);
    const [remarks, setRemarks] = useState('');
    const [rootCauseRemarks, setRootCauseRemarks] = useState('');
    const [correctiveActionRemarks, setCorrectiveActionRemarks] = useState('');
    const [closeFinding, setCloseFinding] = useState(false);
    const [approveExtension, setApproveExtension] = useState<boolean | null>(null); 
    
    // State for Viewing Full Report
    const [reportViewId, setReportViewId] = useState<string | null>(null);

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
            setRequestExtensionWithCar(false);
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
                url: '#', // In a real app, this would be a blob URL or S3 link
                type: file.type.includes('image') ? 'image' : 'document'
            };
            setAttachments([...attachments, newAttachment]);
        }
    };

    // Helper to render attachments with download capability
    const renderAttachments = (atts: Attachment[] | undefined) => {
        if (!atts || atts.length === 0) return <span className="text-gray-400 text-xs italic">No attachments</span>;
        
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {atts.map((att, i) => (
                    <a 
                        key={i} 
                        href={att.url} 
                        download={att.name}
                        onClick={(e) => {
                            if(att.url === '#') {
                                e.preventDefault();
                                alert(`Simulating download for: ${att.name}`);
                            }
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 hover:border-blue-300 transition-colors text-sm text-blue-700 group"
                    >
                        {att.type === 'image' ? (
                            <span className="text-lg">🖼️</span>
                        ) : (
                            <FileTextIcon className="h-4 w-4" />
                        )}
                        <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                        <DownloadIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                    </a>
                ))}
            </div>
        );
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
        }
    };
    
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

    // --- Data Filtering ---

    // Auditee: Findings that need action (Open, Rejected, CARSubmitted but not closed)
    const auditeeOpenFindings = findings.filter(f => {
        const audit = useAppContext().audits.find(a => a.id === f.auditId);
        return audit?.auditeeId === currentUser?.id && f.status !== FindingStatus.Closed;
    });

    // Auditee: History (Closed findings OR findings where CARs have been submitted)
    const auditeeHistoryFindings = findings.filter(f => {
         const audit = useAppContext().audits.find(a => a.id === f.auditId);
         // It's in history if it's closed OR if there are CARs associated with it (even if open)
         const hasCars = cars.some(c => c.findingId === f.id);
         return audit?.auditeeId === currentUser?.id && (f.status === FindingStatus.Closed || hasCars);
    });

    // Auditor: Pending Reviews
    const carsToReview = cars.filter(c => {
        const audit = useAppContext().audits.find(a => a.id === c.auditId);
        return audit?.auditorId === currentUser?.id && c.status === 'Pending Review';
    });

    // Auditor: Review History
    const reviewedCars = cars.filter(c => {
        const audit = useAppContext().audits.find(a => a.id === c.auditId);
        return audit?.auditorId === currentUser?.id && c.status === 'Reviewed';
    });

    // --- Auditee View ---
    if (currentUser?.role === UserRole.Auditee) {
        return (
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CAR Management</h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`py-2 px-4 font-medium text-sm focus:outline-none border-b-2 transition-colors ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Open Findings / Action Required
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`py-2 px-4 font-medium text-sm focus:outline-none border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Submission History
                    </button>
                </div>

                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {auditeeOpenFindings.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                                <p className="text-gray-500">You have no open findings requiring immediate action.</p>
                            </div>
                        )}
                        {auditeeOpenFindings.map(finding => {
                            const findingCars = cars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                            const nextCarNumber = findingCars.length + 1;
                            
                            return (
                                <div key={finding.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-bold rounded ${finding.level.includes('1') ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {finding.level}
                                                </span>
                                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{finding.customId || finding.id}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    finding.status === FindingStatus.Open ? 'bg-blue-100 text-blue-800' :
                                                    finding.status === FindingStatus.CARSubmitted ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {finding.status}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => setReportViewId(finding.auditId)}
                                                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                                            >
                                                <FileTextIcon className="h-3 w-3" /> View Audit Report
                                            </button>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mb-4 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-semibold block mb-1 text-xs uppercase text-gray-500">Description:</span>
                                            {finding.description}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mb-4">
                                            <div className="text-red-500 font-semibold flex items-center gap-1">
                                                <span className="uppercase text-xs text-gray-500 mr-1">Deadline:</span> 
                                                {new Date(finding.deadline!).toLocaleDateString()}
                                                {finding.extensionStatus === ExtensionStatus.Approved && " (Extended)"}
                                            </div>
                                            {finding.extensionStatus === ExtensionStatus.Pending && (
                                                <span className="text-purple-600 font-bold text-xs bg-purple-50 px-2 py-1 rounded">Extension Pending</span>
                                            )}
                                        </div>

                                        {/* Status of last submission */}
                                        {findingCars.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Latest Status</p>
                                                {(() => {
                                                    const lastCar = findingCars[findingCars.length - 1];
                                                    return (
                                                        <div className="bg-white border p-3 rounded-md shadow-sm">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-gray-700">CAR {lastCar.carNumber}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${lastCar.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{lastCar.status}</span>
                                                            </div>
                                                            {lastCar.auditorRemarks && (
                                                                <p className="text-xs text-red-600 mt-1">Auditor: "{lastCar.auditorRemarks}"</p>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                                        <button 
                                            onClick={() => setSelectedFinding(finding)} 
                                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all w-full flex items-center justify-center gap-2"
                                        >
                                            <FileTextIcon className="h-5 w-5" />
                                            {findingCars.length > 0 ? `Submit CAR ${nextCarNumber}` : 'Submit Initial CAR'}
                                        </button>
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            {findingCars.length > 0 ? 'Update progress or address rejection' : 'Start corrective action process'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6">
                        {auditeeHistoryFindings.map(finding => {
                            const findingCars = cars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                            
                            return (
                                <div key={finding.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-white">{finding.customId || finding.id}</h3>
                                            <p className="text-xs text-gray-500 truncate max-w-md">{finding.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setReportViewId(finding.auditId)}
                                                className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
                                            >
                                                View Report
                                            </button>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                finding.status === FindingStatus.Closed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {finding.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Submission Timeline</h4>
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                            {findingCars.map(car => (
                                                <div key={car.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    {/* Icon */}
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                        <span className="font-bold text-xs">{car.carNumber}</span>
                                                    </div>
                                                    
                                                    {/* Card */}
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                                            <div className="font-bold text-slate-900">CAR {car.carNumber}</div>
                                                            <time className="font-caveat font-medium text-indigo-500 text-xs">{new Date(car.submissionDate).toLocaleDateString()}</time>
                                                        </div>
                                                        <div className="text-slate-500 text-sm mb-2">{car.correctiveAction}</div>
                                                        {car.attachments && car.attachments.length > 0 && (
                                                            <div className="mb-2">
                                                                {renderAttachments(car.attachments)}
                                                            </div>
                                                        )}
                                                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                                                            car.status === 'Reviewed' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                                                        }`}>
                                                            {car.status} {car.reviewDate ? `on ${new Date(car.reviewDate).toLocaleDateString()}` : ''}
                                                        </div>
                                                        {car.auditorRemarks && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 italic">
                                                                "Auditor: {car.auditorRemarks}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Submit CAR Modal */}
                {selectedFinding && (
                    <Modal title={`Submit CAR Update for: ${selectedFinding.id}`} onClose={() => setSelectedFinding(null)}>
                        <form onSubmit={handleSubmitCar} className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
                                Submitting <strong>CAR {cars.filter(c => c.findingId === selectedFinding.id).length + 1}</strong>. 
                                Please ensure all evidence is attached.
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
                            <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                                <label className="block text-sm font-medium mb-1">Upload Evidence (Photo/Doc)</label>
                                <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {attachments.map((att, i) => (
                                            <div key={i} className="text-xs flex items-center text-green-600 font-medium">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" /> Attached: {att.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
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

             {/* Tabs */}
             <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                 <button 
                     onClick={() => setActiveTab('pending')}
                     className={`py-2 px-4 font-medium text-sm focus:outline-none border-b-2 transition-colors ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                 >
                     Pending Reviews ({carsToReview.length})
                 </button>
                 <button 
                     onClick={() => setActiveTab('history')}
                     className={`py-2 px-4 font-medium text-sm focus:outline-none border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                 >
                     Review History
                 </button>
             </div>
            
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {carsToReview.length === 0 && <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">No pending CARs to review.</div>}
                    
                    {carsToReview.map(car => {
                        const finding = findings.find(f => f.id === car.findingId);
                        const isCar2Plus = car.carNumber > 1;

                        return (
                        <div key={car.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 transition-transform hover:shadow-lg">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold px-3 py-1 rounded text-white ${isCar2Plus ? 'bg-orange-500' : 'bg-blue-600'}`}>
                                        CAR #{car.carNumber}
                                    </span>
                                    {finding?.extensionStatus === ExtensionStatus.Pending && (
                                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded border border-purple-200 animate-pulse">Extension Requested</span>
                                    )}
                                    {car.auditeeStatus === 'Closed' && (
                                         <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">Closure Requested</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">{car.findingId}</h3>
                                <p className="text-gray-600 text-sm mt-1">Submitted: {new Date(car.submissionDate).toLocaleDateString()}</p>
                                <div className="mt-2 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="font-semibold text-gray-700">Latest Action:</span> {car.correctiveAction.substring(0, 150)}...
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setSelectedCar(car)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg shadow transition-transform transform hover:scale-105">
                                    Review CAR
                                </button>
                                <button onClick={() => setReportViewId(car.auditId)} className="text-sm text-gray-500 hover:text-gray-800 underline text-center">
                                    View Report
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">CAR Ref</th>
                                <th className="px-6 py-3">Finding ID</th>
                                <th className="px-6 py-3">Submission Date</th>
                                <th className="px-6 py-3">Review Date</th>
                                <th className="px-6 py-3">Auditor Remarks</th>
                                <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewedCars.map(car => (
                                <tr key={car.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">CAR-{car.carNumber}</td>
                                    <td className="px-6 py-4">{car.findingId}</td>
                                    <td className="px-6 py-4">{new Date(car.submissionDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{car.reviewDate ? new Date(car.reviewDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{car.auditorRemarks}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedCar(car)} className="text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reviewedCars.length === 0 && <div className="p-6 text-center text-gray-500">No reviewed history found.</div>}
                </div>
            )}

             {selectedCar && (
                <Modal title={`Review: ${selectedCar.id} (CAR ${selectedCar.carNumber})`} onClose={() => setSelectedCar(null)} size="4xl">
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
                        {findings.find(f => f.id === selectedCar.findingId)?.extensionStatus === ExtensionStatus.Pending && selectedCar.status === 'Pending Review' && (
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT COLUMN: Current Submission Details */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2">Current Submission Details</h3>
                                
                                {/* Root Cause Section */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-700 text-sm bg-gray-100 p-1 rounded">1. Root Cause Analysis</h4>
                                    <div className="p-3 bg-white border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap shadow-sm">
                                        {selectedCar.rootCause || findings.find(f => f.id === selectedCar.findingId)?.rootCause}
                                    </div>
                                    {selectedCar.status === 'Pending Review' && (
                                        <textarea 
                                            placeholder="Auditor remarks on Root Cause..." 
                                            value={rootCauseRemarks} 
                                            onChange={e => setRootCauseRemarks(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-primary focus:border-primary bg-yellow-50"
                                            rows={2}
                                        />
                                    )}
                                </div>

                                {/* Corrective Action Section */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-700 text-sm bg-gray-100 p-1 rounded">2. Corrective Action Plan</h4>
                                    <div className="p-3 bg-white border border-gray-200 rounded text-gray-800 text-sm whitespace-pre-wrap shadow-sm">
                                        {selectedCar.correctiveAction}
                                    </div>
                                    {selectedCar.status === 'Pending Review' && (
                                        <textarea 
                                            placeholder="Auditor remarks on Corrective Action..." 
                                            value={correctiveActionRemarks} 
                                            onChange={e => setCorrectiveActionRemarks(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-primary focus:border-primary bg-yellow-50"
                                            rows={2}
                                        />
                                    )}
                                </div>

                                {/* Evidence Section */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-700 text-sm bg-gray-100 p-1 rounded">3. Evidence</h4>
                                    <div className="p-3 bg-white border border-gray-200 rounded text-gray-800 text-sm mb-2">
                                        {selectedCar.evidence}
                                    </div>
                                    
                                    {/* ATTACHMENTS DISPLAY */}
                                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                        <h4 className="font-bold text-blue-900 text-xs uppercase mb-2">Attached Files (Downloadable)</h4>
                                        {selectedCar.attachments && selectedCar.attachments.length > 0 ? (
                                            renderAttachments(selectedCar.attachments)
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No files attached to this submission.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: History & Decision */}
                            <div className="space-y-6 flex flex-col h-full">
                                
                                {/* History Context */}
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex-1 overflow-y-auto max-h-96">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-3 border-b pb-1">Submission History (Previous)</h4>
                                    {cars.filter(c => c.findingId === selectedCar.findingId && c.id !== selectedCar.id).length > 0 ? (
                                        cars.filter(c => c.findingId === selectedCar.findingId && c.id !== selectedCar.id).sort((a,b) => b.carNumber - a.carNumber).map(c => (
                                            <div key={c.id} className="text-sm mb-3 bg-white p-3 rounded border shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-indigo-700">CAR {c.carNumber}</span>
                                                    <span className="text-xs text-gray-500">{new Date(c.submissionDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs mb-2">
                                                    <span className={`px-1 rounded ${c.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 line-clamp-2 mb-2">{c.correctiveAction}</p>
                                                {c.attachments && c.attachments.length > 0 && (
                                                    <div className="border-t pt-1 mt-1">
                                                        <p className="text-xs font-semibold text-gray-500">Attachments:</p>
                                                        {renderAttachments(c.attachments)}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No previous submission history.</p>
                                    )}
                                </div>

                                {/* Decision Area (Only if Pending) */}
                                {selectedCar.status === 'Pending Review' && (
                                    <div className="border-t pt-4 bg-gray-100 p-4 rounded-lg border-gray-300">
                                        <h4 className="font-bold text-gray-800 mb-2">Final Review Decision</h4>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Auditor Remarks</label>
                                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-primary focus:border-primary" rows={3} required placeholder="Summary of review..." />

                                        <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm">
                                            <label className="flex items-center space-x-3 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={closeFinding} 
                                                    onChange={e => setCloseFinding(e.target.checked)}
                                                    className="h-6 w-6 text-success focus:ring-success rounded border-gray-300"
                                                />
                                                <div>
                                                    <span className={`font-bold block ${closeFinding ? 'text-green-700' : 'text-gray-800'}`}>
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
                                )}
                            </div>
                        </div>
                    </form>
                </Modal>
             )}

            {/* View Full Report Modal */}
            {reportViewId && (
                <Modal size="4xl" title={`Audit Report: ${reportViewId}`} onClose={() => setReportViewId(null)}>
                    <AuditReportView auditId={reportViewId} />
                </Modal>
            )}
        </div>
    );
};

export default CarManagementPage;
