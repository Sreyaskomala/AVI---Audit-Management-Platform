
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { Logo } from './Logo';

const LoginPage: React.FC = () => {
  const { users, login, setCurrentPage } = useAppContext();
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id.toString() || '');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      login(parseInt(selectedUserId, 10));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl flex flex-col">
        <div className="flex flex-col items-center">
            <Logo className="h-20 w-auto mb-4 text-gray-800" />
            <h1 className="text-4xl font-bold text-gray-800 mt-2">AVI Login</h1>
            <p className="text-gray-500 mt-2">Audit Management Platform</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
              Select User to Login As:
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              {users.map((user: User) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role} - {user.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="flex flex-col items-center space-y-3">
                 <button 
                    onClick={() => setCurrentPage('help')}
                    className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center gap-2 group"
                 >
                    <span className="bg-blue-50 group-hover:bg-blue-100 p-1.5 rounded-full transition-colors">
                        ?
                    </span>
                    How to use this platform
                 </button>
                 
                 <div className="flex space-x-4 text-xs text-gray-500">
                     <button onClick={() => setCurrentPage('terms')} className="hover:underline hover:text-gray-800">Terms & Conditions</button>
                     <span>•</span>
                     <button onClick={() => setCurrentPage('privacy')} className="hover:underline hover:text-gray-800">Privacy Policy</button>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
