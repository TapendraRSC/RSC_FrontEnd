// 'use client';
// import React, { useState, useRef, useEffect } from 'react';

// interface DropdownOption {
//     label: string;
//     value: string | number;
// }

// interface SearchableLeadDropdownProps {
//     options: DropdownOption[];
//     selected: DropdownOption | null;
//     onChange: (val: DropdownOption | null) => void;
//     placeholder?: string;
//     disabled?: boolean;
// }

// const SearchableLeadDropdown: React.FC<SearchableLeadDropdownProps> = ({
//     options,
//     selected,
//     onChange,
//     placeholder = 'Select Lead',
//     disabled = false,
// }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);

//     const filteredOptions = options.filter((opt) =>
//         opt.label.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 dropdownRef.current &&
//                 !dropdownRef.current.contains(event.target as Node)
//             ) {
//                 setIsOpen(false);
//                 setSearchTerm('');
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     useEffect(() => {
//         if (isOpen && inputRef.current) {
//             inputRef.current.focus();
//         }
//     }, [isOpen]);

//     const handleSelect = (option: DropdownOption) => {
//         onChange(option);
//         setIsOpen(false);
//         setSearchTerm('');
//     };

//     const handleClear = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         onChange(null);
//         setSearchTerm('');
//     };

//     return (
//         <div ref={dropdownRef} className="relative w-full">
//             {/* Display */}
//             <div
//                 className={`w-full h-11 px-3 border rounded-lg flex items-center justify-between cursor-pointer text-sm
//           ${disabled
//                         ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600'
//                         : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-500'
//                     }
//           ${isOpen
//                         ? 'border-orange-500 ring-2 ring-orange-500/20'
//                         : 'border-gray-300 dark:border-gray-600'
//                     }`}
//                 onClick={() => !disabled && setIsOpen(!isOpen)}
//             >
//                 <span
//                     className={`truncate ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400'
//                         }`}
//                 >
//                     {selected ? selected.label : placeholder}
//                 </span>
//                 <div className="flex items-center gap-1">
//                     {selected && !disabled && (
//                         <button
//                             onClick={handleClear}
//                             className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
//                         >
//                             <svg
//                                 className="w-3.5 h-3.5 text-gray-400"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M6 18L18 6M6 6l12 12"
//                                 />
//                             </svg>
//                         </button>
//                     )}
//                     <svg
//                         className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
//                             }`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                     >
//                         <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M19 9l-7 7-7-7"
//                         />
//                     </svg>
//                 </div>
//             </div>

//             {/* Dropdown */}
//             {isOpen && !disabled && (
//                 <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
//                     {/* Search */}
//                     <div className="p-2 border-b border-gray-200 dark:border-gray-700">
//                         <div className="relative">
//                             <svg
//                                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                                 />
//                             </svg>
//                             <input
//                                 ref={inputRef}
//                                 type="text"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 placeholder="Search lead..."
//                                 className="w-full h-9 pl-8 pr-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
//                             />
//                         </div>
//                     </div>

//                     {/* Options */}
//                     <div className="max-h-48 overflow-y-auto">
//                         {filteredOptions.length > 0 ? (
//                             filteredOptions.map((option) => (
//                                 <div
//                                     key={option.value}
//                                     onClick={() => handleSelect(option)}
//                                     className={`px-4 py-2.5 cursor-pointer text-sm transition-colors
//                     ${selected?.value === option.value
//                                             ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
//                                             : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
//                                         }`}
//                                 >
//                                     <div className="flex items-center justify-between">
//                                         <span className="truncate">{option.label}</span>
//                                         {selected?.value === option.value && (
//                                             <svg
//                                                 className="w-4 h-4 text-orange-600"
//                                                 fill="currentColor"
//                                                 viewBox="0 0 20 20"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
//                                 No leads found
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SearchableLeadDropdown;



'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DropdownOption {
    label: string;
    value: string | number;
}

interface SearchableLeadDropdownProps {
    options: DropdownOption[];
    selected: DropdownOption | null;
    onChange: (option: DropdownOption | null) => void;
    onSearchChange?: (query: string) => void;
    onLoadMore?: () => void; // For pagination
    hasMore?: boolean; // More items to load
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    totalCount?: number;
}

const SearchableLeadDropdown: React.FC<SearchableLeadDropdownProps> = ({
    options,
    selected,
    onChange,
    onSearchChange,
    onLoadMore,
    hasMore = false,
    placeholder = 'Search...',
    disabled = false,
    isLoading = false,
    totalCount,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Infinite scroll - load more when scrolled to bottom
    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement || !onLoadMore || !hasMore) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = listElement;
            // Load more when user scrolls to 80% of the list
            if (scrollTop + clientHeight >= scrollHeight * 0.8 && !isLoading && hasMore) {
                onLoadMore();
            }
        };

        listElement.addEventListener('scroll', handleScroll);
        return () => listElement.removeEventListener('scroll', handleScroll);
    }, [onLoadMore, hasMore, isLoading]);

    // Handle search input change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (onSearchChange) {
            onSearchChange(query);
        }
    }, [onSearchChange]);

    // Handle option selection
    const handleSelect = (option: DropdownOption) => {
        onChange(option);
        setSearchQuery('');
        setIsOpen(false);
    };

    // Handle input focus
    const handleFocus = () => {
        setIsOpen(true);
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchQuery('');
        if (onSearchChange) {
            onSearchChange('');
        }
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'Enter' && options.length === 1) {
            handleSelect(options[0]);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input Field */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={selected ? selected.label : searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full h-11 px-3 pr-10 
            border border-gray-300 dark:border-gray-600 
            rounded-lg bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white text-sm 
            focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            ${selected ? 'text-gray-900 dark:text-white' : ''}
          `}
                    onClick={() => {
                        if (selected) {
                            setSearchQuery('');
                            onChange(null);
                            if (onSearchChange) {
                                onSearchChange('');
                            }
                        }
                    }}
                />

                {/* Icons */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                    {/* Loading Spinner */}
                    {isLoading && (
                        <svg
                            className="animate-spin h-4 w-4 text-orange-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    )}

                    {/* Clear Button */}
                    {selected && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Dropdown Arrow */}
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                    {/* Results count header */}
                    {totalCount !== undefined && totalCount > 0 && (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            {options.length} of {totalCount} leads shown
                            {searchQuery && ` • Searching: "${searchQuery}"`}
                        </div>
                    )}

                    {/* Scrollable options list */}
                    <div
                        ref={listRef}
                        className="max-h-60 overflow-y-auto"
                    >
                        {/* Initial Loading State */}
                        {isLoading && options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-orange-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Loading leads...
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery
                                    ? `No leads found for "${searchQuery}"`
                                    : 'No leads available'
                                }
                            </div>
                        )}

                        {/* Options List */}
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  hover:bg-orange-50 dark:hover:bg-gray-700
                  focus:bg-orange-50 dark:focus:bg-gray-700 focus:outline-none
                  border-b border-gray-100 dark:border-gray-700 last:border-b-0
                  ${selected?.value === option.value
                                        ? 'bg-orange-100 dark:bg-gray-600 text-orange-700 dark:text-orange-300'
                                        : 'text-gray-700 dark:text-gray-200'
                                    }
                `}
                            >
                                {option.label}
                            </button>
                        ))}

                        {/* Load More Indicator */}
                        {isLoading && options.length > 0 && (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700">
                                <svg
                                    className="animate-spin h-4 w-4 text-orange-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Loading more...
                            </div>
                        )}

                        {/* Load More Button (manual trigger) */}
                        {!isLoading && hasMore && options.length > 0 && (
                            <button
                                type="button"
                                onClick={onLoadMore}
                                className="w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 font-medium"
                            >
                                Load more leads...
                            </button>
                        )}

                        {/* End of list indicator */}
                        {!hasMore && options.length > 0 && !isLoading && (
                            <div className="px-4 py-2 text-xs text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700">
                                All leads loaded
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableLeadDropdown;