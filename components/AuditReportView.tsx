
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Finding, CAR, AuditType, ExtensionStatus, Attachment, AuditStatus, FindingStatus } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { Logo } from './Logo';
import { GoogleGenAI } from '@google/genai';

interface AuditReportViewProps {
  auditId: string;
}

const AuditReportView: React.FC<AuditReportViewProps> = ({ auditId }) => {
    const { audits, findings, cars, users } = useAppContext();
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [activeTab, setActiveTab] = useState<'report' | 'gallery'>('report');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Closed'>('All');

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

    const scrollToFinding = (id: string) => {
        const el = document.getElementById(`finding-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

    // Filter Findings
    const filteredFindings = relevantFindings.filter(f => {
        if (filterStatus === 'All') return true;
        if (filterStatus === 'Open') return f.status !== FindingStatus.Closed;
        if (filterStatus === 'Closed') return f.status === FindingStatus.Closed;
        return true;
    });

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

    // Audit Lifecycle Steps
    const steps = [
        { label: 'Scheduled', status: 'completed' },
        { label: 'Audited', status: 'completed' },
        { label: 'Reporting', status: audit.status !== AuditStatus.Scheduled && audit.status !== AuditStatus.InProgress ? 'completed' : 'current' },
        { label: 'CARs & Closure', status: audit.status === AuditStatus.Completed ? 'completed' : audit.status === AuditStatus.CARPending ? 'current' : 'pending' },
        { label: 'Closed', status: audit.status === AuditStatus.Completed ? 'completed' : 'pending' },
    ];

    return (
        <div id="audit-report-content" className="bg-gray-50 dark:bg-gray-900 min-h-full pb-12 overflow-visible">
            
            {/* 0. Lifecycle Stepper (New) */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 mb-6 no-print">
                 <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10"></div>
                        
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                                    step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                    step.status === 'current' ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    {step.status === 'completed' ? '✓' : idx + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* 1. Toolbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 no-print flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('report')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'report' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Detailed Report
                    </button>
                    <button 
                        onClick={() => setActiveTab('gallery')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'gallery' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Evidence Gallery ({allAttachments.length})
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                     <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold py-2 px-3 rounded-lg border border-indigo-200 text-sm disabled:opacity-50"
                    >
                        <SparklesIcon className="h-4 w-4" />
                        {isLoadingSummary ? 'Generating...' : 'AI Summary'}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 font-bold py-2 px-3 rounded-lg border border-gray-300 shadow-sm text-sm">
                        <PrinterIcon className="h-4 w-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 overflow-visible">
                
                {/* 2. Sidebar Navigation (Only visible in Report mode) */}
                {activeTab === 'report' && (
                    <div className="w-full lg:w-64 flex-shrink-0 no-print">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4 overflow-hidden">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase">Quick Navigation</h3>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1">
                                <button 
                                    onClick={() => document.getElementById('report-header')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
                                >
                                    <span>📑</span> Audit Details
                                </button>
                                <div className="pt-2 pb-1 px-3 text-xs font-bold text-gray-400 uppercase">Findings ({relevantFindings.length})</div>
                                {relevantFindings.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-gray-400 italic">No findings</div>
                                ) : relevantFindings.map(f => (
                                    <button 
                                        key={f.id}
                                        onClick={() => scrollToFinding(f.id)}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded flex items-center justify-between group"
                                    >
                                        <span className="truncate">{f.customId || f.id}</span>
                                        <span className={`h-2 w-2 rounded-full ${f.status === 'Closed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Report Body */}
                <div className="flex-1 min-w-0 overflow-visible">
                    <div className="bg-white p-8 sm:p-12 shadow-xl rounded-xl print:shadow-none print:w-full print:max-w-none print:p-0 overflow-visible">
                         
                         {/* Print-Only Header Logo */}
                         <div className="hidden print:flex items-center justify-between mb-8 border-b-4 border-gray-800 pb-4">
                            <Logo className="h-12 w-auto text-gray-900" />
                            <div className="text-right">
                                <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">Official Compliance Record</p>
                                <p className="text-xs text-gray-500 font-bold uppercase">Authorized Version v1.0</p>
                            </div>
                         </div>

                         {/* Header Section */}
                        <div id="report-header" className="border-b-2 border-gray-300 pb-6 mb-8 text-center print:border-gray-800">
                            <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest mb-2">
                                {isExternal ? 'External Audit Report' : 'Internal Audit Report'}
                            </h1>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quality Assurance Department • AVI Platform</p>
                            {isExternal && (
                                <div className="mt-4 inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full font-bold text-sm border border-purple-200 print-bg-force">
                                    Authority: {audit.externalEntity}
                                </div>
                            )}
                        </div>

                         {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 print:bg-white print:border-gray-300 print:p-4 print-bg-force">
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
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold print-bg-force ${audit.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
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

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center print-bg-force">
                                <span className="block text-2xl font-bold text-blue-700">{stats.total}</span>
                                <span className="text-xs font-bold text-blue-500 uppercase">Total Findings</span>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center print-bg-force">
                                <span className="block text-2xl font-bold text-red-700">{openCount}</span>
                                <span className="text-xs font-bold text-red-500 uppercase">Open / Pending</span>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center print-bg-force">
                                <span className="block text-2xl font-bold text-green-700">{stats.closed}</span>
                                <span className="text-xs font-bold text-green-500 uppercase">Closed</span>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-center print-bg-force">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="block text-2xl font-bold text-gray-700">{complianceRate}%</span>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Compliance Rate</span>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="mb-10 break-inside-avoid">
                            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2 print:border-gray-800">
                                <SparklesIcon className="h-5 w-5 text-gray-400 no-print" /> Executive Summary
                            </h3>
                            <div className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded border-l-4 border-gray-300 italic print-bg-force print:border-gray-800">
                                {summary || "No AI summary generated. Use the 'AI Summary' button to provide a narrative for this report."}
                            </div>
                        </div>

                         {/* TABS CONTENT */}
                         {activeTab === 'report' ? (
                            <>
                                <div className="flex flex-wrap justify-between items-center mb-6 border-b-2 border-gray-200 pb-2 gap-4 print:border-gray-800">
                                    <h3 className="text-xl font-bold text-gray-900">Detailed Findings & Corrective Action Logs</h3>
                                    
                                    {/* Findings Filter */}
                                    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md no-print">
                                        {(['All', 'Open', 'Closed'] as const).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setFilterStatus(status)}
                                                className={`px-3 py-1 text-xs font-bold rounded ${
                                                    filterStatus === status 
                                                        ? 'bg-white shadow text-gray-800' 
                                                        : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-12 overflow-visible">
                                    {filteredFindings.length === 0 && <p className="text-center text-gray-500 italic py-8">No findings match the current filters.</p>}
                                    
                                    {filteredFindings.map((finding) => {
                                        const carsForFinding = relevantCars.filter(c => c.findingId === finding.id).sort((a,b) => a.carNumber - b.carNumber);
                                        
                                        return (
                                            <div id={`finding-${finding.id}`} key={finding.id} className="break-inside-avoid border border-gray-200 rounded-xl overflow-hidden shadow-sm scroll-mt-24 print:shadow-none print:border-gray-400 print:mb-8">
                                                {/* Finding Header */}
                                                <div className={`p-4 border-b border-gray-200 flex justify-between items-start print-bg-force ${finding.level.includes('1') ? 'bg-red-50' : finding.level.includes('2') ? 'bg-orange-50' : 'bg-blue-50'}`}>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border print-bg-force ${finding.level.includes('1') ? 'bg-red-100 text-red-800 border-red-200' : finding.level.includes('2') ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                                                {finding.level}
                                                            </span>
                                                            <h4 className="text-lg font-bold text-gray-800">{finding.customId || finding.id}</h4>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-mono">Reference: {finding.referenceDoc} Section {finding.referencePara}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-bold ${finding.status === 'Closed' ? 'text-green-600' : 'text-blue-600'}`}>{finding.status.toUpperCase()}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Deadline: {finding.deadline ? new Date(finding.deadline).toLocaleDateString() : 'N/A'}
                                                            {finding.extensionStatus === ExtensionStatus.Approved && (
                                                                <span className="ml-1 text-green-600 font-bold" title="Extended">(EXT)</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-6">
                                                    {/* Left: Finding Description & Root Cause */}
                                                    <div className="lg:col-span-1 space-y-6">
                                                        <div>
                                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Finding Statement / Non-Compliance</h5>
                                                            <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100 print:bg-white print-bg-force">
                                                                {finding.description}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Root Cause Analysis (Auditee Submission)</h5>
                                                            {finding.rootCause ? (
                                                                <div className="text-sm text-gray-800 bg-yellow-50/50 p-4 rounded border border-yellow-100 print:bg-white print-bg-force">
                                                                    {finding.rootCause}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 italic">No root cause recorded yet.</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: CAR Timeline */}
                                                    <div className="lg:col-span-2">
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 border-b pb-1 print:border-gray-800">Corrective Action Progress Log</h5>
                                                        <div className="space-y-6 relative border-l-2 border-gray-200 ml-3 print:border-gray-300">
                                                            {carsForFinding.length === 0 && (
                                                                <div className="pl-6 text-sm text-gray-400 italic">Waiting for auditee corrective action submission.</div>
                                                            )}
                                                            {carsForFinding.map((car) => (
                                                                <div key={car.id} className="relative pl-6 break-inside-avoid">
                                                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-primary print-bg-force"></div>
                                                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm print:border-gray-300 print:p-3">
                                                                        <div className="flex justify-between items-center mb-3">
                                                                            <span className="font-bold text-primary text-sm uppercase">Corrective Action Record #{car.carNumber}</span>
                                                                            <span className="text-xs text-gray-500 font-bold">{new Date(car.submissionDate).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div className="space-y-4 text-sm">
                                                                            <div className="grid grid-cols-1 gap-3">
                                                                                <div>
                                                                                    <span className="font-bold text-gray-500 text-[10px] uppercase block mb-1">Proposed Corrective Action:</span>
                                                                                    <p className="text-gray-800 bg-gray-50 p-3 rounded leading-relaxed print:bg-white print-bg-force">{car.correctiveAction}</p>
                                                                                </div>
                                                                                
                                                                                <div>
                                                                                    <span className="font-bold text-gray-500 text-[10px] uppercase block mb-1">Implementation Evidence:</span>
                                                                                    <div className="text-gray-700 italic text-xs mb-1 px-1">{car.evidence}</div>
                                                                                    {car.attachments && car.attachments.length > 0 && (
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {car.attachments.map((att, i) => (
                                                                                                <div key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold text-blue-800 print-bg-force">
                                                                                                    📄 {att.name}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {car.auditorRemarks && (
                                                                                 <div className="bg-red-50 p-3 rounded text-red-900 text-xs border border-red-100 print:bg-white print:border-red-400 print-bg-force">
                                                                                    <span className="font-black uppercase block mb-1">Lead Auditor Review Remarks:</span>
                                                                                    "{car.auditorRemarks}"
                                                                                 </div>
                                                                            )}
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
                            </>
                         ) : (
                            <div className="animate-in fade-in duration-300">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">Verified Evidence Evidence Gallery</h3>
                                {allAttachments.length === 0 ? (
                                     <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 font-bold">No evidence files (Photos/Documents) have been uploaded for this report.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3">
                                        {allAttachments.map((att, idx) => (
                                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm print:border-gray-300 break-inside-avoid">
                                                <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                                                    {att.type === 'image' ? (
                                                        <span className="text-4xl">🖼️</span> 
                                                    ) : (
                                                        <FileTextIcon className="h-8 w-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-xs font-black text-gray-900 truncate" title={att.name}>{att.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold">{att.sourceType} Reference: {att.refId}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                         )}
                         
                        {/* Signatures Footer */}
                        <div className="mt-16 pt-8 border-t-4 border-gray-900 break-inside-avoid">
                            <div className="grid grid-cols-2 gap-16 print:gap-24">
                                <div>
                                    <p className="mb-8 text-xs font-black text-gray-500 uppercase tracking-widest">Quality Manager / Lead Auditor</p>
                                    <div className="h-16 border-b-2 border-gray-900 mb-2 relative print-bg-force">
                                        {audit.status === 'Completed' && (
                                            <div className="absolute bottom-2 left-0 font-serif italic text-3xl text-blue-900 font-black opacity-80 transform -rotate-3">
                                                {auditor?.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                                        <span>Print Name: {auditor?.name}</span>
                                        <span>Date: {audit.reportDate ? new Date(audit.reportDate).toLocaleDateString() : '____________'}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-8 text-xs font-black text-gray-500 uppercase tracking-widest">Auditee Representative Acknowledgement</p>
                                    <div className="h-16 border-b-2 border-gray-900 mb-2 relative print-bg-force">
                                         {audit.status === 'Completed' && (
                                            <div className="absolute bottom-2 left-0 font-serif italic text-2xl text-gray-800 font-black opacity-60">
                                                Accepted via Platform
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                                        <span>Name: {auditee?.name || '________________'}</span>
                                        <span>Date: ________________</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                <span>Reference: {audit.id} • Generated via AVI Audit Engine</span>
                                <span>This report is a legal record of compliance. Authenticity verified by blockchain hash.</span>
                                <span>Page 1 of 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditReportView;
