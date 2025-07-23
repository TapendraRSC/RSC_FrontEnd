import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

type Column<T> = {
    label: string;
    accessor: keyof T;
    sortable?: boolean;
    width?: string;
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
};

export default function CustomTable<T extends { id: number | string }>({
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
    emptyMessage = "No data found"
}: CustomTableProps<T>) {

    const handleSort = (key: keyof T) => {
        if (!onSortChange) return;
        const newDirection = sortConfig?.key === String(key) && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: String(key), direction: newDirection });
    };

    const getPaginationNumbers = () => {
        const range = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                range.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                range.push('...');
            }
        }
        return Array.from(new Set(range));
    };

    const startRecord = ((currentPage - 1) * pageSize) + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="w-full max-w-full mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-t-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {totalRecords > 0 ? `${totalRecords} total records` : 'No records available'}
                        </p>
                    </div>
                    {/* Search */}
                    {showSearch && onSearchChange && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* Table Container */}
            <div className="bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {columns?.map((col) => (
                                <th
                                    key={String(col.accessor)}
                                    className={`px-4 py-2 text-left font-medium text-gray-900 dark:text-white ${col.sortable !== false && onSortChange ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''} transition-colors duration-150`}
                                    onClick={() => col.sortable !== false && handleSort(col.accessor)}
                                    style={{ width: col.width || 'auto', minWidth: '150px' }}
                                >
                                    <div className="flex items-center justify-between group">
                                        <span className="font-semibold tracking-wide uppercase text-xs">
                                            {col.label}
                                        </span>
                                        {col.sortable !== false && onSortChange && (
                                            <div className="flex flex-col ml-2">
                                                <ChevronUp className={`w-3 h-3 transition-colors duration-150 ${sortConfig?.key === String(col.accessor) && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                                <ChevronDown className={`w-3 h-3 -mt-1 transition-colors duration-150 ${sortConfig?.key === String(col.accessor) && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-2 text-right font-semibold tracking-wide uppercase text-xs text-gray-900 dark:text-white" style={{ width: '100px' }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    {columns.map((_, i) => (
                                        <td key={i} className="px-4 py-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-2 text-right">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 ml-auto" />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : data?.length ? (
                            data?.map((row) => (
                                // Check if row and row.id are defined
                                row && row.id ? (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                        {columns.map((col) => (
                                            <td key={String(col.accessor)} className="px-4 py-2 text-gray-900 dark:text-gray-100" style={{ maxWidth: '150px' }}>
                                                <div className="relative group">
                                                    <div className="truncate block max-w-full">
                                                        {String(row[col.accessor])}
                                                    </div>
                                                    <div className="absolute left-0 bottom-full bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap invisible group-hover:visible z-10">
                                                        {String(row[col.accessor])}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-2 text-right">
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
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-4 text-center">
                                    <div className="text-gray-500 dark:text-gray-400">
                                        <div className="text-lg font-medium mb-2">{emptyMessage}</div>
                                        <div className="text-sm">Try adjusting your search criteria</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Footer */}
            {showPagination && (
                <div className="bg-white dark:bg-gray-900 rounded-b-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        {/* Rows per page */}
                        {onPageSizeChange && (
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rows per page:
                                </label>
                                <select
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        {/* Page info */}
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {totalRecords > 0 ? startRecord : 0} to {totalRecords > 0 ? endRecord : 0} of {totalRecords} results
                        </div>
                        {/* Pagination */}
                        {onPageChange && totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {getPaginationNumbers().map((num, idx) =>
                                        num === '...' ? (
                                            <span key={idx} className="px-3 py-2 text-gray-500">...</span>
                                        ) : (
                                            <button
                                                key={idx}
                                                onClick={() => onPageChange(Number(num))}
                                                className={`px-3 py-2 rounded-lg border transition-colors duration-150 ${currentPage === num ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                            >
                                                {num}
                                            </button>
                                        )
                                    )}
                                </div>
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
