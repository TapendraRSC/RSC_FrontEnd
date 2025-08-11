"use client";

import React, { useEffect, useState } from "react";
import CustomTable, { Column, SortConfig } from "../components/CustomTable";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectStatus {
  id: string;
  title: string;
  status: string;
}

export default function ProjectStatusListPage() {
  /* ===================== STATE ===================== */
  const [projectStatusList, setProjectStatusList] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchValue,
      page: currentPage.toString(),
      page_size: pageSize.toString(),
      sort_key: sortConfig?.key ?? "",
      sort_direction: sortConfig?.direction ?? "",
    });
    fetch(`http://localhost:8000/projectstatus?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Expecting shape { data: ProjectStatus[], total: number }
        setProjectStatusList(data.data ?? data);
        setTotalRecords(data.total ?? data.length ?? 0);
      })
      .catch(() => {
        setProjectStatusList([]);
      })
      .finally(() => setLoading(false));
  }, [searchValue, currentPage, pageSize, sortConfig]);

  /* ===================== COLUMNS ===================== */
  const columns: Column<ProjectStatus>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "title", header: "Title", sortable: true },
    { key: "status", header: "Status", sortable: true },
  ];

  /* ===================== ACTIONS ===================== */
  function handleEdit(row: ProjectStatus) {
    // Navigate to detail page for now
    window.location.href = `/project-status/${row.id}`;
  }

  function handleDelete(row: ProjectStatus) {
    if (!confirm("Are you sure you want to delete this status?")) return;
    fetch(`http://localhost:8000/projectstatus/${row.id}`, { method: "DELETE" })
      .then(() => {
        setProjectStatusList((prev) => prev.filter((p) => p.id !== row.id));
        setTotalRecords((prev) => prev - 1);
      })
      .catch((err) => alert("Failed to delete: " + err));
  }

  /* ===================== RENDER ===================== */
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <CustomTable<ProjectStatus>
        data={projectStatusList}
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
        totalPages={Math.ceil(totalRecords / pageSize)}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        showPagination
        emptyMessage="No statuses found"
        showColumnToggle
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}