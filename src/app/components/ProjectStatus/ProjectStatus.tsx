'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Pencil, Trash2, Plus, Grid3X3, List, Menu, Search, FileText, Eye, Download } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ProjectStatusModal from './ProjectStatusModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import {
    addStatus,
    deleteStatus,
    fetchProjectStatuses,
    ProjectStatus,
    updateStatus
} from '../../../../store/projectSlice';
import Link from 'next/link';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import ExportModal from '../Common/ExportModal';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

const ProjectStatusComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<ProjectStatus | null>(null);
    const [statusToDelete, setStatusToDelete] = useState<ProjectStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Ref to track initial fetch and prevent duplicates
    const lastFetchRef = useRef<string>('');

    const { list, loading, error } = useSelector((state: RootState) => state.projectStatus);
    const projectStatusList: ProjectStatus[] = list?.projects || [];
    const totalRecords = list?.total || 0;
    const totalPages = list?.totalPages || 1;

    useEffect(() => {
        const fetchKey = `${currentPage}-${pageSize}-${searchValue}`;
        if (lastFetchRef.current === fetchKey) return;
        lastFetchRef.current = fetchKey;
        dispatch(fetchProjectStatuses({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    const handleAdd = () => {
        setCurrentStatus(null);
        setIsModalOpen(true);
    };

    const handleEdit = (status: ProjectStatus) => {
        setCurrentStatus(status);
        setIsModalOpen(true);
    };

    const handleDelete = (status: ProjectStatus) => {
        setStatusToDelete(status);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (statusToDelete) {
                await dispatch(deleteStatus(statusToDelete.id)).unwrap();
                toast.success('Project status deleted successfully');
                dispatch(fetchProjectStatuses({ page: currentPage, limit: pageSize, searchValue }));
            }
        } catch (err: any) {
            toast.error(err || 'Failed to delete status');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleSaveStatus = async (data: any) => {
        setIsSaving(true);
        try {
            const formData: any = new FormData();
            formData.append('title', data.title);
            formData.append('status', data.status);
            if (data.projectImage?.[0]) {
                formData.append('projectImage', data.projectImage[0]);
            }
            if (data.projectPdf?.[0]) {
                formData.append('projectPdf', data.projectPdf[0]);
            }
            if (currentStatus) {
                await dispatch(updateStatus({
                    id: currentStatus.id,
                    formData
                })).unwrap();
                toast.success('Status updated successfully');
            } else {
                await dispatch(addStatus(formData)).unwrap();
                toast.success('Status added successfully');
            }
            dispatch(fetchProjectStatuses({
                page: currentPage,
                limit: pageSize,
                searchValue
            }));
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err || 'Failed to save status');
        } finally {
            setIsSaving(false);
        }
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return projectStatusList;
        return [...projectStatusList].sort((a, b) => {
            const aVal = a[sortConfig.key as keyof ProjectStatus];
            const bVal = b[sortConfig.key as keyof ProjectStatus];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [projectStatusList, sortConfig]);

    const columns: any = [
        {
            label: 'Project Title',
            accessor: 'title',
            sortable: true,
            mobile: true,
            showTooltip: true,
            render: (row: ProjectStatus) =>
                row.status === 'inactive' ? (
                    <span className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                        {row.title}
                    </span>
                ) : (
                    <Link
                        href={`/projectstatus/${row.id}`}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline cursor-pointer text-sm sm:text-base"
                    >
                        {row.title}
                    </Link>
                ),
        },
        {
            label: 'Image',
            accessor: 'projectImage',
            mobile: false,
            render: (row: ProjectStatus) =>
                row.projectImage ? (
                    <img
                        src={row.projectImage}
                        alt="projectImage"
                        className={`object-cover border border-gray-300 dark:border-gray-600 rounded-lg w-16 h-10 sm:w-20 sm:h-12 ${row.status === 'inactive' ? 'opacity-50' : ''
                            }`}
                    />
                ) : (
                    <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>-</span>
                ),
            showTooltip: true,
        },
        {
            label: 'PDF',
            accessor: 'projectPdf',
            mobile: false,
            render: (row: ProjectStatus) =>
                row.projectPdf ? (
                    row.status === 'inactive' ? (
                        <span className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                            View PDF
                        </span>
                    ) : (
                        <a
                            href={row.projectPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline text-sm sm:text-base"
                        >
                            View PDF
                        </a>
                    )
                ) : (
                    <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>-</span>
                ),
            showTooltip: true,
        },
        {
            label: 'Status',
            accessor: 'status',
            sortable: true,
            mobile: true,
            render: (row: ProjectStatus) => (
                <span
                    className={`text-xs sm:text-sm ${row.status === 'active'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}
                >
                    {row.status}
                </span>
            ),
            showTooltip: true,
        },
    ];

    const { permissions: rolePermissions, loading: rolePermissionsLoading } =
        useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    // Ref to prevent duplicate permission fetch
    const permissionsFetchedRef = useRef(false);

    // NOTE: fetchRolePermissionsSidebar is already called globally by LayoutClient.tsx
    // Only fetch permissions specific to this component
    useEffect(() => {
        if (permissionsFetchedRef.current) return;
        permissionsFetchedRef.current = true;
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Project Status'
        );
        return leadPerm?.permissionIds || [];
    };

    const leadPermissionIds = getLeadPermissions();

    const hasPermission = (permId: number, permName: string) => {
        if (!leadPermissionIds.includes(permId)) return false;
        const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
        if (!matched) return false;
        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const ProjectStatusCard = ({ project }: { project: ProjectStatus }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 space-y-3 sm:space-y-4 hover:shadow-md transition-shadow" style={{ marginTop: "15px" }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Link
                        href={`/projectstatus/${project.id}`}
                        className={`${project.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} hover:underline font-medium sm:font-semibold text-base sm:text-lg block`}
                    >
                        {project.title}
                    </Link>
                    <p className={`text-xs sm:text-sm mt-1 ${project.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>ID: {project.id}</p>
                </div>
                <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                >
                    {project.status}
                </span>
            </div>
            {project.projectImage && (
                <div className="relative">
                    <img
                        src={project.projectImage}
                        alt={project.title}
                        className={`w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700 ${project.status === 'inactive' ? 'opacity-50' : ''}`}
                    />
                </div>
            )}
            <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                {project.projectPdf && (
                    <a
                        href={project.projectPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                    >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">PDF</span>
                    </a>
                )}
                <Link
                    href={`/projectstatus/${project.id}`}
                    className="flex-1 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View</span>
                </Link>
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleEdit(project)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-800"
                    >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </button>
                )}
                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleDelete(project)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 transition-colors bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                    >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Project Status</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage project statuses</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" /> : <List className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Menu"
                        >
                            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Actions */}
            <div className="sticky top-10 sm:top-12 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-3 py-2 lg:hidden">
                <div className="flex items-center gap-1 sm:gap-2">
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleAdd}
                            disabled={isSaving}
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium
                            ${isSaving ? "bg-orange-400 text-white cursor-wait" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Add New</span>
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Project Status Master
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage project statuses</p>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                        {/* <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-xs sm:text-sm"
                        >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Export</span>
                        </button> */}
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleAdd}
                                disabled={isSaving}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm
                                ${isSaving ? "bg-orange-400 text-white cursor-wait" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>Add New</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 lg:px-6 lg:pb-6">
                {/* Grid View (Mobile) */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search project status..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-xs sm:text-sm dark:text-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-8 sm:py-12">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 sm:gap-4">
                                    {sortedData.map((project) => (
                                        <ProjectStatusCard key={project.id} project={project} />
                                    ))}
                                </div>
                                {sortedData.length === 0 && (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-4xl sm:text-5xl mb-3 sm:mb-4">📋</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium">No project statuses found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first project status to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-2 sm:p-3 text-center">
                            <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200">
                                Total: <span className="font-semibold">{totalRecords}</span> project statuses
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" style={{ marginTop: "15px" }}>
                        <CustomTable<ProjectStatus>
                            data={sortedData}
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
                                <div className="flex gap-1">
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            title="Edit"
                                            className="p-1 rounded text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            title="Delete"
                                            className="p-1 rounded text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProjectStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveProjectStatus={handleSaveStatus}
                isLoading={isSaving}
                currentProjectStatus={currentStatus}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${statusToDelete?.title}"?`}
                Icon={Trash2}
            />
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={sortedData}
                fileName={`project_status_export_${new Date().toISOString().split('T')[0]}`}
                columns={columns}
            />
        </div>
    );
};

export default ProjectStatusComponent;