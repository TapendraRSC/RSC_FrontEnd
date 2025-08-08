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

    useEffect(() => {
        dispatch(getRoles({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

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

    const roleMap = useMemo(() => {
        const map = new Map<string, string>();
        const rolesData: any = roles;
        let rolesArray: any[] = [];

        try {
            if (Array.isArray(rolesData)) {
                rolesArray = rolesData;
            } else if (rolesData && typeof rolesData === 'object') {
                if (rolesData.data) {
                    if (Array.isArray(rolesData.data)) {
                        rolesArray = rolesData.data;
                    } else if (rolesData.data.data && Array.isArray(rolesData.data.data)) {
                        rolesArray = rolesData.data.data;
                    }
                }
            }
        } catch (error) {
            console.error('Error processing roles data:', error);
        }

        if (rolesArray && rolesArray.length > 0) {
            rolesArray.forEach((role: any) => {
                if (role && role.id && role.roleType) {
                    map.set(String(role.id), role.roleType);
                } else {
                    console.error('Invalid role object:', role);
                }
            });
        }
        return map;
    }, [roles]);

    const actualUsersData = useMemo(() => {
        if (Array.isArray(users)) {
            return users;
        }
        if (users?.data) {
            if (Array.isArray(users.data)) {
                return users.data;
            }
            if (users.data?.data && Array.isArray(users.data.data)) {
                return users.data.data;
            }
        }
        return [];
    }, [users]);

    const filteredData = useMemo(() => {
        if (!searchValue) return actualUsersData;
        return actualUsersData.filter((user: any) =>
            Object.values(user).some((val) =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    }, [searchValue, actualUsersData]);

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
                const rolesData: any = roles;
                if (!rolesData || (!Array.isArray(rolesData) && !rolesData.data)) {
                    return 'Loading...';
                }
                let actualRoles: any[] = [];
                if (Array.isArray(rolesData)) {
                    actualRoles = rolesData;
                } else if (rolesData.data && Array.isArray(rolesData.data)) {
                    actualRoles = rolesData.data;
                }
                const foundRole = actualRoles.find((role: any) => {
                    return String(role.id) === String(row.roleId) ||
                        role.id === row.roleId ||
                        Number(role.id) === Number(row.roleId);
                });
                if (foundRole && foundRole.roleType) {
                    return foundRole.roleType;
                }
                return `🔍 ${row.roleId}`;
            }
        },
        {
            label: 'Profile Image',
            accessor: 'profileImage',
            render: (row: User) =>
                row.profileImage ? (
                    <img
                        src={row.profileImage}
                        alt="Profile"
                        className="w-20 h-12 object-cover border border-gray-300 rounded-lg"
                    />
                ) : (
                    '-'
                ),
        },
    ];

    useEffect(() => {
        if (paginatedData && paginatedData.length > 0) {
            console.log('Sample user roleIds:', paginatedData.slice(0, 3).map(u => ({
                id: u.id,
                name: u.name,
                roleId: u.roleId,
                roleType: roleMap.get(String(u.roleId))
            })));
        }
    }, [paginatedData, roleMap]);

    return (
        <div className="p-4">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system users and permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Users
                </button>
            </div>
            <div className="overflow-x-auto">
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
            </div>
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
