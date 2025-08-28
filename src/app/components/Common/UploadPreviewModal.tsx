import React from "react";
import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface UploadPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmUpload: () => void;
    fileName: string;
    previewData: any[];
    isLoading: boolean;
    totalRows: number;
}

const UploadPreviewModal: React.FC<UploadPreviewModalProps> = ({
    isOpen,
    onClose,
    onConfirmUpload,
    fileName,
    previewData,
    isLoading,
    totalRows
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ margin: "0px" }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                Upload Preview
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Review your data before uploading
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* File Info */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">{fileName}</p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {totalRows} rows found
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Ready to upload
                        </div>
                    </div>
                </div>

                {/* Preview Table */}
                <div className="flex-1 overflow-hidden p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                            Data Preview (First 10 rows)
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Please review the data to ensure it's formatted correctly
                        </p>
                    </div>

                    {previewData.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto max-h-72 sm:max-h-96">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            {Object.keys(previewData[0] || {}).map((key) => (
                                                <th
                                                    key={key}
                                                    className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]"
                                                >
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.slice(0, 10).map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {Object.values(row).map((value, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-2 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm text-gray-900 max-w-[120px] sm:max-w-[200px] truncate"
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
                    ) : (
                        <div className="text-center py-10 sm:py-12 bg-gray-50 rounded-lg">
                            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-gray-600">No data preview available</p>
                        </div>
                    )}

                    {totalRows > 10 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                            ... and {totalRows - 10} more rows
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Make sure column names match your database fields
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirmUpload}
                            disabled={isLoading}
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
