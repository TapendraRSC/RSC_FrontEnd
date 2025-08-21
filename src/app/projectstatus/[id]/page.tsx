"use client";

import { use } from "react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { AppDispatch, RootState } from "../../../../store/store";
import { addPlot, deletePlot, fetchPlots, updatePlot, uploadPlotData } from "../../../../store/plotSlice";
import PlotModal from "../PlotModal";
import CustomTable from "../../components/Common/CustomTable";
import DeleteConfirmationModal from "../../components/Common/DeleteConfirmationModal";
import UploadPreviewModal from "../../components/Common/UploadPreviewModal";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ProjectStatusDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { plots, total, totalPages, loading, uploadLoading } = useSelector(
        (state: RootState) => state.plotSlice
    );

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [plotToDelete, setPlotToDelete] = useState<any>(null);

    // Upload preview modal states
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

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
        { label: "Land Type", accessor: "landType" },
        { label: "Project Title", accessor: "projectTitle" },
        { label: "Sq. Yard", accessor: "sqYard" },
        { label: "Sq. Feet", accessor: "sqFeet" },
        { label: "Price", accessor: "price" },
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

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Helper functions for file processing
    const processCSV = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    reject(new Error(`CSV parsing error: ${error.message}`));
                }
            });
        });
    };

    const processExcel = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (jsonData.length === 0) {
                        reject(new Error('Excel file is empty'));
                        return;
                    }

                    // Convert to objects with headers
                    const headers = jsonData[0] as string[];
                    const rows = jsonData.slice(1) as any[][];
                    const parsedData = rows.map(row => {
                        const obj: any = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    resolve(parsedData);
                } catch (error: any) {
                    reject(new Error(`Excel parsing error: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read Excel file'));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
            toast.error('Please upload a CSV or Excel file');
            return;
        }

        try {
            let parsedData: any[] = [];

            // Parse the file to show preview
            if (fileExtension === 'csv') {
                parsedData = await processCSV(file);
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                parsedData = await processExcel(file);
            }

            if (parsedData.length === 0) {
                toast.error('No data found in the file');
                return;
            }

            // Set preview data and show modal
            setPreviewData(parsedData);
            setSelectedFile(file);
            setFileName(file.name);
            setIsUploadPreviewOpen(true);

        } catch (error) {
            console.error('File parsing error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process file');
        } finally {
            // Clear the input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        try {
            const result = await dispatch(uploadPlotData({
                projectId: id,
                file: selectedFile
            }));

            if (uploadPlotData.fulfilled.match(result)) {
                toast.success("File uploaded successfully!");
                setIsUploadPreviewOpen(false);
                // Refresh the plots list after successful upload
                dispatch(fetchPlots({
                    projectId: id,
                    page: currentPage,
                    limit: pageSize
                }));
                // Clear states
                setSelectedFile(null);
                setPreviewData([]);
                setFileName("");
            } else {
                toast.error(result.payload as string || "Failed to upload file");
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Failed to upload file');
        }
    };

    const handleClosePreview = () => {
        setIsUploadPreviewOpen(false);
        setSelectedFile(null);
        setPreviewData([]);
        setFileName("");
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
                <div className="flex gap-2">
                    <button
                        onClick={handleUploadClick}
                        disabled={uploadLoading}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                    >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                        Upload
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
            />

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

            <PlotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSavePlot={handleSavePlot}
                isLoading={loading}
                currentPlot={selectedPlot}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete plot number "${plotToDelete?.plotNumber}"?`}
                Icon={Trash2}
            />

            <UploadPreviewModal
                isOpen={isUploadPreviewOpen}
                onClose={handleClosePreview}
                onConfirmUpload={handleConfirmUpload}
                fileName={fileName}
                previewData={previewData}
                isLoading={uploadLoading}
                totalRows={previewData.length}
            />
        </div>
    );
}