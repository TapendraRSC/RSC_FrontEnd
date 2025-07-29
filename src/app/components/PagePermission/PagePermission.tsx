// components/PagePermission.tsx
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import PagePermissionModal from './PagePermissionModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { fetchPages, addPage, updatePage, deletePage } from '../../../../store/pagePermissionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';

interface PagePermission {
    id: number;
    pageName: string;
}

interface SortConfig {
    key: keyof PagePermission;
    direction: 'asc' | 'desc';
}

const PagePermission: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPermission, setCurrentPermission] = useState<PagePermission | null>(null);
    const [permissionToDelete, setPermissionToDelete] = useState<PagePermission | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.pages);

    useEffect(() => {
        dispatch(fetchPages({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

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

    const filteredData = list?.data?.permissions?.filter((item: any) =>
        item.pageName.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

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


    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page Permissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage page permissions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Page Permission
                </button>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
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
                        totalPages={list?.data?.totalPages || 1}
                        pageSize={pageSize}
                        totalRecords={list?.data?.total || 0}
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
