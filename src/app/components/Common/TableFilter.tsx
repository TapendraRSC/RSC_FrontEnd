"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, Calendar, Search, Check, Plus } from 'lucide-react';

export type FilterType = 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'multiSelect';

export type FilterOption = {
    value: string | number;
    label: string;
};

export type FilterConfig<T> = {
    key: keyof T;
    label: string;
    type: FilterType;
    options?: FilterOption[];
    placeholder?: string;
    multiple?: boolean;
};

export type FilterValue = {
    [key: string]: any;
};

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
    values,
    onChange,
    onClear,
    data = [],
    className = '',
    columns = [],
}: TableFilterProps<T>) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<(keyof T)[]>([]);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Unique values for select/multiSelect filters
    const getUniqueValues = (key: keyof T): FilterOption[] => {
        if (!data.length) return [];
        const unique = [...new Set(data.map(item => item[key]))]
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => ({ value: String(v), label: String(v) }));
        return unique.sort((a, b) => a.label.localeCompare(b.label));
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
                setShowColumnSelector(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateFilter = (key: string, value: any) => onChange({ ...values, [key]: value });
    const removeFilter = (key: string) => {
        const newValues = { ...values };
        delete newValues[key];
        onChange(newValues);
    };

    const addColumn = (columnKey: keyof T) => {
        if (!selectedColumns.includes(columnKey)) setSelectedColumns([...selectedColumns, columnKey]);
        setShowColumnSelector(false);
    };
    const removeColumn = (columnKey: keyof T) => {
        setSelectedColumns(selectedColumns.filter(c => c !== columnKey));
        removeFilter(String(columnKey));
    };

    const activeFiltersCount = Object.keys(values).filter(key => {
        const val = values[key];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'object' && val !== null) return Object.values(val).some(v => v);
        return val !== null && val !== undefined && val !== '';
    }).length;

    // Render input based on filter type
    const renderFilterInput = (filter: FilterConfig<T>) => {
        const key = String(filter.key);
        const value = values[key];

        switch (filter.type) {
            case 'text':
                return (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                            value={value || ''}
                            onChange={e => updateFilter(key, e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        />
                        {value && (
                            <button
                                onClick={() => removeFilter(key)}
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
                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left text-gray-900 dark:text-white flex items-center justify-between text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <span className="truncate">{value ? selectOptions.find(opt => opt.value === value)?.label || value : filter.placeholder || `Select ${filter.label}`}</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${openDropdown === key ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === key && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div
                                    className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800"
                                    onClick={() => { removeFilter(key); setOpenDropdown(null); }}
                                >
                                    Clear selection
                                </div>
                                {selectOptions.map(opt => (
                                    <div
                                        key={String(opt.value)}
                                        className={`px-4 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}
                                        onClick={() => { updateFilter(key, opt.value); setOpenDropdown(null); }}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {value === opt.value && <Check className="w-4 h-4" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'multiSelect':
                const options = filter.options || getUniqueValues(filter.key);
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between text-sm min-h-[42px] hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                        >
                            <div className="flex flex-wrap gap-1 max-w-full flex-1 mr-2">
                                {selectedValues.length > 0 ? (
                                    selectedValues.length > 2 ? (
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedValues.length} items selected</span>
                                    ) : (
                                        selectedValues.map(val => (
                                            <span
                                                key={String(val)}
                                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium"
                                            >
                                                {options.find(o => o.value === val)?.label || val}
                                            </span>
                                        ))
                                    )
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">{filter.placeholder || `Select ${filter.label}`}</span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === key ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === key && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div
                                    className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800"
                                    onClick={() => { removeFilter(key); setOpenDropdown(null); }}
                                >
                                    Clear all selections
                                </div>
                                {options.map(opt => {
                                    const isSelected = selectedValues.includes(opt.value);
                                    return (
                                        <div
                                            key={String(opt.value)}
                                            className="px-4 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                            onClick={() => {
                                                const newSelected = isSelected
                                                    ? selectedValues.filter(v => v !== opt.value)
                                                    : [...selectedValues, opt.value];
                                                updateFilter(key, newSelected);
                                            }}
                                        >
                                            <span className="truncate">{opt.label}</span>
                                            {isSelected && <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={value || ''}
                            onChange={e => updateFilter(key, e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        />
                        {value && (
                            <button
                                onClick={() => removeFilter(key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );

            case 'dateRange':
                const dateRangeValue = value || {};
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['from', 'to'].map(part => (
                            <div key={part} className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    placeholder={part === 'from' ? 'From' : 'To'}
                                    value={dateRangeValue[part] || ''}
                                    onChange={e => updateFilter(key, { ...dateRangeValue, [part]: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                />
                                <label className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">{part === 'from' ? 'From' : 'To'}</label>
                            </div>
                        ))}
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
                        value={value || ''}
                        onChange={e => updateFilter(key, e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    />
                );

            default:
                return null;
        }
    };

    const availableColumns = columns.filter(c => !selectedColumns.includes(c.accessor));

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${availableColumns.length === 0 ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                            disabled={availableColumns.length === 0}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Filter</span>
                            <span className="sm:hidden">Add</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showColumnSelector ? 'rotate-180' : ''}`} />
                        </button>

                        {showColumnSelector && availableColumns.length > 0 && (
                            <div className="absolute z-50 w-48 sm:w-56 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1 mb-1">Available Columns</div>
                                    {availableColumns.map(col => (
                                        <div
                                            key={String(col.accessor)}
                                            className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-white rounded-md transition-colors duration-150"
                                            onClick={() => addColumn(col.accessor)}
                                        >
                                            {col.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedColumns.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedColumns.length} filter{selectedColumns.length !== 1 ? 's' : ''} active</div>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClear}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-4 h-4" />
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Filter Cards */}
            {selectedColumns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                    {selectedColumns.map(columnKey => {
                        const column = columns.find(col => col.accessor === columnKey);
                        const filter = filters.find(f => f.key === columnKey);
                        if (!column || !filter) return null;

                        const val = values[String(columnKey)];
                        const hasValue = Array.isArray(val) ? val.length > 0 : typeof val === 'object' && val !== null ? Object.values(val).some(v => v) : val !== null && val !== undefined && val !== '';

                        return (
                            <div key={String(columnKey)} className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${hasValue ? 'border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${hasValue ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Filter className={`w-4 h-4 ${hasValue ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{column.label}</h3>
                                        {hasValue && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
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

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters ({activeFiltersCount})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(values).map(([key, value]) => {
                            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                            const column = columns.find(c => String(c.accessor) === key);
                            if (!column) return null;

                            let displayValue = '';
                            if (Array.isArray(value)) displayValue = `${value.length} selected`;
                            else if (typeof value === 'object' && value.from && value.to) displayValue = `${value.from} to ${value.to}`;
                            else if (typeof value === 'object' && (value.from || value.to)) displayValue = value.from ? `From ${value.from}` : `To ${value.to}`;
                            else displayValue = String(value);

                            return (
                                <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100 rounded-lg text-sm font-medium shadow-sm">
                                    <span className="font-semibold">{column.label}:</span>
                                    <span className="truncate max-w-[120px]">{displayValue}</span>
                                    <button onClick={() => removeFilter(key)} className="ml-1 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex-shrink-0">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {selectedColumns.length === 0 && (
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
