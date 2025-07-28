'use client';
import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import LeadStateModal from './LeadStateModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';

interface LeadStage {
    id: number;
    leadStageStatus: string;
    status: number;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

const LeadStageMasterPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LeadStage[]>([
        { id: 1, leadStageStatus: 'Cold', status: 1 },
        { id: 2, leadStageStatus: 'Warm', status: 1 },
        { id: 3, leadStageStatus: 'Hot', status: 1 },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLeadStage, setCurrentLeadStage] = useState<LeadStage | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadStageToDelete, setLeadStageToDelete] = useState<LeadStage | null>(null);

    const columns: any = [
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
        },
        {
            label: 'Lead Stage Status',
            accessor: 'leadStageStatus',
            sortable: true,
        },
        {
            label: 'Status',
            accessor: 'status',
            sortable: true,
        },
    ];

    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.leadStageStatus.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [data, searchValue]);

    const sortedData = useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key as keyof LeadStage] < b[sortConfig.key as keyof LeadStage]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key as keyof LeadStage] > b[sortConfig.key as keyof LeadStage]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleSort = (config: any) => {
        setSortConfig(config);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleColumnVisibilityChange = (columns: string[]) => {
        setHiddenColumns(columns);
    };

    const handleEdit = (row: LeadStage) => {
        setCurrentLeadStage(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: LeadStage) => {
        setLeadStageToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (leadStageToDelete) {
            setData(prev => prev.filter(item => item.id !== leadStageToDelete.id));
        }
        setIsDeleteModalOpen(false);
    };

    const handleAdd = () => {
        setCurrentLeadStage(null);
        setIsModalOpen(true);
    };

    const handleSaveLeadStage = (leadStageStatus: string) => {
        if (currentLeadStage) {
            setData(prev => prev.map(item => item.id === currentLeadStage.id ? { ...item, leadStageStatus } : item));
        } else {
            const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
            setData(prev => [...prev, { id: newId, leadStageStatus, status: 1 }]);
        }
        setIsModalOpen(false);
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
                        data={paginatedData}
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
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalRecords={sortedData.length}
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
                message={`Are you sure you want to delete the lead stage "${leadStageToDelete?.leadStageStatus}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default LeadStageMasterPage;
