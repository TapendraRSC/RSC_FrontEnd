'use client';
import React, { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import FormInput from "../Common/FormInput";

interface ColletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    isLoading?: boolean;
}

const ColletionModal: React.FC<ColletionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors,
    }: UseFormReturn<any> = useForm();

    const emiPlanOptions = [
        "0 Days",
        "15 Days",
        "30 Days",
        "35 Days",
        "45 Days",
        "55 Days",
        "60 Days",
        "2 Months",
        "6 Months",
        "11 Months",
    ];

    const registryStatusOptions = ["Pending", "Done"];

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                projectName: initialData.projectName || "",
                employeeName: initialData.employeeName || "",
                clientName: initialData.clientName || "",
                mobileNumber: initialData.mobileNumber || "",
                emailId: initialData.emailId || "",
                plotNumber: initialData.plotNumber || "",
                emiPlan: initialData.emiPlan || "",
                plotSize: initialData.plotSize || "",
                price: initialData.price || "",
                plotOnlinePrice: initialData.plotOnlinePrice || "",
                plotCreditPrice: initialData.plotCreditPrice || "",
                registryStatus: initialData.registryStatus || "",
                plotValue: initialData.plotValue || "",
                paymentReceived: initialData.paymentReceived || "",
                pendingAmount: initialData.pendingAmount || "",
                commission: initialData.commission || "",
                maintenance: initialData.maintenance || "",
                stampDuty: initialData.stampDuty || "",
                legalFees: initialData.legalFees || "",
                onlineAmount: initialData.onlineAmount || "",
                receivedOnlineAmount: initialData.receivedOnlineAmount || "",
                pendingOnlineAmount: initialData.pendingOnlineAmount || "",
                cashAmount: initialData.cashAmount || "",
                receivedCreditAmount: initialData.receivedCreditAmount || "",
                pendingCreditAmount: initialData.pendingCreditAmount || "",
                totalAmount: initialData.totalAmount || "",
                incentive: initialData.incentive || "",
                CPName: initialData.CPName || "",
            });
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: any) => onSave(data);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white tracking-wide">
                        Edit Collection Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="overflow-y-auto flex-1 p-6 space-y-6"
                >
                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h3 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">
                            Basic Information
                        </h3>
                        <FormInput
                            disabled
                            label="Project Name"
                            name="projectName"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Employee Name"
                            name="employeeName"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Client Name"
                            name="clientName"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Mobile Number"
                            name="mobileNumber"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Email ID"
                            name="emailId"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="CP Name"
                            name="CPName"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                    </div>

                    {/* Section 2: Plot Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h3 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">
                            Plot & Plan Details
                        </h3>
                        <FormInput
                            label="Plot Number"
                            name="plotNumber"
                            register={register}
                            errors={errors}
                            disabled
                            clearErrors={clearErrors}
                        />

                        {/* EMI Plan Dropdown */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-600 mb-1 text-white">
                                EMI Plan
                            </label>
                            <select
                                {...register("emiPlan")}
                                className="text-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-900 text-gray-700 transition"
                            >
                                <option value="">Select EMI Plan</option>
                                {emiPlanOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <FormInput
                            label="Plot Size"
                            name="plotSize"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Price"
                            name="price"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Online Price"
                            name="plotOnlinePrice"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Credit Price"
                            name="plotCreditPrice"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />

                        {/* Registry Status Dropdown */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-600 mb-1 text-white ">
                                Registry Status
                            </label>
                            <select
                                {...register("registryStatus")}
                                className="text-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-900 text-gray-700 transition"
                            >
                                <option value="">Select Status</option>
                                {registryStatusOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Financial Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h3 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">
                            Financials & Amounts
                        </h3>
                        <FormInput
                            label="Plot Value"
                            name="plotValue"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Payment Received"
                            name="paymentReceived"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Pending Amount"
                            name="pendingAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Commission"
                            name="commission"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Online Amount"
                            name="onlineAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Received Online Amount"
                            name="receivedOnlineAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Pending Online Amount"
                            name="pendingOnlineAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Credit Points (Cash Amount)"
                            name="cashAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Received Credit Points"
                            name="receivedCreditAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Pending Credit Points"
                            name="pendingCreditAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Total Amount"
                            name="totalAmount"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Incentive"
                            name="incentive"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                    </div>

                    {/* Section 4: Extra Charges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h3 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">
                            Taxes & Fees
                        </h3>
                        <FormInput
                            label="Maintenance"
                            name="maintenance"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Stamp Duty"
                            name="stampDuty"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                        <FormInput
                            label="Legal Fees"
                            name="legalFees"
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white-700 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-indigo-600 text-white font-semibold hover:from-orange-700 hover:to-indigo-700 transition disabled:opacity-50"
                        >
                            {isLoading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ColletionModal;