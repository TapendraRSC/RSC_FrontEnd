'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import LeadStateModal from './LeadStateModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { AppDispatch, RootState } from '../../../../store/store';
import { createLeadStage, deleteLeadStage, fetchLeadStageById, fetchLeadStages, updateLeadStage } from '../../../../store/leadStageSlice';
import { toast } from 'react-toastify';

interface LeadStage {
    id: number;
    type: string;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

const LeadStageMasterPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, page, limit, totalPages, total } = useSelector((state: RootState) => state.leadStages);

    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLeadStage, setCurrentLeadStage] = useState<LeadStage | any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadStageToDelete, setLeadStageToDelete] = useState<LeadStage | null>(null);

    useEffect(() => {
        dispatch(fetchLeadStages({
            page: currentPage,
            limit: pageSize,
            searchValue: searchValue
        }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    const columns: any = [
        { label: 'ID', accessor: 'id', sortable: true },
        { label: 'Lead Stage Type', accessor: 'type', sortable: true },
    ];

    const displayData = useMemo(() => {
        if (!list || list.length === 0) return [];
        let sortableData = [...list];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof LeadStage];
                const bValue = b[sortConfig.key as keyof LeadStage];
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

    const handleEdit = async (row: LeadStage) => {
        try {
            const result = await dispatch(fetchLeadStageById(row.id.toString())).unwrap();
            setCurrentLeadStage(result);
        } catch (error) {
            console.error('Error fetching lead stage:', error);
            setCurrentLeadStage(row);
        }
        setIsModalOpen(true);
    };

    const handleDelete = (row: LeadStage) => {
        setLeadStageToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (leadStageToDelete) {
            try {
                await dispatch(deleteLeadStage(leadStageToDelete.id.toString())).unwrap();
                toast.success("Lead stage deleted successfully");

                await dispatch(fetchLeadStages({
                    page: currentPage,
                    limit: pageSize,
                    searchValue: searchValue
                }));
            } catch (error: any) {
                console.error("Error deleting lead stage:", error);
                toast.error(error?.message || "Failed to delete lead stage");
            }
        }
        setIsDeleteModalOpen(false);
        setLeadStageToDelete(null);
    };

    const handleAdd = () => {
        setCurrentLeadStage(null);
        setIsModalOpen(true);
    };

    const handleSaveLeadStage = async (leadStageType: string) => {
        try {
            if (currentLeadStage) {
                await dispatch(
                    updateLeadStage({
                        id: currentLeadStage.id.toString(),
                        payload: { type: leadStageType },
                    })
                ).unwrap();
                toast.success("Lead stage updated successfully ");
            } else {
                await dispatch(createLeadStage({ type: leadStageType })).unwrap();
                toast.success("Lead stage created successfully ");
            }

            await dispatch(fetchLeadStages({
                page: currentPage,
                limit: pageSize,
                searchValue: searchValue
            }));

            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving lead stage:", error);
            toast.error(error?.message || "Failed to save lead stage ❌");
        }
    };


    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Stage Master</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage lead stages and their statuses</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead Stage
                </button>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <CustomTable<LeadStage>
                        data={displayData}
                        columns={columns}
                        isLoading={loading}
                        title="Lead Stage Master"
                        searchValue={searchValue}
                        onSearchChange={handleSearch}
                        searchPlaceholder="Search lead stages..."
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
                        emptyMessage="No lead stages found"
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
            <LeadStateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveLeadStage={handleSaveLeadStage}
                isLoading={loading}
                currentLeadStage={currentLeadStage}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the lead stage "${leadStageToDelete?.type}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default LeadStageMasterPage;
