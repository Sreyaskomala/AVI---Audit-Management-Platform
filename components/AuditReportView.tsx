
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
    const [layoutMode, setLayoutMode] = useState<'detailed' | 'table'>('detailed');

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
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm font-medium">Layout:</span>
                    <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
                        <button 
                            onClick={() => setLayoutMode('detailed')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${layoutMode === 'detailed' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Detailed (Vertical)
                        </button>
                        <button 
                            onClick={() => setLayoutMode('table')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${layoutMode === 'table' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Matrix (Horizontal)
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        {isLoadingSummary ? 'Generating...' : 'AI Summary'}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                        <PrinterIcon className="h-5 w-5" />
                        Print Report
                    </button>
                </div>
            </div>

            <div className={`p-8 border rounded-lg bg-white space-y-8 print:border-0 print:p-0 ${layoutMode === 'table' ? 'max-w-none' : ''}`}>
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm">
                        <div>
                            <strong className="text-gray-600 block text-xs uppercase">Audit Reference</strong> 
                            <span>{audit.id}</span>
                        </div>
                        <div>
                            <strong className="text-gray-600 block text-xs uppercase">Location</strong> 
                            <span>{audit.location || 'N/A'}</span>
                        </div>
                         <div>
                            <strong className="text-gray-600 block text-xs uppercase">Date(s)</strong> 
                            <span>{allDates}</span>
                        </div>
                         <div>
                            <strong className="text-gray-600 block text-xs uppercase">Department</strong> 
                            <span>{audit.department}</span>
                        </div>
                         <div>
                            <strong className="text-gray-600 block text-xs uppercase">{isExternal ? 'Uploaded By' : 'Auditor'}</strong> 
                            <span>{auditor?.name}</span>
                        </div>
                         <div>
                            <strong className="text-gray-600 block text-xs uppercase">Auditee</strong> 
                            <span>{auditee?.name}</span>
                        </div>
                        {audit.fstdId && (
                             <div>
                                <strong className="text-gray-600 block text-xs uppercase">FSTD ID</strong> 
                                <span>{audit.fstdId}</span>
                            </div>
                        )}
                        <div>
                            <strong className="text-gray-600 block text-xs uppercase">Report Status</strong> 
                            <span>{audit.status}</span>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white rounded-lg">
                    <h2 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1 uppercase">Executive Summary</h2>
                    {summary ? (
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{summary}</p>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No summary generated.</p>
                    )}
                </div>

                {/* Findings Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-primary pb-1">Findings Details</h2>
                    
                    {layoutMode === 'detailed' ? (
                        /* DETAILED VERTICAL LAYOUT */
                        <div className="space-y-8">
                            {relevantFindings.map((finding: Finding) => {
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

                                            {finding.rootCause && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <strong>Root Cause Analysis:</strong>
                                                    <p className="mt-1 bg-white p-2 border rounded text-gray-800">{finding.rootCause}</p>
                                                </div>
                                            )}
                                        </div>

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
                                                                <div>
                                                                    <strong className="text-gray-800 block text-xs uppercase">Corrective Action:</strong>
                                                                    <p className="bg-gray-50 p-2 rounded">{car.correctiveAction}</p>
                                                                    {car.correctiveActionRemarks && <p className="text-xs text-red-600 mt-1 italic pl-2 border-l-2 border-red-300"> Auditor: {car.correctiveActionRemarks}</p>}
                                                                </div>
                                                                <div>
                                                                    <strong className="text-gray-800 block text-xs uppercase">Evidence:</strong>
                                                                    <p className="bg-gray-50 p-2 rounded">{car.evidence}</p>
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
                    ) : (
                        /* MATRIX / TABLE LAYOUT (Horizontal) */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border border-gray-300">
                                <thead className="bg-gray-100 text-gray-800 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 border-r w-1/6">Reference & Level</th>
                                        <th className="px-4 py-3 border-r w-1/4">Description & Root Cause</th>
                                        <th className="px-4 py-3">Corrective Actions Timeline (CAR 1 → CAR N)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {relevantFindings.map((finding) => {
                                        const carsForFinding = relevantCars
                                            .filter(c => c.findingId === finding.id)
                                            .sort((a,b) => a.carNumber - b.carNumber);
                                        
                                        return (
                                            <tr key={finding.id} className="bg-white hover:bg-gray-50">
                                                <td className="px-4 py-4 border-r align-top">
                                                    <div className="font-bold text-gray-900">{finding.customId || finding.id}</div>
                                                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-white rounded ${finding.level.includes('1') ? 'bg-red-600' : finding.level.includes('2') ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                        {finding.level}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Ref: {finding.referenceDoc}<br/>{finding.referencePara}
                                                    </div>
                                                    <div className="mt-2 text-xs">
                                                        <span className="font-semibold block">Deadline:</span>
                                                        <span className={finding.extensionStatus === ExtensionStatus.Approved ? 'line-through text-gray-400' : ''}>
                                                            {finding.deadline ? new Date(finding.deadline).toLocaleDateString() : '-'}
                                                        </span>
                                                        {finding.extensionStatus === ExtensionStatus.Approved && (
                                                            <div className="text-green-600 font-bold">
                                                                {new Date(finding.requestedDeadline!).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t text-xs font-bold text-center">
                                                        Status: <br/>
                                                        <span className={`${finding.status === 'Closed' ? 'text-green-600' : 'text-blue-600'}`}>{finding.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 border-r align-top">
                                                    <p className="mb-3 text-gray-800">{finding.description}</p>
                                                    {finding.rootCause && (
                                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                            <strong className="text-xs text-gray-500 uppercase block mb-1">Root Cause:</strong>
                                                            <p className="text-gray-700 italic">{finding.rootCause}</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                                                        {carsForFinding.length === 0 && <span className="text-gray-400 italic text-xs">No CARs submitted.</span>}
                                                        {carsForFinding.map((car, idx) => (
                                                            <div key={car.id} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-md shadow-sm p-3 relative">
                                                                {/* Connector Line Logic (visual only) */}
                                                                {idx < carsForFinding.length - 1 && (
                                                                    <div className="absolute top-1/2 -right-6 w-4 h-0.5 bg-gray-300 z-0 hidden print:block"></div>
                                                                )}
                                                                
                                                                <div className="flex justify-between items-center mb-2 border-b pb-1">
                                                                    <span className="font-bold text-xs text-indigo-700">CAR {car.carNumber}</span>
                                                                    <span className="text-[10px] text-gray-500">{new Date(car.submissionDate).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="text-xs space-y-2">
                                                                    <div className="line-clamp-4 hover:line-clamp-none transition-all">
                                                                        <span className="font-semibold text-gray-600">Action:</span> {car.correctiveAction}
                                                                    </div>
                                                                    <div className="line-clamp-2">
                                                                        <span className="font-semibold text-gray-600">Evidence:</span> {car.evidence}
                                                                    </div>
                                                                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-100">
                                                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${car.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                            {car.status}
                                                                        </span>
                                                                        {car.auditeeStatus === 'Closed' && <span className="text-[10px] text-green-600 font-bold">req. closure</span>}
                                                                    </div>
                                                                    {car.auditorRemarks && (
                                                                        <div className="bg-red-50 p-1 rounded text-[10px] text-red-800 border border-red-100">
                                                                            Review: {car.auditorRemarks}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
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
