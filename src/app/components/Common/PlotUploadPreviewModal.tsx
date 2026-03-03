'use client';
import React, { useRef, useState, useEffect } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, Download, CloudUpload, CheckCircle, XCircle, FileWarning } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";

interface PlotUploadPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmUpload: () => void;
    fileName: string;
    previewData: any[];
    isLoading: boolean;
    totalRows: number;
    onFileSelect: (file: File) => void;
    projectTitle?: string;
    failedPlotsFileUrl?: string;
}

const PlotUploadPreviewModal: React.FC<PlotUploadPreviewModalProps> = ({
    isOpen,
    onClose,
    onConfirmUpload,
    fileName,
    previewData,
    isLoading,
    totalRows,
    onFileSelect,
    projectTitle,
    failedPlotsFileUrl,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [localPreviewData, setLocalPreviewData] = useState<any[]>([]);
    const [localFileName, setLocalFileName] = useState("");
    const [localTotalRows, setLocalTotalRows] = useState(0);
    const [isValidHeaders, setIsValidHeaders] = useState(false);
    const [validationError, setValidationError] = useState("");

    // ✅ Allowed headers for Plot upload (case-insensitive)
    const allowedHeaders = [
        "plotnumber", "plotno", "plot no", "plot no.",
        "city",
        "facing",
        "plotsize", "plot size",
        "price",
        "onlineprice", "online price",
        "creditpoint", "credit point",
        "status"
    ];

    // ✅ Header mapping to normalize different variations
    const headerMapping: { [key: string]: string } = {
        "plotnumber": "plotNumber",
        "plotno": "plotNumber",
        "plot no": "plotNumber",
        "plot no.": "plotNumber",
        "city": "city",
        "facing": "facing",
        "plotsize": "plotSize",
        "plot size": "plotSize",
        "price": "price",
        "onlineprice": "onlinePrice",
        "online price": "onlinePrice",
        "creditpoint": "creditPoint",
        "credit point": "creditPoint",
        "status": "status"
    };

    // ✅ Required headers (at least one of these must be present)
    const requiredHeaders = ["plotnumber", "plotno", "plot no", "plot no."];

    const normalizeHeader = (header: string): string => {
        return header.toLowerCase().trim().replace(/[₹()]/g, "").trim();
    };

    const validateHeaders = (headers: string[]): boolean => {
        const normalizedHeaders = headers.map(normalizeHeader);

        // Check if at least one required header (plotNumber variant) is present
        const hasPlotNumber = normalizedHeaders.some(h =>
            requiredHeaders.includes(h)
        );

        if (!hasPlotNumber) {
            const msg = "Excel must contain 'Plot No.' or 'plotNumber' column";
            setIsValidHeaders(false);
            setValidationError(msg);
            toast.error(msg);
            return false;
        }

        // Check for any invalid headers
        const invalidHeaders = normalizedHeaders.filter(h => {
            // Skip empty headers
            if (!h) return false;
            // Check if header matches any allowed header
            return !allowedHeaders.some(allowed =>
                h === allowed || h.includes(allowed) || allowed.includes(h)
            );
        });

        if (invalidHeaders.length > 0) {
            const msg = `Invalid headers found: ${invalidHeaders.join(", ")}. Allowed: Plot No., City, Facing, Plot Size, Price, Online Price, Credit Point, Status`;
            setIsValidHeaders(false);
            setValidationError(msg);
            toast.error(msg);
            return false;
        }

        setIsValidHeaders(true);
        setValidationError("");
        return true;
    };

    const mapHeaders = (headers: string[]): string[] => {
        return headers.map(header => {
            const normalized = normalizeHeader(header);
            return headerMapping[normalized] || header;
        });
    };

    // Parse CSV
    const parseCSV = (file: File): Promise<{ data: any[]; headers: string[] }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split("\n").filter((line) => line.trim());
                    if (lines.length < 2) throw new Error("No data found");

                    const rawHeaders = lines[0]
                        .split(",")
                        .map((h) => h.replace(/["']/g, "").trim())
                        .filter((h) => h);

                    if (!validateHeaders(rawHeaders)) {
                        reject(new Error("Invalid headers"));
                        return;
                    }

                    const mappedHeaders = mapHeaders(rawHeaders);

                    const data = lines
                        .slice(1)
                        .map((line) => {
                            const values = line
                                .split(",")
                                .map((v) => v.replace(/["']/g, "").trim());
                            const row: any = {};
                            mappedHeaders.forEach((header, i) => {
                                row[header] = values[i] || "";
                            });
                            return row;
                        })
                        .filter((row) =>
                            Object.values(row).some(
                                (val) => val && val.toString().trim().length > 0
                            )
                        );

                    resolve({ data, headers: mappedHeaders });
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    };

    // Parse Excel
    const parseExcel = (file: File): Promise<{ data: any[]; headers: string[] }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json<any[]>(firstSheet, {
                        header: 1,
                    });

                    if (jsonData.length < 2) throw new Error("No data found");

                    const rawHeaders = jsonData[0]
                        .map((h) => String(h || "").trim())
                        .filter((h) => h);

                    if (!validateHeaders(rawHeaders)) {
                        reject(new Error("Invalid headers"));
                        return;
                    }

                    const mappedHeaders = mapHeaders(rawHeaders);

                    const parsedData = jsonData
                        .slice(1)
                        .map((row: any[]) => {
                            const obj: any = {};
                            mappedHeaders.forEach((header, i) => {
                                obj[header] = row[i] ? String(row[i]).trim() : "";
                            });
                            return obj;
                        })
                        .filter((row) =>
                            Object.values(row).some(
                                (val) => val && val.toString().trim().length > 0
                            )
                        );

                    resolve({ data: parsedData, headers: mappedHeaders });
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLocalFileName(file.name);

            try {
                let result: { data: any[]; headers: string[] };

                if (file.name.toLowerCase().endsWith(".csv")) {
                    result = await parseCSV(file);
                } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
                    result = await parseExcel(file);
                } else {
                    throw new Error("Only CSV, XLSX, XLS files allowed");
                }

                setLocalPreviewData(result.data.slice(0, 10));
                setLocalTotalRows(result.data.length);
                onFileSelect(file);

            } catch (error: any) {
                setLocalPreviewData([]);
                setLocalTotalRows(0);
                setIsValidHeaders(false);
                setValidationError(error.message);

                if (error.message !== "Invalid headers") {
                    toast.error(error.message);
                }
            }
        }
    };

    // const handleDownloadSample = () => {
    //     const headers = ["Plot No.", "City", "Facing", "Plot Size", "Price", "Online Price", "Credit Point", "Status"];
    //     const rows = [
    //         ["101", "Ahmedabad", "East", "1200 sq yard", "500000", "480000", "100", "Available"],
    //         ["102", "Surat", "West", "1500 sq yard", "750000", "720000", "150", "Available"],
    //         ["103", "Mumbai", "North", "1000 sq yard", "1200000", "1150000", "200", "Company Reserved"],
    //         ["104", "Rajkot", "South", "1800 sq yard", "600000", "580000", "120", "Hold"],
    //     ];

    //     const csvContent = [
    //         headers.map((h) => `"${h}"`).join(","),
    //         ...rows.map((r) => r.map(cell => `"${cell}"`).join(",")),
    //     ].join("\n");

    //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "Sample_Plots.csv";
    //     a.click();
    //     URL.revokeObjectURL(url);
    // };




    const handleDownloadSample = () => {
        const headers = ["Plot No.", "City", "Facing", "Plot Size", "Price", "Online Price", "Credit Point", "Status"];
        const rows = [
            ["101", "Ahmedabad", "East", "1200 sq yard", "500000", "480000", "100", "Available"],
            ["102", "Surat", "West", "1500 sq yard", "750000", "720000", "150", "Available"],
            ["103", "Mumbai", "North", "1000 sq yard", "1200000", "1150000", "200", "Company Reserved"],
            ["104", "Rajkot", "South", "1800 sq yard", "600000", "580000", "120", "Hold"],
        ];

        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...rows.map((r) => r.map(cell => `"${cell}"`).join(",")),
        ].join("\n");


        const now = new Date();

        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();

        const hours = String(now.getHours()).padStart(2, "0"); // 24 hour
        const minutes = String(now.getMinutes()).padStart(2, "0");

        const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;

        const fileName = `Sample_Plots_${formattedDate}.csv`;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };


    const handleDownloadFailedPlots = () => {
        if (failedPlotsFileUrl) {
            window.open(failedPlotsFileUrl, '_blank');
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setLocalPreviewData([]);
            setLocalFileName("");
            setLocalTotalRows(0);
            setIsValidHeaders(false);
            setValidationError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const tableFileName = localPreviewData.length > 0 ? localFileName : "Sample_Plots.csv";
    const tableRows = localPreviewData.length > 0 ? localTotalRows : 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Upload Plots
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {projectTitle ? `Project: ${projectTitle}` : "Upload plot data from a file"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Failed Plots Alert */}
                {failedPlotsFileUrl && (
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                    <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-700 dark:text-red-300 text-sm sm:text-base">
                                        Some plots failed to upload
                                    </p>
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                                        Download the file to see which plots failed and why
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadFailedPlots}
                                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                Download Failed Plots
                            </button>
                        </div>
                    </div>
                )}

                {/* File Info */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div
                                className={`p-2 rounded-lg ${localPreviewData.length > 0 && isValidHeaders
                                    ? "bg-green-100 dark:bg-green-900"
                                    : localPreviewData.length > 0 && !isValidHeaders
                                        ? "bg-red-100 dark:bg-red-900"
                                        : "bg-yellow-100 dark:bg-yellow-900"
                                    }`}
                            >
                                {localPreviewData.length > 0 ? (
                                    isValidHeaders ? (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                                    )
                                ) : (
                                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                    {tableFileName}
                                </p>
                                {localPreviewData.length > 0 ? (
                                    <p
                                        className={`text-xs sm:text-sm font-medium ${isValidHeaders
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                            }`}
                                    >
                                        {isValidHeaders
                                            ? "✓ Valid format - Ready to upload"
                                            : "✗ Invalid / extra headers"}
                                    </p>
                                ) : (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        {tableRows} rows found - Upload file to preview
                                    </p>
                                )}
                                {validationError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 line-clamp-2">
                                        {validationError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadSample}
                                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                Download Sample
                            </button>
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-600 transition-colors"
                            >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                Upload File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Table */}
                {localPreviewData.length > 0 ? (
                    <div className="flex-1 overflow-hidden p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Data Preview (First 10 rows)
                            </h3>
                            <p
                                className={`text-sm ${isValidHeaders
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {isValidHeaders
                                    ? `✓ Headers valid. ${localTotalRows} total rows ready.`
                                    : "✗ Fix headers using sample download."}
                            </p>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-80 overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                        {localPreviewData[0] &&
                                            Object.keys(localPreviewData[0]).map((key) => (
                                                <th
                                                    key={key}
                                                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]"
                                                >
                                                    {key}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {localPreviewData.slice(0, 10).map((row, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-50 dark:bg-gray-800"
                                            }
                                        >
                                            {Object.values(row).map((value, cellIndex) => (
                                                <td
                                                    key={cellIndex}
                                                    className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[150px] truncate"
                                                    title={String(value)}
                                                >
                                                    {String(value) || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-800">
                        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center border-4 border-dashed border-orange-200 dark:border-orange-700 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                                    onClick={handleUploadClick}
                                >
                                    <CloudUpload className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div
                                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full bg-orange-500 dark:bg-orange-400 flex items-center justify-center animate-pulse cursor-pointer"
                                    onClick={handleUploadClick}
                                >
                                    <Upload className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-900 dark:text-gray-100 text-center">
                                Upload Plot Data
                            </h3>
                            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                                Select a CSV or Excel file to upload plot data for this project.
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4" />
                        <span>Headers: Plot No., City, Facing, Plot Size, Price, Online Price, Credit Point, Status</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirmUpload}
                            disabled={isLoading || localPreviewData.length === 0 || !isValidHeaders}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    {localPreviewData.length > 0 ? "Confirm & Upload" : "Upload Data"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotUploadPreviewModal;