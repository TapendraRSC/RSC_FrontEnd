'use client';
import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
    label: string;
    value: string | number;
}

interface SearchableLeadDropdownProps {
    options: DropdownOption[];
    selected: DropdownOption | null;
    onChange: (val: DropdownOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

const SearchableLeadDropdown: React.FC<SearchableLeadDropdownProps> = ({
    options,
    selected,
    onChange,
    placeholder = 'Select Lead',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option: DropdownOption) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm('');
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            {/* Display */}
            <div
                className={`w-full h-11 px-3 border rounded-lg flex items-center justify-between cursor-pointer text-sm
          ${disabled
                        ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-500'
                    }
          ${isOpen
                        ? 'border-orange-500 ring-2 ring-orange-500/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span
                    className={`truncate ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                        }`}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {selected && !disabled && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                            <svg
                                className="w-3.5 h-3.5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search lead..."
                                className="w-full h-9 pl-8 pr-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-2.5 cursor-pointer text-sm transition-colors
                    ${selected?.value === option.value
                                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate">{option.label}</span>
                                        {selected?.value === option.value && (
                                            <svg
                                                className="w-4 h-4 text-orange-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                No leads found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableLeadDropdown;
