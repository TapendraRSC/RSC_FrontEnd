import React from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Column<T> {
  header: string;
  key: keyof T;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  actions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
  };
  title?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  actions,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
}: CustomTableProps<T>) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {onSearchChange && (
        <div className="mb-4">
          <input
            type="text"
            value={searchValue || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200"
                >
                  {column.header}
                </th>
              ))}
              {actions && (actions.onEdit || actions.onDelete) && (
                <th className="px-4 py-2">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-6">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={rowIndex % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-2 text-gray-900 dark:text-gray-100"
                    >
                      {row[column.key] as React.ReactNode}
                    </td>
                  ))}
                  {actions && (actions.onEdit || actions.onDelete) && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        {actions.onEdit && (
                          <button
                            onClick={() => actions.onEdit && actions.onEdit(row)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            onClick={() => actions.onDelete && actions.onDelete(row)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomTable;