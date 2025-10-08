'use client';
import React, { useEffect, useState } from "react";
import { X, Calendar, IndianRupee, CheckCircle, AlertCircle, Users, Phone, Clock, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import CommonDropdown from "../Common/CommonDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchFollowUps, saveFollowUp } from "../../../../store/followUpSlice";
import { fetchLeads } from "../../../../store/leadSlice";

interface DropdownOption {
    label: string;
    value: string;
}

interface FollowUpFormData {
    inquiryStatus: DropdownOption | null;
    nextFollowUpDate: string;
    budgetUpto: DropdownOption | null;
    remark: string;
}

interface FollowUpLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: { id: number; name?: string; phone?: string };
}

const statusMappingReverse: Record<number, string> = {
    1: "New Lead",
    2: "in follow up",
    3: "Very Interested",
    4: "WARM",
    5: "not interested",
    6: "READY TO VISIT",
    7: "NOT CONNECTED",
    8: "Switch Off",
    9: "Not reachable/DNP",
    10: "RERA Projects",
    11: "Visit Pending",
    12: "Payment Full fill",
    13: "Registry Done",
    14: "High Interested",
    15: "closed",
};

const Toast: React.FC<{
    message: string;
    type: "success" | "error";
    onClose: () => void;
}> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right duration-300">
            <div
                className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-xl max-w-sm ${type === "success"
                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-900 dark:bg-emerald-900/90 dark:text-emerald-100 dark:border-emerald-600"
                    : "bg-rose-50/90 border-rose-300 text-rose-900 dark:bg-rose-900/90 dark:text-rose-100 dark:border-rose-600"
                    }`}
            >
                {type === "success" ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                )}
                <span className="text-sm font-medium flex-1">{message}</span>
                <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const FollowUpLeadModal: React.FC<FollowUpLeadModalProps> = ({ isOpen, onClose, lead }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { followUps, loading } = useSelector((state: RootState) => state.followUps);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        control,
    } = useForm<FollowUpFormData>({
        defaultValues: {
            inquiryStatus: { label: "in follow up", value: "in follow up" },
            budgetUpto: null,
            nextFollowUpDate: new Date().toISOString().slice(0, 16),
            remark: "",
        },
    });

    useEffect(() => {
        if (isOpen && lead?.id) dispatch(fetchFollowUps(lead.id));
    }, [dispatch, lead, isOpen]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "inquiryStatus") {
                const status = value.inquiryStatus?.value;
                if (status === "not interested" || status === "closed") {
                    setValue("nextFollowUpDate", "");
                    setValue("budgetUpto", null);
                } else if (!value.nextFollowUpDate) {
                    setValue("nextFollowUpDate", new Date().toISOString().slice(0, 16));
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    if (!isOpen) return null;

    const inquiryOptions: DropdownOption[] = [
        { label: "in follow up", value: "in follow up" },
        { label: "not interested", value: "not interested" },
        { label: "closed", value: "closed" },
    ];

    const budgetOptions: DropdownOption[] = [
        { label: "10 lacs", value: "10 lacs" },
        { label: "20 lacs", value: "20 lacs" },
        { label: "30 lacs", value: "30 lacs" },
        { label: "40 lacs", value: "40 lacs" },
        { label: "50 lacs", value: "50 lacs" },
        { label: "60 lacs", value: "60 lacs" },
        { label: "70 lacs", value: "70 lacs" },
        { label: "80 lacs", value: "80 lacs" },
        { label: "90 lacs", value: "90 lacs" },
        { label: "1 Crore", value: "1 Crore" },
        { label: "1.5 Crore", value: "1.5 Crore" },
        { label: "2 Crore", value: "2 Crore" },
    ];

    const inquiryValue = watch("inquiryStatus");
    const isDisabledStatus = inquiryValue?.value === "not interested" || inquiryValue?.value === "closed";

    const onSubmit = async (data: FollowUpFormData) => {
        try {
            if (!lead?.id) throw new Error("Lead ID not found");

            const followUpStatusString = data.inquiryStatus?.value || "in follow up";
            const result: any = await dispatch(
                saveFollowUp({
                    leadId: lead.id,
                    followUpStatus: followUpStatusString,
                    followUpDate: data.nextFollowUpDate,
                    budget: data.budgetUpto?.value || "",
                    remark: data.remark,
                })
            );

            if (saveFollowUp.fulfilled.match(result)) {
                await dispatch(fetchFollowUps(lead.id));
                const params = {
                    page: currentPage,
                    limit: pageSize,
                };
                dispatch(fetchLeads(params));
                setToast({ message: "Follow-up saved successfully!", type: "success" });
                reset({
                    inquiryStatus: { label: "in follow up", value: "in follow up" },
                    budgetUpto: null,
                    nextFollowUpDate: new Date().toISOString().slice(0, 16),
                    remark: "",
                });
                onClose();
            } else {
                const errorMessage = result.payload?.message || "Failed to save follow-up. Please try again.";
                setToast({ message: errorMessage, type: "error" });
            }
        } catch (error: any) {
            console.error("Error saving follow-up:", error);
            const errorMessage = error?.message || "Failed to save follow-up. Please try again.";
            setToast({ message: errorMessage, type: "error" });
        }
    };

    const handleClose = () => {
        reset({
            inquiryStatus: { label: "in follow up", value: "in follow up" },
            budgetUpto: null,
            nextFollowUpDate: new Date().toISOString().slice(0, 16),
            remark: "",
        });
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4" style={{ margin: "0px" }}>
                <div className="bg-white dark:bg-gray-900 w-full max-w-md sm:max-w-2xl md:max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
                    {/* Modern Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950 text-white px-6 sm:px-8 py-6 sm:py-8">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                        <div className="relative flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Lead Follow-up</h2>
                                </div>
                                <p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base ml-14">
                                    Track and manage customer interactions
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="hover:bg-white/20 p-2.5 rounded-xl transition-all duration-200 hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="px-6 sm:px-8 py-5 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Customer Name</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        {lead.name || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                                    <Phone className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Phone Number</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        {lead.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* Inquiry Status */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Inquiry Status <span className="text-rose-500">*</span>
                                    </label>
                                    <CommonDropdown
                                        options={inquiryOptions}
                                        selected={inquiryValue}
                                        onChange={(val: any) => setValue("inquiryStatus", val)}
                                        placeholder="Select Inquiry Status"
                                    />
                                    {errors.inquiryStatus && (
                                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Inquiry Status is required
                                        </p>
                                    )}
                                </div>

                                {/* Next Follow-up Date */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Next Followup Date {isDisabledStatus ? "" : <span className="text-rose-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            {...register("nextFollowUpDate", {
                                                required: !isDisabledStatus ? "Next Followup Date is required" : false
                                            })}
                                            disabled={isDisabledStatus}
                                            value={isDisabledStatus ? "" : watch("nextFollowUpDate")}
                                            className={`w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200 ${errors.nextFollowUpDate
                                                ? "border-rose-300 dark:border-rose-600"
                                                : "border-gray-200 dark:border-gray-700"
                                                } ${isDisabledStatus ? "bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60" : "hover:border-blue-400"}`}
                                        />
                                        <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.nextFollowUpDate && (
                                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.nextFollowUpDate.message}
                                        </p>
                                    )}
                                </div>

                                {/* Budget */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Budget Upto
                                    </label>
                                    <div className="relative">
                                        <CommonDropdown
                                            options={budgetOptions}
                                            selected={watch("budgetUpto")}
                                            onChange={(val: any) => setValue("budgetUpto", val)}
                                            placeholder="Select Budget"
                                            disabled={isDisabledStatus}
                                        />
                                        <IndianRupee className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Remark */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Remark {isDisabledStatus ? "" : <span className="text-rose-500">*</span>}
                                </label>
                                <textarea
                                    {...register("remark", {
                                        required: !isDisabledStatus ? "Remark is required" : false
                                    })}
                                    rows={4}
                                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200 resize-none ${errors.remark
                                        ? "border-rose-300 dark:border-rose-600"
                                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                                        }`}
                                    placeholder="Enter detailed remarks about the follow-up interaction..."
                                />
                                {errors.remark && (
                                    <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.remark.message}
                                    </p>
                                )}
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-300 transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-2xl"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Save Follow-up
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Follow-up History Table */}
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                        Recent Follow-up History
                                    </h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-5 py-4 text-left font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                                S.No.
                                            </th>
                                            <th className="px-5 py-4 text-left font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                                Next Follow-up Date
                                            </th>
                                            <th className="px-5 py-4 text-left font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                                Remark
                                            </th>
                                            <th className="px-5 py-4 text-left font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                                Budget
                                            </th>
                                            <th className="px-5 py-4 text-left font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {followUps.length > 0 ? (
                                            followUps.map((f: any, index: number) => (
                                                <tr key={`${f.id}-${index}`} className="hover:bg-blue-50/50 dark:hover:bg-gray-800/70 transition-colors duration-150">
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                                                        {f.followUpDate
                                                            ? new Date(f.followUpDate).toLocaleString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                                timeZone: "UTC",
                                                            })
                                                            : "N/A"}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                                        {f.remark || "No remark"}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-800 dark:text-gray-200 font-semibold">
                                                        {f.budget || "Not specified"}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                                                            {f.followUpStatus || "N/A"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr key="no-followups">
                                                <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                            <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-base mb-1">No follow-ups yet</p>
                                                            <p className="text-sm text-gray-400">Start tracking your customer interactions</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default FollowUpLeadModal;