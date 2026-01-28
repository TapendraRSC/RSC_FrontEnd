'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { fetchPermissions } from '../../../../store/permissionSlice';

interface LeadPlatform {
    id: number;
    platformType: string;
}

interface SortConfig {
    key: keyof LeadPlatform;
    direction: 'asc' | 'desc';
}

const LeadPlatformCard = ({
    platform,
    onEdit,
    onDelete,
    hasPermission,
}: {
    platform: LeadPlatform;
    onEdit: () => void;
    onDelete: () => void;
    hasPermission: (permId: number, permName: string) => boolean;
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{platform.platformType}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform ID: {platform.id}</p>
                </div>
            </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            {hasPermission(22, "edit") && (
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                   transition-colors bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-gray-600 cursor-pointer"
                    title="Edit"
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </button>
            )}
            {hasPermission(4, "delete") && (
                <button
                    onClick={onDelete}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                   transition-colors bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-gray-600 cursor-pointer"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            )}
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
    const [sortConfig, setSortConfig] = useState<SortConfig | any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<LeadPlatform | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<LeadPlatform | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Refs to prevent duplicate API calls
    const lastFetchRef = useRef<string>('');
    const permissionsFetchedRef = useRef(false);

    useEffect(() => {
        const fetchKey = `${currentPage}-${pageSize}-${searchValue}`;
        if (lastFetchRef.current === fetchKey) return;
        lastFetchRef.current = fetchKey;
        dispatch(
            fetchLeadPlatforms({ page: currentPage, limit: pageSize, search: searchValue })
        );
    }, [dispatch, currentPage, pageSize, searchValue]);

    const { permissions: rolePermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    // NOTE: fetchRolePermissionsSidebar is already called globally by LayoutClient.tsx
    useEffect(() => {
        if (permissionsFetchedRef.current) return;
        permissionsFetchedRef.current = true;
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

    // Sorting logic
    const sortedData = useMemo(() => {
        if (!leadPlatforms) return [];
        let data = [...leadPlatforms];
        if (sortConfig) {
            data.sort((a: any, b: any) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return data;
    }, [leadPlatforms, sortConfig]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Lead Platform'
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
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
        },
        {
            label: 'Platform Type',
            accessor: 'platformType',
            sortable: true,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800">
            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Platform Master</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your lead platforms</p>
                    </div>
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                            title="Add New Platform"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Platform
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Lead Platforms</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage and track your lead platforms</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Add Button for Mobile */}
            <div className="sticky top-16 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
                {hasPermission(21, "add") && (
                    <button
                        onClick={handleAdd}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium
                   bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        title="Add New Platform"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Platform
                    </button>
                )}
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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {sortedData.map((platform: LeadPlatform) => (
                                        <LeadPlatformCard
                                            key={platform.id}
                                            platform={platform}
                                            onEdit={() => handleEdit(platform)}
                                            onDelete={() => handleDelete(platform)}
                                            hasPermission={hasPermission}
                                        />
                                    ))}
                                </div>
                                {sortedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🖥️</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No platforms found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first platform to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Total: <span className="font-semibold">{total}</span> platforms
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View (Desktop + Mobile) */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" style={{ marginTop: "15px" }}>
                        <CustomTable<LeadPlatform>
                            data={sortedData}
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
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="p-1 rounded text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="p-1 rounded text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
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
