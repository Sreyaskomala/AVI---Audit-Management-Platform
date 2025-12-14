
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { FileTextIcon } from './icons/FileTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { FolderIcon } from './icons/FolderIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon } from './icons/BellIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { SparklesIcon } from './icons/SparklesIcon';

type HelpSection = 'overview' | 'dashboard' | 'audits' | 'planning' | 'cars' | 'admin';

const HelpPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeSection, setActiveSection] = useState<HelpSection>('overview');

    const sections: { id: HelpSection; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview & Navigation', icon: <SearchIcon className="h-5 w-5" /> },
        { id: 'dashboard', label: 'Dashboard & Metrics', icon: <BarChartIcon className="h-5 w-5" /> },
        { id: 'audits', label: 'Audit Reports', icon: <FileTextIcon className="h-5 w-5" /> },
        { id: 'planning', label: 'Audit Planning', icon: <FolderIcon className="h-5 w-5" /> },
        { id: 'cars', label: 'CAR Management', icon: <ClipboardListIcon className="h-5 w-5" /> },
        { id: 'admin', label: 'Admin & Profile', icon: <SettingsIcon className="h-5 w-5" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Platform Overview</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Welcome to <strong>AVI</strong>, the Aviation Audit Management Platform. This system is designed to streamline the entire lifecycle of internal and external audits, from scheduling and reporting to findings management and corrective action tracking. It serves two main user roles: <strong>Auditors</strong> (Quality Department) and <strong>Auditees</strong> (Department Heads/Managers).
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl border border-blue-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-4 flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" /> Global Navigation Bar (Header)
                            </h3>
                            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                                <li className="flex gap-3">
                                    <div className="mt-1"><SearchIcon className="h-4 w-4 text-gray-500" /></div>
                                    <div>
                                        <strong>Global Search:</strong> Located at the top left. Use this to quickly find specific pages or reference IDs (feature in development).
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1"><SparklesIcon className="h-4 w-4 text-yellow-500" /></div>
                                    <div>
                                        <strong>Theme Toggle:</strong> Click the Sun/Moon icon to switch between Light Mode and Dark Mode. This preference is saved to your browser.
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1"><BellIcon className="h-4 w-4 text-gray-500" /></div>
                                    <div>
                                        <strong>Notifications:</strong> The bell icon displays a red badge count for unread alerts. Clicking it toggles the <strong>Notification Drawer</strong> on the right side of the screen, showing a history of CAR submissions, upcoming audits, and due dates.
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1"><UsersIcon className="h-4 w-4 text-primary" /></div>
                                    <div>
                                        <strong>User Profile Menu:</strong> Click your avatar/name to access your <strong>Profile</strong> settings or <strong>Logout</strong>.
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Sidebar Navigation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sections.filter(s => s.id !== 'overview').map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left"
                                    >
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-primary">
                                            {s.icon}
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Dashboard</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                The Dashboard is your command center. It provides a high-level view of compliance health and immediate actions required.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">1. Filters & Controls</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                <li><strong>Location Filter:</strong> Top-right dropdown. Changing this updates ALL metric cards and charts on the dashboard to show data only for the selected location (e.g., Location 1, Location 2).</li>
                                <li><strong>Help Button:</strong> The "Need Help?" link brings you to this guide.</li>
                                <li><strong>Schedule New Audit (Auditor Only):</strong> A prominent button in the header area opens the modal to create a new audit immediately without leaving the dashboard.</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">2. Interactive Metric Cards</h3>
                                <p className="text-sm text-gray-500 mb-3">Clicking any card opens a detailed list (drill-down view).</p>
                                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 rounded font-bold">Active Audits</span>
                                        <span>Count of audits with status 'Scheduled' or 'In Progress'. Drill-down shows ID, Title, Dept, Date.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-yellow-100 text-yellow-800 px-2 rounded font-bold">Open Findings</span>
                                        <span>Count of findings with status 'Open' or 'Rejected'. Drill-down shows Finding ID, Level, Deadline.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-red-100 text-red-800 px-2 rounded font-bold">Pending CARs</span>
                                        <span>Count of CARs submitted by auditees awaiting your review. Drill-down shows CAR Ref, Date, Action summary.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-green-100 text-green-800 px-2 rounded font-bold">Completed</span>
                                        <span>Count of fully closed audits.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">3. Quick Actions & Tables</h3>
                                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                    <li><strong>Create New Audit:</strong> Opens the creation modal.</li>
                                    <li><strong>Submit CAR:</strong> Navigates to CAR Management page.</li>
                                    <li><strong>Track Findings:</strong> Navigates to Findings Tracker.</li>
                                    <li><strong>Generate Report:</strong> Navigates to Audit Reports page.</li>
                                    <li className="pt-2 border-t mt-2">
                                        <strong>Recent Audits Table:</strong> Shows the 5 most recent audits. Columns include Reference, Title, Department, Date, Status, and a visual Finding Count (Red=Open / Green=Closed).
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'audits':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Audit Reports</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                This module allows you to view, filter, and manage all audit reports.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Filtering & Exporting</h3>
                                <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <p><strong>Status Filter:</strong> Use the multi-select dropdown to view specific states (e.g., show only 'Draft' and 'In Progress').</p>
                                    <p><strong>Location Filter:</strong> Filter the list by physical location.</p>
                                    <p><strong>Export Button:</strong> 
                                        <br/>- <strong>CSV:</strong> Downloads a .csv file compatible with Excel.
                                        <br/>- <strong>Print:</strong> Opens the browser print dialog for the list view.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Creating an Audit (Auditor Only)</h3>
                                <p className="mb-3 text-sm text-gray-600">Click "Create New Audit" to open the modal:</p>
                                <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li><strong>General Info:</strong> Select Internal vs External. If External, provide entity name (e.g., CAA).</li>
                                    <li><strong>Scope:</strong> Title, Department (selects Auditee automatically), Location. FSTD selection appears if Dept is 'Engineering'.</li>
                                    <li><strong>Dates:</strong> Select main date. Use "+ Add Another Date" for multi-day audits.</li>
                                    <li><strong>Findings:</strong> Click "+ Add New Finding".
                                        <ul className="list-disc pl-5 mt-1 text-gray-500">
                                            <li><strong>Level:</strong> Level 1 (7 days), Level 2 (30 days), etc. Deadline is auto-calculated upon finalization.</li>
                                            <li><strong>Attachments:</strong> Upload evidence photos/docs directly to the finding.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Buttons:</strong> 
                                        <br/>- <strong>Save as Draft:</strong> Saves progress. Status becomes 'Draft'.
                                        <br/>- <strong>Finalize & Submit:</strong> Locks the report, sets status to 'CAR Pending', and notifies the Auditee.
                                    </li>
                                </ul>
                            </div>

                             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Viewing a Report</h3>
                                <p className="text-sm text-gray-600 mb-2">Click "View Report" on any table row.</p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li><strong>Layout Modes:</strong> Toggle between "Detailed" (Vertical, readable) and "Matrix" (Horizontal table) views using the buttons at the top left of the modal.</li>
                                    <li><strong>AI Summary:</strong> Click the <SparklesIcon className="inline h-3 w-3"/> button to generate a 3-4 sentence executive summary of the audit using AI.</li>
                                    <li><strong>Print:</strong> Renders a printer-friendly version of the report.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'planning':
                return (
                     <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Audit Planning Calendar</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                A calendar interface for visualizing the audit schedule and identifying gaps or overlaps.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">How to Use</h3>
                            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-3">
                                    <div className="font-bold whitespace-nowrap w-24">Navigation:</div>
                                    <div>Use the arrows next to the Month/Year label to switch months.</div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="font-bold whitespace-nowrap w-24">Create:</div>
                                    <div>(Auditor Only) Click on any empty white space within a calendar day cell to open the "Create Audit" modal pre-filled with that date.</div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="font-bold whitespace-nowrap w-24">View/Edit:</div>
                                    <div>Click on an existing audit strip. 
                                        <br/>- If <strong>Draft</strong>: Opens Edit Modal.
                                        <br/>- If <strong>Finalized</strong>: Opens View Report Modal.
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="font-bold whitespace-nowrap w-24">Legend:</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 border border-gray-500 border-dashed"></span> Draft</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border border-blue-500"></span> Scheduled</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-500"></span> Completed</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-500"></span> Overdue</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            case 'cars':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">CAR Management</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                The core compliance engine. This module handles the submission and review of Corrective Action Reports (CARs).
                            </p>
                        </div>

                        {/* AUDITEE SECTION */}
                        <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl border border-blue-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">FOR AUDITEES</span>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Submitting a CAR</h3>
                            </div>
                            
                            <ol className="list-decimal pl-5 space-y-4 text-gray-700 dark:text-gray-300">
                                <li>
                                    <strong>Navigate to 'Open Findings / Action Required' Tab:</strong>
                                    <p className="text-sm mt-1">Here you see all findings assigned to your department that are not yet Closed.</p>
                                </li>
                                <li>
                                    <strong>Click "Submit CAR":</strong>
                                    <p className="text-sm mt-1">Opens the submission form.</p>
                                </li>
                                <li>
                                    <strong>Fill the Form:</strong>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-600 space-y-1">
                                        <li><strong>Root Cause:</strong> Required for the first submission. Read-only for subsequent updates.</li>
                                        <li><strong>Action Taken:</strong> Describe what you did.</li>
                                        <li><strong>Evidence:</strong> Upload photos or PDFs.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Submission Status (Crucial):</strong>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-600 space-y-1">
                                        <li>Select <strong>"Work in Progress"</strong> if you are just providing an update but the work isn't finished. The finding will remain 'Open'.</li>
                                        <li>Select <strong>"Corrective Action Complete"</strong> if you are ready for the auditor to close the finding.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Extension Request:</strong>
                                    <p className="text-sm mt-1">Check the box at the bottom if you cannot meet the deadline. You must provide a New Date and Reason. The Auditor will approve/reject this during review.</p>
                                </li>
                            </ol>
                        </div>

                        {/* AUDITOR SECTION */}
                        <div className="bg-orange-50 dark:bg-gray-800 p-6 rounded-xl border border-orange-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">FOR AUDITORS</span>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Reviewing a CAR</h3>
                            </div>
                            
                            <ol className="list-decimal pl-5 space-y-4 text-gray-700 dark:text-gray-300">
                                <li>
                                    <strong>Navigate to 'Pending Reviews' Tab:</strong>
                                    <p className="text-sm mt-1">Cards appear here when an Auditee submits a CAR.</p>
                                </li>
                                <li>
                                    <strong>Click "Review CAR":</strong>
                                    <p className="text-sm mt-1">Opens the split-screen review modal.</p>
                                </li>
                                <li>
                                    <strong>Analyze:</strong>
                                    <p className="text-sm mt-1">Left side shows the current submission. Right side shows previous history. Check attachments.</p>
                                </li>
                                <li>
                                    <strong>Extension Decision:</strong>
                                    <p className="text-sm mt-1">If requested, a purple box appears. Select 'Approve' (updates deadline) or 'Reject'.</p>
                                </li>
                                <li>
                                    <strong>Final Decision:</strong>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-600 space-y-1">
                                        <li><strong>Verify & Close:</strong> If Auditee requested closure and you agree, check the box. Finding becomes 'Closed'.</li>
                                        <li><strong>Reject/Request More Info:</strong> If you do NOT check the close box, the finding reverts to 'Rejected/Open' status, and your remarks are sent to the Auditee.</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                    </div>
                );

            case 'admin':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Admin & Settings</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Management of system users and personal profile settings.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">User Management (Auditor Role Only)</h3>
                            <p className="mb-4 text-sm text-gray-600">Accessed via sidebar "User Management".</p>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li><strong>Create User:</strong> Click the top-right button. Enter Name, Department, and Role (Auditor vs Auditee).
                                    <br/><span className="text-xs text-gray-500 italic">Note: Department names must match exactly when creating Audits.</span>
                                </li>
                                <li><strong>Edit User:</strong> Click the pencil icon to rename or change roles.</li>
                                <li><strong>Delete User:</strong> Click the trash icon. <span className="text-red-500 font-bold text-xs">Warning: This cannot be undone.</span></li>
                            </ul>
                        </div>

                         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Profile Page</h3>
                            <p className="mb-4 text-sm text-gray-600">Accessed via the user menu in the top-right header.</p>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li><strong>View Details:</strong> Shows your current Name, Role, Department, and ID.</li>
                                <li><strong>Edit Profile:</strong> Click to change your display name or department.</li>
                                <li><strong>Avatar:</strong> Your avatar is automatically generated based on your name initials.</li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-12">
            {/* Left Navigation Rail */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <nav className="space-y-1 sticky top-6">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                activeSection === section.id 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {section.icon}
                            {section.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default HelpPage;
