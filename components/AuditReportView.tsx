
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Finding, CAR, AuditType, ExtensionStatus, Attachment } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { GoogleGenAI } from '@google/genai';

interface AuditReportViewProps {
  auditId: string;
}

const AuditReportView: React.FC<AuditReportViewProps> = ({ auditId }) => {
    const { audits, findings, cars, users } = useAppContext();
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [activeTab, setActiveTab] = useState<'report' | 'gallery'>('report');
    const [layoutMode, setLayoutMode] = useState<'detailed' | 'table'>('detailed');

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

    // Statistics Calculation
    const stats = {
        total: relevantFindings.length,
        closed: relevantFindings.filter(f => f.status === 'Closed').length,
        level1: relevantFindings.filter(f => f.level.includes('1')).length,
        level2: relevantFindings.filter(f => f.level.includes('2')).length,
    };
    const openCount = stats.total - stats.closed;
    const complianceRate = stats.total === 0 ? 100 : Math.round((stats.closed / stats.total) * 100);

    // Aggregate all attachments
    interface GalleryItem extends Attachment {
        sourceType: 'Finding' | 'CAR';
        refId: string;
        date?: string;
    }

    const allAttachments: GalleryItem[] = [
        ...relevantFindings.flatMap(f => (f.attachments || []).map(a => ({
            ...a, 
            sourceType: 'Finding' as const, 
            refId: f.customId || f.id, 
            date: audit.date
        }))),
        ...relevantCars.flatMap(c => (c.attachments || []).map(a => ({
            ...a, 
            sourceType: 'CAR' as const, 
            refId: `CAR ${c.carNumber} (Finding ${c.findingId})`, 
            date: c.submissionDate
        })))
    ];

    const isExternal = audit.type === AuditType.External;
    const allDates = [audit.date, ...(audit.additionalDates || [])].map(d => new Date(d).toLocaleDateString()).join(', ');

    return (
        <div id="audit-report-content" className="bg-gray-50 dark:bg-gray-900 min-h-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('report')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'report' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            <FileTextIcon className="inline h-4 w-4 mr-2" />
                            Full Report
                        </button>
                        <button 
                            onClick={() => setActiveTab('gallery')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'gallery' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            <span className="mr-2">🖼️</span>
                            Evidence Gallery ({allAttachments.length})
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg shadow-sm text-sm disabled:opacity-50"
                    >
                        <SparklesIcon className="h-4 w-4" />
                        {isLoadingSummary ? 'Generating...' : 'AI Summary'}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-bold py-2 px-3 rounded-lg shadow-sm text-sm">
                        <PrinterIcon className="h-4 w-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Main Report Container */}
            <div className="bg-white p-8 sm:p-12 shadow-xl max-w-5xl mx-auto print:shadow-none print:w-full print:max-w-none print:p-0">
                
                {/* 1. Header Section */}
                <div className="border-b-2 border-gray-800 pb-6 mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest mb-2">
                        {isExternal ? 'External Audit Report' : 'Internal Audit Report'}
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quality Assurance Department • AVI Platform</p>
                    {isExternal && (
                        <div className="mt-4 inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full font-bold text-sm border border-purple-200">
                            Authority: {audit.externalEntity}
                        </div>
                    )}
                </div>

                {/* 2. Audit Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 print:bg-transparent print:border-gray-300">
                     <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Reference No</span>
                        <span className="font-bold text-gray-800 text-lg">{audit.id}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Audit Date(s)</span>
                        <span className="font-medium text-gray-800">{allDates}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Location</span>
                        <span className="font-medium text-gray-800">{audit.location || 'N/A'}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${audit.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {audit.status}
                        </span>
                    </div>
                     <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Department</span>
                        <span className="font-medium text-gray-800">{audit.department}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">{isExternal ? 'Recorded By' : 'Lead Auditor'}</span>
                        <span className="font-medium text-gray-800">{auditor?.name}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Auditee Rep</span>
                        <span className="font-medium text-gray-800">{auditee?.name}</span>
                    </div>
                     {audit.fstdId && (
                        <div className="space-y-1">
                            <span className="block text-xs font-bold text-gray-400 uppercase">FSTD Device</span>
                            <span className="font-medium text-gray-800">{audit.fstdId}</span>
                        </div>
                    )}
                </div>

                {/* 3. Statistics Dashboard (New) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center">
                        <span className="block text-2xl font-bold text-blue-700">{stats.total}</span>
                        <span className="text-xs font-bold text-blue-500 uppercase">Total Findings</span>
                     </div>
                     <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
                        <span className="block text-2xl font-bold text-red-700">{openCount}</span>
                        <span className="text-xs font-bold text-red-500 uppercase">Open / Pending</span>
                     </div>
                     <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center">
                        <span className="block text-2xl font-bold text-green-700">{stats.closed}</span>
                        <span className="text-xs font-bold text-green-500 uppercase">Closed</span>
                     </div>
                     <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <span className="block text-2xl font-bold text-gray-700">{complianceRate}%</span>
                         </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Completion Rate</span>
                     </div>
                </div>

                {/* 4. Executive Summary */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-gray-400" /> Executive Summary
                    </h3>
                    <div className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded border-l-4 border-gray-300 italic">
                        {summary || "No AI summary generated. Use the button above to generate one."}
                    </div>
                </div>

                {/* CONTENT TABS */}
                {activeTab === 'report' ? (
                    <>
                        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-2">
                            <h3 className="text-xl font-bold text-gray-900">Findings & Corrective Actions</h3>
                            <div className="flex bg-gray-100 rounded p-1 no-print">
                                <button onClick={() => setLayoutMode('detailed')} className={`px-2 py-1 text-xs font-bold rounded ${layoutMode === 'detailed' ? 'bg-white shadow' : 'text-gray-500'}`}>Detailed</button>
                                <button onClick={() => setLayoutMode('table')} className={`px-2 py-1 text-xs font-bold rounded ${layoutMode === 'table' ? 'bg-white shadow' : 'text-gray-500'}`}>Matrix</button>
                            </div>
                        </div>

                        {layoutMode === 'detailed' ? (
                            <div className="space-y-12">
                                {relevantFindings.length === 0 && <p className="text-center text-gray-500 italic py-8">No findings recorded.</p>}
                                {relevantFindings.map((finding, index) => {
                                    const carsForFinding = relevantCars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                                    
                                    return (
                                        <div key={finding.id} className="break-inside-avoid border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            {/* Finding Header */}
                                            <div className={`p-4 border-b border-gray-200 flex justify-between items-start ${finding.level.includes('1') ? 'bg-red-50' : finding.level.includes('2') ? 'bg-orange-50' : 'bg-blue-50'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${finding.level.includes('1') ? 'bg-red-100 text-red-800 border-red-200' : finding.level.includes('2') ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                                            {finding.level}
                                                        </span>
                                                        <h4 className="text-lg font-bold text-gray-800">{finding.customId || finding.id}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono">Ref: {finding.referenceDoc} / {finding.referencePara}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${finding.status === 'Closed' ? 'text-green-600' : 'text-blue-600'}`}>{finding.status}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Due: {finding.deadline ? new Date(finding.deadline).toLocaleDateString() : 'N/A'}
                                                        {finding.extensionStatus === ExtensionStatus.Approved && (
                                                            <span className="ml-1 text-green-600 font-bold" title="Extended">(Ext)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Left: Finding Description & Root Cause */}
                                                <div className="lg:col-span-1 space-y-6">
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Non-Compliance Description</h5>
                                                        <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                                                            {finding.description}
                                                        </p>
                                                        {finding.attachments && finding.attachments.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {finding.attachments.map((att, i) => (
                                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-white border text-xs text-gray-600">
                                                                        📎 {att.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Root Cause Analysis</h5>
                                                        {finding.rootCause ? (
                                                            <div className="text-sm text-gray-800 bg-yellow-50/50 p-3 rounded border border-yellow-100">
                                                                {finding.rootCause}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-400 italic">Pending root cause submission...</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: CAR Timeline */}
                                                <div className="lg:col-span-2">
                                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 border-b pb-1">Corrective Action History</h5>
                                                    <div className="space-y-0 relative border-l-2 border-gray-200 ml-3">
                                                        {carsForFinding.length === 0 && (
                                                            <div className="pl-6 text-sm text-gray-400 italic">No corrective actions submitted yet.</div>
                                                        )}
                                                        {carsForFinding.map((car, idx) => (
                                                            <div key={car.id} className="relative pl-6 pb-6 last:pb-0">
                                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-indigo-500 shadow-sm"></div>
                                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-bold text-indigo-700 text-sm">CAR #{car.carNumber}</span>
                                                                        <span className="text-xs text-gray-500">{new Date(car.submissionDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div>
                                                                            <span className="font-semibold text-gray-700 text-xs uppercase">Action:</span>
                                                                            <p className="text-gray-800 mt-1">{car.correctiveAction}</p>
                                                                        </div>
                                                                        {car.auditorRemarks && (
                                                                             <div className="bg-red-50 p-2 rounded text-red-800 text-xs border border-red-100 mt-2">
                                                                                <strong>Auditor Review:</strong> "{car.auditorRemarks}"
                                                                             </div>
                                                                        )}
                                                                        <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-100">
                                                                            <div className="flex gap-2">
                                                                                {car.attachments?.map((att, i) => (
                                                                                    <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">📎 {att.name}</span>
                                                                                ))}
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${car.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                {car.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Matrix View (Simplified for brevity as detailed view is the focus)
                             <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3">ID & Level</th>
                                            <th className="px-4 py-3 w-1/3">Finding & Root Cause</th>
                                            <th className="px-4 py-3">Latest Action Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {relevantFindings.map(f => {
                                            const carsForFinding = relevantCars.filter(c => c.findingId === f.id);
                                            const lastCar = carsForFinding[carsForFinding.length - 1];
                                            return (
                                                <tr key={f.id} className="bg-white">
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="font-bold">{f.customId || f.id}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{f.level}</div>
                                                        <div className={`text-xs font-bold mt-2 ${f.status === 'Closed' ? 'text-green-600' : 'text-blue-600'}`}>{f.status}</div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="mb-2">{f.description}</p>
                                                        {f.rootCause && <p className="text-xs text-gray-600 bg-gray-50 p-1 rounded"><strong>RC:</strong> {f.rootCause}</p>}
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-xs">
                                                        {lastCar ? (
                                                            <div>
                                                                <div className="font-bold text-indigo-700">CAR #{lastCar.carNumber}</div>
                                                                <div className="line-clamp-2 mt-1">{lastCar.correctiveAction}</div>
                                                            </div>
                                                        ) : <span className="text-gray-400 italic">No actions yet.</span>}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                             </div>
                        )}
                    </>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">Evidence Vault</h3>
                        {allAttachments.length === 0 ? (
                             <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <span className="text-4xl block mb-2">📂</span>
                                <p className="text-gray-500">No evidence documents or images have been uploaded for this audit.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {allAttachments.map((att, idx) => (
                                    <div key={idx} className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                                            {att.type === 'image' ? (
                                                <span className="text-4xl">🖼️</span> // In real app, would be <img src={att.url} />
                                            ) : (
                                                <FileTextIcon className="h-12 w-12 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-sm font-bold text-gray-800 truncate" title={att.name}>{att.name}</p>
                                            <p className="text-xs text-gray-500">{att.sourceType} • {att.date ? new Date(att.date).toLocaleDateString() : ''}</p>
                                        </div>
                                        <div className="text-xs bg-gray-50 p-1 rounded mb-3 truncate" title={att.refId}>
                                            Ref: {att.refId}
                                        </div>
                                        <a 
                                            href={att.url} 
                                            download={att.name}
                                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 rounded hover:bg-gray-50"
                                            onClick={(e) => { if(att.url === '#') { e.preventDefault(); alert('Download simulation'); }}}
                                        >
                                            <DownloadIcon className="h-3 w-3" /> Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* 5. Signatures Footer */}
                {activeTab === 'report' && (
                    <div className="mt-16 pt-8 border-t-2 border-gray-300 break-inside-avoid">
                        <div className="grid grid-cols-2 gap-16">
                            <div>
                                <p className="mb-8 text-sm font-bold text-gray-500 uppercase">Lead Auditor Signature</p>
                                <div className="h-16 border-b border-gray-400 mb-2 relative">
                                    {/* Placeholder for signature image */}
                                    {audit.status === 'Completed' && (
                                        <div className="absolute bottom-2 left-0 font-serif italic text-2xl text-blue-900 font-bold opacity-75 transform -rotate-2">
                                            {auditor?.name}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Name: {auditor?.name}</span>
                                    <span>Date: {audit.reportDate ? new Date(audit.reportDate).toLocaleDateString() : '____________'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="mb-8 text-sm font-bold text-gray-500 uppercase">Auditee Acceptance</p>
                                <div className="h-16 border-b border-gray-400 mb-2 relative">
                                     {audit.status === 'Completed' && (
                                        <div className="absolute bottom-2 left-0 font-serif italic text-2xl text-gray-800 font-bold opacity-75">
                                            Accepted
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Name: {auditee?.name || '________________'}</span>
                                    <span>Date: ____________</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 text-center text-xs text-gray-400">
                            Generated by AVI Audit Management Platform • {new Date().toISOString()} • Page 1 of 1
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditReportView;
