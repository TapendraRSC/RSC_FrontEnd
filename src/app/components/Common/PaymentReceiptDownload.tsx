"use client";

import React, { useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PaymentDetails {
    paymentBy: string;
    transactionDate: string;
    bank: string;
    transactionNo: string;
    branch: string;
    amount: string;
}

interface ReceiptData {
    receiptNo: string;
    receiptDate: string;
    name: string;
    receivedAmount: string;
    plotNo: string;
    projectName: string;
    bookingDate: string;
    paymentCondition: string;
    address: string;
    payments: PaymentDetails[];
}

interface PaymentReceiptProps {
    data: ReceiptData;
    onClose?: () => void;
}

// Function to convert number to words (Indian numbering system)
const convertNumberToWords = (num: number): string => {
    if (num === 0) return "Zero Rupees Only";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return "";
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            const tensPart = Math.floor(n / 10);
            const onesPart = n % 10;
            return tens[tensPart] + (onesPart > 0 ? " " + ones[onesPart] : "");
        }
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        return ones[hundreds] + " Hundred" + (remainder > 0 ? " " + convertLessThanThousand(remainder) : "");
    };

    const [integerPart, decimalPart] = num.toString().split(".");
    const intNum = parseInt(integerPart);

    if (intNum === 0) return "Zero Rupees Only";

    let words = "";

    // Crores
    const crores = Math.floor(intNum / 10000000);
    if (crores > 0) {
        words += convertLessThanThousand(crores) + " Crore ";
    }

    // Lakhs
    const lakhs = Math.floor((intNum % 10000000) / 100000);
    if (lakhs > 0) {
        words += convertLessThanThousand(lakhs) + " Lakh ";
    }

    // Thousands
    const thousands = Math.floor((intNum % 100000) / 1000);
    if (thousands > 0) {
        words += convertLessThanThousand(thousands) + " Thousand ";
    }

    // Hundreds
    const remainder = intNum % 1000;
    if (remainder > 0) {
        words += convertLessThanThousand(remainder) + " ";
    }

    words = words.trim() + " Rupees";

    // Handle paise (decimal part)
    if (decimalPart && parseInt(decimalPart) > 0) {
        const paise = parseInt(decimalPart.padEnd(2, "0").slice(0, 2));
        words += " and " + convertLessThanThousand(paise) + " Paise";
    }

    return words + " Only";
};

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ data, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        if (!receiptRef.current) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                allowTaint: true,
            });

            const imgData = canvas.toDataURL("image/png");
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const aspectRatio = imgHeight / imgWidth;
            const pdfWidth = 210;
            const pdfHeight = pdfWidth * aspectRatio;

            const pdf = new jsPDF({
                orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
                unit: "mm",
                format: [pdfWidth, pdfHeight],
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            let heightLeft = pdfHeight;
            let position = 0;

            while (heightLeft > pdfHeight) {
                position = heightLeft - pdfHeight;
                pdf.addPage([pdfWidth, pdfHeight]);
                pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Payment_Receipt_${data.receiptNo}_${data.name}.pdf`);

            // Close modal after download
            if (onClose) {
                setTimeout(() => onClose(), 500);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
    };

    const cellStyle: React.CSSProperties = {
        border: "1px solid #333",
        padding: "6px 8px",
        verticalAlign: "middle",
    };

    const labelCell: React.CSSProperties = {
        ...cellStyle,
        fontWeight: 600,
        whiteSpace: "nowrap",
    };

    const valueCell: React.CSSProperties = {
        ...cellStyle,
        fontWeight: 400,
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadPDF}
                            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-md flex items-center gap-2"
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div
                        ref={receiptRef}
                        className="bg-white shadow-lg"
                        style={{
                            width: "240mm",
                            fontFamily: "Arial, sans-serif",
                        }}
                    >

                        <div className="w-full">
                            <Image
                                src="/images/nheader.jpg"
                                alt="RSC Group Header"
                                width={2555}
                                height={450}
                                className="w-full h-auto"
                                priority
                            />
                        </div>


                        <div style={{ padding: "10px 25px", backgroundColor: "#ffffff" }}>

                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                border: "1px solid #333",
                                fontFamily: "'Helvetica', 'Arial', sans-serif",
                                fontSize: "13px",
                                color: "#000000"
                            }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold", width: "15%" }}>Receipt No.</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "35%" }}>{data.receiptNo}</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold", width: "15%" }}>Receipt Date :</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "35%" }}>{data.receiptDate}</td>
                                    </tr>

                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Mr./Ms./Mrs.</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", fontSize: "14px", fontWeight: "500" }} colSpan={3}>
                                            {data.name}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Received Amount</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", fontStyle: "italic" }} colSpan={3}>
                                            {data.receivedAmount}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Plot No.</td>
                                        <td style={{ padding: "8px", border: "1px solid #333" }}>{data.plotNo}</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Project Name :</td>
                                        <td style={{ padding: "8px", border: "1px solid #333" }}>{data.projectName}</td>
                                    </tr>

                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Booking Date</td>
                                        <td style={{ padding: "8px", border: "1px solid #333" }}>{data.bookingDate}</td>
                                        {/* <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Payment Condition :</td>
                                        <td style={{ padding: "8px", border: "1px solid #333" }}>{data.paymentCondition}</td> */}
                                    </tr>

                                    {/* <tr>
                                        <td style={{ padding: "8px", border: "1px solid #333", backgroundColor: "#f9f9f9", fontWeight: "bold" }}>Address</td>
                                        <td style={{ padding: "8px", border: "1px solid #333" }} colSpan={3}>
                                            {data.address}
                                        </td>
                                </tr> */}
                                </tbody>
                            </table>


                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                border: "1px solid #333",
                                marginTop: "-1px", // Connects perfectly to the table above
                                fontFamily: "'Helvetica', 'Arial', sans-serif",
                                fontSize: "12px",
                                textAlign: "center"
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold", fontSize: "13px", color: "#000" }}>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "20%", textAlign: "center" }}>Payment By</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "15%", textAlign: "center" }}>Transaction Date</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "15%", textAlign: "center" }}>Bank</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "25%", textAlign: "center" }}>Transaction No.</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "10%", textAlign: "center" }}>Branch</td>
                                        <td style={{ padding: "8px", border: "1px solid #333", width: "15%", textAlign: "center" }}>Amount</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.payments.map((payment, index) => (
                                        <tr key={index} style={{ fontSize: "13px", color: "#000" }}>
                                            <td style={{ padding: "8px", border: "1px solid #333", textAlign: "center" }}>{payment.paymentBy}</td>
                                            <td style={{ padding: "8px", border: "1px solid #333", textAlign: "center" }}>{payment.transactionDate}</td>
                                            <td style={{ padding: "8px", border: "1px solid #333", textAlign: "center" }}>{payment.bank}</td>
                                            <td style={{ padding: "8px", border: "1px solid #333", textAlign: "center" }}>{payment.transactionNo}</td>
                                            <td style={{ padding: "8px", border: "1px solid #333", textAlign: "center" }}>{payment.branch}</td>
                                            <td style={{ padding: "8px", border: "1px solid #333", fontWeight: "bold", textAlign: "right" }}>
                                                {payment.amount} /-
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        <div className="w-full">
                            <Image
                                src="/images/nfooter.jpg"
                                alt="RSC Group Footer"
                                width={2555}
                                height={570}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PaymentReceipt;
export { convertNumberToWords };
export type { ReceiptData, PaymentDetails };