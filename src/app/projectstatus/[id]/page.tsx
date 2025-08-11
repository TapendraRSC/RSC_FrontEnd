"use client";

import { useEffect, useState } from "react";

export default function ProjectStatusDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [project, setProject] = useState<any>(null);
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

  if (loading) return <p className="px-4 py-6 text-center text-gray-600">Loading...</p>;
  if (!project) return <p className="px-4 py-6 text-center text-gray-600">No project found</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">Project Status Detail</h1>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-semibold">ID:</span> {project.id}
          </p>
          <p>
            <span className="font-semibold">Title:</span> {project.title}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {project.status}
          </p>
        </div>
      </div>
    </div>
  );
}