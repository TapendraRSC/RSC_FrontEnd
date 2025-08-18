"use client";


import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

type Column<T> = {
    label: string;
    accessor: keyof T;
    sortable?: boolean;
    width?: string;
    hideable?: boolean;
    maxLength?: number;
};

type CustomTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    actions?: React.ReactNode | ((row: T) => React.ReactNode);
    isLoading?: boolean;
    title?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    sortConfig?: SortConfig;
    onSortChange?: (config: SortConfig) => void;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    totalRecords?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    showSearch?: boolean;
    showPagination?: boolean;
    emptyMessage?: string;
    showColumnToggle?: boolean;
    hiddenColumns?: string[];
    onColumnVisibilityChange?: (hiddenColumns: string[]) => void;
    globalMaxLength?: number;
};

const useColumnVisibility = (initialHiddenColumns: string[]) => {
    const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set(initialHiddenColumns));

    const toggleColumnVisibility = useCallback((accessor: string) => {
        setHiddenCols(prevHiddenCols => {
            const newHiddenCols = new Set(prevHiddenCols);
            if (newHiddenCols.has(accessor)) {
                newHiddenCols.delete(accessor);
            } else {
                newHiddenCols.add(accessor);
            }
            return newHiddenCols;
        });
    }, []);

    return { hiddenCols, toggleColumnVisibility };
};

