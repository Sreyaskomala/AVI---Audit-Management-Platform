
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Finding, CAR, AuditType, ExtensionStatus } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleGenAI } from '@google/genai';

interface AuditReportViewProps {
  auditId: string;
}

const AuditReportView: React.FC<AuditReportViewProps> = ({ auditId }) => {
    const { audits, findings, cars, users } = useAppContext();
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const audit = audits.find(a => a.id === auditId);
    const relevantFindings = findings.filter(f => f.auditId === auditId);
    // Fetch all cars related to this audit
    const relevantCars = cars.filter(c => c.auditId === auditId);
    const auditor = users.find(u => u.id === audit?.auditorId);
    const auditee = users.find(u => u.id === audit?.auditeeId);

    const generateSummary = async () => {
        if (!audit) return;
        setIsLoadingSummary(true);
        setSummary('');

        let promptContent = `Generate a concise executive summary for the following aviation audit report.
        The summary should be professional, objective, and highlight the key outcomes, including the number and severity of findings.

        **Audit Details:**
        - Reference: ${audit.id}
        - Type: ${audit.type} ${audit.type === AuditType.External ? `(Entity: ${audit.externalEntity})` : ''}
        - Title: ${audit.title}
        - Department: ${audit.department}
        - Location: ${audit.location}
        - Date: ${new Date(audit.date).toLocaleDateString()}
        - Status: ${audit.status}

        **Findings (${relevantFindings.length} total):**\n`;

        relevantFindings.forEach(f => {
            promptContent += `- Finding ID: ${f.customId || f.id}, Level: ${f.level}, Status: ${f.status}, Description: ${f.description}\n`;
        });

        promptContent += "\n**Summary Guidelines:**\n- Start with a clear opening statement about the audit's purpose and overall result.\n- Quantify the findings (e.g., 'The audit resulted in 2 Level 2 findings and 1 Observation.').\n- Briefly mention the areas where non-compliance was noted.\n- Conclude with the current status of the audit (e.g., 'Corrective actions are pending for open findings.').\n- Keep the entire summary to 3-4 sentences."

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: promptContent,
            });
            setSummary(response.text);
        } catch (error) {
            console.error("Error generating summary:", error);
            setSummary("Could not generate summary due to an error.");
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!audit) {
        return <div>Audit not found.</div>;
    }

    const isExternal = audit.type === AuditType.External;
    const allDates = [audit.date, ...(audit.additionalDates || [])].map(d => new Date(d).toLocaleDateString()).join(', ');

    return (
        <div id="audit-report-content">
            <div className="flex justify-between items-center mb-6 no-print">
                <h3 className="text-lg font-bold">Report Preview</h3>
                <div className="flex items-center gap-4">
                     <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        {isLoadingSummary ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                        <PrinterIcon className="h-5 w-5" />
                        Print Report
                    </button>
                </div>
            </div>

            <div className="p-8 border rounded-lg bg-white space-y-8 print:border-0 print:p-0">
                {/* Header */}
                <div className="text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">
                        {isExternal ? 'External Audit Report' : 'Internal Audit Report'}
                    </h1>
                    <p className="text-gray-500 font-medium">Aviation Quality Assurance</p>
                    {isExternal && (
                        <p className="text-purple-700 font-bold mt-2 text-lg">Authority: {audit.externalEntity}</p>
                    )}
                </div>

                {/* Audit Details */}
                <div className="bg-gray-50 p-4 rounded-lg border print:bg-transparent print:border-gray-200">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Audit Reference:</strong> 
                            <span>{audit.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Report Date:</strong> 
                            <span>{audit.reportDate ? new Date(audit.reportDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Audit Date(s):</strong> 
                            <span className="text-right">{allDates}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Location:</strong> 
                            <span>{audit.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Department:</strong> 
                            <span>{audit.department}</span>
                        </div>
                        {audit.fstdId && (
                            <div className="flex justify-between border-b border-gray-200 py-2">
                                <strong className="text-gray-600">FSTD ID:</strong> 
                                <span>{audit.fstdId}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">{isExternal ? 'Uploaded By' : 'Auditor'}:</strong> 
                            <span>{auditor?.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <strong className="text-gray-600">Auditee:</strong> 
                            <span>{auditee?.name}</span>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white rounded-lg">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Executive Summary</h2>
                    {summary ? (
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
                    ) : (
                        <p className="text-gray-400 italic">No summary generated.</p>
                    )}
                </div>

                {/* Findings Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-primary pb-1">Findings Details</h2>
                    <div className="space-y-8">
                        {relevantFindings.map((finding: Finding, index) => {
                            // Get ALL cars for this finding and sort them
                            const carsForFinding = relevantCars
                                .filter(c => c.findingId === finding.id)
                                .sort((a,b) => a.carNumber - b.carNumber);

                            return (
                                <div key={finding.id} className="break-inside-avoid">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-bold text-white rounded ${finding.level.includes('1') ? 'bg-red-600' : finding.level.includes('2') ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                            {finding.level}
                                        </span>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {finding.customId || finding.id}
                                        </h3>
                                        {finding.extensionStatus === ExtensionStatus.Approved && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold border border-green-500 text-green-700 rounded-full bg-green-50">
                                                Extension Granted
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 border border-l-4 border-l-gray-400 p-4 rounded-r-md text-sm text-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <strong>Reference:</strong> {finding.referenceDoc} - {finding.referencePara}
                                            </div>
                                            <div>
                                                <strong>Deadline:</strong> 
                                                <span className={finding.extensionStatus === ExtensionStatus.Approved ? 'line-through text-gray-400 mr-2' : ''}>
                                                    {finding.deadline ? new Date(finding.deadline).toLocaleDateString() : 'N/A'}
                                                </span>
                                                {finding.extensionStatus === ExtensionStatus.Approved && (
                                                    <span className="text-green-600 font-bold">
                                                        {new Date(finding.requestedDeadline!).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {finding.extensionStatus === ExtensionStatus.Approved && (
                                                    <div className="text-xs mt-1 bg-green-50 text-green-700 p-1 rounded border border-green-200 inline-block">
                                                        <span className="italic text-gray-500">Reason: {finding.extensionReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="mb-2"><strong>Description:</strong> {finding.description}</p>
                                        
                                        {finding.attachments && finding.attachments.length > 0 && (
                                            <div className="mt-2 text-xs">
                                                <strong>Attached Evidence (Finding):</strong>
                                                <ul className="list-disc pl-5 mt-1 text-blue-600">
                                                    {finding.attachments.map((att, i) => (
                                                        <li key={i}>{att.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Display Root Cause from Finding if available */}
                                        {finding.rootCause && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <strong>Root Cause Analysis:</strong>
                                                <p className="mt-1 bg-white p-2 border rounded text-gray-800">{finding.rootCause}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Render History of CARs */}
                                    {carsForFinding.length > 0 && (
                                        <div className="mt-4 ml-6 pl-4 border-l-2 border-dashed border-gray-300">
                                            <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Corrective Action History</h4>
                                            
                                            <div className="space-y-4">
                                                {carsForFinding.map(car => (
                                                    <div key={car.id} className="bg-white p-4 rounded border border-gray-200 text-sm text-gray-700 shadow-sm">
                                                        <div className="flex justify-between border-b pb-2 mb-2">
                                                            <strong className="text-indigo-800">CAR {car.carNumber} ({new Date(car.submissionDate).toLocaleDateString()})</strong>
                                                            <div className="text-right">
                                                                <span className="block text-xs font-bold text-gray-600">{car.auditeeStatus === 'Closed' ? 'Closure Requested' : 'Progress Update'}</span>
                                                                <span className="text-xs text-gray-400">Reviewed: {car.reviewDate ? new Date(car.reviewDate).toLocaleDateString() : 'Pending'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {/* We don't need Root Cause here if displayed above, unless specifically needed for history context. User requested "root cause should not change". So displaying it once above is cleaner. */}
                                                            
                                                            <div>
                                                                <strong className="text-gray-800 block text-xs uppercase">Corrective Action:</strong>
                                                                <p className="bg-gray-50 p-2 rounded">{car.correctiveAction}</p>
                                                                {car.correctiveActionRemarks && <p className="text-xs text-red-600 mt-1 italic pl-2 border-l-2 border-red-300"> Auditor: {car.correctiveActionRemarks}</p>}
                                                            </div>
                                                            <div>
                                                                <strong className="text-gray-800 block text-xs uppercase">Evidence:</strong>
                                                                <p className="bg-gray-50 p-2 rounded">{car.evidence}</p>
                                                                {car.attachments && car.attachments.length > 0 && (
                                                                    <div className="text-xs text-blue-600 mt-1 flex gap-2">
                                                                        {car.attachments.map(a => <span key={a.name}>📎 {a.name}</span>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {car.auditorRemarks && (
                                                                <div className="pt-2 mt-2 border-t border-gray-200">
                                                                    <span className="font-bold text-gray-800 text-xs uppercase block">Auditor Remarks:</span>
                                                                    <p className="italic text-gray-600">"{car.auditorRemarks}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 text-center text-xs text-gray-400 border-t mt-8">
                    <p>Report generated via AVI Audit Management Platform on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default AuditReportView;
