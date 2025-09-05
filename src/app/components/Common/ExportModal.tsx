'use client';
import React, { useState } from 'react';
import {
    X, FileText, Download, Loader2, CheckCircle2, Info, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

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
    const [exportType, setExportType] = useState<'pdf' | 'word'>('pdf');
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
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Leads Export Report', 14, 15);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
            pdf.text(`Total Records: ${data.length}`, 14, 32);

            const tableColumns = exportableColumns.map((col) => col.label);
            const tableRows = data.map((row) =>
                exportableColumns.map((col) => formatDataForExport(row, col.accessor))
            );

            autoTable(pdf, {
                head: [tableColumns],
                body: tableRows,
                startY: 42,
                styles: { fontSize: 9, cellPadding: 2, font: 'helvetica' },
                headStyles: {
                    fillColor: [37, 99, 235],
                    textColor: 255,
                    fontStyle: 'bold',
                    font: 'helvetica',
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 42, right: 14, bottom: 14, left: 14 },
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
                            new Table({
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

    const handleExport = () => {
        if (data.length === 0) {
            setError('No data to export.');
            return;
        }
        if (exportType === 'pdf') exportToPDF();
        else exportToWord();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ margin: "0px" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-fade-in scale-98 hover:scale-100 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Download className="w-6 h-6 text-blue-600" />
                            Export Data
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Export your leads data as a professional PDF or Word document.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isExporting}
                    >
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Export Options */}
                <div className="space-y-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700">
                        Select Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { type: 'pdf', label: 'PDF Document', desc: 'Best for printing and sharing.', color: 'text-red-500', icon: <FileText className="w-6 h-6" /> },
                            { type: 'word', label: 'Word Document', desc: 'Editable format for reports.', color: 'text-blue-500', icon: <FileText className="w-6 h-6" /> },
                        ].map((opt) => (
                            <label
                                key={opt.type}
                                className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${exportType === opt.type
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center mb-2">
                                    {opt.icon && <div className={`mr-2 ${opt.color}`}>{opt.icon}</div>}
                                    <span className="font-medium">{opt.label}</span>
                                    {exportType === opt.type && (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{opt.desc}</p>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value={opt.type}
                                    checked={exportType === opt.type}
                                    onChange={(e) => setExportType(e.target.value as 'pdf' | 'word')}
                                    className="hidden"
                                    disabled={isExporting}
                                />
                            </label>
                        ))}
                    </div>

                    {/* Export Details */}
                    <div className="bg-gray-50 p-5 rounded-xl text-sm text-gray-700 shadow-inner">
                        <p className="font-medium mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" /> Export Details
                        </p>
                        <ul className="space-y-1 pl-2">
                            <li>• Total Records: <span className="font-semibold">{data.length}</span></li>
                            <li>• Columns: <span className="font-semibold">{exportableColumns.length}</span></li>
                            <li>• Selected Format: <span className="font-semibold">{exportType.toUpperCase()}</span></li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        disabled={isExporting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || data.length === 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg shadow-md transition-colors font-medium ${isExporting || data.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Export {exportType.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
