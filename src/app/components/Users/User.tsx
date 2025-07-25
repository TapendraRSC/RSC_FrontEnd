'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomTable from '../Common/CustomTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../store/store';
import { exportUsers, deleteUser, updateUser, addUser } from '../../../../store/userSlice';
import { getRoles } from '../../../../store/roleSlice';
import UsersModal from './UsersModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { toast } from 'react-toastify';

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    roleId: number;
    status: string;
    profileImage: string;
}

interface Role {
    id: number | string;
    roleType: string;
}

type SortConfig = {
    key: keyof User;
    direction: 'asc' | 'desc';
} | null;

const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const Users: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: users = [], loading } = useSelector((state: RootState) => state.users);
    const { data: roles = [] } = useSelector((state: RootState) => state.roles);

    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

    // Fix 1: Load roles when component mounts and when users data changes
    useEffect(() => {
        dispatch(getRoles({ page: 1, limit: 100, searchValue: '' })); // Increase limit to get all roles
    }, [dispatch]);

    // Fix 2: Also fetch users initially
    useEffect(() => {
        dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: '' }));
    }, [dispatch, currentPage, pageSize]);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: value }));
        }, 1000),
        [dispatch, currentPage, pageSize]
    );

    useEffect(() => {
        if (searchValue.length >= 3) {
            debouncedSearch(searchValue);
        } else if (searchValue.length === 0) {
            dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: '' }));
        }
    }, [searchValue, debouncedSearch, currentPage, pageSize, dispatch]);

    // Fix 3: Improved getRoleType function with better error handling
    const getRoleType = useCallback((roleId: number | string): string => {
        console.log('getRoleType called with roleId:', roleId);
        console.log('Available roles:', roles);

        if (!roleId || !roles || roles.length === 0) {
            console.log('No roleId or roles available');
            return '-';
        }

        // Handle different data structures
        const rolesArray = Array.isArray(roles) ? roles :
            (roles && Array.isArray(roles)) ? roles :
                (roles && roles && Array.isArray(roles)) ? roles : [];

        console.log('Processed roles array:', rolesArray);

        const matchedRole: any = rolesArray.find((role: any) => {
            const roleIdMatch = String(role.id) === String(roleId);
            console.log(`Comparing role.id: ${role.id} with roleId: ${roleId}, match: ${roleIdMatch}`);
            return roleIdMatch;
        });

        console.log('Matched role:', matchedRole);

        return matchedRole?.roleType || '-';
    }, [roles]);

    const roleMap = useMemo(() => {
        const map = new Map();
        const rolesArray = Array.isArray(roles) ? roles :
            (roles && Array.isArray(roles)) ? roles :
                (roles && roles && Array.isArray(roles)) ? roles : [];

        rolesArray.forEach((role: any) => {
            map.set(String(role.id), role.roleType);
        });
        return map;
    }, [roles]);

    const filteredData = useMemo(() => {
        const usersArray = Array.isArray(users?.data?.data) ? users.data?.data : [];
        if (!searchValue) return usersArray;
        return usersArray.filter((user: any) =>
            Object.values(user).some((val) =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    }, [searchValue, users]);

    const sortedData = useMemo(() => {
        const dataArray = Array.isArray(filteredData) ? filteredData : [];
        if (!sortConfig) return dataArray;
        return [...dataArray].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        const dataArray = Array.isArray(sortedData) ? sortedData : [];
        const startIndex = (currentPage - 1) * pageSize;
        return dataArray.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil((Array.isArray(sortedData) ? sortedData.length : 0) / pageSize);

    const handleSort = (config: any) => setSortConfig(config);
    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleColumnVisibilityChange = (newHiddenColumns: string[]) => {
        setHiddenColumns(newHiddenColumns);
        localStorage.setItem('users-hidden-columns', JSON.stringify(newHiddenColumns));
    };

    useEffect(() => {
        const savedHiddenColumns = localStorage.getItem('users-hidden-columns');
        if (savedHiddenColumns) {
            try {
                setHiddenColumns(JSON.parse(savedHiddenColumns));
            } catch (error) {
                console.error('Error parsing hidden columns from localStorage:', error);
            }
        }
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleUserSubmit = async (data: any) => {
        setIsSubmitting(true);
        let resultAction: any;
        if (editingUser) {
            resultAction = await dispatch(updateUser({ id: editingUser.id, userData: data }));
        } else {
            resultAction = await dispatch(addUser(data));
        }
        if (
            (editingUser && updateUser.fulfilled.match(resultAction)) ||
            (!editingUser && addUser.fulfilled.match(resultAction))
        ) {
            const res = resultAction.payload;
            if (res?.success) {
                toast.success(res.message);
                dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
                setModalOpen(false);
            } else {
                toast.error(res?.message || "An error occurred");
            }
        } else {
            const errorPayload: any = resultAction.payload || resultAction.error;
            toast.error(errorPayload?.message || "An unexpected error occurred");
        }
        setIsSubmitting(false);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            await dispatch(deleteUser(userToDelete.id));
            await dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
            setIsDeleteModalOpen(false);
        }
    };

    const columns: any = [
        {
            label: 'Name',
            accessor: 'name',
            sortable: true,
            width: '150px',
        },
        {
            label: 'Email',
            accessor: 'email',
            sortable: true,
            width: '200px',
        },
        {
            label: 'Password',
            accessor: 'password',
            sortable: false,
            width: '150px',
            render: (row: User) => row.password?.trim() ? row.password : '-',
        },
        {
            label: 'Role',
            accessor: 'roleId',
            sortable: true,
            width: '120px',
            render: (row: User) => {

                const roleTypeFromMap = roleMap.get(String(row.roleId)) || roleMap.get(Number(row.roleId));

                const roleType = roleTypeFromMap || getRoleType(row.roleId);

                return roleType || '-';
            }
        },
        {
            label: 'Profile Image',
            accessor: 'profileImage',
            sortable: false,
            width: '200px',
            render: (row: User) => {
                const imageText = row.profileImage?.trim();
                if (!imageText) return '-';
                return (
                    <span title={imageText}>
                        {imageText.length > 20 ? imageText.slice(0, 20) + '...' : imageText}
                    </span>
                );
            }
        }
    ];


    if (paginatedData && paginatedData.length > 0) {
        console.log('First user roleId:', paginatedData[0].roleId, 'type:', typeof paginatedData[0].roleId);
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system users and permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Users
                </button>
            </div>

            <CustomTable<User>
                data={paginatedData}
                columns={columns}
                isLoading={loading}
                title="Users"
                searchValue={searchValue}
                onSearchChange={handleSearch}
                searchPlaceholder="Search users..."
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
                emptyMessage="No users found"
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

            <UsersModal
                isOpen={modalOpen}
                onClose={() => !isSubmitting && setModalOpen(false)}
                onSubmit={handleUserSubmit}
                user={editingUser}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the user "${userToDelete?.name}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default Users;