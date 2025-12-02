
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const ProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUserDetails } = useAppContext();
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setDepartment(currentUser.department);
        }
    }, [currentUser]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateCurrentUserDetails({ name, department });
        setIsEditing(false);
    };

    if (!currentUser) return null;

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">User Profile</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center border-b border-gray-200 dark:border-gray-700">
                     <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md mb-4 overflow-hidden">
                        <img 
                            src={currentUser.avatarUrl} 
                            alt={currentUser.name} 
                            className="h-full w-full rounded-full object-cover"
                        />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentUser.name}</h2>
                     <p className="text-gray-500 dark:text-gray-400 font-medium">{currentUser.role}</p>
                </div>

                <div className="p-8">
                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{currentUser.name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{currentUser.department}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{currentUser.role}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</label>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">#{currentUser.id}</p>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    required 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                                <input 
                                    type="text" 
                                    value={department} 
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">Note: Changing department might affect audit assignments.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
