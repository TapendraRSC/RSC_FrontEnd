'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { AppDispatch, RootState } from '../../../../store/store';

import { toast } from 'react-toastify';
import { createStatus, deleteStatus, fetchStatusById, fetchStatuses, updateStatus } from '../../../../store/statusMasterSlice';
import StatusMasterModal from './StatusMasterModal';

interface Status {
    id: number;
    type: string;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

const StatusMasterView: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, page, limit, totalPages, total } = useSelector((state: RootState) => state.statuses);
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<Status | any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

    useEffect(() => {
        dispatch(fetchStatuses({
            page: currentPage,
            limit: pageSize,
            searchValue: searchValue
        }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    const columns: any = [
        { label: 'ID', accessor: 'id', sortable: true },
        { label: 'Lead Status', accessor: 'type', sortable: true },
    ];

    const displayData: any = useMemo(() => {
        if (!list || list.length === 0) return [];
        let sortableData = [...list];
        if (sortConfig !== null) {
            sortableData.sort((a: any, b: any) => {
                const aValue = a[sortConfig.key as keyof Status];
                const bValue = b[sortConfig.key as keyof Status];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [list, sortConfig]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleSort = (config: any) => setSortConfig(config);
    const handlePageChange = (newPage: number) => setCurrentPage(newPage);
    const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
    const handleColumnVisibilityChange = (columns: string[]) => setHiddenColumns(columns);

    const handleEdit = async (row: Status) => {
        try {
            const result = await dispatch(fetchStatusById(row.id.toString())).unwrap();
            setCurrentStatus(result);
        } catch (error) {
            console.error('Error fetching status by ID:', error);
            setCurrentStatus(row);
        }
        setIsModalOpen(true);
    };

    const handleDelete = (row: Status) => {
        setStatusToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStatus(null);
    };

    const confirmDelete = async () => {
        if (statusToDelete) {
            try {
                await dispatch(deleteStatus(statusToDelete.id.toString())).unwrap();
                toast.success("Status deleted successfully");

                await dispatch(fetchStatuses({
                    page: currentPage,
                    limit: pageSize,
                    searchValue: searchValue
                }));
            } catch (error: any) {
                console.error("Error deleting status:", error);
                toast.error(error?.message || "Failed to delete status");
            }
        }
        setIsDeleteModalOpen(false);
        setStatusToDelete(null);
    };

    const handleAdd = () => {
        setCurrentStatus(null);
        setIsModalOpen(true);
    };

    const handleSaveStatus = async (typeValue: any) => {
        try {
            if (currentStatus) {
                await dispatch(
                    updateStatus({
                        id: currentStatus.id.toString(),
                        payload: { type: typeof typeValue === "string" ? typeValue : typeValue.type },
                    })
                ).unwrap();

                toast.success("Status updated successfully");
            } else {
                await dispatch(
                    createStatus({ type: typeof typeValue === "string" ? typeValue : typeValue.type })
                ).unwrap();

                toast.success("Status created successfully");
            }

            await dispatch(fetchStatuses({
                page: currentPage,
                limit: pageSize,
                searchValue: searchValue
            }));

            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving status:", error);
            toast.error(error?.message || "Failed to save status");
        }
    };

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Status Master</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage lead statuses</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Status
                </button>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <CustomTable<Status>
                        data={displayData}
                        columns={columns}
                        isLoading={loading}
                        title="Status Master"
                        searchValue={searchValue}
                        onSearchChange={handleSearch}
                        searchPlaceholder="Search statuses..."
                        showSearch={true}
                        sortConfig={sortConfig}
                        onSortChange={handleSort}
                        currentPage={currentPage}
                        totalPages={totalPages || Math.ceil(total / pageSize)}
                        pageSize={pageSize}
                        totalRecords={total}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[10, 25, 50, 100]}
                        showPagination={true}
                        emptyMessage="No statuses found"
                        showColumnToggle={true}
                        hiddenColumns={hiddenColumns}
                        onColumnVisibilityChange={handleColumnVisibilityChange}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            <StatusMasterModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSaveStatus={handleSaveStatus}
                isLoading={loading}
                currentStatus={currentStatus}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the status "${statusToDelete?.type}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default StatusMasterView;
