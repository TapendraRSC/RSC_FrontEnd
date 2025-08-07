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

    const handleSaveStatus = async (name: string) => {
        setIsSaving(true);
        try {
            if (currentStatus) {
                await dispatch(updateStatus({ id: currentStatus.id, projectStatusName: name })).unwrap();
                toast.success('Status updated successfully');
            } else {
                await dispatch(addStatus({ projectStatusName: name })).unwrap();
                toast.success('Status added successfully');
            }
            dispatch(fetchProjectStatuses({ page: currentPage, limit: pageSize, searchValue }));
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err || 'Failed to save status');
        } finally {
            setIsSaving(false);
        }
    };

    const columns: any = [
        { label: 'Sr', accessor: 'id', sortable: true },
        { label: 'Project Status Name', accessor: 'projectStatusName', sortable: true },
        {
            label: 'Status',
            accessor: 'status',
            render: (row: ProjectStatus) => (
                <span className={`text-sm ${row.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.status}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Status Master</h1>
                    <p className="text-gray-600">Manage project statuses</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            <div className="p-6">
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <div className="bg-white rounded-lg shadow-sm">
                    <CustomTable<ProjectStatus>
                        data={projectStatusList}
                        columns={columns}
                        isLoading={loading}
                        title="Project Statuses"
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
                                <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 p-1">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(row)} className="text-red-500 hover:text-red-700 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    />
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
                message={`Are you sure you want to delete "${statusToDelete?.projectStatusName}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default ProjectStatusComponent;
