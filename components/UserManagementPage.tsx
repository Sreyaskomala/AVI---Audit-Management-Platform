import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User, UserRole } from '../types';
import Modal from './shared/Modal';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

const UserManagementPage: React.FC = () => {
    const { currentUser, users, addUser, updateUser, deleteUser } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        role: UserRole.Auditee,
        avatarUrl: '',
    });

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', department: '', role: UserRole.Auditee, avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` });
        setModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, department: user.department, role: user.role, avatarUrl: user.avatarUrl });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUser({ ...editingUser, ...formData });
        } else {
            addUser(formData);
        }
        handleCloseModal();
    };

    const handleDelete = (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    };
    
    if (currentUser?.role !== UserRole.Auditor) {
        return (
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button 
                    onClick={openCreateModal}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Create New User
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                                            <div className="ml-4 font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.department}</td>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openEditModal(user)} className="text-primary hover:text-primary-dark p-2">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="text-danger hover:text-red-700 p-2">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal title={editingUser ? 'Edit User' : 'Create User'} onClose={handleCloseModal}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" required>
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Avatar URL</label>
                            <input type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">
                                {editingUser ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default UserManagementPage;
