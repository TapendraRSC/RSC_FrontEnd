'use client';
import React, { useRef } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, Download, CloudUpload } from "lucide-react";

interface UploadPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmUpload: () => void;
    fileName: string;
    previewData: any[];
    isLoading: boolean;
    totalRows: number;
    onFileSelect: (file: File) => void;
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
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    if (!isOpen) return null;

    const tableFileName = previewData.length > 0 ? fileName : "Sample_Leads.xlsx";
    const tableRows = previewData.length > 0 ? totalRows : 0;

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const handleDownloadSample = () => {
        const headers = [
            "Name",
            "Email",
            "Phone",
            "Assigned Person",
            "Lead Status",
            "Lead Stage",
            "Current Status",
            "Platform Type",
            "Plot Number",
            "Plot Price",
            "City",
            "State",
        ];

        const rows = [
            ["John Doe", "john@example.com", "9876543210", "Admin", "New", "Inquiry", "Interested", "Website", "P-101", "25,00,000", "Ahmedabad", "Gujarat"],
            ["Jane Smith", "jane@example.com", "9876543211", "Manager", "Contacted", "Negotiation", "Not Interested", "Facebook", "P-202", "30,00,000", "Surat", "Gujarat"]
        ];

        const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Sample_Leads.csv"; // 👈 CSV extension
        a.click();
        URL.revokeObjectURL(url);
    };


    console.log(Object.keys(previewData[0] || {}), "hey");


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" style={{ marginTop: '0px' }}>
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

                {/* File Info */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                    {tableFileName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    {previewData.length > 0 ? `${tableRows} rows found` : "Upload a file to preview"}
                                </p>
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

                {/* Preview Table OR Upload Placeholder */}
                {previewData.length > 0 ? (
                    <div className="flex-1 overflow-hidden p-4 sm:p-6">
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                                Data Preview (First 10 rows)
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                Please review the data to ensure it's formatted correctly
                            </p>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto max-h-72 sm:max-h-96">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                        <tr>
                                            {Object.keys(previewData[0] || {}).map((key) => (
                                                <th
                                                    key={key}
                                                    className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]"
                                                >
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {previewData.slice(0, 10).map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                                {Object.values(row).map((value, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-2 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm text-gray-900 dark:text-gray-100 max-w-[120px] sm:max-w-[200px] truncate"
                                                        title={String(value)}
                                                    >
                                                        {String(value) || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {tableRows > 10 && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                                ... and {tableRows - 10} more rows
                            </p>
                        )}
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
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Make sure column names match your database fields
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirmUpload}
                            disabled={isLoading || previewData.length === 0}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Confirm Upload
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
