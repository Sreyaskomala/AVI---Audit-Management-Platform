
import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">1. Introduction</h2>
                    <p>Welcome to AVI. By accessing our website and using our audit management services, you agree to be bound by these Terms and Conditions.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">2. Use of Platform</h2>
                    <p>You agree to use the platform only for lawful purposes related to aviation compliance and quality assurance. Unauthorized access or misuse of data is strictly prohibited.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">3. Data Integrity</h2>
                    <p>Users are responsible for the accuracy of the data entered into the system, including audit findings, corrective actions, and evidence uploads.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">4. Limitation of Liability</h2>
                    <p>AVI is a tool to assist in compliance management. We are not liable for any regulatory fines or operational incidents resulting from the use or misuse of this platform.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">5. Updates</h2>
                    <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the new terms.</p>
                </section>
                <div className="text-sm text-gray-400 mt-8 pt-8 border-t">
                    Last updated: October 2025
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
