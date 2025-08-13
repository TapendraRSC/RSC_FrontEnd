"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "../Common/FormInput";
import CommonDropdown from "../Common/CommonDropdown";

interface FormData {
    name: string;
    mobile: string;
    altMobile: string;
    email: string;
    plotInterestNo: string;
    source: string;
    assignUser: string;
    phase: string;
    offerPrice: number;
    siteVisitDate: string;
    siteVisitTime: string;
    siteVisitInfo: string;
    visitRemark: string;
}

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    initialData?: Partial<FormData> | null;
    isLoading?: boolean;
}

const statusOptions = [
    { label: "Direct Call", value: "Direct Call" },
    { label: "Facebook", value: "Facebook" },
    { label: "Google Ads", value: "Google Ads" },
];

const assignUserOptions = [
    { label: "User 1", value: "User 1" },
    { label: "User 2", value: "User 2" },
];

const phaseOptions = [
    { label: "Phase 1", value: "Phase 1" },
    { label: "Phase 2", value: "Phase 2" },
];

const LeadModal: React.FC<LeadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isLoading,
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            mobile: "",
            altMobile: "",
            email: "",
            plotInterestNo: "",
            source: "",
            assignUser: "",
            phase: "",
            offerPrice: 0,
            siteVisitDate: "",
            siteVisitTime: "",
            siteVisitInfo: "",
            visitRemark: "",
            ...initialData,
        },
    });

    const submitHandler = (data: FormData) => {
        onSave(data);
        handleClose(); // also reset when saving
    };

    const handleClose = () => {
        reset(); // clears values + errors
        onClose();
    };

    // When modal opens with initialData, reset form
    useEffect(() => {
        if (isOpen) {
            reset({
                name: "",
                mobile: "",
                altMobile: "",
                email: "",
                plotInterestNo: "",
                source: "",
                assignUser: "",
                phase: "",
                offerPrice: 0,
                siteVisitDate: "",
                siteVisitTime: "",
                siteVisitInfo: "",
                visitRemark: "",
                ...initialData,
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4" style={{ margin: "0" }}   >
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Add Lead</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={handleSubmit(submitHandler)}
                >
                    <FormInput<FormData>
                        name="name"
                        label="Name"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter Name"
                    />

                    <FormInput<FormData>
                        name="mobile"
                        label="Mobile"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter Mobile"
                    />

                    <FormInput<FormData>
                        name="altMobile"
                        label="Alt Mobile"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter Alt Mobile"
                    />

                    <FormInput<FormData>
                        name="email"
                        label="Email"
                        type="email"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter Email"
                    />

                    <FormInput<FormData>
                        name="plotInterestNo"
                        label="Plot Interest No"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter Plot Interest No"
                    />

                    {/* Source Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Source<span className="text-red-500 ml-1">*</span>
                        </label>
                        <CommonDropdown
                            options={statusOptions}
                            onChange={(value) =>
                                setValue("source", (value as any).value, {
                                    shouldValidate: true,
                                })
                            }
                            placeholder="Select Source"
                            selected={
                                statusOptions.find(
                                    (s) => s.value === watch("source")
                                ) || null
                            }
                        />
                        {errors.source && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.source.message}
                            </p>
                        )}
                    </div>

                    {/* Assign User Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign User
                        </label>
                        <CommonDropdown
                            options={assignUserOptions}
                            onChange={(value) =>
                                setValue("assignUser", (value as any).value, {
                                    shouldValidate: true,
                                })
                            }
                            placeholder="Select User"
                            selected={
                                assignUserOptions.find(
                                    (s) => s.value === watch("assignUser")
                                ) || null
                            }
                        />
                        {errors.assignUser && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.assignUser.message}
                            </p>
                        )}
                    </div>

                    {/* Phase Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phase
                        </label>
                        <CommonDropdown
                            options={phaseOptions}
                            onChange={(value) =>
                                setValue("phase", (value as any).value, {
                                    shouldValidate: true,
                                })
                            }
                            placeholder="Select Phase"
                            selected={
                                phaseOptions.find((s) => s.value === watch("phase")) || null
                            }
                        />
                        {errors.phase && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.phase.message}
                            </p>
                        )}
                    </div>

                    <FormInput<FormData>
                        name="offerPrice"
                        label="Offer Price"
                        type="number"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter Offer Price"
                    />

                    <FormInput<FormData>
                        name="siteVisitDate"
                        label="Site Visit Date"
                        type="date"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                    />

                    <FormInput<FormData>
                        name="siteVisitTime"
                        label="Site Visit Time"
                        type="time"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                    />

                    <FormInput<FormData>
                        name="siteVisitInfo"
                        label="Site Visit Info"
                        type="textarea"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter site visit info"
                    />

                    <FormInput<FormData>
                        name="visitRemark"
                        label="Visit Remark"
                        type="textarea"
                        register={register}
                        errors={errors}
                        clearErrors={clearErrors}
                        placeholder="Enter visit remark"
                    />
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit(submitHandler)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadModal;
