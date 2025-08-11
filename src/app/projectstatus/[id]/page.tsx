"use client";

import { useEffect, useState } from "react";
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    User, 
    FileText, 
    Hash,
    Loader2,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectStatus {
    id: string;
    title: string;
    status: string;
    description?: string;
    priority?: string;
    assignee?: string;
    createdAt?: string;
    updatedAt?: string;
    dueDate?: string;
    progress?: number;
}

export default function ProjectStatusDetail({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [project, setProject] = useState<ProjectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const fetchProject = async () => {
        try {
            setError(false);
            const response = await fetch(`http://localhost:8000/projectstatus/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project');
            }
            const data = await response.json();
            setProject(data);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(true);
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleRetry = () => {
        setRetrying(true);
        setLoading(true);
        fetchProject();
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in progress':
            case 'active':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'cancelled':
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
            case 'waiting':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in progress':
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
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
        if (!dateString) return 'Not specified';
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Project Details</h3>
                            <p className="text-gray-600">Please wait while we fetch the project information...</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
                            <p className="text-gray-600 mb-6">
                                The project with ID "{id}" could not be found or there was an error loading it.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                            <button
                                onClick={handleRetry}
                                disabled={retrying}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                            >
                                {retrying ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-xl font-semibold text-gray-900">Project Status Detail</h1>
                        </div>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                        >
                            {retrying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Card Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Hash className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-500">ID: {project.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(project.status)}
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-6 py-6">
                                {project.description && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-700 leading-relaxed">{project.description}</p>
                                    </div>
                                )}

                                {project.progress !== undefined && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900">Progress</h3>
                                            <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Project Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {project.assignee && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assignee</p>
                                                <p className="text-sm font-medium text-gray-900">{project.assignee}</p>
                                            </div>
                                        </div>
                                    )}

                                    {project.priority && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</p>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                                                    {project.priority}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timeline Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Timeline
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {project.createdAt && (
                                    <div className="flex items-start space-x-3">
                                        <Calendar className="w-4 h-4 text-green-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                                            <p className="text-sm text-gray-900">{formatDate(project.createdAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {project.updatedAt && (
                                    <div className="flex items-start space-x-3">
                                        <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                                            <p className="text-sm text-gray-900">{formatDate(project.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {project.dueDate && (
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</p>
                                            <p className="text-sm text-gray-900">{formatDate(project.dueDate)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                                    <FileText className="w-4 h-4" />
                                    Edit Project
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Complete
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Status Legend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900">Status Legend</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-600">Completed</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600">In Progress</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-600">Pending</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-600">Cancelled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}