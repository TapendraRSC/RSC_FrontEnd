import React, { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search as SearchIcon,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Generic table column definition.
 */
export type Column<T> = {
  /** Unique column key. Should match the field in the data if `accessor` is not provided. */
  key: string;
  /** Column header label */
  header: string;
  /** Extractor for the cell value. If omitted we will use `row[key]` */
  accessor?: keyof T | ((row: T) => React.ReactNode);
  /** Allow sorting on this column */
  sortable?: boolean;
  /** Custom renderer for the cell value */
  cell?: (row: T) => React.ReactNode;
};

export type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface CustomTableProps<T extends { id?: string | number }> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  title?: string;

  /* Search */
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  /* Sorting */
  sortConfig?: SortConfig | null;
  onSortChange?: (config: SortConfig) => void;

  /* Pagination */
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPagination?: boolean;

  /* Column visibility */
  showColumnToggle?: boolean;
  hiddenColumns?: string[]; // array of column keys hidden
  onColumnVisibilityChange?: (hiddenColumns: string[]) => void;

  /* Misc */
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CustomTable<T extends { id?: string | number }>(props: CustomTableProps<T>) {
  const {
    data,
    columns,
    isLoading = false,
    title,
    showSearch = false,
    searchValue = "",
    searchPlaceholder = "Search...",
    onSearchChange,
    sortConfig,
    onSortChange,
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    totalRecords = data.length,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    showPagination = false,
    showColumnToggle = false,
    hiddenColumns = [],
    onColumnVisibilityChange,
    emptyMessage = "No data found",
    actions,
  } = props;

  const [columnToggleOpen, setColumnToggleOpen] = useState(false);

  // Determine visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((c) => !hiddenColumns.includes(c.key));
  }, [columns, hiddenColumns]);

  // Sorting handler
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;

    if (sortConfig?.key === column.key) {
      // toggle direction
      onSortChange({
        key: column.key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ key: column.key, direction: "asc" });
    }
  };

  // Render header cell
  const renderHeader = (column: Column<T>) => {
    const isSorted = sortConfig?.key === column.key;
    const direction = sortConfig?.direction;

    return (
      <th
        key={column.key}
        onClick={() => handleSort(column)}
        className={classNames(
          "px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300",
          column.sortable && "cursor-pointer select-none"
        )}
      >
        <div className="flex items-center gap-1">
          {column.header}
          {column.sortable && (
            <ArrowUpDown
              size={14}
              className={classNames(
                "text-gray-400 transition-transform",
                isSorted && direction === "asc" && "rotate-180"
              )}
            />
          )}
        </div>
      </th>
    );
  };

  // Render cell value
  const renderCell = (row: T, column: Column<T>) => {
    if (column.cell) return column.cell(row);

    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }

    const field = (column.accessor as keyof T) ?? (column.key as keyof T);
    const value = row[field];
    return value as React.ReactNode;
  };

  // Handle toggle column visibility
  const handleToggleColumn = (key: string) => {
    if (!onColumnVisibilityChange) return;
    const newHidden = hiddenColumns.includes(key)
      ? hiddenColumns.filter((k) => k !== key)
      : [...hiddenColumns, key];
    onColumnVisibilityChange(newHidden);
  };

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
      {/* Header */}
      {(title || showSearch || showColumnToggle) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {title && <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>}
          <div className="flex items-center gap-2">
            {showSearch && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="h-9 w-48 rounded-md border border-gray-300 bg-transparent pl-8 pr-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-0 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            )}

            {showColumnToggle && (
              <div className="relative">
                <button
                  onClick={() => setColumnToggleOpen((p) => !p)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <SlidersHorizontal size={16} />
                </button>

                {columnToggleOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Columns</p>
                    {columns.map((col) => (
                      <label key={col.key} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.includes(col.key)}
                          onChange={() => handleToggleColumn(col.key)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                        />
                        {col.header}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>{visibleColumns.map(renderHeader)}{actions && <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={(row.id as string | number | undefined) ?? idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {renderCell(row, col)}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="h-9 rounded-md border border-gray-300 bg-transparent px-2 text-sm text-gray-700 outline-none focus:border-primary dark:border-gray-700 dark:text-gray-200"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size} className="text-gray-700 dark:text-gray-200">
                  {size} / page
                </option>
              ))}
            </select>

            <div className="flex items-center">
              <button
                onClick={() => onPageChange?.(1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-l-md border border-gray-300 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center border-t border-b border-gray-300 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="flex h-9 items-center justify-center border-t border-b border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center border-t border-b border-gray-300 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => onPageChange?.(totalPages)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-r-md border border-gray-300 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}