"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Grid3X3, List, Menu, Search } from "lucide-react";
import LandModal from "./LandModal";
import CustomTable from "../Common/CustomTable";
import DeleteConfirmationModal from "../Common/DeleteConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
    fetchLands,
    addLand,
    updateLand,
    deleteLand,
} from "../../../../store/landSlice";
import { fetchPermissions } from "../../../../store/permissionSlice";
import { fetchRolePermissionsSidebar } from "../../../../store/sidebarPermissionSlice";

type Land = {
    id: number;
    type: string;
    status?: number;
};

interface SortConfig {
    key: string;
    direction: "asc" | "desc";
}

const Land: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading } = useSelector((state: RootState) => state.lands);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLand, setCurrentLand] = useState<Land | any>(0);
    const [searchValue, setSearchValue] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState<any>(1);
    const [pageSize, setPageSize] = useState<any>(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [landToDelete, setLandToDelete] = useState<Land | null>(null);
    // Mobile responsive states
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Fetch lands on mount
    useEffect(() => {
        dispatch(fetchLands({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const data: Land[] = list?.roles || [];
    const totalRecords = list?.total || 0;
    const totalPages = list?.totalPages || 1;

    const filteredData = useMemo(() => {
        return (data ?? []).filter((item) =>
            item?.type?.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [data, searchValue]);

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
            (p: any) => p.pageName === 'Land'
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

    const sortedData = useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig) {
            sortableData.sort((a: any, b: any) => {
                if (a[sortConfig.key as keyof Land] < b[sortConfig.key as keyof Land]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key as keyof Land] > b[sortConfig.key as keyof Land]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

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

    const handleSaveLand = async (formData: { type: string }) => {
        try {
            if (currentLand && typeof currentLand === 'object' && currentLand.id != null) {
                await dispatch(updateLand({ id: currentLand.id, type: formData.type })).unwrap();
            } else {
                await dispatch(addLand({ type: formData.type })).unwrap();
            }
            await dispatch(fetchLands({ page: currentPage, limit: pageSize }));
            setIsModalOpen(false);
            setCurrentLand(null);
        } catch (err) {
            console.error("Failed to save land:", err);
        }
    };

    const handleEdit = (land: Land) => {
        setCurrentLand(land);
        setIsModalOpen(true);
    };

    const handleDelete = (land: Land) => {
        setLandToDelete(land);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (landToDelete) {
            await dispatch(deleteLand(landToDelete.id));
            dispatch(fetchLands({ page: currentPage, limit: pageSize }));
        }
        setIsDeleteModalOpen(false);
        setLandToDelete(null);
    };

    const handleAdd = () => {
        setCurrentLand(null);
        setIsModalOpen(true);
    };

    const columns: any = [
        {
            label: "ID",
            accessor: "id",
            sortable: true,
            mobile: false // Hide on mobile
        },
        {
            label: "Land Type",
            accessor: "type",
            sortable: true,
            mobile: true // Show on mobile
        },
    ];

    // Mobile card component for land items
    const LandCard = ({ land }: { land: Land }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow" style={{ marginTop: "15px" }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{land.type}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {land.id}</p>
                </div>
                {land.status && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                        Active
                    </span>
                )}
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {/* Edit Button */}
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleEdit(land)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-gray-600 cursor-pointer"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}
                {/* Delete Button */}
                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleDelete(land)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-gray-600 cursor-pointer"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Land Management</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage your properties</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Action Button */}
            <div className="sticky top-16 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
                {hasPermission(21, "add") && (
                    <button
                        onClick={handleAdd}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium
              bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        title="Add New Land"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Land
                    </button>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Land Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and organize your land properties
                        </p>
                    </div>
                    <div>
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                                title="Add Land"
                            >
                                <Plus className="w-4 h-4" />
                                Add Land
                            </button>
                        )}
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
                                placeholder="Search land types..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {paginatedData.map((land) => (
                                        <LandCard key={land.id} land={land} />
                                    ))}
                                </div>
                                {paginatedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🏞️</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No land properties found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first land property to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {/* Mobile Summary */}
                        <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Total: <span className="font-semibold">{totalRecords}</span> land properties
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View - Mobile & Desktop */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" style={{ marginTop: "15px" }}>
                        <CustomTable<Land>
                            data={paginatedData}
                            columns={columns}
                            isLoading={loading}
                            title="Land Properties"
                            searchValue={searchValue}
                            onSearchChange={handleSearch}
                            searchPlaceholder="Search land type..."
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
                            emptyMessage="No lands found"
                            showColumnToggle
                            hiddenColumns={hiddenColumns}
                            onColumnVisibilityChange={handleColumnVisibilityChange}
                            actions={(row) => (
                                <div className="flex gap-1 sm:gap-2">
                                    {/* Edit Button */}
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="p-1 rounded text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    {/* Delete Button */}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="p-1 rounded text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LandModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentLand(null);
                }}
                onSave={handleSaveLand}
                initialData={currentLand}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the land type "${landToDelete?.type}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default Land;
