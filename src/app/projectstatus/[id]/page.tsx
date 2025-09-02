"use client";

import { use } from "react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Pencil, Plus, Trash2, Upload, Filter, Grid3X3, List, Menu } from "lucide-react";
import { AppDispatch, RootState } from "../../../../store/store";
import { addPlot, deletePlot, fetchPlots, updatePlot, uploadPlotData } from "../../../../store/plotSlice";
import PlotModal from "../PlotModal";
import CustomTable from "../../components/Common/CustomTable";
import DeleteConfirmationModal from "../../components/Common/DeleteConfirmationModal";
import UploadPreviewModal from "../../components/Common/UploadPreviewModal";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { fetchPermissions } from "../../../../store/permissionSlice";
import { fetchRolePermissionsSidebar } from "../../../../store/sidebarPermissionSlice";

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

    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (!id) return; // wait for id
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
        {
            label: "Plot No.", accessor: "plotNumber", mobile: true,
            showTooltip: true
        },
        {
            label: "City", accessor: "city", mobile: true,
            showTooltip: true
        },
        {
            label: "Facing", accessor: "facing", mobile: false,
            showTooltip: true
        },
        {
            label: "Land Type", accessor: "landType", mobile: false,
            showTooltip: true
        },
        {
            label: "Project", accessor: "projectTitle", mobile: false, minWidth: 200,
            maxWidth: 500,
            showTooltip: true
        },
        {
            label: "Sq. Yard", accessor: "sqYard", mobile: true,
            showTooltip: true
        },
        {
            label: "Sq. Feet", accessor: "sqFeet", mobile: false,
            showTooltip: true
        },
        {
            label: "Price", accessor: "price", mobile: true,
            showTooltip: true
        },
        {
            label: "Status", accessor: "status", mobile: true, minWidth: 150,
            maxWidth: 300,
            showTooltip: true
        },
    ];

    const { permissions: rolePermissions, loading: rolePermissionsLoading } =
        useSelector((state: RootState) => state.sidebarPermissions);

    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar()); // roleId backend se mil jayega
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Plot Status'
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

            if (fileExtension === 'csv') {
                parsedData = await processCSV(file);
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                parsedData = await processExcel(file);
            }

            if (parsedData.length === 0) {
                toast.error('No data found in the file');
                return;
            }

            setPreviewData(parsedData);
            setSelectedFile(file);
            setFileName(file.name);
            setIsUploadPreviewOpen(true);

        } catch (error) {
            console.error('File parsing error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process file');
        } finally {
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
                dispatch(fetchPlots({
                    projectId: id,
                    page: currentPage,
                    limit: pageSize
                }));
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

    const PlotCard = ({ plot }: { plot: any }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">{plot.plotNumber}</h3>
                    <p className="text-sm text-gray-600">{plot.city}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${plot.status === 'Available' ? 'bg-green-100 text-green-800' :
                    plot.status === 'Sold' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {plot.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-500 block">Sq. Yard</span>
                    <span className="font-medium">{plot.sqYard?.toLocaleString() || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500 block">Price</span>
                    <span className="font-semibold text-green-600">
                        ₹{plot.price?.toLocaleString() || 'N/A'}
                    </span>
                </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
                {/* Edit Button */}
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleOpenEdit(plot)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                   bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}

                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleOpenDelete(plot)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                   bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Project Plots</h1>
                        <p className="text-xs text-gray-600">ID: {id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="sticky top-16 z-20 bg-white border-b border-gray-100 px-4 py-3 lg:hidden">
                <div className="flex gap-2">
                    {/* Upload Button */}
                    {hasPermission(20, "upload") && (
                        <button
                            onClick={handleUploadClick}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                   bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            title="Upload"
                        >
                            {uploadLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            Upload
                        </button>
                    )}

                    {/* Add New Button */}
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleOpenAdd}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                   bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            title="Add New"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    )}

                </div>
            </div>

            <div className="hidden lg:block p-6">
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
                        {hasPermission(20, "upload") && (
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base
                   bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                                title="Upload"
                            >
                                {uploadLoading ? (
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                                Upload
                            </button>
                        )}

                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base
                   bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                title="Add New"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                Add New
                            </button>
                        )}

                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                {/* Mobile Grid View */}
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search plots..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {plots.map((plot) => (
                                        <PlotCard key={plot.id} plot={plot} />
                                    ))}
                                </div>

                                {plots.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No plots found</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table View - Mobile & Desktop */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                <div className="flex gap-1 sm:gap-2">
                                    {/* Edit Button */}
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleOpenEdit(row)}
                                            className="p-1 transition-colors text-blue-500 hover:text-blue-700 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}

                                    {/* Delete Button */}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleOpenDelete(row)}
                                            className="p-1 transition-colors text-red-500 hover:text-red-700 cursor-pointer"
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