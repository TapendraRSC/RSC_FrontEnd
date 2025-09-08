'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, Grid3X3, List, Menu, Search, Shield } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import PagePermissionModal from './PagePermissionModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { fetchPages, addPage, updatePage, deletePage } from '../../../../store/pagePermissionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';

interface PagePermission {
    id: number;
    pageName: string;
}

interface SortConfig {
    key: keyof PagePermission;
    direction: 'asc' | 'desc';
}

// PageCard component with dark theme support
const PageCard = ({ page, onEdit, onDelete, hasPermission }: {
    page: PagePermission;
    onEdit: () => void;
    onDelete: () => void;
    hasPermission: (permId: number, permName: string) => boolean
}) => (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{page.pageName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Page ID: {page.id}</p>
                </div>
            </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            {hasPermission(22, "edit") && (
                <button
                    onClick={onEdit}
                    className="flex-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </button>
            )}
            {hasPermission(4, "delete") && (
                <button
                    onClick={onDelete}
                    className="flex-1 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            )}
        </div>
    </div>
);

const PagePermission: React.FC = () => {
    // State management
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPermission, setCurrentPermission] = useState<PagePermission | null>(null);
    const [permissionToDelete, setPermissionToDelete] = useState<PagePermission | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Redux hooks
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.pages);

    // Fetch data on mount and when dependencies change
    useEffect(() => {
        dispatch(fetchPages({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    // Extract data from Redux store
    const rawData = list?.data?.data || [];
    const totalPages = list?.data?.totalPages || 1;
    const totalRecords = list?.data?.total || 0;

    // Filter and sort data
    const filteredData = useMemo(() => {
        const filtered = rawData.filter((item: PagePermission) =>
            item.pageName.toLowerCase().includes(searchValue.toLowerCase())
        );
        if (!sortConfig) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [rawData, searchValue, sortConfig]);

    // Handler functions
    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleSort = (config: SortConfig | any) => {
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

    const handleEdit = (row: PagePermission) => {
        setCurrentPermission(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: PagePermission) => {
        setPermissionToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (permissionToDelete) {
                await dispatch(deletePage(permissionToDelete.id));
                await dispatch(fetchPages({ page: currentPage, limit: pageSize, searchValue }));
                toast.success('Page permission deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete page permission');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleAdd = () => {
        setCurrentPermission(null);
        setIsModalOpen(true);
    };

    const handleSavePermission = async (permission: Omit<PagePermission, 'id'>) => {
        try {
            if (currentPermission) {
                await dispatch(updatePage({ id: currentPermission.id, pageName: permission.pageName }));
                toast.success('Page permission updated successfully');
            } else {
                await dispatch(addPage({ pageName: permission.pageName }));
                toast.success('Page permission added successfully');
            }
            await dispatch(fetchPages({ page: currentPage, limit: pageSize, searchValue }));
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save page permission');
        }
    };

    // Table columns configuration
    const columns: any = [
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
        },
        {
            label: 'Page Name',
            accessor: 'pageName',
            sortable: true,
        },
    ];

    // Error handling
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Permission management
    const { permissions: rolePermissions, loading: rolePermissionsLoading } =
        useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar());
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Page Permissions'
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

    // Main component return
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Page Permissions</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage page permissions</p>
                    </div>
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Page Permission
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Page Permissions</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage page permissions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Add Button for Mobile */}
            <div className="sticky top-16 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
                {hasPermission(21, "add") && (
                    <button
                        onClick={handleAdd}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Page Permission
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
                                placeholder="Search page permissions..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {filteredData.map((page: PagePermission) => (
                                        <PageCard
                                            key={page.id}
                                            page={page}
                                            onEdit={() => handleEdit(page)}
                                            onDelete={() => handleDelete(page)}
                                            hasPermission={hasPermission}
                                        />
                                    ))}
                                </div>
                                {filteredData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">📄</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No page permissions found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first page permission to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Total: <span className="font-semibold">{totalRecords}</span> page permissions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View (Desktop + Mobile) */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <CustomTable<PagePermission>
                            data={filteredData}
                            columns={columns}
                            isLoading={loading}
                            title="Page Permissions"
                            searchValue={searchValue}
                            onSearchChange={handleSearch}
                            searchPlaceholder="Search page permissions..."
                            showSearch={true}
                            sortConfig={sortConfig}
                            onSortChange={handleSort}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalRecords={totalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[10, 25, 50, 100]}
                            showPagination={true}
                            emptyMessage="No page permissions found"
                            showColumnToggle={true}
                            hiddenColumns={hiddenColumns}
                            onColumnVisibilityChange={handleColumnVisibilityChange}
                            actions={(row: PagePermission) => (
                                <div className="flex gap-2">
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition-colors"
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

            {/* Modals */}
            <PagePermissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePermission={handleSavePermission}
                currentPermission={currentPermission}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the page permission "${permissionToDelete?.pageName}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default PagePermission;
