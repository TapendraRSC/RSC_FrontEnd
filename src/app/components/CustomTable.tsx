import React from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings } from "lucide-react";

/**
 * Type describing each column in the table.
 */
export type Column<T> = {
  /** Unique key for the column – maps to the row field or is used just as an identifier */
  key: keyof T | string;
  /** Text displayed in the column header */
  header: string;
  /** Optional custom render function. When omitted the row[key] value is rendered. */
  render?: (row: T) => React.ReactNode;
  /** Whether users are allowed to sort by this column */
  sortable?: boolean;
};

export type SortDirection = "asc" | "desc";
export type SortConfig = {
  key: string;
  direction: SortDirection;
} | null;

interface CustomTableProps<T> {
  /** Title shown above the table */
  title?: string;
  /** Rows to show */
  data: T[];
  /** Column descriptions */
  columns: Column<T>[];
  /** Loading state */
  isLoading?: boolean;

  /* ===================== SEARCH ===================== */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  /* ===================== SORT ===================== */
  sortConfig?: SortConfig;
  onSortChange?: (config: SortConfig) => void;

  /* ===================== PAGINATION ===================== */
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  showPagination?: boolean;

  /* ===================== MISC ===================== */
  emptyMessage?: string;

  /* ===================== COLUMN VISIBILITY ===================== */
  showColumnToggle?: boolean;
  hiddenColumns?: string[];
  onColumnVisibilityChange?: (hidden: string[]) => void;

  /* ===================== ACTIONS ===================== */
  actions?: (row: T) => React.ReactNode;
}

/**
 * Re-usable, generic table component.
 */
export default function CustomTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  isLoading = false,
  /* Search */
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = false,
  /* Sort */
  sortConfig = null,
  onSortChange,
  /* Pagination */
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  showPagination = false,
  /* Misc */
  emptyMessage = "No data found",
  /* Column visibility */
  showColumnToggle = false,
  hiddenColumns = [],
  onColumnVisibilityChange,
  /* Actions */
  actions,
}: CustomTableProps<T>) {
  /** Handle header click for sorting. */
  function handleSort(key: string) {
    if (!onSortChange) return;
    if (sortConfig && sortConfig.key === key) {
      // Toggle direction
      const direction: SortDirection = sortConfig.direction === "asc" ? "desc" : "asc";
      onSortChange({ key, direction });
    } else {
      onSortChange({ key, direction: "asc" });
    }
  }

  /** Helper that returns true if a column is currently hidden */
  const isHidden = (key: string) => hiddenColumns.includes(key);

  /** Derived list of columns taking into account hidden state */
  const visibleColumns = columns.filter((c) => !isHidden(c.key.toString()));

  /* ===================== RENDER ===================== */
  return (
    <div className="w-full bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      {(title || showSearch || showColumnToggle) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          {/* Title */}
          {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            {showSearch && (
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {/* Column toggle */}
            {showColumnToggle && (
              <ColumnToggleDropdown
                columns={columns}
                hiddenColumns={hiddenColumns}
                onChange={onColumnVisibilityChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Table wrapper */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          {/* THEAD */}
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key.toString()}
                  className="px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap"
                  onClick={() => col.sortable && handleSort(col.key.toString())}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig && sortConfig.key === col.key && (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>

          {/* TBODY */}
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center" colSpan={visibleColumns.length + (actions ? 1 : 0)}>
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center" colSpan={visibleColumns.length + (actions ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key.toString()} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 whitespace-nowrap">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 p-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
          </div>

          <div className="flex items-center gap-2">
            {/* Page size select */}
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* Prev button */}
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page indicator */}
            <span className="text-sm select-none">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>

            {/* Next */}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================================================== */
/* ========================  COLUMN TOGGLE  =============================== */
/* ======================================================================== */

interface ColumnToggleProps<T> {
  columns: Column<T>[];
  hiddenColumns: string[];
  onChange?: (hidden: string[]) => void;
}

function ColumnToggleDropdown<T>({ columns, hiddenColumns, onChange }: ColumnToggleProps<T>) {
  const [open, setOpen] = React.useState(false);

  function toggle(key: string) {
    if (!onChange) return;
    if (hiddenColumns.includes(key)) {
      onChange(hiddenColumns.filter((k) => k !== key));
    } else {
      onChange([...hiddenColumns, key]);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
      >
        <Settings className="w-4 h-4" /> Columns
      </button>

      {open && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md p-2"
          onMouseLeave={() => setOpen(false)}
        >
          {columns.map((col) => (
            <label key={col.key.toString()} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!hiddenColumns.includes(col.key.toString())}
                onChange={() => toggle(col.key.toString())}
              />
              {col.header}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}