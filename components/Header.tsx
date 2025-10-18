import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon } from './icons/BellIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, logout, setCurrentPage } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
            <MenuIcon className="h-6 w-6" />
        </button>
        <div className="relative mx-4 lg:mx-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-500" />
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-primary focus:ring-opacity-40 focus:outline-none"
            type="text"
            placeholder="Search"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <BellIcon className="h-6 w-6 text-gray-600 hover:text-primary cursor-pointer" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
          </span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img className="h-10 w-10 rounded-full object-cover" src={currentUser?.avatarUrl} alt="User avatar" />
            <div className="ml-3 hidden sm:block">
              <p className="font-semibold text-gray-800">{currentUser?.name}</p>
              <p className="text-sm text-gray-500">{currentUser?.role} - {currentUser?.department}</p>
            </div>
            <ChevronDownIcon className="h-5 w-5 text-gray-500 ml-2 hidden sm:block"/>
          </div>
          {dropdownOpen && (
             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                <button onClick={() => { setCurrentPage('profile'); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;