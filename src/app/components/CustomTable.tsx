"use client";

import React from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
} from "lucide-react";

export type SortDirection = "asc" | "desc";

export type SortConfig<T> = {
  key: keyof T | string;
  direction: SortDirection;
} | null;

export type Column<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  width?: string | number;
  render?: (row: T) => React.ReactNode;
};

export type CustomTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  title?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  sortConfig: SortConfig<T>;
  onSortChange: (config: SortConfig<T>) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
  showPagination?: boolean;
  emptyMessage?: string;
  showColumnToggle?: boolean;
  hiddenColumns: string[];
  onColumnVisibilityChange: (hidden: string[]) => void;
  actions?: (row: T) => React.ReactNode;
};

export default function CustomTable<T>(props: CustomTableProps<T>) {
  const {
    data,
    columns,
    isLoading = false,
    title,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    showSearch = true,
    sortConfig,
    onSortChange,
    currentPage,
    totalPages,
    pageSize,
    totalRecords,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    showPagination = true,
    emptyMessage = "No records found",
    showColumnToggle = true,
    hiddenColumns,
    onColumnVisibilityChange,
    actions,
  } = props;

  const visibleColumns = columns.filter(
    (c) => !hiddenColumns.includes(String(c.key))
  );

  const handleHeaderClick = (key: keyof T | string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortConfig && sortConfig.key === key) {
      const nextDirection: SortDirection =
        sortConfig.direction === "asc" ? "desc" : "asc";
      onSortChange({ key, direction: nextDirection });
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  const renderSortIcon = (key: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const toggleHidden = (key: string) => {
    const next = hiddenColumns.includes(key)
      ? hiddenColumns.filter((k) => k !== key)
      : [...hiddenColumns, key];
    onColumnVisibilityChange(next);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {title && (
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          )}
          <div className="text-sm text-gray-500">{totalRecords} total</div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-64 rounded-md border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showColumnToggle && (
            <div className="relative group inline-block">
              <button
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                title="Toggle columns"
              >
                <Settings className="h-4 w-4" />
                Columns
              </button>
              <div className="absolute right-0 z-10 mt-2 hidden w-56 rounded-md border border-gray-200 bg-white p-2 shadow-lg group-hover:block">
                {columns.map((col) => (
                  <label
                    key={String(col.key)}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!hiddenColumns.includes(String(col.key))}
                      onChange={() => toggleHidden(String(col.key))}
                    />
                    <span>{col.header}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={String(col.key)}
                    style={{ width: col.width }}
                    className={`sticky top-0 z-10 select-none border-b border-gray-200 px-3 py-2 text-left font-medium text-gray-600 ${
                      col.className ?? ""
                    } ${col.sortable ? "cursor-pointer" : ""}`}
                    onClick={() => handleHeaderClick(col.key, col.sortable)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {col.sortable && renderSortIcon(col.key)}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="border-b border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {visibleColumns.map((col, cidx) => (
                      <td key={`${idx}-${cidx}`} className="border-b border-gray-100 px-3 py-3">
                        <div className="h-4 w-32 rounded bg-gray-200" />
                      </td>
                    ))}
                    {actions && (
                      <td className="border-b border-gray-100 px-3 py-3 text-right">
                        <div className="ml-auto h-4 w-16 rounded bg-gray-200" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (actions ? 1 : 0)}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50">
                    {visibleColumns.map((col) => (
                      <td key={String(col.key)} className="border-b border-gray-100 px-3 py-3">
                        {col.render ? (
                          col.render(row)
                        ) : (
                          <span>{String((row as Record<string, unknown>)[String(col.key)] ?? "")}</span>
                        )}
                      </td>
                    ))}
                    {actions && (
                      <td className="border-b border-gray-100 px-3 py-3 text-right">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showPagination && (
          <div className="flex flex-col gap-3 border-t border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Page {totalPages === 0 ? 0 : currentPage} of {totalPages} · Showing {data.length} of {totalRecords}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} / page
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  className="rounded-md border border-gray-200 p-1 disabled:opacity-40"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  className="rounded-md border border-gray-200 p-1 disabled:opacity-40"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="rounded-md border border-gray-200 p-1 disabled:opacity-40"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="rounded-md border border-gray-200 p-1 disabled:opacity-40"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}