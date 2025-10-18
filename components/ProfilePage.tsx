import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';

const ProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUserDetails } = useAppContext();
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setDepartment(currentUser.department);
            setAvatarUrl(currentUser.avatarUrl);
        }
    }, [currentUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCurrentUserDetails({ name, department, avatarUrl });
        alert('Profile updated successfully!');
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={avatarUrl} alt="User Avatar" className="h-24 w-24 rounded-full object-cover" />
                        <div className="flex-1">
                            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">Avatar URL</label>
                            <input
                                id="avatarUrl"
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            id="department"
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <input
                            id="role"
                            type="text"
                            value={currentUser.role}
                            disabled
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
