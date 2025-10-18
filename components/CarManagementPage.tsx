import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, Finding, CAR, FindingStatus } from '../types';
import Modal from './shared/Modal';

const CarManagementPage: React.FC = () => {
    const { currentUser, findings, cars, users, submitCar, reviewCar } = useAppContext();

    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
    const [selectedCar, setSelectedCar] = useState<CAR | null>(null);
    
    // State for CAR submission modal
    const [rootCause, setRootCause] = useState('');
    const [correctiveAction, setCorrectiveAction] = useState('');
    const [evidence, setEvidence] = useState('');
    const [proposedClosureDate, setProposedClosureDate] = useState('');
    
    // State for CAR review modal
    const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
    const [remarks, setRemarks] = useState('');

    const handleSubmitCar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFinding && rootCause && correctiveAction && evidence && proposedClosureDate) {
            submitCar({
                findingId: selectedFinding.id,
                rootCause,
                correctiveAction,
                evidence,
                proposedClosureDate,
            });
            setSelectedFinding(null);
            // Reset form
            setRootCause(''); setCorrectiveAction(''); setEvidence(''), setProposedClosureDate('');
        }
    };
    
    const handleReviewCar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCar && remarks) {
            reviewCar(selectedCar.id, decision, remarks);
            setSelectedCar(null);
            // Reset form
            setDecision('Approved'); setRemarks('');
        }
    };

    const auditeeFindings = findings.filter(f => {
        const audit = useAppContext().audits.find(a => a.id === f.auditId);
        return audit?.auditeeId === currentUser?.id && (f.status === FindingStatus.Open || f.status === FindingStatus.Rejected);
    });

    const carsToReview = cars.filter(c => {
        const audit = useAppContext().audits.find(a => a.id === c.auditId);
        return audit?.auditorId === currentUser?.id && c.status === 'Pending Review';
    });
    
    const getAuditorName = (auditId: string) => {
        const audit = useAppContext().audits.find(a => a.id === auditId);
        const auditor = users.find(u => u.id === audit?.auditorId);
        return auditor?.name || 'N/A';
    }

    if (currentUser?.role === UserRole.Auditee) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Open Findings</h1>
                <div className="space-y-4">
                    {auditeeFindings.length === 0 && <p className="text-gray-500">You have no open findings assigned to you.</p>}
                    {auditeeFindings.map(finding => (
                        <div key={finding.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{finding.id} <span className="text-sm font-normal text-gray-500">({finding.auditId})</span></p>
                                <p className="text-gray-600">{finding.description}</p>
                                {finding.status === FindingStatus.Rejected && <p className="text-sm text-red-500 font-semibold">CAR Rejected. Please resubmit.</p>}
                            </div>
                            <button onClick={() => setSelectedFinding(finding)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Submit CAR</button>
                        </div>
                    ))}
                </div>

                {selectedFinding && (
                    <Modal title={`Submit CAR for Finding: ${selectedFinding.id}`} onClose={() => setSelectedFinding(null)}>
                        <form onSubmit={handleSubmitCar} className="space-y-4">
                            <div><label className="block text-sm font-medium">Root Cause Analysis</label><textarea value={rootCause} onChange={e => setRootCause(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div><label className="block text-sm font-medium">Corrective Action Taken</label><textarea value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div><label className="block text-sm font-medium">Evidence of Implementation</label><textarea value={evidence} onChange={e => setEvidence(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div><label className="block text-sm font-medium">Proposed Closure Date</label><input type="date" value={proposedClosureDate} onChange={e => setProposedClosureDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                            <div className="flex justify-end space-x-4"><button type="button" onClick={() => setSelectedFinding(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Submit</button></div>
                        </form>
                    </Modal>
                )}
            </div>
        );
    }

    // Auditor View
    return (
         <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">CARs Pending Review</h1>
            <div className="space-y-4">
                {carsToReview.length === 0 && <p className="text-gray-500">There are no CARs pending your review.</p>}
                {carsToReview.map(car => {
                    const submittedBy = users.find(u => u.id === car.submittedById);
                    return(
                    <div key={car.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{car.id} <span className="text-sm font-normal text-gray-500">(for Finding {car.findingId})</span></p>
                            <p className="text-gray-600">Submitted by: {submittedBy?.name} ({submittedBy?.department}) on {new Date(car.submissionDate).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setSelectedCar(car)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Review CAR</button>
                    </div>
                )})}
            </div>
             {selectedCar && (
                <Modal title={`Review CAR: ${selectedCar.id}`} onClose={() => setSelectedCar(null)}>
                    <div className="space-y-4 mb-4 text-sm">
                        <p><strong>Finding:</strong> {selectedCar.findingId}</p>
                        <p><strong>Root Cause:</strong> {selectedCar.rootCause}</p>
                        <p><strong>Corrective Action:</strong> {selectedCar.correctiveAction}</p>
                        <p><strong>Evidence:</strong> {selectedCar.evidence}</p>
                    </div>
                    <form onSubmit={handleReviewCar} className="space-y-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium">Decision</label>
                            <select value={decision} onChange={e => setDecision(e.target.value as any)} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                                <option value="Approved">Accepted / Closed</option>
                                <option value="Rejected">Rejected - Resubmit Required</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium">Auditor Remarks</label><textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required /></div>
                        <div className="flex justify-end space-x-4"><button type="button" onClick={() => setSelectedCar(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Submit Review</button></div>
                    </form>
                </Modal>
             )}
        </div>
    );
};

export default CarManagementPage;
