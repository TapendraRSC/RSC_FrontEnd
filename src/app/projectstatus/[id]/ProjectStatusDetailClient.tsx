"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Pencil, Plus, Trash2, Upload, Grid3X3, List, Menu, Download } from "lucide-react";
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
import ExportModal from "../../components/Common/ExportModal";

export default function ProjectStatusDetailClient({ params }: { params: any }) {
    const { id } = params;

    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Redux state — plots comes from response.data, total/totalPages from response.pagination
    const { plots, total, totalPages, loading, uploadLoading } = useSelector(
        (state: RootState) => state.plotSlice
    );

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // ✅ Fixed: projectId: id  (was: projectId: params)
    useEffect(() => {
        if (!id) return;
        dispatch(fetchPlots({
            projectId: id,
            page: currentPage,
            limit: pageSize,
            search: searchValue,
            sortBy: sortConfig?.key,
            sortOrder: sortConfig?.direction
        }));
    }, [id, currentPage, pageSize, searchValue, sortConfig, dispatch]);

    // ✅ Columns match API response fields exactly:
    // plotNumber, plotSize, price, onlinePrice, creditPoint, city, facing, status, projectTitle
    const columns: any = [
        {
            label: "Plot No.",
            accessor: "plotNumber",
            mobile: true,
            showTooltip: true,
            sortable: true
        },
        {
            label: "Project",
            accessor: "projectTitle",
            mobile: true,
            minWidth: 150,
            maxWidth: 300,
            showTooltip: true,
            sortable: true
        },
        {
            label: "City",
            accessor: "city",
            mobile: false,
            showTooltip: true,
            sortable: true,
            render: (row: any) => <span>{row.city || '—'}</span>
        },
        {
            label: "Facing",
            accessor: "facing",
            mobile: false,
            showTooltip: true,
            sortable: true,
            render: (row: any) => <span>{row.facing || '—'}</span>
        },
        {
            label: "Plot Size",
            accessor: "plotSize",
            mobile: true,
            showTooltip: true,
            sortable: true
        },
        {
            label: "Price (₹)",
            accessor: "price",
            mobile: true,
            showTooltip: true,
            sortable: true,
            render: (row: any) => (
                <span className="font-medium text-green-600 dark:text-green-400">
                    ₹{row.price ? Number(row.price).toLocaleString() : '—'}
                </span>
            )
        },
        {
            label: "Online Price (₹)",
            accessor: "onlinePrice",
            mobile: false,
            showTooltip: true,
            sortable: true,
            render: (row: any) => (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                    ₹{row.onlinePrice ? Number(row.onlinePrice).toLocaleString() : '—'}
                </span>
            )
        },
        {
            label: "Credit Point",
            accessor: "creditPoint",
            mobile: false,
            showTooltip: true,
            sortable: true,
            render: (row: any) => (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                    ₹{row.creditPoint ? Number(row.creditPoint).toLocaleString() : '0'}
                </span>
            )
        },
        {
            label: "Status",
            accessor: "status",
            mobile: true,
            minWidth: 120,
            maxWidth: 200,
            showTooltip: true,
            sortable: true,
            render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Available'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : row.status === 'Sold'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const { permissions: rolePermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar());
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
            result = await dispatch(addPlot({ ...data, projectId: id }));
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

    const handleFileSelect = async (event: any) => {
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
                dispatch(fetchPlots({ projectId: id, page: currentPage, limit: pageSize }));
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

    // ✅ PlotCard — shows all API fields: plotNumber, projectTitle, city, facing,
    //               plotSize, price, onlinePrice, creditPoint, status
    const PlotCard = ({ plot }: { plot: any }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 hover:shadow-md dark:hover:shadow-lg transition-shadow" style={{ marginTop: "15px" }}>

            {/* Header Row */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        Plot No. {plot.plotNumber}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plot.projectTitle}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${plot.status === 'Available'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : plot.status === 'Sold'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                    {plot.status}
                </span>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Plot Size</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{plot.plotSize || '—'}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">City</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{plot.city || '—'}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Facing</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{plot.facing || '—'}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Credit Point</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{plot.creditPoint ?? '0'}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Price</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{plot.price ? Number(plot.price).toLocaleString() : '—'}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Online Price</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ₹{plot.onlinePrice ? Number(plot.onlinePrice).toLocaleString() : '—'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleOpenEdit(plot)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                   bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 cursor-pointer"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}
                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleOpenDelete(plot)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                   bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Project Plots</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {plots[0]?.projectTitle || "Project Name"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="sticky top-16 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 lg:hidden">
                <div className="flex gap-2">
                    {hasPermission(26, "upload") && (
                        <button
                            onClick={handleUploadClick}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                       bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white cursor-pointer"
                        >
                            {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Upload
                        </button>
                    )}
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleOpenAdd}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                       bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    )}
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center justify-center p-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Project Plots
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {plots[0]?.projectTitle || "Project Name"} &nbsp;•&nbsp; Total: {total} plots
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm
                                       bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white cursor-pointer"
                        >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            Export
                        </button>
                        {hasPermission(26, "upload") && (
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm
                                           bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white cursor-pointer"
                            >
                                {uploadLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
                                Upload
                            </button>
                        )}
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm
                                           bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white cursor-pointer"
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                           focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent
                                           placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500 dark:text-orange-400" />
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {plots.map((plot) => (
                                        <PlotCard key={plot.id} plot={plot} />
                                    ))}
                                </div>
                                {plots.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p>No plots found</p>
                                    </div>
                                )}
                            </>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                                               rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                                               rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table View */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ marginTop: "15px" }}>
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
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleOpenEdit(row)}
                                            className="p-1 transition-colors text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleOpenDelete(row)}
                                            className="p-1 transition-colors text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
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
          <PlotModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSavePlot={handleSavePlot}
    isLoading={loading}
    currentPlot={selectedPlot}
    projectTitle={plots[0]?.projectTitle}  // ✅ yeh add karo
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
                onFileSelect={handleFileSelect}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={plots}
                fileName={`plots_export_${new Date().toISOString().split('T')[0]}`}
                columns={columns}
            />
        </div>
    );
}