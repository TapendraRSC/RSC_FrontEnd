'use client';

import React, { useEffect, useMemo } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import PermissionModalShow from './PermissionModalShow';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchPermissions, addPermission, updatePermission, deletePermission } from '../../../../store/permissionSlice';
import { toast } from 'react-toastify';

// ------------------ Types ------------------
interface Permission {
    id: number;
    permissionName: string;
}

interface SortConfig {
    key: keyof Permission;
    direction: 'asc' | 'desc';
}

// ------------------ Component ------------------
const PermissionsShow: React.FC = () => {
    const [searchValue, setSearchValue] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentPermission, setCurrentPermission] = React.useState<Permission | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [permissionToDelete, setPermissionToDelete] = React.useState<Permission | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.permissions);

    // ✅ Fetch permissions
    useEffect(() => {
        dispatch(fetchPermissions({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    // ------------------ Data handling ------------------
    const filteredData = list?.data?.permissions || [];
    const totalPages = list?.data?.totalPages || 1;

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

    const handleEdit = (row: Permission) => {
        setCurrentPermission(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: Permission) => {
        setPermissionToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (permissionToDelete) {
                await dispatch(deletePermission(permissionToDelete.id));
                toast.success('Permission deleted successfully');
                await dispatch(fetchPermissions({ page: currentPage, limit: pageSize, searchValue }));
            }
        } catch (error) {
            toast.error('Failed to delete permission');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleAdd = () => {
        setCurrentPermission(null);
        setIsModalOpen(true);
    };

    const handleSavePermission = async (permission: Omit<Permission, 'id'>) => {
        try {
            if (currentPermission) {
                await dispatch(updatePermission({ id: currentPermission.id, permissionName: permission.permissionName }));
                toast.success('Permission updated successfully');
            } else {
                await dispatch(addPermission({ permissionName: permission.permissionName }));
                toast.success('Permission added successfully');
            }
            await dispatch(fetchPermissions({ page: currentPage, limit: pageSize, searchValue }));
        } catch (error) {
            toast.error('Failed to save permission');
        } finally {
            setIsModalOpen(false);
        }
    };

    // ------------------ Sorting ------------------
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    // ------------------ Table columns ------------------
    const columns: any = [
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
        },
        {
            label: 'Permission Name',
            accessor: 'permissionName',
            sortable: true,
        },
    ];

    if (error) {
        return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;
    }

    // ------------------ UI ------------------
    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 min-h-screen overflow-y-auto transition-colors">

            {/* Header Section */}
            <div className="mb-6 flex justify-between items-center p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md dark:shadow-blue-800/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Permission
                </button>
            </div>

            {/* Table Section */}
            <div className="p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg transition-colors border border-gray-100 dark:border-gray-700">
                    <CustomTable<Permission>
                        data={sortedData}
                        columns={columns}
                        isLoading={loading}
                        title="Permissions"
                        searchValue={searchValue}
                        onSearchChange={handleSearch}
                        searchPlaceholder="Search permissions..."
                        showSearch={true}
                        sortConfig={sortConfig}
                        onSortChange={handleSort}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalRecords={list?.data?.total || 0}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[10, 25, 50, 100]}
                        showPagination={true}
                        emptyMessage="No permissions found"
                        showColumnToggle={true}
                        hiddenColumns={hiddenColumns}
                        onColumnVisibilityChange={handleColumnVisibilityChange}
                        actions={(row: Permission) => (
                            <div className="flex gap-2">
                                {/* Edit button */}
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Modals */}
            <PermissionModalShow
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePermission={handleSavePermission}
                isLoading={loading}
                currentPermission={currentPermission}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the permission "${permissionToDelete?.permissionName}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default PermissionsShow;
