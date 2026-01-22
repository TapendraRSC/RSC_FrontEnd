'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    FileText,
    Download,
    Loader2,
    CheckCircle2,
    Info,
    AlertCircle,
    Table,
    FileSpreadsheet,
    Database,
    ArrowDown,
    ArrowUp
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
    TextRun,
    AlignmentType,
    ShadingType,
    PageOrientation,
    convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// ============= ALL 20 EXPORT COLUMNS =============
export const ALL_EXPORT_COLUMNS = [
    { label: 'Lead No', accessor: 'leadNo' },
    { label: 'Name', accessor: 'name' },
    { label: 'Phone', accessor: 'phone' },
    { label: 'Email', accessor: 'email' },
    { label: 'Profession', accessor: 'profession' },
    { label: 'Address', accessor: 'address' },
    { label: 'City', accessor: 'city' },
    { label: 'State', accessor: 'state' },
    { label: 'Assigned To', accessor: 'assignedUserName' },
    { label: 'Status', accessor: 'status' },
    { label: 'Stage', accessor: 'stage' },
    { label: 'Interested In', accessor: 'interestedIn' },
    { label: 'Budget', accessor: 'budget' },
    { label: 'Platform', accessor: 'platformType' },
    { label: 'Plot Number', accessor: 'plotNumber' },
    { label: 'Plot Price', accessor: 'plotPrice' },
    { label: 'Next Follow-up', accessor: 'latestFollowUpDate' },
    { label: 'Created', accessor: 'createdAt' },
    { label: 'Last Updated', accessor: 'updatedAt' },
    { label: 'Remark', accessor: 'remark' }
];

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    fileName?: string;
    columns?: {
        label: string;
        accessor: string;
    }[];
    totalRecords?: number;
    onFetchDataRange?: (start: number, end: number) => Promise<any[]>;
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    data,
    fileName = 'leads_export',
    columns = ALL_EXPORT_COLUMNS,
    totalRecords = 0,
    onFetchDataRange
}) => {
    // ============= ALL HOOKS AT TOP LEVEL (BEFORE ANY CONDITIONAL RETURNS) =============
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<'pdf' | 'word' | 'excel' | 'csv'>('excel');
    const [error, setError] = useState<string | null>(null);
    const [isLoadingRange, setIsLoadingRange] = useState(false);
    const [rangeStart, setRangeStart] = useState<number>(1);
    const [rangeEnd, setRangeEnd] = useState<number>(1);
    const [rangeStartInput, setRangeStartInput] = useState<string>('1');
    const [rangeEndInput, setRangeEndInput] = useState<string>('1');

    const actualTotalRecords = totalRecords || data.length;

    const exportableColumns = useMemo(() => {
        const cols = columns && columns.length > 0 ? columns : ALL_EXPORT_COLUMNS;
        return cols.filter(col => col.accessor);
    }, [columns]);

    const validationResult = useMemo(() => {
        if (rangeStart < 1) {
            return { isValid: false, error: 'Start must be 1 or greater' };
        }
        if (rangeEnd > actualTotalRecords) {
            return { isValid: false, error: `End must be ${actualTotalRecords} or less` };
        }
        if (rangeStart > rangeEnd) {
            return { isValid: false, error: 'Start must be less than or equal to End' };
        }
        return { isValid: true, error: null };
    }, [rangeStart, rangeEnd, actualTotalRecords]);

    const recordsToExport = useMemo(() =>
        Math.max(0, rangeEnd - rangeStart + 1),
        [rangeStart, rangeEnd]
    );

    // Initialize values when modal opens
    useEffect(() => {
        if (isOpen && actualTotalRecords > 0) {
            setRangeStart(1);
            setRangeEnd(actualTotalRecords);
            setRangeStartInput('1');
            setRangeEndInput(String(actualTotalRecords));
            setError(null);
        }
    }, [isOpen, actualTotalRecords]);

    // ============= EARLY RETURN - AFTER ALL HOOKS =============
    if (!isOpen) return null;

    // ============= HANDLER FUNCTIONS =============
    const handleRangeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRangeStartInput(value);

        if (value !== '') {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 1 && num <= actualTotalRecords) {
                setRangeStart(num);
            }
        }
        setError(null);
    };

    const handleRangeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRangeEndInput(value);

        if (value !== '') {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 1 && num <= actualTotalRecords) {
                setRangeEnd(num);
            }
        }
        setError(null);
    };

    const handleRangeStartBlur = () => {
        const num = parseInt(rangeStartInput);
        if (isNaN(num) || num < 1) {
            setRangeStart(1);
            setRangeStartInput('1');
        } else if (num > actualTotalRecords) {
            setRangeStart(actualTotalRecords);
            setRangeStartInput(String(actualTotalRecords));
        } else {
            setRangeStart(num);
            setRangeStartInput(String(num));
        }
    };

    const handleRangeEndBlur = () => {
        const num = parseInt(rangeEndInput);
        if (isNaN(num) || num < 1) {
            setRangeEnd(rangeStart);
            setRangeEndInput(String(rangeStart));
        } else if (num > actualTotalRecords) {
            setRangeEnd(actualTotalRecords);
            setRangeEndInput(String(actualTotalRecords));
        } else if (num < rangeStart) {
            setRangeEnd(rangeStart);
            setRangeEndInput(String(rangeStart));
        } else {
            setRangeEnd(num);
            setRangeEndInput(String(num));
        }
    };

    // ============= HELPER FUNCTIONS =============
    const formatDataForExport = (row: any, accessor: string): string => {
        let value = row[accessor];

        if (value === undefined) {
            for (const key in row) {
                if (key.toLowerCase() === accessor.toLowerCase()) {
                    value = row[key];
                    break;
                }
            }
        }

        if (value === null || value === undefined) {
            return '-';
        }

        if (accessor.includes('Date') || accessor === 'createdAt' || accessor === 'updatedAt' || accessor === 'latestFollowUpDate') {
            if (value) {
                try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });
                    }
                } catch {
                    return String(value);
                }
            }
            return '-';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        if (String(value).trim() === '' || value === 'N/A' || value === 'Not Provided') {
            return '-';
        }

        return String(value).replace(/<[^>]*>/g, '').trim();
    };

    const getExportData = async (): Promise<any[]> => {
        const startIdx = rangeStart - 1;
        const endIdx = rangeEnd;

        if (onFetchDataRange) {
            setIsLoadingRange(true);
            try {
                return await onFetchDataRange(startIdx, endIdx);
            } catch {
                throw new Error('Failed to fetch data range');
            } finally {
                setIsLoadingRange(false);
            }
        }

        return data.slice(startIdx, endIdx);
    };

    // ============= PDF EXPORT =============
    const exportToPDF = async () => {
        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        setIsExporting(true);
        setError(null);
        try {
            const exportData = await getExportData();
            if (exportData.length === 0) throw new Error('No data to export');

            const pdf = new jsPDF('l', 'mm', 'a2');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.setFillColor(37, 99, 235);
            pdf.rect(0, 0, pageWidth, 30, 'F');

            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('LEADS EXPORT REPORT', 20, 20);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 20, { align: 'right' });

            pdf.setFillColor(243, 244, 246);
            pdf.rect(0, 30, pageWidth, 15, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(75, 85, 99);
            pdf.text(`Records: ${rangeStart.toLocaleString()} - ${rangeEnd.toLocaleString()} of ${actualTotalRecords.toLocaleString()}`, 20, 40);
            pdf.text(`Total Exported: ${exportData.length.toLocaleString()} records`, pageWidth / 2, 40, { align: 'center' });
            pdf.text(`Columns: ${exportableColumns.length}`, pageWidth - 20, 40, { align: 'right' });

            const tableColumns = exportableColumns.map(col => col.label);
            const tableRows = exportData.map(row =>
                exportableColumns.map(col => formatDataForExport(row, col.accessor))
            );

            const availableWidth = pageWidth - 20;

            const getColumnMultiplier = (accessor: string): number => {
                if (accessor === 'email' || accessor === 'address') return 1.5;
                if (accessor === 'name' || accessor === 'assignedUserName') return 1.3;
                if (accessor === 'remark' || accessor === 'interestedIn') return 1.4;
                if (accessor === 'createdAt' || accessor === 'updatedAt' || accessor === 'latestFollowUpDate') return 1.2;
                if (accessor === 'leadNo' || accessor === 'stage' || accessor === 'status') return 0.8;
                return 1;
            };

            const totalMultiplier = exportableColumns.reduce((sum, col) => sum + getColumnMultiplier(col.accessor), 0);
            const baseWidth = availableWidth / totalMultiplier;

            const columnStyles: any = {};
            exportableColumns.forEach((col, idx) => {
                columnStyles[idx] = {
                    cellWidth: baseWidth * getColumnMultiplier(col.accessor),
                    halign: 'left',
                    overflow: 'linebreak'
                };
            });

            autoTable(pdf, {
                head: [tableColumns],
                body: tableRows,
                startY: 50,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    font: 'helvetica',
                    lineColor: [229, 231, 235],
                    lineWidth: 0.1,
                    textColor: [31, 41, 55],
                    valign: 'middle',
                    overflow: 'linebreak',
                    minCellHeight: 8,
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                    cellPadding: 4,
                    halign: 'left',
                    minCellHeight: 10,
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: columnStyles,
                margin: { top: 50, right: 10, bottom: 25, left: 10 },
                tableWidth: 'wrap',
                horizontalPageBreak: false,
                didDrawPage: (dataArg) => {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
                    pdf.setFontSize(9);
                    pdf.setTextColor(107, 114, 128);
                    pdf.text('Generated by Leads Management System', 20, pageHeight - 8);
                    pdf.text(`Page ${dataArg.pageNumber}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
                    pdf.text(new Date().toLocaleDateString(), pageWidth - 20, pageHeight - 8, { align: 'right' });
                }
            });

            pdf.save(`${fileName}_${rangeStart}-${rangeEnd}.pdf`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error generating PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // ============= WORD EXPORT =============
    const exportToWord = async () => {
        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        setIsExporting(true);
        setError(null);
        try {
            const exportData = await getExportData();
            if (exportData.length === 0) throw new Error('No data to export');

            const headerRow = new TableRow({
                tableHeader: true,
                children: exportableColumns.map(col =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: col.label,
                                        bold: true,
                                        color: 'FFFFFF',
                                        size: 16,
                                    }),
                                ],
                                alignment: AlignmentType.LEFT,
                            }),
                        ],
                        shading: {
                            fill: '3B82F6',
                            type: ShadingType.CLEAR,
                        },
                        width: {
                            size: 100 / exportableColumns.length,
                            type: WidthType.PERCENTAGE,
                        },
                    })
                ),
            });

            const dataRows = exportData.map((row, index) =>
                new TableRow({
                    children: exportableColumns.map(col =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: formatDataForExport(row, col.accessor),
                                            size: 16,
                                        }),
                                    ],
                                }),
                            ],
                            shading: index % 2 === 0
                                ? { fill: 'FFFFFF', type: ShadingType.CLEAR }
                                : { fill: 'F8FAFC', type: ShadingType.CLEAR },
                        })
                    ),
                })
            );

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
                        properties: {
                            page: {
                                size: { orientation: PageOrientation.LANDSCAPE },
                                margin: {
                                    top: convertInchesToTwip(0.3),
                                    right: convertInchesToTwip(0.3),
                                    bottom: convertInchesToTwip(0.3),
                                    left: convertInchesToTwip(0.3),
                                },
                            },
                        },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'Leads Export Report',
                                        bold: true,
                                        size: 32,
                                        color: '3B82F6',
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 150 },
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Generated: ${new Date().toLocaleString()} | Records: ${rangeStart}-${rangeEnd} of ${actualTotalRecords} | Total: ${exportData.length} | Columns: ${exportableColumns.length}`,
                                        size: 18,
                                        color: '6B7280',
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 200 },
                            }),
                            new DocxTable({
                                rows: [headerRow, ...dataRows],
                                width: { size: 100, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}_${rangeStart}-${rangeEnd}.docx`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error generating Word document. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // ============= EXCEL EXPORT =============
    const exportToExcel = async () => {
        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        setIsExporting(true);
        setError(null);
        try {
            const exportData = await getExportData();
            if (exportData.length === 0) throw new Error('No data to export');

            const workbook = XLSX.utils.book_new();

            const excelData = exportData.map((row, idx) => {
                const excelRow: Record<string, any> = { 'S.No': idx + rangeStart };
                exportableColumns.forEach(col => {
                    const value = formatDataForExport(row, col.accessor);
                    if (value === '-') {
                        excelRow[col.label] = '';
                    } else if (!isNaN(Number(value)) && value.trim() !== '' && !value.includes('-') && !value.includes('/') && !value.includes(':')) {
                        excelRow[col.label] = parseFloat(value);
                    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                        excelRow[col.label] = value.toLowerCase() === 'true';
                    } else {
                        excelRow[col.label] = value;
                    }
                });
                return excelRow;
            });

            const dataSheet = XLSX.utils.json_to_sheet(excelData);

            const colWidths = [{ wch: 6 }];
            exportableColumns.forEach(col => {
                const headerLen = col.label.length;
                let maxLen = headerLen;
                exportData.slice(0, 100).forEach(row => {
                    const val = formatDataForExport(row, col.accessor);
                    maxLen = Math.max(maxLen, val.length);
                });
                colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 10), 35) });
            });
            dataSheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, dataSheet, 'Leads Data');

            const summaryData = [
                ['LEADS EXPORT REPORT'],
                [''],
                ['Export Details'],
                ['Generated On', new Date().toLocaleString()],
                ['Record Range', `${rangeStart} to ${rangeEnd}`],
                ['Total Exported', exportData.length],
                ['Total Available', actualTotalRecords],
                ['Total Columns', exportableColumns.length],
                [''],
                // ['Columns Exported:'],
                // ...exportableColumns.map((col, idx) => [`${idx + 1}. ${col.label}`, col.accessor])
            ];
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Export Info');

            XLSX.writeFile(workbook, `${fileName}_${rangeStart}-${rangeEnd}.xlsx`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error generating Excel file. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // ============= CSV EXPORT =============
    const exportToCSV = async () => {
        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        setIsExporting(true);
        setError(null);
        try {
            const exportData = await getExportData();
            if (exportData.length === 0) throw new Error('No data to export');

            const headers = ['S.No', ...exportableColumns.map(col => col.label)];
            const csvHeaders = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

            const csvRows = exportData.map((row, idx) => {
                const rowData = [
                    String(idx + rangeStart),
                    ...exportableColumns.map(col => {
                        const value = formatDataForExport(row, col.accessor);
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    })
                ];
                return rowData.join(',');
            });

            const csvContent = [csvHeaders, ...csvRows].join('\r\n');
            const blob = new Blob(['\uFEFF', csvContent], {
                type: 'text/csv;charset=utf-8;',
            });
            saveAs(blob, `${fileName}_${rangeStart}-${rangeEnd}.csv`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error generating CSV file. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExport = () => {
        if ((!data || data.length === 0) && !onFetchDataRange) {
            setError('No data to export.');
            return;
        }

        if (exportableColumns.length === 0) {
            setError('No columns defined for export.');
            return;
        }

        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        switch (exportType) {
            case 'pdf': exportToPDF(); break;
            case 'word': exportToWord(); break;
            case 'excel': exportToExcel(); break;
            case 'csv': exportToCSV(); break;
        }
    };

    const exportOptions = [
        {
            type: 'pdf',
            label: 'PDF',
            color: 'text-red-500 dark:text-red-400',
            bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
            icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
        },
        {
            type: 'word',
            label: 'Word',
            color: 'text-orange-500 dark:text-orange-400',
            bgColor: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700',
            icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
        },
        {
            type: 'excel',
            label: 'Excel',
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
            icon: <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />,
        },
        {
            type: 'csv',
            label: 'CSV',
            color: 'text-yellow-500 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
            icon: <Table className="w-4 h-4 sm:w-5 sm:h-5" />,
        },
    ];

    const isButtonDisabled = isExporting || isLoadingRange || recordsToExport === 0 || !validationResult.isValid;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" style={{ margin: "0px" }}>
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-w-2xl mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-orange-500 to-purple-600 p-1.5 rounded-lg">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Export Data</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors"
                        disabled={isExporting || isLoadingRange}
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="px-3 sm:px-4 pb-3">
                    {/* Error Message */}
                    {error && (
                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg mb-3 mt-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Range Selection */}
                    {actualTotalRecords > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 p-3 sm:p-4 rounded-lg mb-4 mt-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400" />
                                <h3 className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
                                    Total Records: {actualTotalRecords.toLocaleString()}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                        <ArrowDown className="w-3 h-3" />
                                        From (Min: 1)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={rangeStartInput}
                                        onChange={handleRangeStartChange}
                                        onBlur={handleRangeStartBlur}
                                        placeholder="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                                        disabled={isExporting || isLoadingRange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                        <ArrowUp className="w-3 h-3" />
                                        To (Max: {actualTotalRecords.toLocaleString()})
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={rangeEndInput}
                                        onChange={handleRangeEndChange}
                                        onBlur={handleRangeEndBlur}
                                        placeholder={String(actualTotalRecords)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                                        disabled={isExporting || isLoadingRange}
                                    />
                                </div>
                            </div>

                            <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Will export:{' '}
                                <strong className="text-indigo-600 dark:text-indigo-400">
                                    {recordsToExport.toLocaleString()}
                                </strong>{' '}
                                records
                                <div className="text-xs mt-1">
                                    Records {rangeStart.toLocaleString()} – {rangeEnd.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Export Options */}
                    <div className="mb-4">
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                                        disabled={isExporting || isLoadingRange}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Export Details */}
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 dark:text-orange-400" />
                            <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">Export Summary</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <div className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">{recordsToExport.toLocaleString()}</div>
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
                            disabled={isExporting || isLoadingRange}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isButtonDisabled}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${isButtonDisabled
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white hover:shadow-lg transform hover:scale-[1.02]'
                                }`}
                        >
                            {isExporting || isLoadingRange ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                    {isLoadingRange ? 'Loading...' : 'Exporting...'}
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Export {recordsToExport.toLocaleString()} Records
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
