'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ProjectStatusModal from './ProjectStatusModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import { addStatus, deleteStatus, fetchProjectStatuses, ProjectStatus, updateStatus } from '../../../../store/projectSlice';
import Link from 'next/link';

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
        { label: 'Sr', accessor: 'id', sortable: true },
        {
            label: 'Project Title',
            accessor: 'title',
            sortable: true,
            render: (row: ProjectStatus) => (
                <Link
                    href={`/projects/${row.id}`}
                    className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                >
                    {row.title}
                </Link>
            ),
        },
        {
            label: 'Image',
            accessor: 'projectImage',
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
            render: (row: ProjectStatus) => (
                <span
                    className={`text-sm ${row.status === 'active' ? 'text-green-600' : 'text-red-600'}`}
                >
                    {row.status}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto p-3 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Project Status Master
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage project statuses</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add New
                </button>
            </div>

            {/* Table */}
            <div className="p-3 sm:p-4 md:p-6">
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-500 hover:text-blue-700 p-1"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    />
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
        </div>
    );
};

export default ProjectStatusComponent;
