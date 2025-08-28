'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Grid3X3, List, Menu, Search, FileText, Eye } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ProjectStatusModal from './ProjectStatusModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import { addStatus, deleteStatus, fetchProjectStatuses, ProjectStatus, updateStatus } from '../../../../store/projectSlice';
import Link from 'next/link';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';

const ProjectStatusComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<ProjectStatus | null>(null);
    const [statusToDelete, setStatusToDelete] = useState<ProjectStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const { list, loading, error } = useSelector((state: RootState) => state.projectStatus);

    const projectStatusList: ProjectStatus[] = list?.projects || [];
    const totalRecords = list?.total || 0;
    const totalPages = list?.totalPages || 1;

    useEffect(() => {
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
            formData.append('status', data.status || 'active');

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

    const columns: any = [
        {
            label: 'Sr',
            accessor: 'id',
            sortable: true,
            mobile: false
        },
        {
            label: 'Project Title',
            accessor: 'title',
            sortable: true,
            mobile: true,
            render: (row: ProjectStatus) => (
                <Link
                    href={`/projectstatus/${row.id}`}
                    className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
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
                        className="object-cover border border-gray-300 rounded-lg w-20 h-12 sm:w-28 sm:h-16"
                    />
                ) : (
                    '-'
                ),
        },
        {
            label: 'PDF',
            accessor: 'projectPdf',
            mobile: false,
            render: (row: ProjectStatus) =>
                row.projectPdf ? (
                    <a
                        href={row.projectPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        View PDF
                    </a>
                ) : (
                    '-'
                ),
        },
        {
            label: 'Status',
            accessor: 'status',
            mobile: true,
            render: (row: ProjectStatus) => (
                <span
                    className={`text-sm ${row.status === 'active' ? 'text-green-600' : 'text-red-600'}`}
                >
                    {row.status}
                </span>
            ),
        },
    ];


    // Permissions 

    const { permissions: rolePermissions, loading: rolePermissionsLoading } =
        useSelector((state: RootState) => state.sidebarPermissions);

    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar()); // roleId backend se mil jayega
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Project Status'
        );
        return leadPerm?.permissionIds || [];
    };

    const leadPermissionIds = getLeadPermissions();

    const hasPermission = (permId: number, permName: string) => {
        // rolePermissions se id check
        if (!leadPermissionIds.includes(permId)) return false;

        // master list se naam check
        const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
        if (!matched) return false;

        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const ProjectStatusCard = ({ project }: { project: ProjectStatus }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Link
                        href={`/projectstatus/${project.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-lg block hover:underline"
                    >
                        {project.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">ID: {project.id}</p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
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
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
                {project.projectPdf && (
                    <a
                        href={project.projectPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        PDF
                    </a>
                )}
                <Link
                    href={`/projectstatus/${project.id}`}
                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    View
                </Link>
                <button
                    onClick={hasPermission(22, "edit") ? () => handleEdit(project) : undefined}
                    disabled={!hasPermission(22, "edit")}
                    title={!hasPermission(22, "edit") ? "Restricted by Admin" : ""}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors
        ${hasPermission(22, "edit")
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </button>

                <button
                    onClick={hasPermission(4, "delete") ? () => handleDelete(project) : undefined}
                    disabled={!hasPermission(4, "delete")}
                    title={!hasPermission(4, "delete") ? "Restricted by Admin" : ""}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-colors
        ${hasPermission(4, "delete")
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Project Status</h1>
                        <p className="text-xs text-gray-600">Manage project statuses</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="sticky top-16 z-20 bg-white border-b border-gray-100 px-4 py-3 lg:hidden">
                <button
                    onClick={hasPermission(21, "add") ? handleAdd : undefined}
                    disabled={!hasPermission(21, "add") || isSaving}
                    title={!hasPermission(21, "add") ? "Restricted by Admin" : ""}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium ${hasPermission(21, "add")
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    Add New Project
                </button>

            </div>

            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Project Status Master
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">Manage project statuses</p>
                    </div>
                    <button
                        onClick={hasPermission(21, "add") ? handleAdd : undefined}
                        disabled={!hasPermission(21, "add") || isSaving}
                        title={!hasPermission(21, "add") ? "Restricted by Admin" : ""}
                        className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${hasPermission(21, "add")
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        Add New
                    </button>

                </div>
            </div>

            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                {/* Mobile Grid View */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search project status..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {projectStatusList.map((project) => (
                                        <ProjectStatusCard key={project.id} project={project} />
                                    ))}
                                </div>

                                {projectStatusList.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-5xl mb-4">📋</div>
                                        <p className="text-gray-500 text-lg font-medium">No project statuses found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first project status to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Mobile Summary */}
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-700">
                                Total: <span className="font-semibold">{totalRecords}</span> project statuses
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View - Mobile & Desktop */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <CustomTable<ProjectStatus>
                            data={projectStatusList}
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
                                <div className="flex gap-1 sm:gap-2">
                                    {/* Edit */}
                                    <button
                                        onClick={hasPermission(22, "edit") ? () => handleEdit(row) : undefined}
                                        disabled={!hasPermission(22, "edit")}
                                        title={!hasPermission(22, "edit") ? "Restricted by Admin" : "Edit"}
                                        className={`p-1 rounded ${hasPermission(22, "edit")
                                            ? "text-blue-500 hover:text-blue-700"
                                            : "text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={hasPermission(4, "delete") ? () => handleDelete(row) : undefined}
                                        disabled={!hasPermission(4, "delete")}
                                        title={!hasPermission(4, "delete") ? "Restricted by Admin" : "Delete"}
                                        className={`p-1 rounded ${hasPermission(4, "delete")
                                            ? "text-red-500 hover:text-red-700"
                                            : "text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

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
        </div>
    );
};

export default ProjectStatusComponent;