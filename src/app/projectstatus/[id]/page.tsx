// src/app/projectstatus/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProjectStatusDetailClient from './ProjectStatusDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
    const knownProjectIds = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    return knownProjectIds.map((id) => ({ id }));
}

export default async function ProjectStatusDetail({ params }: PageProps) {
    const resolvedParams = await params;

    if (!resolvedParams?.id || resolvedParams.id.trim() === '') notFound();

    // ✅ Fixed: pass object { id } instead of just string resolvedParams.id
    return <ProjectStatusDetailClient params={{ id: resolvedParams.id }} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return {
        title: `Project Status - ${resolvedParams.id}`,
        description: `Status details for project ${resolvedParams.id}`,
    };
}