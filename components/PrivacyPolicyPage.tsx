
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">1. Data Collection</h2>
                    <p>We collect information necessary to facilitate the audit process, including user profiles (names, roles, departments) and audit-related documentation (findings, evidence, reports).</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">2. Data Usage</h2>
                    <p>Your data is used solely for the purpose of providing the audit management service, generating reports, and tracking compliance history. We do not sell your data to third parties.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">3. Data Security</h2>
                    <p>We employ industry-standard security measures to protect your data from unauthorized access, alteration, or destruction. However, no internet transmission is completely secure.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">4. User Rights</h2>
                    <p>You have the right to access, correct, or request deletion of your personal data stored within the platform, subject to regulatory retention requirements for audit records.</p>
                </section>
                <div className="text-sm text-gray-400 mt-8 pt-8 border-t">
                    Last updated: October 2025
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
