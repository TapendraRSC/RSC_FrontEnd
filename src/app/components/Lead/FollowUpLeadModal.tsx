"use client";

import React from "react";
import { X, Calendar, IndianRupee } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../Common/FormInput";
import CommonDropdown from "../Common/CommonDropdown";

interface FollowUpLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    customer?: { name: string; phone: string };
}

interface FollowUpFormData {
    inquiryStatus: { label: string; value: string } | null;
    nextFollowUpDate: string;
    budgetUpto: { label: string; value: string } | null;
    remark: string;
}

const FollowUpLeadModal: React.FC<FollowUpLeadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    customer = { name: "Akshit", phone: "+919988860633" },
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FollowUpFormData>({
        defaultValues: {
            inquiryStatus: { label: "IN FOLLOWUP", value: "IN FOLLOWUP" },
            budgetUpto: null,
        },
    });

    if (!isOpen) return null;

    // Dropdown options
    const inquiryOptions = [
        { label: "IN FOLLOWUP", value: "IN FOLLOWUP" },
        { label: "NEW LEAD", value: "NEW LEAD" },
        { label: "CLOSED", value: "CLOSED" },
        { label: "REJECTED", value: "REJECTED" },
    ];

    const budgetOptions = [
        { label: "₹50,000", value: "50000" },
        { label: "₹1,00,000", value: "100000" },
        { label: "₹5,00,000", value: "500000" },
    ];

    const inquiryValue = watch("inquiryStatus");
    const budgetValue = watch("budgetUpto");

    const onSubmit = (data: FollowUpFormData) => {
        onSave(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ margin: "0px" }}>
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4">
                    <h2 className="text-xl font-semibold">Follow-up</h2>
                    <button onClick={onClose} className="hover:text-gray-300 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Customer Info */}
                <div className="px-6 py-3 border-b text-sm text-gray-700 space-y-1">
                    <p>
                        <span className="font-semibold">Customer Name:</span> {customer.name}
                    </p>
                    <p>
                        <span className="font-semibold">Phone No.:</span> {customer.phone}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="px-6 py-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Inquiry Status Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Inquiry Status <span className="text-red-500">*</span>
                                </label>
                                <CommonDropdown
                                    options={inquiryOptions}
                                    selected={inquiryValue}
                                    onChange={(val) => setValue("inquiryStatus", val as any)}
                                    placeholder="Select Inquiry Status"
                                />
                                {errors.inquiryStatus && (
                                    <p className="text-red-500 text-xs mt-1">
                                        Inquiry Status is required
                                    </p>
                                )}
                            </div>

                            {/* Next Followup Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Next Followup Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        {...register("nextFollowUpDate", {
                                            required: "Next Followup Date is required",
                                        })}
                                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm pr-10 focus:ring-2 focus:ring-blue-500 ${errors.nextFollowUpDate
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300"
                                            }`}
                                    />
                                    <Calendar className="absolute right-2 top-2.5 w-5 h-5 text-gray-400" />
                                </div>
                                {errors.nextFollowUpDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nextFollowUpDate.message}
                                    </p>
                                )}
                            </div>

                            {/* Budget Upto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget Upto
                                </label>
                                <div className="relative">
                                    <CommonDropdown
                                        options={budgetOptions}
                                        selected={budgetValue}
                                        onChange={(val) =>
                                            setValue("budgetUpto", val as any)
                                        }
                                        placeholder="Select Budget"
                                    />
                                    <IndianRupee className="absolute right-2 top-3 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Remark */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Remark <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register("remark", {
                                    required: "Remark is required",
                                })}
                                rows={3}
                                className={`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.remark ? "border-red-500" : ""
                                    }`}
                                placeholder="Enter remark"
                            />
                            {errors.remark && (
                                <p className="text-red-500 text-xs mt-1">{errors.remark.message}</p>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>

                {/* Recent Follow Up Details */}
                <div>
                    <div className="bg-blue-50 px-6 py-2 font-semibold text-gray-700 text-sm">
                        Recent Follow Up Detail
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 border">S/No.</th>
                                    <th className="px-3 py-2 border">Type</th>
                                    <th className="px-3 py-2 border">Followup Date</th>
                                    <th className="px-3 py-2 border">Remark</th>
                                    <th className="px-3 py-2 border">Next Schedule Date</th>
                                    <th className="px-3 py-2 border">Status</th>
                                    <th className="px-3 py-2 border">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="px-3 py-2 border">1</td>
                                    <td className="px-3 py-2 border">Lead</td>
                                    <td className="px-3 py-2 border">25-08-2025 14:29</td>
                                    <td className="px-3 py-2 border">Send details, call after 6 pm</td>
                                    <td className="px-3 py-2 border">25-08-2025 14:41</td>
                                    <td className="px-3 py-2 border">IN FOLLOWUP</td>
                                    <td className="px-3 py-2 border">Dhruvi Patel</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    <div className="px-6 py-3 text-xs text-gray-500">
                        <p>
                            <span className="text-red-500 font-semibold">*ccoa:</span> customer clicked on ad,
                            <span className="text-red-500 font-semibold"> *ccoaa:</span> customer clicked again (open lead ⇐ dump lead)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FollowUpLeadModal;
