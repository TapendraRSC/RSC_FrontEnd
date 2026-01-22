'use client';
import { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Plus, Grid3X3, List, Menu, Search, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import CustomTable from '../Common/CustomTable';
import RolesModal from './RolesModal';
import { getRoles, addRole, updateRole, deleteRole } from '../../../../store/roleSlice';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';

type Role = {
    id: number;
    roleType: string;
};

export default function RolesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        roles,
        total,
        totalPages,
        page,
        limit,
        loading: isLoading,
    } = useSelector((state: RootState) => state.roles);
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Role; direction: 'asc' | 'desc' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        dispatch(getRoles({ page: 1, limit: pageSize }));
    }, [dispatch, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(getRoles({ page: 1, limit: pageSize, searchValue }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, dispatch, pageSize]);

    const handlePageChange = (newPage: number) => {
        dispatch(getRoles({ page: newPage, limit: pageSize, searchValue }));
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        dispatch(getRoles({ page: 1, limit: newSize, searchValue }));
    };

    const handleSearch = (val: string) => {
        setSearchValue(val);
    };

    const handleSort = (config: { key: keyof any; direction: 'asc' | 'desc' } | any) => {
        setSortConfig(config);
    };

    const handleAdd = () => {
        setCurrentRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row: Role) => {
        setCurrentRole(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: Role) => {
        setRoleToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!roleToDelete) return;
        try {
            const response = await dispatch(deleteRole(roleToDelete.id)).unwrap();
            if (response?.success) {
                toast.success(response.message);
                dispatch(getRoles({ page, limit: pageSize, searchValue }));
            } else {
                toast.error(response?.message || 'Failed to delete role.');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong while deleting the role.');
            console.error('Failed to delete role:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    const handleSaveRole = async (roleType: string) => {
        setIsSaving(true);
        try {
            if (currentRole) {
                const res = await dispatch(updateRole({ id: currentRole.id, roleType })).unwrap();
                if (res?.success) {
                    toast.success(res.message);
                    setIsModalOpen(false);
                    dispatch(getRoles({ page: 1, limit: pageSize, searchValue }));
                } else {
                    toast.error(res?.message || 'Failed to update role.');
                }
            } else {
                const res = await dispatch(addRole({ roleType })).unwrap();
                if (res?.success) {
                    toast.success(res.message);
                    setIsModalOpen(false);
                    dispatch(getRoles({ page: 1, limit: pageSize, searchValue }));
                } else {
                    toast.error(res?.message || 'Failed to create role.');
                }
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong.');
            console.error('Failed to save role:', error);
        } finally {
            setIsSaving(false);
            setCurrentRole(null);
        }
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return roles;
        return [...roles].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [roles, sortConfig]);

    const columns: any = [
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
            width: '80px',
            mobile: false
        },
        {
            label: 'Role Type',
            accessor: 'roleType',
            sortable: true,
            width: '200px',
            mobile: true
        },
    ];

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
            (p: any) => p.pageName === 'Roles'
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

    const RoleCard = ({ role }: { role: Role }) => (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{role.roleType}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Role ID: {role.id}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                        Active
                    </span>
                </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleEdit(role)}
                        className="flex-1 bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}
                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleDelete(role)}
                        className="flex-1 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Roles Management</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage system roles</p>
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
            {/* Mobile Actions */}
            <div className="sticky top-16 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
                {hasPermission(21, "add") && (
                    <button
                        onClick={handleAdd}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Role
                    </button>
                )}
            </div>
            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Roles Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage system roles and permissions
                        </p>
                    </div>
                    <div>
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Role
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                {/* Grid View (Mobile) */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {sortedData.map((role) => (
                                        <RoleCard key={role.id} role={role} />
                                    ))}
                                </div>
                                {sortedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🛡️</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No roles found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first role to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {page} of {totalPages}
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
                                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Total: <span className="font-semibold">{total}</span> system roles
                            </p>
                        </div>
                    </div>
                </div>
                {/* Table View */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <CustomTable<Role>
                            data={sortedData}
                            isLoading={isLoading}
                            title="System Roles"
                            columns={columns}
                            actions={(row) => (
                                <div className="flex gap-1 sm:gap-2">
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                            searchValue={searchValue}
                            onSearchChange={handleSearch}
                            searchPlaceholder="Search roles..."
                            showSearch={true}
                            sortConfig={sortConfig}
                            onSortChange={handleSort}
                            currentPage={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalRecords={total}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[10, 25, 50, 100]}
                            showPagination={true}
                            emptyMessage="No roles found"
                        />
                    </div>
                </div>
            </div>
            {/* Modals */}
            <RolesModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentRole(null);
                }}
                onSaveRole={handleSaveRole}
                isLoading={isSaving}
                currentRole={currentRole}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the role "${roleToDelete?.roleType}"?`}
                Icon={Trash2}
            />
        </div>
    );
}
