'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomTable from '../Common/CustomTable';
import { Plus, Pencil, Trash2, Grid3X3, List, Menu, Search } from 'lucide-react';
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

    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    const totalRecords = Array.isArray(sortedData) ? sortedData.length : 0;

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

        const res = resultAction.payload;

        if (res?.success) {
            // toast.success(res.message);
            dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
            setModalOpen(false);
        } else {
            // Backend ka actual error message show karo
            const errorMessage = Array.isArray(res?.errors) && res.errors.length > 0
                ? res.errors[0]  // sirf pehla validation error
                : res?.message;

            toast.error(errorMessage);
        }

        setIsSubmitting(false);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                const res = await dispatch(deleteUser(userToDelete.id));

                if (res.meta.requestStatus === "fulfilled") {
                    // toast.success("User deleted successfully ");
                    await dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
                    setIsDeleteModalOpen(false);
                } else {
                    toast.error("Failed to delete user ❌");
                }
            } catch (error) {
                toast.error("Something went wrong while deleting user ⚠️");
            }
        }
    };

    const getRoleType = (roleId: number) => {
        const rolesData: any = roles;
        let actualRoles: any[] = [];

        if (Array.isArray(rolesData)) {
            actualRoles = rolesData;
        } else if (rolesData?.data) {
            if (Array.isArray(rolesData.data)) {
                actualRoles = rolesData.data;
            } else if (rolesData.data?.data && Array.isArray(rolesData.data.data)) {
                actualRoles = rolesData.data.data;
            }
        }

        const foundRole = actualRoles.find((role: any) => {
            return String(role.id) === String(roleId) ||
                role.id === roleId ||
                Number(role.id) === Number(roleId);
        });

        return foundRole ? foundRole.roleType : `Role ${roleId}`;
    };

    const columns: any = [
        {
            label: 'ID',
            accessor: 'id',
            sortable: true,
            width: '80px',
            mobile: false,
            showTooltip: true
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
            showTooltip: true
        },
        {
            label: 'Name',
            accessor: 'name',
            sortable: true,
            width: '150px',
            mobile: true,
            minWidth: 200,
            maxWidth: 500,
            showTooltip: true
        },
        {
            label: 'Email',
            accessor: 'email',
            sortable: true,
            width: '200px',
            mobile: true, // Show on mobile
            render: (row: User) => (
                <div className="truncate max-w-[150px] md:max-w-[200px]" title={row.email}>
                    {row.email}
                </div>
            ),
            showTooltip: true
        },
        {
            label: 'Phone',
            accessor: 'phoneNumber',
            sortable: true,
            width: '140px',
            mobile: false,
            minWidth: 200,
            maxWidth: 500,
            showTooltip: true
        },
        {
            label: 'Role',
            accessor: 'roleId',
            sortable: true,
            width: '120px',
            mobile: true, // Show on mobile
            render: (row: User) => {
                const roleType = getRoleType(row.roleId);
                return (
                    <div className="truncate max-w-[100px] md:max-w-[120px]" title={roleType}>
                        {roleType}
                    </div>
                );
            },
            // showTooltip: true
        },
        {
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '100px',
            mobile: false,
            render: (row: User) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.status || 'Active'}
                </span>
            ),
            showTooltip: true
        },
    ];

    // Mobile card component for user items
    const UserCard = ({ user }: { user: User }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-12 h-12 object-cover border border-gray-300 rounded-full"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{user.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{getRoleType(user.roleId)}</p>
                        <p className="text-sm text-gray-600 truncate mt-1">{user.email}</p>
                    </div>
                </div>
                {user.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.status}
                    </span>
                )}
            </div>

            {user.phoneNumber && (
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {user.phoneNumber}
                </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={() => handleDelete(user)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Users Management</h1>
                        <p className="text-xs text-gray-600">Manage system users</p>
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

            {/* Mobile Action Button */}
            <div className="sticky top-16 z-20 bg-white border-b border-gray-100 px-4 py-3 lg:hidden">
                <button
                    onClick={handleAdd}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Users Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage system users and permissions
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                {/* Mobile Grid View */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
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
                                    {paginatedData.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>

                                {paginatedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-5xl mb-4">👥</div>
                                        <p className="text-gray-500 text-lg font-medium">No users found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first user to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Mobile Summary */}
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-700">
                                Total: <span className="font-semibold">{totalRecords}</span> users
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View - Mobile & Desktop */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <CustomTable<User>
                            data={paginatedData}
                            columns={columns}
                            isLoading={loading}
                            title="Users"
                            searchValue={searchValue}
                            onSearchChange={handleSearch}
                            searchPlaceholder="Search users..."
                            showSearch
                            sortConfig={sortConfig}
                            onSortChange={handleSort}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalRecords={totalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[10, 25, 50, 100]}
                            showPagination
                            emptyMessage="No users found"
                            showColumnToggle
                            hiddenColumns={hiddenColumns}
                            onColumnVisibilityChange={handleColumnVisibilityChange}
                            actions={(row) => (
                                <div className="flex gap-1 sm:gap-2">
                                    <button
                                        onClick={() => handleEdit(row)}
                                        className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
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