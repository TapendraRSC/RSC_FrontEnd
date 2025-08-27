'use client';
import React, { useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import PermissionModalShow from './PermissionModalShow';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchPermissions, addPermission, updatePermission, deletePermission } from '../../../../store/permissionSlice';
import { toast } from 'react-toastify';

interface Permission {
    id: number;
    permissionName: string;
}

interface SortConfig {
    key: keyof Permission;
    direction: 'asc' | 'desc';
}

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

    useEffect(() => {
        dispatch(fetchPermissions({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

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

    const filteredData = list?.data?.permissions || [];

    const totalPages = list?.data?.totalPages || 1;

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


    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Permission
                </button>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <CustomTable<Permission>
                        data={filteredData}
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