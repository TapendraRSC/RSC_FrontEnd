// src/app/projectstatus/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProjectStatusDetailClient from './ProjectStatusDetailClient';

// ----------------------------
// Types - Updated for Next.js 15
// ----------------------------
interface PageProps {
    params: Promise<{ id: string }>; // Now a Promise in Next.js 15
}

// ----------------------------
// Static params generation
// Fully static, no API fetch
// ----------------------------
export async function generateStaticParams(): Promise<{ id: string }[]> {
    // Static list of project IDs
    const knownProjectIds = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    return knownProjectIds.map((id) => ({ id }));
}

// ----------------------------
// Page component - Now async to handle Promise params
// ----------------------------
export default async function ProjectStatusDetail({ params }: PageProps) {
    // Await the params Promise
    const resolvedParams = await params;

    // Validate param
    if (!resolvedParams?.id || resolvedParams.id.trim() === '') notFound();

    return <ProjectStatusDetailClient params={resolvedParams.id} />;
}

// ----------------------------
// Metadata generation - Updated for Promise params
// ----------------------------
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    return {
        title: `Project Status - ${resolvedParams.id}`,
        description: `Status details for project ${resolvedParams.id}`,
    };
}