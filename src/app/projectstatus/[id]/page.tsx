import { ArrowLeft, BadgeCheck, Clock } from "lucide-react";
import Link from "next/link";

async function getProject(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/projectstatus/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProjectStatusDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/projectstatus"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Project Status Detail</h1>
        </div>
      </div>

      {!project ? (
        <p className="text-gray-600">No project found</p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm text-gray-500">ID</div>
                <div className="mt-1 font-medium">{project.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Title</div>
                <div className="mt-1 font-medium">{project.title}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1 inline-flex items-center gap-2 font-medium">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  <span>{project.status}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Updated</div>
                <div className="mt-1 inline-flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Description</h2>
            <p className="text-gray-700">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}