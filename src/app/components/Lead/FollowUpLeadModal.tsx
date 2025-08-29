'use client';
import React, { useEffect, useState } from "react";
import { X, Calendar, IndianRupee, CheckCircle, AlertCircle, Users, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import CommonDropdown from "../Common/CommonDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchFollowUps, FollowUp, saveFollowUp } from "../../../../store/followUpSlice";

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

// ✅ Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm ${type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {type === 'success'
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <AlertCircle className="w-5 h-5 text-red-600" />}
                <span className="text-sm font-medium">{message}</span>
                <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

const FollowUpLeadModal: React.FC<FollowUpLeadModalProps> = ({ isOpen, onClose, lead }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { followUps, loading } = useSelector((state: RootState) => state.followUps);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FollowUpFormData>({
        defaultValues: {
            inquiryStatus: { label: "IN FOLLOWUP", value: "IN FOLLOWUP" },
            budgetUpto: null,
            nextFollowUpDate: new Date().toISOString().slice(0, 16),
            remark: ""
        },
    });

    useEffect(() => {
        if (isOpen && lead?.id) dispatch(fetchFollowUps(lead.id));
    }, [dispatch, lead, isOpen]);

    if (!isOpen) return null;

    // ✅ Inquiry Options
    const inquiryOptions: DropdownOption[] = [
        { label: "IN FOLLOWUP", value: "IN FOLLOWUP" },
        { label: "Very Interested", value: "Very Interested" },
        { label: "WARM", value: "WARM" },
        { label: "Not Interested", value: "Not Interested" },
        { label: "READY TO VISIT", value: "READY TO VISIT" },
        { label: "NOT CONNECTED", value: "NOT CONNECTED" },
        { label: "Switch Off", value: "Switch Off" },
        { label: "Not reachable/DNP", value: "Not reachable/DNP" },
        { label: "RERA Projects", value: "RERA Projects" },
        { label: "Visit Pending", value: "Visit Pending" },
        { label: "Payment Full fill", value: "Payment Full fill" },
        { label: "Registry Done", value: "Registry Done" },
        { label: "High Interested", value: "High Interested" },
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
    const budgetValue = watch("budgetUpto");

    // ✅ Map leadStatusId to readable status
    const statusMappingReverse: Record<number, string> = {
        1: "New Lead",
        2: "IN FOLLOWUP",
        3: "Very Interested",
        4: "WARM",
        5: "Not Interested",
        6: "READY TO VISIT",
        7: "NOT CONNECTED",
        8: "Switch Off",
        9: "Not reachable/DNP",
        10: "RERA Projects",
        11: "Visit Pending",
        12: "Payment Full fill",
        13: "Registry Done",
        14: "High Interested"
    };

    // ✅ Save Follow-up
    const onSubmit = async (data: FollowUpFormData) => {
        try {
            if (!lead?.id) throw new Error("Lead ID not found");

            await dispatch(saveFollowUp({
                leadId: lead.id,
                leadStatusId: data.inquiryStatus?.value === "IN FOLLOWUP" ? 2 : 1,
                followUpDate: data.nextFollowUpDate,
                budget: data.budgetUpto?.value || "",
                remark: data.remark
            }));

            await dispatch(fetchFollowUps(lead.id));

            setToast({ message: "Follow-up saved successfully!", type: 'success' });

            reset({
                inquiryStatus: { label: "IN FOLLOWUP", value: "IN FOLLOWUP" },
                budgetUpto: null,
                nextFollowUpDate: new Date().toISOString().slice(0, 16),
                remark: "",
            });
        } catch (error) {
            setToast({ message: "Failed to save follow-up. Please try again.", type: 'error' });
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ margin: "0px" }}>
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shadow-sm">
                        <div>
                            <h2 className="text-xl font-semibold">Lead Follow-up</h2>
                            <p className="text-blue-100 text-sm mt-1">Track and manage customer interactions</p>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Customer Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Customer:</span>
                                <span className="text-gray-900 font-semibold">{lead.name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Phone:</span>
                                <span className="text-gray-900 font-semibold">{lead.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        <div onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Inquiry Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Inquiry Status <span className="text-red-500">*</span>
                                    </label>
                                    <CommonDropdown
                                        options={inquiryOptions}
                                        selected={inquiryValue}
                                        onChange={(val: any) => setValue("inquiryStatus", val)}
                                        placeholder="Select Inquiry Status"
                                    />
                                    {errors.inquiryStatus && <p className="text-red-500 text-xs mt-1">Inquiry Status is required</p>}
                                </div>

                                {/* Next Followup Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Next Followup Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            {...register("nextFollowUpDate", { required: "Next Followup Date is required" })}
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.nextFollowUpDate ? "border-red-300" : "border-gray-300"}`}
                                        />
                                        <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>
                                    {errors.nextFollowUpDate && <p className="text-red-500 text-xs mt-1">{errors.nextFollowUpDate.message}</p>}
                                </div>

                                {/* Budget Upto */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Budget Upto
                                    </label>
                                    <div className="relative">
                                        <CommonDropdown
                                            options={budgetOptions}
                                            selected={budgetValue}
                                            onChange={(val: any) => setValue("budgetUpto", val)}
                                            placeholder="Select Budget"
                                        />
                                        <IndianRupee className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Remark */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Remark <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register("remark", { required: "Remark is required" })}
                                    rows={4}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${errors.remark ? "border-red-300" : "border-gray-300"}`}
                                    placeholder="Enter detailed remarks about the follow-up..."
                                />
                                {errors.remark && <p className="text-red-500 text-xs mt-1">{errors.remark.message}</p>}
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={loading}
                                    className={`px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Follow-up"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ✅ Follow-up Table */}
                        <div className="border-t border-gray-200 mt-4">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b">
                                <h3 className="font-semibold text-gray-800 text-sm">Recent Follow-up History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">S.No.</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Next Follow-up Date</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Remark</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Budget</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                            {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">Created By</th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {followUps.length > 0 ? (
                                            followUps.map((f: any, index: number) => (
                                                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3 text-gray-800 font-medium">
                                                        {new Date(f.followUpDate).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={f.remark}>{f.remark}</td>
                                                    <td className="px-4 py-3 text-gray-700 font-medium">{f.budget || "Not specified"}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {statusMappingReverse[f.leadStatusId] || "N/A"}
                                                        </span>
                                                    </td>
                                                    {/* <td className="px-4 py-3 text-gray-600">{f.createdBy}</td> */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Users className="w-8 h-8 text-gray-300" />
                                                        <span>No follow-ups found</span>
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
