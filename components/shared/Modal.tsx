
import React, { ReactNode } from 'react';
import { XIcon } from '../icons/XIcon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | '2xl' | '4xl' | 'custom-xl';
}

const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    'custom-xl': 'max-w-6xl',
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, size = '2xl' }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-8 pb-8 overflow-y-auto modal-wrapper"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} my-auto flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b no-print">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[85vh] modal-content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
