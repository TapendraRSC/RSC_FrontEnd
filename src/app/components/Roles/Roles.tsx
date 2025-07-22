'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import CustomTable from '../Common/CustomTable';
import RolesModal from './RolesModal';
import { AppDispatch, RootState } from '../../../../store/store';
import { getRoles } from '../../../../store/roleSlice';

type SortConfig = {
    key: keyof Role;
    direction: 'asc' | 'desc';
} | null;

type Role = {
    id: number;
    roleType: string;
};

export default function RolesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: roles, loading: isLoading } = useSelector((state: RootState) => state.roles);

    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getRoles());
    }, [dispatch]);

    const filteredData = useMemo(() => {
        const usersArray = Array.isArray(roles) ? roles : [];
        if (!searchValue) return usersArray;

        return usersArray.filter((role: any) =>
            Object.values(role).some((val) =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    }, [searchValue, roles]);

    const sortedData = useMemo(() => {
        const dataArray = Array.isArray(filteredData) ? filteredData : [];
        if (!sortConfig) return dataArray;

        return [...dataArray].sort((a: any, b: any) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    const paginatedData: any = useMemo(() => {
        const dataArray = Array.isArray(sortedData) ? sortedData : [];
        const startIndex = (currentPage - 1) * pageSize;
        return dataArray.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

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

    const handleEdit = (row: Role) => {
        console.log('Edit role:', row);
    };

    const handleDelete = (row: Role) => {
        console.log('Delete role:', row);
    };

    const handleAdd = () => {
        setIsModalOpen(true);
    };

    const handleAddRole = (roleType: string) => {
        console.log('Adding new role:', { roleType });
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
                data={paginatedData}
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
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={sortedData.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 25, 50, 100]}
                showPagination={true}
                emptyMessage="No roles found"
            />

            <RolesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddRole={handleAddRole}
            />
        </div>
    );
}
