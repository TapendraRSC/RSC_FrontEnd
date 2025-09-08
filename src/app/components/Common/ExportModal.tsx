'use client';
import React, { useState } from 'react';
import {
    X,
    FileText,
    Download,
    Loader2,
    CheckCircle2,
    Info,
    AlertCircle,
    Table,
    FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Document,
    Packer,
    Paragraph,
    Table as DocxTable,
    TableCell,
    TableRow,
    WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    fileName?: string;
    columns: any[];
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    data,
    fileName = 'leads_export',
    columns,
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<'pdf' | 'word' | 'excel' | 'csv'>('pdf');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const exportableColumns = columns.filter(
        (col) => col.accessor && col.accessor !== 'actions'
    );

    const formatDataForExport = (row: any, accessor: string) => {
        const value = row[accessor];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).replace(/<[^>]*>/g, '');
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const pdf = new jsPDF('l', 'mm', 'a4');
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Leads Export Report', 14, 20);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            pdf.text(`Total Records: ${data.length}`, 14, 38);
            const tableColumns = exportableColumns.map((col) => col.label);
            const tableRows = data.map((row) =>
                exportableColumns.map((col) => formatDataForExport(row, col.accessor))
            );
            autoTable(pdf, {
                head: [tableColumns],
                body: tableRows,
                startY: 50,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    font: 'helvetica',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    font: 'helvetica',
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { top: 50, right: 10, bottom: 10, left: 10 },
                tableWidth: 'auto',
            });
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error(error);
            setError('Error generating PDF. Please try again.');
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const exportToWord = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const tableRows = [
                new TableRow({
                    children: exportableColumns.map(
                        (col) =>
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        text: col.label,
                                        style: 'tableHeader',
                                    }),
                                ],
                                width: {
                                    size: 100 / exportableColumns.length,
                                    type: WidthType.PERCENTAGE,
                                },
                            })
                    ),
                }),
                ...data.map(
                    (row) =>
                        new TableRow({
                            children: exportableColumns.map(
                                (col) =>
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                text: formatDataForExport(row, col.accessor),
                                            }),
                                        ],
                                    })
                            ),
                        })
                ),
            ];
            const doc = new Document({
                styles: {
                    paragraphStyles: [
                        {
                            id: 'tableHeader',
                            name: 'Table Header',
                            basedOn: 'Normal',
                            next: 'Normal',
                            run: { bold: true, color: '000000' },
                        },
                    ],
                },
                sections: [
                    {
                        children: [
                            new Paragraph({ text: 'Leads Export Report', heading: 'Title' }),
                            new Paragraph({ text: `Generated on: ${new Date().toLocaleString()}` }),
                            new Paragraph({ text: `Total Records: ${data.length}` }),
                            new Paragraph({ text: '' }),
                            new DocxTable({
                                rows: tableRows,
                                width: { size: 100, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    },
                ],
            });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
        } catch (error) {
            console.error(error);
            setError('Error generating Word document. Please try again.');
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const workbook = XLSX.utils.book_new();
            const excelData = data.map(row => {
                const excelRow: any = {};
                exportableColumns.forEach(col => {
                    excelRow[col.label] = formatDataForExport(row, col.accessor);
                });
                return excelRow;
            });
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const colWidths = exportableColumns.map(col => ({
                wch: Math.max(col.label.length, 15)
            }));
            worksheet['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Data');
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } catch (error) {
            console.error(error);
            setError('Error generating Excel file. Please try again.');
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const exportToCSV = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const csvHeaders = exportableColumns.map(col => col.label).join(',');
            const csvRows = data.map(row =>
                exportableColumns.map(col => {
                    const value = formatDataForExport(row, col.accessor);
                    return value.includes(',') || value.includes('"')
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                }).join(',')
            );
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${fileName}.csv`);
        } catch (error) {
            console.error(error);
            setError('Error generating CSV file. Please try again.');
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const handleExport = () => {
        if (data.length === 0) {
            setError('No data to export.');
            return;
        }
        switch (exportType) {
            case 'pdf':
                exportToPDF();
                break;
            case 'word':
                exportToWord();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'csv':
                exportToCSV();
                break;
        }
    };

    const exportOptions = [
        {
            type: 'pdf',
            label: 'PDF',
            color: 'text-red-500 dark:text-red-400',
            bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
            icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
            gradient: 'from-red-500 to-red-600'
        },
        {
            type: 'word',
            label: 'Word',
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
            icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            type: 'excel',
            label: 'Excel',
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
            icon: <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />,
            gradient: 'from-green-500 to-green-600'
        },

    ];

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-w-2xl mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Export Data</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors"
                        disabled={isExporting}
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="px-3 sm:px-4 pb-3">
                    {/* Error Message */}
                    {error && (
                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg mb-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Export Options */}
                    <div className="mb-4">
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 mt-3">
                            Select Export Format
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {exportOptions.map((opt) => (
                                <label
                                    key={opt.type}
                                    className={`group relative flex flex-col p-2 sm:p-3 border rounded-lg cursor-pointer transition-all ${exportType === opt.type
                                        ? opt.bgColor
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className={`${opt.color} transition-transform group-hover:scale-110`}>
                                            {opt.icon}
                                        </div>
                                        {exportType === opt.type && (
                                            <div className="bg-green-500 dark:bg-green-600 rounded-full p-0.5">
                                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">{opt.label}</h3>
                                    <input
                                        type="radio"
                                        name="exportType"
                                        value={opt.type}
                                        checked={exportType === opt.type}
                                        onChange={(e) => setExportType(e.target.value as 'pdf' | 'word' | 'excel' | 'csv')}
                                        className="hidden"
                                        disabled={isExporting}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Export Details */}
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />
                            <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">Export Summary</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <div className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">{data.length}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Records</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">{exportableColumns.length}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Columns</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400">{exportType.toUpperCase()}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Format</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                            disabled={isExporting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting || data.length === 0}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${isExporting || data.length === 0
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg transform hover:scale-[1.02]'
                                }`}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Export
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;