const CustomTable = <T extends { id: number | string }>({
    data,
    columns,
    actions,
    isLoading = false,
    title = "Data Table",
    searchValue = '',
    onSearchChange,
    searchPlaceholder = "Search records...",
    showSearch = true,
    sortConfig,
    onSortChange,
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    totalRecords = 0,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    showPagination = true,
    emptyMessage = "No data found",
    showColumnToggle = true,
    hiddenColumns = [],
    onColumnVisibilityChange,
    globalMaxLength = 25
}: CustomTableProps<T>) => {
    const { hiddenCols, toggleColumnVisibility } = useColumnVisibility(hiddenColumns);
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    const visibleColumns = useMemo(() =>
        columns.filter(col => !hiddenCols.has(String(col.accessor))),
        [columns, hiddenCols]
    );

    const truncateText = useCallback((text: string, maxLength: number = globalMaxLength) => {
        if (!text) return '';
        const textStr = String(text);
        return textStr.length <= maxLength ? textStr : `${textStr.slice(0, maxLength)}...`;
    }, [globalMaxLength]);

    const shouldShowTooltip = useCallback((text: string, maxLength: number = globalMaxLength) => {
        if (!text) return false;
        return String(text).length > maxLength;
    }, [globalMaxLength]);

    const handleSort = useCallback((key: keyof T) => {
        if (!onSortChange) return;
        const newDirection = sortConfig?.key === String(key) && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: String(key), direction: newDirection });
    }, [onSortChange, sortConfig]);

    const getPaginationNumbers = useCallback(() => {
        const range = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                range.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                range.push('...');
            }
        }
        return Array.from(new Set(range));
    }, [totalPages, currentPage]);

    const startRecord = ((currentPage - 1) * pageSize) + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="w-full mx-auto px-2 sm:px-0">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-t-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                    <div className="min-w-0">
                        <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {totalRecords > 0 ? `${totalRecords} total records` : 'No records available'}
                        </p>
                    </div>
                    {showSearch && onSearchChange && (
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-64 text-sm"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Table Container with proper scroll */}
            <div className="bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 -mx-2 sm:mx-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm" style={{ minWidth: '600px' }}>
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                {visibleColumns.map((col) => (
                                    <th
                                        key={String(col.accessor)}
                                        className={`px-2 sm:px-4 py-3 text-left font-medium text-gray-900 dark:text-white whitespace-nowrap ${col.sortable !== false && onSortChange ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''} transition-colors duration-150`}
                                        onClick={() => col.sortable !== false && handleSort(col.accessor)}
                                        style={{
                                            width: col.width,
                                            minWidth: '80px'
                                        }}
                                    >
                                        <div className="flex items-center justify-between group">
                                            <span className="font-semibold tracking-wide uppercase text-xs">
                                                {col.label}
                                            </span>
                                            {col.sortable !== false && onSortChange && (
                                                <div className="flex flex-col ml-2 flex-shrink-0">
                                                    <ChevronUp className={`w-3 h-3 transition-colors duration-150 ${sortConfig?.key === String(col.accessor) && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                                    <ChevronDown className={`w-3 h-3 -mt-1 transition-colors duration-150 ${sortConfig?.key === String(col.accessor) && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && (
                                    <th
                                        className="px-2 sm:px-4 py-3 text-right font-semibold tracking-wide uppercase text-xs text-gray-900 dark:text-white whitespace-nowrap"
                                        style={{ minWidth: '80px' }}
                                    >
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        {visibleColumns.map((_, i) => (
                                            <td key={i} className="px-2 sm:px-4 py-3">
                                                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-2 sm:px-4 py-3 text-right">
                                                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-12 sm:w-16 ml-auto" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : data?.length ? (
                                data.map((row: any) => (
                                    row && row.id ? (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                            {visibleColumns.map((col: any) => {
                                                const cellValue: any = String(row[col.accessor]);
                                                const maxLength = col.maxLength || globalMaxLength;
                                                const truncatedText = truncateText(cellValue, maxLength);
                                                const showTooltip = shouldShowTooltip(cellValue, maxLength);

                                                return (
                                                    <td
                                                        key={String(col.accessor)}
                                                        className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100"
                                                    >
                                                        <div className="relative group">
                                                            <div className="block min-w-0">
                                                                {typeof (col as any).render === "function" ? (
                                                                    // custom render function if provided
                                                                    (col as any).render(row)
                                                                ) : (
                                                                    <span className="break-words text-xs sm:text-sm">{truncatedText}</span>
                                                                )}
                                                            </div>

                                                            {showTooltip && !col.render && (
                                                                <div className="absolute left-0 bottom-full mb-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 whitespace-normal max-w-xs shadow-lg invisible group-hover:visible z-20 transition-opacity duration-200">
                                                                    <div className="break-words">{cellValue}</div>
                                                                    <div className="absolute top-full left-4 w-2 h-2 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            {actions && (
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                                                    <div className="flex justify-end">
                                                        {typeof actions === 'function' ? actions(row) : actions}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ) : null
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="px-2 sm:px-4 py-6 sm:py-8 text-center">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <div className="text-sm sm:text-lg font-medium mb-2">{emptyMessage}</div>
                                            <div className="text-xs sm:text-sm">Try adjusting your search criteria</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside to close column menu */}
            {showColumnMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColumnMenu(false)}
                />
            )}

            {/* Footer - Responsive Pagination */}
            {showPagination && (
                <div className="bg-white dark:bg-gray-900 rounded-b-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 -mx-2 sm:mx-0">
                    <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
                        {/* Rows per page */}
                        {onPageSizeChange && (
                            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Rows:
                                </label>
                                <select
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={pageSize}
                                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                >
                                    {pageSizeOptions.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Results info */}
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
                            {totalRecords > 0 ? `${startRecord}-${endRecord} of ${totalRecords}` : 'No results'}
                        </div>

                        {/* Pagination controls */}
                        {onPageChange && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>

                                <div className="flex gap-1 overflow-x-auto scrollbar-hide" style={{ maxWidth: '200px' }}>
                                    {getPaginationNumbers().slice(0, 5).map((num, idx) =>
                                        num === '...' ? (
                                            <span key={idx} className="px-2 py-1.5 sm:py-2 text-gray-500 flex-shrink-0 text-xs sm:text-sm">...</span>
                                        ) : (
                                            <button
                                                key={idx}
                                                onClick={() => onPageChange(Number(num))}
                                                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-colors duration-150 flex-shrink-0 text-xs sm:text-sm min-w-8 sm:min-w-10 ${currentPage === num ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                            >
                                                {num}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTable;