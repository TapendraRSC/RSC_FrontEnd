'use client';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import CustomTable from '../Common/CustomTable';
import RolesModal from './RolesModal';
import { getRoles, addRole, updateRole, deleteRole } from '../../../../store/roleSlice';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';

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

    useEffect(() => {
        dispatch(getRoles({ page: 1, limit: pageSize }));
    }, [dispatch, pageSize]);

    useEffect(() => {
        // Dispatch getRoles action whenever searchValue changes
        const timer = setTimeout(() => {
            dispatch(getRoles({ page: 1, limit: pageSize, searchValue }));
        }, 500); // Debounce the search input to avoid excessive API calls

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

    const handleSort = (config: any) => {
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

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system roles and permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Role
                </button>
            </div>
            <CustomTable<Role>
                data={roles}
                isLoading={isLoading}
                title="System Roles"
                columns={[
                    { label: 'ID', accessor: 'id', sortable: true },
                    { label: 'Role Type', accessor: 'roleType', sortable: true },
                ]}
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
