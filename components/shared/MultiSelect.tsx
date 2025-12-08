
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { XIcon } from '../icons/XIcon';

interface MultiSelectProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full min-w-[200px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            >
                <span className="text-gray-700 dark:text-gray-200 truncate mr-2">
                    {selected.length === 0 
                        ? label 
                        : `${label}: ${selected.length} selected`}
                </span>
                <div className="flex items-center">
                    {selected.length > 0 && (
                        <div 
                            onClick={clearAll}
                            className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full cursor-pointer"
                        >
                             <XIcon className="h-3 w-3 text-gray-500" />
                        </div>
                    )}
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => toggleOption(option)}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => {}}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
