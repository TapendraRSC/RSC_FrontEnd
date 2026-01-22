"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, Calendar, Search, Check, Plus } from 'lucide-react';
import CommonDropdown from './CommonDropdown';

export type FilterType = 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'multiSelect';
export type FilterOption = { value: string | number; label: string };
export type FilterConfig<T> = {
    key: keyof T;
    label: string;
    type: FilterType;
    options?: FilterOption[];
    placeholder?: string;
    multiple?: boolean;
};
export type FilterValue = { [key: string]: any };

type TableFilterProps<T> = {
    filters: FilterConfig<T>[];
    values: FilterValue;
    onChange: (values: FilterValue) => void;
    onClear: () => void;
    data?: T[];
    className?: string;
    columns: { label: string; accessor: keyof T }[];
};

const TableFilter = <T extends Record<string, any>>({
    filters,
    values: initialValues,
    onChange,
    onClear,
    data = [],
    className = '',
    columns = [],
}: TableFilterProps<T>) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<(keyof T)[]>([]);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [tempDateRange, setTempDateRange] = useState({ from: '', to: '' });
    const [tempValues, setTempValues] = useState<FilterValue>({ ...initialValues });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTempValues({ ...initialValues });
    }, [initialValues]);

    const getUniqueValues = (key: keyof T): FilterOption[] => {
        if (!data.length) return [];
        const unique = [...new Set(data.map((item) => item[key]))]
            .filter((v) => v !== null && v !== undefined && v !== '')
            .map((v) => ({ value: String(v), label: String(v) }));
        return unique.sort((a, b) => a.label.localeCompare(b.label));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
                setShowColumnSelector(false);
                setShowDateModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateTempFilter = (key: string, value: any) => {
        setTempValues({ ...tempValues, [key]: value });
    };

    const removeTempFilter = (key: string) => {
        const newValues = { ...tempValues };
        delete newValues[key];
        setTempValues(newValues);
    };

    const handleApply = () => {
        onChange(tempValues);
    };

    const handleClear = () => {
        setTempValues({});
        onClear();
    };

    const addColumn = (columnKey: keyof T) => {
        if (!selectedColumns.includes(columnKey)) {
            setSelectedColumns([...selectedColumns, columnKey]);
            if (!tempValues[String(columnKey)]) {
                setTempValues({ ...tempValues, [String(columnKey)]: '' });
            }
        }
        setShowColumnSelector(false);
    };

    const removeColumn = (columnKey: keyof T) => {
        const newColumns = selectedColumns.filter((c) => c !== columnKey);
        setSelectedColumns(newColumns);
        const newValues = { ...tempValues };
        delete newValues[String(columnKey)];
        setTempValues(newValues);
    };

    const activeFiltersCount = Object.keys(tempValues).filter((key) => {
        const val = tempValues[key];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'object' && val !== null) return Object.values(val).some((v) => v);
        return val !== null && val !== undefined && val !== '';
    }).length;

    const handleDateInputClick = (part: 'from' | 'to', value: string) => {
        setTempDateRange({ ...tempDateRange, [part]: value });
    };

    const handleAddDateFilter = () => {
        updateTempFilter('dateRange', tempDateRange);
        setShowDateModal(false);
        setTempDateRange({ from: '', to: '' });
    };

    const renderFilterInput = (filter: FilterConfig<T>) => {
        const key = String(filter.key);
        const value = tempValues[key];
        switch (filter.type) {
            case 'text':
                return (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                            value={value || ''}
                            onChange={(e) => updateTempFilter(key, e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        />
                        {value && (
                            <button
                                onClick={() => removeTempFilter(key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            case 'select':
                const selectOptions = filter.options || getUniqueValues(filter.key);
                return (
                    <CommonDropdown
                        options={selectOptions}
                        selected={selectOptions.find((opt) => opt.value === value) || null}
                        onChange={(selectedOption: any) => {
                            updateTempFilter(key, selectedOption?.value || '');
                        }}
                        placeholder={filter.placeholder || `Select ${filter.label}`}
                        allowClear={true}
                    />
                );
            case 'multiSelect':
                const multiOptions = filter.options || getUniqueValues(filter.key);
                const selectedValues = Array.isArray(value) ? value : [];
                const selectedMultiOptions = multiOptions.filter((opt) =>
                    selectedValues.includes(opt.value)
                );
                return (
                    <CommonDropdown
                        options={multiOptions}
                        selected={selectedMultiOptions}
                        onChange={(selectedOptions) => {
                            const newSelectedValues = Array.isArray(selectedOptions)
                                ? selectedOptions.map((opt) => opt.value)
                                : [];
                            updateTempFilter(key, newSelectedValues);
                        }}
                        isMulti={true}
                        placeholder={filter.placeholder || `Select ${filter.label}`}
                        allowClear={true}
                    />
                );
            case 'date':
                return (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => updateTempFilter(key, e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        />
                        {value && (
                            <button
                                onClick={() => removeTempFilter(key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            case 'dateRange':
                const dateRangeValue = value || { from: '', to: '' };
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(['from', 'to'] as const).map((part) => (
                                <div key={part} className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={dateRangeValue[part] || ''}
                                        onChange={(e) =>
                                            updateTempFilter(key, { ...dateRangeValue, [part]: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    />
                                    <label className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                        {part === 'from' ? 'From' : 'To'}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    updateTempFilter(key, { from: today, to: today });
                                }}
                                className="px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => updateTempFilter(key, { from: '', to: '' })}
                                className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                );
            case 'number':
                return (
                    <input
                        type="number"
                        placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
                        value={value || ''}
                        onChange={(e) => updateTempFilter(key, e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    />
                );
            default:
                return null;
        }
    };

    const availableColumns = columns.filter((c) => !selectedColumns.includes(c.accessor));

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${availableColumns.length === 0
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            disabled={availableColumns.length === 0}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Filter</span>
                            <span className="sm:hidden">Add</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showColumnSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showColumnSelector && (
                            <div className="absolute z-50 w-48 sm:w-56 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1 mb-1">Available Columns</div>
                                    {availableColumns.map((col) => (
                                        <div
                                            key={String(col.accessor)}
                                            className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-white rounded-md transition-colors duration-150"
                                            onClick={() => addColumn(col.accessor)}
                                        >
                                            {col.label}
                                        </div>
                                    ))}
                                    {/* Date Filter Option */}
                                    <div
                                        onClick={() => {
                                            setShowDateModal(true);
                                            setShowColumnSelector(false);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-white rounded-md transition-colors duration-150 flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span>Date Filter</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {selectedColumns.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedColumns.length} filter{selectedColumns.length !== 1 ? 's' : ''} active
                        </div>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-4 h-4" />
                            Clear all
                        </button>
                        <button
                            onClick={handleApply}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors duration-200"
                        >
                            <Check className="w-4 h-4" />
                            Apply Filters
                        </button>
                    </div>
                )}
            </div>

            {showDateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        ref={dropdownRef}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Date Filter</h3>
                            <button
                                onClick={() => setShowDateModal(false)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={tempDateRange.from}
                                        onChange={(e) => handleDateInputClick('from', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={tempDateRange.to}
                                        onChange={(e) => handleDateInputClick('to', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        setTempDateRange({ from: today, to: today });
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTempDateRange({ from: '', to: '' })}
                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddDateFilter}
                                    className="px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Cards */}
            {selectedColumns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                    {selectedColumns.map((columnKey) => {
                        const column = columns.find((col) => col.accessor === columnKey);
                        const filter = filters.find((f) => f.key === columnKey);
                        if (!column || !filter) return null;
                        const val = tempValues[String(columnKey)];
                        const hasValue =
                            Array.isArray(val) ? val.length > 0 : typeof val === 'object' && val !== null ? Object.values(val).some((v) => v) : val !== null && val !== undefined && val !== '';
                        return (
                            <div
                                key={String(columnKey)}
                                className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${hasValue ? 'border-orange-200 dark:border-orange-800 ring-1 ring-orange-100 dark:ring-orange-900' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${hasValue ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Filter className={`w-4 h-4 ${hasValue ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{column.label}</h3>
                                        {hasValue && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                                    </div>
                                    <button
                                        onClick={() => removeColumn(columnKey)}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>{renderFilterInput(filter)}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tempValues.dateRange && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 ring-1 ring-orange-100 dark:ring-orange-900 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Date Range</h3>
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            </div>
                            <button
                                onClick={() => removeTempFilter('dateRange')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <label className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={tempValues.dateRange.from || ''}
                                        onChange={(e) =>
                                            updateTempFilter('dateRange', { ...tempValues.dateRange, from: e.target.value })
                                        }
                                        className="w-full pl-3 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        value={tempValues.dateRange.to || ''}
                                        onChange={(e) =>
                                            updateTempFilter('dateRange', { ...tempValues.dateRange, to: e.target.value })
                                        }
                                        className="w-full pl-3 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        updateTempFilter('dateRange', { from: today, to: today });
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateTempFilter('dateRange', { from: '', to: '' })}
                                    className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeFiltersCount > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending Filters ({activeFiltersCount})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(tempValues).map(([key, value]) => {
                            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                            const column = columns.find((c) => String(c.accessor) === key);
                            if (!column) return null;
                            let displayValue = '';
                            if (Array.isArray(value)) displayValue = `${value.length} selected`;
                            else if (typeof value === 'object' && value.from && value.to) displayValue = `${value.from} to ${value.to}`;
                            else if (typeof value === 'object' && (value.from || value.to)) displayValue = value.from ? `From ${value.from}` : `To ${value.to}`;
                            else displayValue = String(value);
                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 text-orange-900 dark:text-orange-100 rounded-lg text-sm font-medium shadow-sm"
                                >
                                    <span className="font-semibold">{column?.label || 'Date Range'}:</span>
                                    <span className="truncate max-w-[120px]">{displayValue}</span>
                                    <button
                                        onClick={() => removeTempFilter(key)}
                                        className="ml-1 hover:text-orange-700 dark:hover:text-orange-300 transition-colors duration-200 flex-shrink-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedColumns.length === 0 && !tempValues.dateRange && (
                <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <Filter className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No filters added</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click "Add Filter" to start filtering your data</p>
                </div>
            )}
        </div>
    );
};

export default TableFilter;
