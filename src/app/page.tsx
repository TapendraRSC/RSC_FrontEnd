"use client";

import React, { useEffect, useState } from "react";
import CustomTable from "./components/CustomTable";
import { ProjectStatus } from "./types";

export interface ProjectStatus {
  id: string;
  title: string;
  status: string;
}

export default function ProjectStatusList() {
  const [projectStatusList, setProjectStatusList] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/projectstatus")
      .then((res) => res.json())
      .then((data) => {
        setProjectStatusList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Title", key: "title" },
    { header: "Status", key: "status" },
  ];

  const filteredList = projectStatusList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.status.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.id.toString().includes(searchValue)
  );

  const handleEdit = (row: ProjectStatus) => {
    // Implement edit functionality
    alert(`Edit: ${row.id}`);
  };

  const handleDelete = (row: ProjectStatus) => {
    // Implement delete functionality
    alert(`Delete: ${row.id}`);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 dark:bg-gray-950">
      <CustomTable<ProjectStatus>
        data={filteredList}
        columns={columns}
        isLoading={loading}
        title="Project Status"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search status..."
        actions={{ onEdit: handleEdit, onDelete: handleDelete }}
      />
    </div>
  );
}
