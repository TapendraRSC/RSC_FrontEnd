"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
    console.log(currentLand, "currentLand")
    const [searchValue, setSearchValue] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState<any>(1);
    const [pageSize, setPageSize] = useState<any>(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [landToDelete, setLandToDelete] = useState<Land | null>(null);

    // Fetch lands on mount
    useEffect(() => {
        dispatch(fetchLands({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    // ✅ Adapted to your API response
    const data: Land[] = list?.roles || [];
    const totalRecords = list?.total || 0;
    const totalPages = list?.totalPages || 1;

    const filteredData = useMemo(() => {
        return (data ?? []).filter((item) =>
            item?.type?.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [data, searchValue]);

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
        },
        {
            label: "Land Type",
            accessor: "type",
            sortable: true,
        },
    ];

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            {/* Header */}
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
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Land
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
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
