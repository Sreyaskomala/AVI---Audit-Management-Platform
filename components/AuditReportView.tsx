
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Finding, FindingStatus, CAR } from '../types';
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
        - Title: ${audit.title}
        - Department: ${audit.department}
        - Date: ${new Date(audit.date).toLocaleDateString()}
        - Status: ${audit.status}

        **Findings (${relevantFindings.length} total):**\n`;

        relevantFindings.forEach(f => {
            promptContent += `- Finding ID: ${f.id}, Level: ${f.level}, Status: ${f.status}, Description: ${f.description}\n`;
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

            <div className="p-8 border rounded-lg bg-white space-y-8">
                {/* Header */}
                <div className="text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Internal Audit Report</h1>
                    <p className="text-gray-500">AVI Audit Management Platform</p>
                </div>

                {/* Audit Details */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div><strong>Reference No:</strong> {audit.id}</div>
                    <div><strong>Department:</strong> {audit.department}</div>
                    <div><strong>Audit Title:</strong> {audit.title}</div>
                    <div><strong>Audit Date:</strong> {new Date(audit.date).toLocaleDateString()}</div>
                    <div><strong>Auditor:</strong> {auditor?.name}</div>
                    <div><strong>Auditee:</strong> {auditee?.name}</div>
                </div>

                {/* AI Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Executive Summary</h2>
                    {isLoadingSummary && <p className="text-gray-500 animate-pulse">Generating summary, please wait...</p>}
                    {summary ? (
                        <p className="text-gray-600 whitespace-pre-wrap">{summary}</p>
                    ) : (
                        <p className="text-gray-500 italic">Click "Generate AI Summary" to create a summary for this report.</p>
                    )}
                </div>

                {/* Findings Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Findings Details</h2>
                    <div className="space-y-6">
                        {relevantFindings.map((finding: Finding, index) => {
                            const car = relevantCars.find(c => c.findingId === finding.id);
                            return (
                                <div key={finding.id} className="p-4 border rounded-md break-inside-avoid">
                                    <h3 className="font-bold text-md text-gray-800">Finding {index + 1}: {finding.id}</h3>
                                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                        <span><strong>Level:</strong> {finding.level}</span>
                                        <span><strong>Status:</strong> {finding.status}</span>
                                        <span><strong>Deadline:</strong> {finding.deadline ? new Date(finding.deadline).toLocaleDateString() : 'N/A'}</span>
                                        <span className="col-span-3"><strong>Reference:</strong> {finding.referenceDoc} - {finding.referencePara}</span>
                                        <p className="col-span-3"><strong>Description:</strong> {finding.description}</p>
                                    </div>
                                    {car && (
                                        <div className="mt-4 pt-4 border-t border-dashed">
                                            <h4 className="font-semibold text-gray-700">Corrective Action Report (CAR-{car.id})</h4>
                                            <div className="mt-2 space-y-2 text-sm text-gray-600">
                                                <p><strong>Root Cause:</strong> {car.rootCause}</p>
                                                <p><strong>Corrective Action:</strong> {car.correctiveAction}</p>
                                                <p><strong>Status:</strong> {car.status}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 text-center text-xs text-gray-400">
                    <p>Report generated on {new Date().toLocaleString()}</p>
                </div>

            </div>
        </div>
    );
};

export default AuditReportView;
