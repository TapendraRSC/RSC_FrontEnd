"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AppDispatch, RootState } from "../../../../store/store";
import { addPlot, deletePlot, fetchPlots, updatePlot } from "../../../../store/plotSlice";
import PlotModal from "../PlotModal";
import CustomTable from "../../components/Common/CustomTable";
import DeleteConfirmationModal from "../../components/Common/DeleteConfirmationModal";
import { toast } from "react-toastify";

export default function ProjectStatusDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useDispatch<AppDispatch>();

    const { plots, total, totalPages, loading } = useSelector(
        (state: RootState) => state.plotSlice
    );

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

    // Plot modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);

    // Delete modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [plotToDelete, setPlotToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPlots({
            projectId: id,
            page: currentPage,
            limit: pageSize,
            search: searchValue,
            sortBy: sortConfig?.key,
            sortOrder: sortConfig?.direction
        }));
    }, [id, currentPage, pageSize, searchValue, sortConfig, dispatch]);

    const columns: any = [
        { label: "ID", accessor: "id" },
        { label: "Plot Number", accessor: "plotNumber" },
        { label: "City", accessor: "city" },
        { label: "Facing", accessor: "facing" },
        { label: "Sq. Yard", accessor: "sqYard" },
        { label: "Sq. Feet", accessor: "sqFeet" },
        { label: "Remarks", accessor: "remarks" },
        { label: "Status", accessor: "status" },
    ];

    const handleOpenAdd = () => {
        setSelectedPlot(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (row: any) => {
        setSelectedPlot(row);
        setIsModalOpen(true);
    };

    const handleOpenDelete = (row: any) => {
        setPlotToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (plotToDelete) {
            const result = await dispatch(deletePlot(plotToDelete.id));
            if (deletePlot.fulfilled.match(result)) {
                dispatch(fetchPlots({ projectId: id, page: currentPage, limit: pageSize }));
            }
        }
        setIsDeleteModalOpen(false);
        setPlotToDelete(null);
    };

    const handleSavePlot = async (data: any) => {
        let result;
        if (selectedPlot) {
            result = await dispatch(updatePlot({ id: selectedPlot.id, data }));
            if (updatePlot.fulfilled.match(result)) {
                toast.success("Plot updated successfully!");
            } else {
                toast.error("Failed to update plot.");
            }
        } else {
            result = await dispatch(addPlot(data));
            if (addPlot.fulfilled.match(result)) {
                toast.success("Plot added successfully!");
            } else {
                toast.error("Failed to add plot.");
            }
        }

        if (updatePlot.fulfilled.match(result) || addPlot.fulfilled.match(result)) {
            setIsModalOpen(false);
            dispatch(fetchPlots({ projectId: id, page: currentPage, limit: pageSize }));
        }
    };


    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Project Plots
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Plots for project ID {id}
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add New
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <CustomTable<any>
                    data={plots}
                    columns={columns}
                    isLoading={loading}
                    title="Plot Details"
                    searchValue={searchValue}
                    onSearchChange={(val) => {
                        setSearchValue(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search plots..."
                    showSearch
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalRecords={total}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    showPagination
                    emptyMessage="No plots found"
                    showColumnToggle
                    hiddenColumns={hiddenColumns}
                    onColumnVisibilityChange={setHiddenColumns}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenEdit(row)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleOpenDelete(row)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
                {loading && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                )}
            </div>

            {/* Plot Modal */}
            <PlotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePlot={handleSavePlot}
                isLoading={loading}
                currentPlot={selectedPlot}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete plot number "${plotToDelete?.plotNumber}"?`}
                Icon={Trash2}
            />
        </div>
    );
}
