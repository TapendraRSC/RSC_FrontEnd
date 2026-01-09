'use client';
import React, { useRef, useState, useEffect } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, Download, CloudUpload, CheckCircle, XCircle, FileWarning } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";

interface UploadPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmUpload: () => void;
    fileName: string;
    previewData: any[];
    isLoading: boolean;
    totalRows: number;
    onFileSelect: (file: File) => void;
    failedLeadsFileUrl?: string;
}

const UploadPreviewModal: React.FC<UploadPreviewModalProps> = ({
    isOpen,
    onClose,
    onConfirmUpload,
    fileName,
    previewData,
    isLoading,
    totalRows,
    onFileSelect,
    failedLeadsFileUrl, // NEW PROP
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [localPreviewData, setLocalPreviewData] = useState<any[]>([]);
    const [localFileName, setLocalFileName] = useState("");
    const [localTotalRows, setLocalTotalRows] = useState(0);
    const [isValidHeaders, setIsValidHeaders] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Allowed headers list (case-insensitive)
    const allowedHeaders = ["name", "email", "phone", "city", "state", "platform"];

    // ✅ Condition:
    // 1) Headers must be ONLY from allowedHeaders (subset allowed)
    // 2) At least ONE allowed header must be present
    // 3) If none of 6 are present OR any extra header -> error + block
    const validateHeaders = (headers: string[]): boolean => {
        const normalizedHeaders = headers.map((h) =>
            h.toLowerCase().trim().replace(/\s+/g, "")
        );

        // Headers which are allowed and present
        const presentAllowed = normalizedHeaders.filter((h) =>
            allowedHeaders.includes(h)
        );

        // 1) if none of 6 allowed headers exist
        if (presentAllowed.length === 0) {
            const msg =
                "Excel must contain at least one of these headers: " +
                allowedHeaders.join(", ");
            setIsValidHeaders(false);
            setValidationError(msg);
            toast.error(msg);
            return false;
        }

        // 2) extra headers which are not in allowed list
        const extraHeaders = normalizedHeaders.filter(
            (h) => !allowedHeaders.includes(h)
        );

        if (extraHeaders.length > 0) {
            const msg =
                "Only these headers are allowed: " +
                allowedHeaders.join(", ") +
                ". Invalid: " +
                extraHeaders.join(", ");
            setIsValidHeaders(false);
            setValidationError(msg);
            toast.error(msg);
            return false;
        }

        // ok: subset of allowed headers
        setIsValidHeaders(true);
        setValidationError("");
        return true;
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

                    // Extract headers (first row)
                    const rawHeaders = lines[0]
                        .split(",")
                        .map((h) => h.replace(/["']/g, "").trim())
                        .filter((h) => h);

                    if (!validateHeaders(rawHeaders)) {
                        reject(new Error("Invalid headers"));
                        return;
                    }

                    // use only allowed + present headers
                    const normalized = rawHeaders.map((h) =>
                        h.toLowerCase().trim().replace(/\s+/g, "")
                    );
                    const headers = rawHeaders.filter((_, idx) =>
                        allowedHeaders.includes(normalized[idx])
                    );

                    const data = lines
                        .slice(1)
                        .map((line) => {
                            const values = line
                                .split(",")
                                .map((v) => v.replace(/["']/g, "").trim());
                            const row: any = {};
                            headers.forEach((header, i) => {
                                row[header] = values[i] || "";
                            });
                            return row;
                        })
                        .filter((row) =>
                            Object.values(row).some(
                                (val) => val && val.toString().trim().length > 0
                            )
                        );

                    resolve({ data, headers });
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

                    const normalized = rawHeaders.map((h) =>
                        h.toLowerCase().trim().replace(/\s+/g, "")
                    );
                    const headers = rawHeaders.filter((_, idx) =>
                        allowedHeaders.includes(normalized[idx])
                    );

                    const parsedData = jsonData
                        .slice(1)
                        .map((row: any[]) => {
                            const obj: any = {};
                            headers.forEach((header, i) => {
                                obj[header] = row[i] ? String(row[i]).trim() : "";
                            });
                            return obj;
                        })
                        .filter((row) =>
                            Object.values(row).some(
                                (val) => val && val.toString().trim().length > 0
                            )
                        );

                    resolve({ data: parsedData, headers });
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

    // validateHeaders जैसा है वैसा रहने दो (toast यही पर रहेगा)

    // handleFileChange में catch बदलो:
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
                    // yeh file-type error hai, iske लिए toast chahiye
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

                // ✅ sirf non-header errors pe toast karo
                if (error.message !== "Invalid headers") {
                    toast.error(error.message);
                }
            }
        }
    };


    const handleDownloadSample = () => {
        const headers = ["name", "email", "phone", "city", "state", "platform"];
        const rows = [
            ["John Doe", "john@example.com", "9876543210", "Ahmedabad", "Gujarat", "Website"],
            ["Jane Smith", "jane@example.com", "9876543211", "Surat", "Gujarat", "Facebook"],
            ["Rahul Patel", "rahul@example.com", "9876543212", "Mumbai", "Maharashtra", "Instagram"],
        ];

        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...rows.map((r) => `"${r.join('","')}"`),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Sample_Leads.csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleDownloadFailedLeads = () => {
        if (failedLeadsFileUrl) {
            window.open(failedLeadsFileUrl, '_blank');
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

    const tableFileName =
        localPreviewData.length > 0 ? localFileName : "Sample_Leads.csv";
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
                                Upload Leads
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                Upload your leads data from a file
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
                {failedLeadsFileUrl && (
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                    <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-700 dark:text-red-300 text-sm sm:text-base">
                                        Some leads failed to upload
                                    </p>
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                                        Download the file to see which leads failed and why
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadFailedLeads}
                                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                Download Failed Leads
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
                                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors"
                            >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                Upload From Your System
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.csv"
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

                        {/* Auto height, but max 10-rows jaisi; uske baad vertical + horizontal scroll */}
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

                        {/* {localTotalRows > 10 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                ... and {localTotalRows - 10} more rows
                            </p>
                        )} */}
                    </div>


                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-800">
                        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border-4 border-dashed border-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                    onClick={handleUploadClick}
                                >
                                    <CloudUpload className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 text-blue-500 dark:text-blue-400" />
                                </div>
                                <div
                                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center animate-pulse cursor-pointer"
                                    onClick={handleUploadClick}
                                >
                                    <Upload className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-900 dark:text-gray-100 text-center">
                                Upload from your system
                            </h3>
                            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                                Select a file from your device to preview and upload leads data.
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4" />
                        <span>Headers must come only from: name, email, phone, city, state, platform</span>
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
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
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

export default UploadPreviewModal;