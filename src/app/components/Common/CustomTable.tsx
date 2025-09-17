"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Settings, Eye, EyeOff, Filter, X, Trash2, UserPlus } from 'lucide-react';
import TableFilter, { FilterConfig, FilterValue } from './TableFilter';

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
    minWidth?: number;
    maxWidth?: number;
    render?: (row: T) => React.ReactNode;
    showTooltip?: boolean;
};

type BulkAction = {
    label: string;
    icon: React.ReactNode;
    onClick: (selectedIds: (string | number)[]) => void;
    disabled?: boolean;
};

type CustomTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    actions?: React.ReactNode | ((row: T) => React.ReactNode);
    bulkActions?: BulkAction[] | ((selectedIds: (string | number)[]) => React.ReactNode);
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
    dynamicWidth?: boolean;
    showTooltipForAll?: boolean;
    rowClassName?: (row: T) => string;
    showFilters?: boolean;
    filters?: FilterConfig<T>[];
    filterValues?: FilterValue;
    onFilterChange?: (values: FilterValue) => void;
    showBulkSelect?: boolean;
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
    hideActionsWhenBulkSelected?: boolean;
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

const calculateDynamicWidth = (data: any[], accessor: string, label: string, minWidth = 100, maxWidth = 300) => {
    let maxContentLength = label.length;
    data.forEach(row => {
        const cellValue = String(row[accessor] || '');
        if (cellValue.length > maxContentLength) {
            maxContentLength = cellValue.length;
        }
    });
    return Math.max(minWidth, Math.min(maxWidth, maxContentLength * 8 + 40));
};

const applyFilters = <T extends any>(data: T[], filterValues: FilterValue, filters: FilterConfig<T>[]): T[] => {
    if (!filterValues || Object.keys(filterValues).length === 0) {
        return data;
    }
    return data.filter(row => {
        return Object.entries(filterValues).every(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                return true;
            }
            const filter = filters.find(f => String(f.key) === key);
            if (!filter) return true;
            const rowValue = row[key as keyof T];
            const rowValueStr = String(rowValue || '').toLowerCase();
            switch (filter.type) {
                case 'text':
                    return rowValueStr.includes(String(value).toLowerCase());
                case 'select':
                    return String(rowValue) === String(value);
                case 'multiSelect':
                    if (!Array.isArray(value) || value.length === 0) return true;
                    return value.some(v => String(rowValue) === String(v));
                case 'date':
                    if (!rowValue || !value) return true;
                    const rowDate = new Date(rowValue as string);
                    const filterDate = new Date(value);
                    return rowDate.toDateString() === filterDate.toDateString();
                case 'dateRange':
                    if (!rowValue) return true;
                    const rowDateRange = new Date(rowValue as string);
                    const { from, to } = value;
                    if (from && to) {
                        const fromDate = new Date(from);
                        const toDate = new Date(to);
                        return rowDateRange >= fromDate && rowDateRange <= toDate;
                    } else if (from) {
                        const fromDate = new Date(from);
                        return rowDateRange >= fromDate;
                    } else if (to) {
                        const toDate = new Date(to);
                        return rowDateRange <= toDate;
                    }
                    return true;
                case 'number':
                    const rowNumber = Number(rowValue);
                    const filterNumber = Number(value);
                    return !isNaN(rowNumber) && !isNaN(filterNumber) && rowNumber === filterNumber;
                default:
                    return true;
            }
        });
    });
};

