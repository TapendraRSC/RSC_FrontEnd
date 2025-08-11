"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProjectStatus {
  id: string;
  title: string;
  status: string;
}

export default function ProjectStatusDetail() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/projectstatus/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!project) return <p className="p-6">No project found</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/project-status" className="text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-semibold mb-4">Project Status Detail</h1>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">ID:</span> {project.id}
          </p>
          <p>
            <span className="font-medium">Title:</span> {project.title}
          </p>
          <p>
            <span className="font-medium">Status:</span> {project.status}
          </p>
        </div>
      </div>
    </div>
  );
}