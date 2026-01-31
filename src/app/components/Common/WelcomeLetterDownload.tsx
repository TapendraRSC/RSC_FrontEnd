"use client";

import React, { useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface WelcomeLetterData {
    customerName: string;
    address: string;
    date: string;
    plotNo: string;
    projectName: string;
}

interface WelcomeLetterProps {
    data: WelcomeLetterData;
    onClose?: () => void;
}

const WelcomeLetterDownload: React.FC<WelcomeLetterProps> = ({ data, onClose }) => {
    const letterRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        if (!letterRef.current) return;

        try {
            const canvas = await html2canvas(letterRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(
                imgData,
                "PNG",
                imgX,
                imgY,
                imgWidth * ratio,
                imgHeight * ratio
            );

            pdf.save(`Welcome_Letter_${data.customerName.replace(/\s+/g, "_")}.pdf`);

            if (onClose) {
                setTimeout(() => onClose(), 500);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">Welcome Letter</h2>
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

                <div className="p-4 flex justify-center bg-gray-100">
                    <div
                        ref={letterRef}
                        className="bg-white shadow-2xl"
                        style={{
                            width: "210mm",
                            minHeight: "290mm",
                            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#ffffff",
                            color: "#1a202c",
                        }}
                    >
                        {/* Header Image */}
                        <div className="w-full">
                            <Image
                                // src="/images/wheader.png"
                                src="/images/nheader1.jpg"
                                alt="RSC Group Header"
                                width={2555}
                                height={450}
                                className="w-full h-auto"
                                priority
                            />
                        </div>


                        <div style={{ padding: "30px 60px", fontSize: "15px", lineHeight: "1.8" }}>

                            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                                <div style={{ display: "inline-block" }}>
                                    <h1
                                        style={{
                                            fontSize: "26px",
                                            fontWeight: "bold",
                                            fontStyle: "italic",
                                            color: "black",
                                            textTransform: "uppercase",
                                            letterSpacing: "1.5px",
                                            margin: "0",
                                            paddingBottom: "5px"
                                        }}
                                    >
                                        Welcome Letter
                                    </h1>

                                    <div style={{
                                        height: "2px",
                                        backgroundColor: "black",
                                        width: "100%"
                                    }}></div>
                                </div>
                            </div>


                            <div style={{ marginBottom: "30px" }}>
                                <p style={{ margin: "0", color: "#000000", fontSize: "15px" }}>To,</p>
                                <p style={{
                                    margin: "5px 0",
                                    fontSize: "16px",
                                    color: "#000000",
                                    fontWeight: "normal"
                                }}>
                                    {data.customerName}
                                </p>
                                {/* <p style={{ margin: "2px 0", color: "#000000" }}>At : {data.address}</p> */}
                                <p style={{ margin: "2px 0", color: "#000000" }}>Date : {data.date}</p>
                            </div>


                            <p style={{ margin: "30px 0 15px 0", fontSize: "17px", color: "black" }}>
                                Dear Sir / Ma'am,
                            </p>


                            <div style={{ textAlign: "justify", color: "black" }}>
                                <p style={{ margin: "20px 0" }}>
                                    On behalf of <strong style={{ color: "black" }}>RSC Group,</strong> we would like to extend a warm welcome to you as a new owner of a residential
                                    <strong style={{
                                        fontSize: "17px",
                                        color: "black",
                                        padding: "0 5px"
                                    }}>
                                        {data.plotNo}
                                    </strong>
                                    in our project <strong style={{ color: "black" }}>"{data.projectName}"</strong>.
                                </p>

                                <p style={{ margin: "20px 0" }}>
                                    We are thrilled that you have chosen to invest in a property with us, and we are confident that you will be satisfied with your decision. Our team has worked hard to ensure that this project offers the best possible living experience for our residents.
                                </p>

                                <p style={{ margin: "20px 0" }}>
                                    Again, welcome to the <strong style={{ color: "black" }}>"{data.projectName}"</strong> community! We look forward to working with you and helping you make the most of your new home.
                                </p>
                            </div>



                        </div>


                        <div style={{ flexGrow: 1 }}></div>


                        <div className="w-full mt-auto">
                            <Image
                                // src="/images/wfooter.png"
                                src="/images/nfooter1.jpg"
                                alt="RSC Group Footer"
                                width={2555}
                                height={570}

                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeLetterDownload;
export type { WelcomeLetterData };