const CustomTable = <T extends { id: number | string }>({
    data,
    columns,
    actions,
    bulkActions,
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
    globalMaxLength = 20,
    dynamicWidth = true,
    showTooltipForAll = false,
    rowClassName,
    showFilters = false,
    filters = [],
    filterValues = {},
    onFilterChange,
    showBulkSelect = false,
    onSelectionChange,
    hideActionsWhenBulkSelected = true,
}: CustomTableProps<T>) => {
    const { hiddenCols, toggleColumnVisibility } = useColumnVisibility(hiddenColumns);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [localFilterValues, setLocalFilterValues] = useState<FilterValue>(filterValues);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const selectAllRef = useRef<HTMLInputElement>(null);

    const filteredData = useMemo(() => {
        if (!showFilters || !filters.length) {
            return data;
        }
        return applyFilters(data, localFilterValues, filters);
    }, [data, localFilterValues, filters, showFilters]);

    const displayData = useMemo(() => filteredData, [filteredData]);

    const visibleColumns = useMemo(() =>
        columns.filter(col => !hiddenCols.has(String(col.accessor))),
        [columns, hiddenCols]);

    const columnWidths = useMemo(() => {
        if (!dynamicWidth) return {};
        const widths: { [key: string]: number } = {};
        visibleColumns.forEach(col => {
            const accessor = String(col.accessor);
            const minWidth = col.minWidth || 100;
            const maxWidth = col.maxWidth || 300;
            widths[accessor] = calculateDynamicWidth(displayData, accessor, col.label, minWidth, maxWidth);
        });
        return widths;
    }, [displayData, visibleColumns, dynamicWidth]);

    const hasMultipleSelected = useMemo(() =>
        showBulkSelect && selectedIds.length > 1,
        [selectedIds.length, showBulkSelect]);

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!showBulkSelect) return;

        if (e.target.checked) {
            const allIds = displayData.map(row => row.id);
            setSelectedIds(allIds);
            onSelectionChange?.(allIds);
        } else {
            setSelectedIds([]);
            onSelectionChange?.([]);
        }
    }, [displayData, onSelectionChange, showBulkSelect]);

    const handleSelectRow = useCallback((id: string | number) => {
        if (!showBulkSelect) return;

        setSelectedIds(prev => {
            const newSelected = prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id];
            onSelectionChange?.(newSelected);
            return newSelected;
        });
    }, [onSelectionChange, showBulkSelect]);

    const isSelected = useCallback((id: string | number) => {
        if (!showBulkSelect) return false;
        return selectedIds.includes(id);
    }, [selectedIds, showBulkSelect]);

    const areAllSelected = useMemo(() => {
        if (!showBulkSelect) return false;
        return displayData.length > 0 && selectedIds.length === displayData.length;
    }, [displayData, selectedIds, showBulkSelect]);

    useEffect(() => {
        if (!showBulkSelect || !selectAllRef.current) return;

        selectAllRef.current.indeterminate =
            selectedIds.length > 0 && selectedIds.length < displayData.length;
    }, [selectedIds, displayData.length, showBulkSelect]);

    const truncateText = useCallback((text: string, maxLength: number = globalMaxLength) => {
        if (!text) return '';
        const textStr = String(text);
        return textStr.length > maxLength ? textStr.substring(0, maxLength) + '...' : textStr;
    }, [globalMaxLength]);

    const shouldShowTooltip = useCallback((text: string, maxLength: number = globalMaxLength, columnShowTooltip?: boolean) => {
        if (!text) return false;
        const textStr = String(text);
        return showTooltipForAll || columnShowTooltip || textStr.length > maxLength;
    }, [globalMaxLength, showTooltipForAll]);

    const handleSort = useCallback((key: keyof T) => {
        if (!onSortChange) return;
        const newDirection = sortConfig?.key === String(key) && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: String(key), direction: newDirection });
    }, [onSortChange, sortConfig]);

    const handleFilterChange = useCallback((values: FilterValue) => {
        setLocalFilterValues(values);
        if (onFilterChange) {
            onFilterChange(values);
        }
        if (onPageChange) {
            onPageChange(1);
        }
    }, [onFilterChange, onPageChange]);

    const handleFilterClear = useCallback(() => {
        const clearedValues: FilterValue = {};
        setLocalFilterValues(clearedValues);
        if (onFilterChange) {
            onFilterChange(clearedValues);
        }
        if (onPageChange) {
            onPageChange(1);
        }
    }, [onFilterChange, onPageChange]);

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
    const endRecord = Math.min(currentPage * pageSize, displayData.length || totalRecords);

    const getActiveFiltersCount = () => {
        return Object.keys(localFilterValues).filter(key => {
            const value = localFilterValues[key];
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined && value !== '';
        }).length;
    };

    return (
        <div className="w-full mx-auto sm:px-0">
            <style jsx global>{`
                @keyframes greenBlink {
                    0%, 100% { background-color: inherit; }
                    50% { background-color: rgba(34, 197, 94, 0.25); box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }
                }
                .fresh-lead-blink {
                    animation: greenBlink 2s infinite;
                    transition: all 0.3s ease;
                }
                .fresh-lead-blink:hover {
                    animation-play-state: paused;
                    background-color: rgba(34, 197, 94, 0.15) !important;
                }
            `}</style>

            {/* Table Header */}
            <div className="bg-white dark:bg-gray-900 rounded-t-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                    <div className="min-w-0">
                        <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {totalRecords ? `${totalRecords} total records` : 'No records available'}
                            {showBulkSelect && selectedIds.length > 0 && (
                                <span className="ml-2 text-blue-600 dark:text-blue-400">
                                    • {selectedIds.length} selected
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                        {showFilters && filters.length > 0 && (
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${getActiveFiltersCount() > 0
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk Actions - only show when multiple items are selected and bulkActions prop is provided */}
                {hasMultipleSelected && bulkActions && (
                    <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-6" style={{ marginTop: "8px" }}>
                        {/* Desktop: Selection counter with separator */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                                <span className="text-sm font-medium text-blue-800">
                                    {selectedIds.length} selected
                                </span>
                            </div>
                            <div className="h-6 w-px bg-gray-300"></div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {typeof bulkActions === 'function' ? bulkActions(selectedIds) : (
                                bulkActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => action.onClick(selectedIds)}
                                        disabled={action.disabled}
                                        className="group relative inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 sm:gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/25"
                                    >
                                        {/* Icon - always visible */}
                                        <span className="transition-transform duration-200 group-hover:scale-110">
                                            {action.icon}
                                        </span>

                                        {/* Text - only on desktop */}
                                        <span className="hidden sm:block">
                                            {action.label}
                                        </span>

                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Mobile: Selection count indicator */}
                        <div className="sm:hidden ml-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {selectedIds.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <TableFilter
                                filters={filters}
                                values={localFilterValues}
                                onChange={handleFilterChange}
                                onClear={handleFilterClear}
                                data={data}
                                columns={visibleColumns.map(col => ({ label: col.label, accessor: col.accessor }))}
                            />
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                            <button
                                onClick={() => {
                                    handleFilterClear();
                                    setIsFilterModalOpen(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 sm:mx-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm" style={{ minWidth: '600px' }}>
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                {/* Bulk Select Checkbox in Header - only shows when showBulkSelect is true */}
                                {showBulkSelect && (
                                    <th className="px-2 sm:px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            ref={selectAllRef}
                                            checked={areAllSelected}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                )}

                                {visibleColumns.map((col) => {
                                    const accessor = String(col.accessor);
                                    const dynamicWidthValue = dynamicWidth ? columnWidths[accessor] : null;
                                    return (
                                        <th
                                            key={accessor}
                                            className={`px-2 sm:px-4 py-3 text-left font-medium text-gray-900 dark:text-white whitespace-nowrap ${col.sortable !== false && onSortChange ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''} transition-colors duration-150`}
                                            onClick={() => col.sortable !== false && handleSort(col.accessor)}
                                            style={{
                                                width: col.width || (dynamicWidthValue ? `${dynamicWidthValue}px` : undefined),
                                                minWidth: col.minWidth || '80px',
                                                maxWidth: col.maxWidth
                                            }}
                                        >
                                            <div className="flex items-center justify-between group">
                                                <span className="font-semibold tracking-wide uppercase text-xs">
                                                    {col.label}
                                                </span>
                                                {col.sortable !== false && onSortChange && (
                                                    <div className="flex flex-col ml-2 flex-shrink-0">
                                                        <ChevronUp className={`w-3 h-3 transition-colors duration-150 ${sortConfig?.key === accessor && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                                        <ChevronDown className={`w-3 h-3 -mt-1 transition-colors duration-150 ${sortConfig?.key === accessor && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}

                                {actions && !hasMultipleSelected && (
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
                                    <tr key={`loading-${index}`} className="animate-pulse">
                                        {showBulkSelect && (
                                            <td className="px-2 sm:px-4 py-3 w-10">
                                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                            </td>
                                        )}
                                        {visibleColumns.map((col, i) => {
                                            const accessor = String(col.accessor);
                                            const dynamicWidthValue = dynamicWidth ? columnWidths[accessor] : null;
                                            return (
                                                <td key={`loading-col-${i}`} className="px-2 sm:px-4 py-3" style={{ width: dynamicWidthValue ? `${dynamicWidthValue}px` : undefined }}>
                                                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                                                </td>
                                            );
                                        })}
                                        {actions && !hasMultipleSelected && (
                                            <td className="px-2 sm:px-4 py-3 text-right">
                                                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-12 sm:w-16 ml-auto" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : displayData.length ? (
                                displayData.map((row: any) => {
                                    if (!row || !row.id) return null;

                                    const customRowClass = rowClassName ? rowClassName(row) : '';
                                    const finalClassName = `hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ${customRowClass || (showBulkSelect && isSelected(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : '')
                                        }`;

                                    return (
                                        <tr key={row.id} className={finalClassName}>
                                            {/* Row Select Checkbox - only shows when showBulkSelect is true */}
                                            {showBulkSelect && (
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(row.id)}
                                                        onChange={() => handleSelectRow(row.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                            )}

                                            {visibleColumns.map((col: any) => {
                                                const accessor = String(col.accessor);
                                                const cellValue = String(row[col.accessor] || '');
                                                const maxLength = col.maxLength || globalMaxLength;
                                                const truncatedText = truncateText(cellValue, maxLength);
                                                const showTooltip = shouldShowTooltip(cellValue, maxLength, col.showTooltip);
                                                const dynamicWidthValue = dynamicWidth ? columnWidths[accessor] : null;

                                                return (
                                                    <td
                                                        key={`${row.id}-${accessor}`}
                                                        className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100 relative"
                                                        style={{ width: dynamicWidthValue ? `${dynamicWidthValue}px` : undefined }}
                                                    >
                                                        <div className="relative group inline-block w-full">
                                                            <span className="break-words text-xs sm:text-sm leading-relaxed inline-block">
                                                                {typeof col.render === "function" ? col.render(row) : truncatedText}
                                                            </span>
                                                            {showTooltip && (
                                                                <div
                                                                    className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 whitespace-normal break-words shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all duration-300 pointer-events-none"
                                                                    style={{ maxWidth: '300px', minWidth: '120px' }}
                                                                >
                                                                    {typeof col.render === "function" ? cellValue : cellValue}
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            {actions && !hasMultipleSelected && (
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                                                    <div className="flex justify-end">
                                                        {typeof actions === 'function' ? actions(row) : actions}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumns.length + (actions ? 1 : 0) + (showBulkSelect ? 1 : 0)} className="px-2 sm:px-4 py-6 sm:py-8 text-center">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <div className="text-sm sm:text-lg font-medium mb-2">{emptyMessage}</div>
                                            <div className="text-xs sm:text-sm">Try adjusting your search criteria or filters</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {showPagination && (
                <div className="bg-white dark:bg-gray-900 rounded-b-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 -mx-2 sm:mx-0">
                    <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
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
                                        <option key={`page-size-${size}`} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
                            {totalRecords ? `${startRecord}-${endRecord} of ${totalRecords}` : 'No results'}
                        </div>
                        {onPageChange && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                    {getPaginationNumbers().slice(0, 5).map((num, idx) =>
                                        num === '...' ? (
                                            <span key={`pagination-dots-${idx}`} className="px-2 py-1.5 sm:py-2 text-gray-500 flex-shrink-0 text-xs sm:text-sm">...</span>
                                        ) : (
                                            <button
                                                key={`pagination-${num}`}
                                                onClick={() => onPageChange(Number(num))}
                                                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-colors duration-150 flex-shrink-0 text-xs sm:text-sm min-w-8 sm:min-w-10 ${currentPage === num
                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
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