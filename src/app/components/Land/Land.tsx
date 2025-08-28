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
        // rolePermissions se id check
        if (!leadPermissionIds.includes(permId)) return false;

        // master list se naam check
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
                console.log("Updating land with ID:", currentLand.id);
                await dispatch(updateLand({ id: currentLand.id, type: formData.type })).unwrap();
            } else {
                console.log("Adding new land");
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{land.type}</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: {land.id}</p>
                </div>
                {land.status && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                    </span>
                )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={hasPermission(22, "edit") ? () => handleEdit(land) : undefined}
                    disabled={!hasPermission(22, "edit")}
                    title={!hasPermission(22, "edit") ? "Access restricted by Admin" : "Edit"}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${hasPermission(22, "edit")
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </button>

                <button
                    onClick={hasPermission(4, "delete") ? () => handleDelete(land) : undefined}
                    disabled={!hasPermission(4, "delete")}
                    title={!hasPermission(4, "delete") ? "Access restricted by Admin" : "Delete"}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${hasPermission(4, "delete")
                            ? "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
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
                        <h1 className="text-lg font-bold text-gray-900">Land Management</h1>
                        <p className="text-xs text-gray-600">Manage your properties</p>
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
                    onClick={hasPermission(21, "add") ? handleAdd : undefined}
                    disabled={!hasPermission(21, "add")}
                    title={!hasPermission(21, "add") ? "Access restricted by Admin" : "Add New Land"}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium ${hasPermission(21, "add")
                        ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    <Plus className="w-5 h-5" />
                    Add New Land
                </button>
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
                        <button
                            onClick={hasPermission(21, "add") ? handleAdd : undefined}
                            disabled={!hasPermission(21, "add")}
                            title={!hasPermission(21, "add") ? "Access restricted by Admin" : "Add Land"}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasPermission(21, "add")
                                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                            Add Land
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
                                placeholder="Search land types..."
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
                                    {paginatedData.map((land) => (
                                        <LandCard key={land.id} land={land} />
                                    ))}
                                </div>

                                {paginatedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-5xl mb-4">🏞️</div>
                                        <p className="text-gray-500 text-lg font-medium">No land properties found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first land property to get started'}
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
                                Total: <span className="font-semibold">{totalRecords}</span> land properties
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View - Mobile & Desktop */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                    <button
                                        onClick={hasPermission(22, "edit") ? () => handleEdit(row) : undefined}
                                        disabled={!hasPermission(22, "edit")}
                                        title={!hasPermission(22, "edit") ? "Access restricted by Admin" : "Edit"}
                                        className={`p-1 rounded transition-colors ${hasPermission(22, "edit")
                                            ? "text-blue-500 hover:text-blue-700 cursor-pointer"
                                            : "text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>

                                    <button
                                        onClick={hasPermission(4, "delete") ? () => handleDelete(row) : undefined}
                                        disabled={!hasPermission(4, "delete")}
                                        title={!hasPermission(4, "delete") ? "Access restricted by Admin" : "Delete"}
                                        className={`p-1 rounded transition-colors ${hasPermission(4, "delete")
                                            ? "text-red-500 hover:text-red-700 cursor-pointer"
                                            : "text-gray-400 cursor-not-allowed"
                                            }`}
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