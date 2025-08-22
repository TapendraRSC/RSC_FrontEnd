'use client';
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Grid3X3, List, Menu, Search, Shield } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import LeadPlatformModal from './LeadPlatformModal';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import {
    createLeadPlatform,
    deleteLeadPlatform,
    fetchLeadPlatforms,
    updateLeadPlatform,
} from '../../../../store/leadPlateformSlice';

interface LeadPlatform {
    id: number;
    platformType: string;
}

const LeadPlatformCard = ({ platform, onEdit, onDelete }: { platform: LeadPlatform; onEdit: () => void; onDelete: () => void }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{platform.platformType}</h3>
                    <p className="text-sm text-gray-500 mt-1">Platform ID: {platform.id}</p>
                </div>
            </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
                onClick={onEdit}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
                <Pencil className="w-4 h-4" />
                Edit
            </button>
            <button
                onClick={onDelete}
                className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Delete
            </button>
        </div>
    </div>
);

const LeadPlateform: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { leadPlatforms, loading, totalPages, total } = useSelector(
        (state: RootState) => state.leadPlateform
    );
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<LeadPlatform | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<LeadPlatform | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        dispatch(
            fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
        );
    }, [dispatch, currentPage, pageSize, searchValue]);

    const handleAdd = () => {
        setCurrentLead(null);
        setIsModalOpen(true);
    };

    const handleEdit = (lead: LeadPlatform) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
    };

    const handleDelete = (lead: LeadPlatform) => {
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!leadToDelete) return;
        try {
            await dispatch(deleteLeadPlatform(leadToDelete.id)).unwrap();
            toast.success('Lead Platform deleted successfully');
            dispatch(
                fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
            );
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
                await dispatch(updateLeadPlatform({ id: currentLead.id, data })).unwrap();
                toast.success("Lead Platform updated successfully");
            } else {
                await dispatch(createLeadPlatform(data)).unwrap();
                toast.success("Lead Platform added successfully");
            }
            await dispatch(
                fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
            ).unwrap();
            setIsModalOpen(false);
            setCurrentLead(null);
        } catch (err: any) {
            console.error("Save Lead Error:", err);
            toast.error(err?.message || "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const columns: any = [
        { label: 'ID', accessor: 'id', sortable: true },
        { label: 'Platform Type', accessor: 'platformType', sortable: true },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Platform Master</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your lead platforms</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Platform
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Lead Platforms</h1>
                        <p className="text-xs text-gray-600">Manage and track your lead platforms</p>
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

            {/* Sticky Add Button for Mobile */}
            <div className="sticky top-16 z-20 bg-white border-b border-gray-100 px-4 py-3 lg:hidden">
                <button
                    onClick={handleAdd}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add New Platform
                </button>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                {/* Grid View (Mobile) */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search platforms..."
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
                                    {leadPlatforms.map((platform: any) => (
                                        <LeadPlatformCard
                                            key={platform.id}
                                            platform={platform}
                                            onEdit={() => handleEdit(platform)}
                                            onDelete={() => handleDelete(platform)}
                                        />
                                    ))}
                                </div>
                                {leadPlatforms.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-5xl mb-4">🖥️</div>
                                        <p className="text-gray-500 text-lg font-medium">No platforms found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first platform to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
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
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-purple-700">
                                Total: <span className="font-semibold">{total}</span> platforms
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View (Desktop + Mobile) */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <CustomTable<any>
                            data={leadPlatforms}
                            columns={columns}
                            isLoading={loading}
                            title="Lead Platforms"
                            searchValue={searchValue}
                            onSearchChange={(val: string) => {
                                setSearchValue(val);
                                setCurrentPage(1);
                            }}
                            searchPlaceholder="Search platforms..."
                            showSearch
                            sortConfig={sortConfig}
                            onSortChange={setSortConfig}
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
                            showColumnToggle
                            hiddenColumns={hiddenColumns}
                            onColumnVisibilityChange={setHiddenColumns}
                            actions={(row: LeadPlatform) => (
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
                </div>
            </div>

            <LeadPlatformModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePlatform={handleSaveLead}
                currentPlatform={currentLead}
                isLoading={isSaving}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${leadToDelete?.platformType || ''}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default LeadPlateform;
