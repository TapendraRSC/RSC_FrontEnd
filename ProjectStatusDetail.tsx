"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Edit3, 
    Trash2, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    Loader2,
    MoreHorizontal,
    RefreshCw
} from "lucide-react";

interface ProjectStatus {
    id: string;
    title: string;
    status: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    priority?: 'low' | 'medium' | 'high';
    progress?: number;
    assignee?: string;
    dueDate?: string;
}

export default function ProjectStatusDetail({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [project, setProject] = useState<ProjectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchProject = async () => {
        try {
            setError(null);
            const response = await fetch(`http://localhost:8000/projectstatus/${id}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch project: ${response.statusText}`);
            }
            
            const data = await response.json();
            setProject(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch project');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchProject();
    };

    const handleEdit = () => {
        router.push(`/project-status/${id}/edit`);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this project status?')) {
            try {
                const response = await fetch(`http://localhost:8000/projectstatus/${id}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    router.push('/project-status');
                } else {
                    alert('Failed to delete project status');
                }
            } catch (err) {
                alert('Error deleting project status');
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in-progress':
            case 'active':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'cancelled':
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-progress':
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-lg text-gray-600">Loading project details...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Project</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
                            <p className="text-gray-600">The project status you're looking for doesn't exist.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Project Status
                    </button>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Status Detail</h1>
                            <p className="text-gray-600">View and manage project status information</p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Status Header */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                                {getStatusIcon(project.status)}
                                <h2 className="ml-3 text-xl font-semibold text-gray-900">{project.title}</h2>
                            </div>
                            <div className="mt-2 sm:mt-0">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Basic Information
                                </h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Project ID</label>
                                        <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                            {project.id}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                                        <p className="text-gray-900">{project.title}</p>
                                    </div>
                                    
                                    {project.description && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                            <p className="text-gray-900">{project.description}</p>
                                        </div>
                                    )}
                                    
                                    {project.assignee && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Assignee</label>
                                            <p className="text-gray-900">{project.assignee}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status & Progress */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Status & Progress
                                </h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                                        <div className="flex items-center">
                                            {getStatusIcon(project.status)}
                                            <span className="ml-2 text-gray-900">{project.status}</span>
                                        </div>
                                    </div>
                                    
                                    {project.priority && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadgeClass(project.priority)}`}>
                                                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {project.progress !== undefined && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Progress</label>
                                            <div className="flex items-center">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">{project.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {project.dueDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Due Date</label>
                                            <div className="flex items-center text-gray-900">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(project.dueDate)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        {(project.createdAt || project.updatedAt) && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.createdAt && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="font-medium mr-2">Created:</span>
                                            {formatDate(project.createdAt)}
                                        </div>
                                    )}
                                    {project.updatedAt && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="font-medium mr-2">Updated:</span>
                                            {formatDate(project.updatedAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage this project status</p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Project
                            </button>
                            
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                            </button>
                            
                            <button className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}