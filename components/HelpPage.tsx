
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { FileTextIcon } from './icons/FileTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

const HelpPage: React.FC = () => {
    const { currentUser } = useAppContext();
    // If user is logged in, default to their role. If not (investor view), default to Auditor view but allow toggle.
    const [activeRole, setActiveRole] = useState<UserRole>(currentUser?.role || UserRole.Auditor);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    User Guide & Platform Overview
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Welcome to <span className="font-bold text-primary">AVI</span>. This comprehensive audit management platform streamlines compliance, tracking, and corrective actions for aviation organizations.
                </p>
            </div>

            {/* Role Toggle for Investors/Public View */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveRole(UserRole.Auditor)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeRole === UserRole.Auditor 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Auditor Workflow
                    </button>
                    <button
                        onClick={() => setActiveRole(UserRole.Auditee)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeRole === UserRole.Auditee
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Auditee Workflow
                    </button>
                </div>
            </div>

            {activeRole === UserRole.Auditor && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-primary">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-primary">
                                <FileTextIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">1. Planning & Reporting Audits</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Start by navigating to <strong>Audit Reports</strong>. You can:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li><strong>Create New Audit:</strong> Set the schedule, department, and scope.</li>
                                    <li><strong>Draft Findings:</strong> Add detailed findings with reference clauses (e.g., ISO, EASA) and severity levels.</li>
                                    <li><strong>Finalize:</strong> Once complete, submit the report to notify the Auditee immediately.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-warning">
                        <div className="flex items-start gap-4">
                            <div className="bg-yellow-100 p-3 rounded-full text-warning">
                                <ClipboardListIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">2. Reviewing CARs (Corrective Action Reports)</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    When an Auditee submits a CAR, you will receive a notification. Go to <strong>CAR Management</strong> to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li><strong>Review Root Cause:</strong> Ensure the analysis is sound.</li>
                                    <li><strong>Verify Evidence:</strong> Check attached photos or documents.</li>
                                    <li><strong>Decision:</strong> Approve to close the finding, or Reject to request further action.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                                <AlertTriangleIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">3. Tracking & Compliance</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Use the <strong>Findings Tracker</strong> for a high-level view of compliance health.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li>Monitor overdue findings.</li>
                                    <li>Identify trends in non-compliance by department.</li>
                                    <li>Manage deadline extension requests.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeRole === UserRole.Auditee && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <CheckCircleIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">1. Dashboard & Notifications</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Your Dashboard highlights immediate actions.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li>See upcoming audits scheduled for your department.</li>
                                    <li>View findings that are <strong>Open</strong> or <strong>Overdue</strong>.</li>
                                    <li>Receive alerts for rejected CARs requiring your attention.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <FileTextIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">2. Submitting Corrective Actions</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Navigate to <strong>CAR Management</strong> to address findings.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li><strong>Root Cause:</strong> Analyze why the issue occurred.</li>
                                    <li><strong>Action Taken:</strong> Describe the fix.</li>
                                    <li><strong>Evidence:</strong> Upload photos/docs to prove compliance.</li>
                                    <li><strong>Submit:</strong> Send to the Auditor for review.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
                         <div className="flex items-start gap-4">
                            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                                <AlertTriangleIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">3. Extensions & Deadlines</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                   Compliance is time-sensitive.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <li>Track deadlines directly on the CAR card.</li>
                                    <li>Request deadline extensions if you need more time (subject to Auditor approval).</li>
                                    <li>Keep findings "Open" if work is in progress, or mark "Closed" when ready for verification.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {!currentUser && (
                <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Ready to explore?</h3>
                    <p className="text-blue-700 mb-4">Go back to the login page to access the demo environment.</p>
                </div>
            )}
        </div>
    );
};

export default HelpPage;
