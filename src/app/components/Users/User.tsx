"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomTable from '../Common/CustomTable';
import { Plus } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../store/store';
import { exportUsers } from '../../../../store/userSlice';
import { getRoles } from '../../../../store/roleSlice';
import UsersModal from './UsersModal';

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
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

const Users: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: users = [], loading } = useSelector((state: RootState) => state.users);
    const { data: roles = [] } = useSelector((state: RootState) => state.roles);

    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        dispatch(exportUsers());
        dispatch(getRoles({ page: 1, limit: 10 }));
    }, [dispatch]);

    const roleMap = useMemo(() => {
        const map = new Map();
        roles.forEach((role: any) => {
            map.set(role.id, role.roleType);
        });
        return map;
    }, [roles]);

    const getRoleType = (roleId: number | string): string => {
        return roleMap.get(roleId) || '-';
    };

    const filteredData = useMemo(() => {
        const usersArray = Array.isArray(users?.data) ? users.data : [];
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

    const handleAdd = () => {
        // TODO: Add modal or routing logic
        setModalOpen(true);
    };

    const handleUserSubmit = (data: any) => {
        console.log('Form Submitted:', data);
        // send data to API here
    };

    const columns: any = [
        { label: 'ID', accessor: 'id', sortable: true },
        { label: 'Name', accessor: 'name', sortable: true },
        { label: 'Email', accessor: 'email', sortable: true },
        { label: 'Phone Number', accessor: 'phoneNumber', sortable: true },
        {
            label: 'Role',
            accessor: 'roleId',
            sortable: true,
            render: (user: User) => getRoleType(user.roleId),
        },
        {
            label: 'Profile Image',
            accessor: 'profileImage',
            sortable: false,
            render: (user: User) => (
                <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
            ),
        },
        { label: 'Status', accessor: 'status', sortable: true },
    ];

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
                totalRecords={Array.isArray(sortedData) ? sortedData.length : 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 25, 50, 100]}
                showPagination={true}
                emptyMessage="No users found"
            />

            <UsersModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleUserSubmit} />

        </div>
    );
};

export default Users;
