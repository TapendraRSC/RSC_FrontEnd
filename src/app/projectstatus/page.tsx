"use client";

import React, { useEffect, useMemo, useState } from "react";
import CustomTable, { Column, SortConfig } from "../components/CustomTable";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectStatus {
  id: number;
  title: string;
  status: string;
}

const ProjectStatusPage: React.FC = () => {
  const [projectStatusList, setProjectStatusList] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Column visibility
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/projectstatus")
      .then((res) => res.json())
      .then((data) => setProjectStatusList(data))
      .finally(() => setLoading(false));
  }, []);

  // Filter & sort data locally
  const filteredData = useMemo(() => {
    let result = [...projectStatusList];

    // Search
    if (searchValue) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }

    // Sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a: any, b: any) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        const compare = valA > valB ? 1 : -1;
        return direction === "asc" ? compare : -compare;
      });
    }

    return result;
  }, [projectStatusList, searchValue, sortConfig]);

  // Pagination calculations
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const columns: Column<ProjectStatus>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "title", header: "Title", sortable: true },
    { key: "status", header: "Status", sortable: true },
  ];

  const handleEdit = (row: ProjectStatus) => {
    // Implement edit navigation/modal
    console.log("Edit", row);
  };

  const handleDelete = (row: ProjectStatus) => {
    // Implement delete confirmation
    console.log("Delete", row);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomTable<ProjectStatus>
        data={paginatedData}
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
        hiddenColumns={hiddenColumns}
        onColumnVisibilityChange={setHiddenColumns}
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
};

export default ProjectStatusPage;