'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface DropdownOption {
    label: string;
    value: string | number;
}

// interface SearchableLeadDropdownProps {
//     options: DropdownOption[];
//     selected: DropdownOption | null;
//     onChange: (val: DropdownOption | null) => void;
//     placeholder?: string;
//     disabled?: boolean;
// }


interface SearchableLeadDropdownProps {
    options: DropdownOption[];
    selected: DropdownOption | null;
    onChange: (val: DropdownOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
    // Add these:
    onSearchChange?: (query: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
    totalCount?: number;
}

// Only render 50 items at a time — prevents DOM overload with 30k options
const VISIBLE_LIMIT = 50;

const SearchableLeadDropdown: React.FC<SearchableLeadDropdownProps> = ({
    options,
    selected,
    onChange,
    placeholder = 'Select Lead',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(VISIBLE_LIMIT);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // FIX 1: useMemo — filter only runs when options/searchTerm changes, not every render
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const q = searchTerm.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchTerm]);

    // FIX 2: Slice to VISIBLE_LIMIT — never render 30k DOM nodes at once
    const visibleOptions = useMemo(
        () => filteredOptions.slice(0, visibleCount),
        [filteredOptions, visibleCount]
    );

    // Reset visible count on new search
    useEffect(() => {
        setVisibleCount(VISIBLE_LIMIT);
    }, [searchTerm]);

    // Close on outside click — registered once only
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setVisibleCount(VISIBLE_LIMIT);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // FIX 3: Focus AFTER paint using setTimeout(0) — no UI jank on open
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // FIX 4: Load more 50 items on scroll — smooth infinite scroll
    const handleScroll = useCallback(() => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 30) {
            setVisibleCount((prev) => prev + VISIBLE_LIMIT);
        }
    }, []);

    const handleSelect = useCallback((option: DropdownOption) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
        setVisibleCount(VISIBLE_LIMIT);
    }, [onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm('');
    }, [onChange]);

    // Highlight matched text in orange
    const highlightMatch = useCallback((label: string, query: string) => {
        if (!query.trim()) return <span>{label}</span>;
        const idx = label.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return <span>{label}</span>;
        return (
            <span>
                {label.slice(0, idx)}
                <mark className="bg-orange-200 dark:bg-orange-700 text-orange-900 dark:text-white rounded-sm px-0.5 not-italic">
                    {label.slice(idx, idx + query.length)}
                </mark>
                {label.slice(idx + query.length)}
            </span>
        );
    }, []);

    return (
        <div ref={dropdownRef} className="relative w-full">

            {/* Trigger Button */}
            <div
                className={`
                    w-full h-11 px-3 border rounded-lg flex items-center justify-between
                    cursor-pointer text-sm transition-colors select-none
                    ${disabled
                        ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600'
                        : isOpen
                            ? 'bg-white dark:bg-gray-800 border-orange-500 ring-2 ring-orange-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }
                `}
                onClick={() => !disabled && setIsOpen((p) => !p)}
            >
                <span className={`truncate ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {selected && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                            <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Panel */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden">

                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                placeholder="Name, phone ya ID se search karo..."
                                className="w-full h-9 pl-8 pr-8 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg leading-none"
                                >×</button>
                            )}
                        </div>
                        {/* Result count */}
                        <p className="text-xs mt-1 pl-0.5">
                            {searchTerm
                                ? <span className={filteredOptions.length > 0 ? 'text-green-500' : 'text-red-400'}>
                                    {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''} found
                                </span>
                                : <span className="text-gray-400">
                                    Showing {visibleOptions.length} of {options.length} leads
                                </span>
                            }
                        </p>
                    </div>

                    {/* Options List — only renders 50 items max at a time */}
                    <div
                        ref={listRef}
                        onScroll={handleScroll}
                        className="max-h-52 overflow-y-auto"
                    >
                        {visibleOptions.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-gray-400 text-center">
                                {searchTerm
                                    ? <>No lead found for <strong className="text-gray-500 dark:text-gray-300">"{searchTerm}"</strong></>
                                    : 'No leads available'
                                }
                            </div>
                        ) : (
                            visibleOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        px-4 py-2.5 cursor-pointer text-sm transition-colors
                                        border-b border-gray-50 dark:border-gray-700/40 last:border-0
                                        ${selected?.value === option.value
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                                            : 'hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">
                                            {highlightMatch(String(option.label), searchTerm)}
                                        </span>
                                        {selected?.value === option.value && (
                                            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Scroll to load more indicator */}
                        {visibleCount < filteredOptions.length && (
                            <div className="px-4 py-2 text-xs text-center text-orange-400 border-t border-gray-100 dark:border-gray-700 bg-orange-50/50 dark:bg-orange-900/10">
                                ↓ Scroll for more ({filteredOptions.length - visibleCount} remaining)
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableLeadDropdown;