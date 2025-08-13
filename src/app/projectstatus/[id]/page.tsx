"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import CustomTable from "@/app/components/Common/CustomTable";

interface Project {
    id: number;
    title: string;
    status: string;
}

export default function ProjectStatusDetail({ params }: { params: { id: string } }) {
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8000/projectstatus/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProject(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const columns: any = [
        { label: "Field", accessor: "field" },
        { label: "Value", accessor: "value" },
    ];

    const tableData: any = project
        ? [
            { field: "ID", value: project.id },
            { field: "Title", value: project.title },
            { field: "Status", value: project.status },
        ]
        : [];

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Project Status Detail</h1>
                <p className="text-gray-600 mt-1">Detailed information of the selected project</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <CustomTable
                    data={tableData}
                    columns={columns}
                    isLoading={loading}
                    title="Project Details"
                    showSearch={false}
                    showPagination={false}
                    emptyMessage="No project found"
                />
                {loading && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
