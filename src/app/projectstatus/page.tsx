"use client";

import React, { useEffect, useMemo, useState } from "react";
import CustomTable, {
  Column,
  SortConfig,
} from "../components/CustomTable";
import { Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export type ProjectStatus = {
  id: number | string;
  title: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProjectStatusListPage() {
  const [projectStatusList, setProjectStatusList] = useState<ProjectStatus[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig<ProjectStatus>>({
    key: "id",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  // Simulate total from server if you have it; here we compute client-side
  const [totalRecords, setTotalRecords] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/projectstatus`)
      .then((res) => res.json())
      .then((data: ProjectStatus[]) => {
        setProjectStatusList(data);
        setTotalRecords(data.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAndSorted = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    let rows = [...projectStatusList];
    if (term) {
      rows = rows.filter((r) =>
        [r.id, r.title, r.status, r.description]
          .map((x) => String(x ?? "").toLowerCase())
          .some((s) => s.includes(term))
      );
    }

    if (sortConfig) {
      const { key, direction } = sortConfig;
      rows.sort((a, b) => {
        const av = String((a as any)[key] ?? "");
        const bv = String((b as any)[key] ?? "");
        return direction === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    return rows;
  }, [projectStatusList, searchValue, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const columns: Column<ProjectStatus>[] = [
    { key: "id", header: "ID", sortable: true, width: 80 },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (row) => (
        <Link
          href={`/projectstatus/${row.id}`}
          className="text-blue-600 hover:underline"
        >
          {row.title}
        </Link>
      ),
    },
    { key: "status", header: "Status", sortable: true },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  const handleEdit = (row: ProjectStatus) => {
    // implement your edit flow
    alert(`Edit ${row.id}`);
  };

  const handleDelete = (row: ProjectStatus) => {
    // implement your delete flow
    const ok = confirm(`Delete ${row.title}?`);
    if (!ok) return;
    // Call API then refresh
    fetch(`http://localhost:8000/projectstatus/${row.id}`, { method: "DELETE" })
      .then(() => {
        setProjectStatusList((prev) => prev.filter((p) => p.id !== row.id));
        setTotalRecords((t) => Math.max(0, t - 1));
      })
      .catch(() => {});
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Project Status
        </h1>
        <Link
          href="#"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Status
        </Link>
      </div>

      <CustomTable<ProjectStatus>
        data={pagedData}
        columns={columns}
        isLoading={loading}
        title="Project Status"
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search status..."
        showSearch
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRecords={filteredAndSorted.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        showPagination
        emptyMessage="No statuses found"
        showColumnToggle
        hiddenColumns={hiddenColumns}
        onColumnVisibilityChange={setHiddenColumns}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Link
              href={`/projectstatus/${row.id}`}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}