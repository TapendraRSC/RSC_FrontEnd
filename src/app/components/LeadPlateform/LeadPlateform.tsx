'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import LeadPlatformModal from './LeadPlatformModal'; // <-- modal import
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../../../store/store';
import {
    createLeadPlatform,
    deleteLeadPlatform,
    fetchLeadPlatforms,
    updateLeadPlatform,
} from '../../../../store/leadPlateformSlice';

const LeadPlateform: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { leadPlatforms, loading, totalPages, total } = useSelector(
        (state: RootState) => state.leadPlateform
    );

    // --- state ---
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<any | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- fetch on mount ---
    useEffect(() => {
        dispatch(
            fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
        );
    }, [dispatch, currentPage, pageSize, searchValue]);

    // --- handlers ---
    const handleAdd = () => {
        setCurrentLead(null);
        setIsModalOpen(true);
    };

    const handleEdit = (lead: any) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
    };

    const handleDelete = (lead: any) => {
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!leadToDelete) return;
        try {
            await dispatch(deleteLeadPlatform(leadToDelete.id)).unwrap();
            toast.success('Lead Platform deleted successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to delete');
        }
        setIsDeleteModalOpen(false);
        setLeadToDelete(null);
    };

    const handleSaveLead = async (data: any) => {
        setIsSaving(true);
        try {
            if (currentLead) {
                // update case
                await dispatch(updateLeadPlatform({ id: currentLead.id, data })).unwrap();
                await fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })

                toast.success('Lead Platform updated successfully');
            } else {
                // create case
                await dispatch(createLeadPlatform(data)).unwrap();
                toast.success('Lead Platform added successfully');
            }

            try {
                await dispatch(
                    fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
                ).unwrap();
            } catch (fetchError) {
                console.log('Error fetching updated data:', fetchError);
            }

            setIsModalOpen(false);
            setCurrentLead(null);
        } catch (err: any) {
            toast.error(err || 'Something went wrong');
        }
        setIsSaving(false);
    };

    const columns: any = [
        { label: 'ID', accessor: 'id', sortable: true },
        { label: 'Platform Type', accessor: 'platformType', sortable: true },
    ];

    return (
        <div className="space-y-8 p-3 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Lead Platform Master</h1>
                    <p className="text-sm text-gray-600">
                        Manage and track your lead platforms
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <CustomTable<any>
                    data={leadPlatforms}
                    columns={columns}
                    isLoading={loading}
                    title="Lead Platforms"
                    // search
                    searchValue={searchValue}
                    onSearchChange={(val: string) => {
                        setSearchValue(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search platforms..."
                    showSearch
                    // sort
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                    // pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalRecords={total}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size: number) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    showPagination
                    // columns toggle
                    showColumnToggle
                    hiddenColumns={hiddenColumns}
                    onColumnVisibilityChange={setHiddenColumns}
                    actions={(row: any) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
            </div>

            <LeadPlatformModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePlatform={handleSaveLead}
                currentPlatform={currentLead}
                isLoading={isSaving}
            />


            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${leadToDelete?.platformType || ''
                    }"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default LeadPlateform;
