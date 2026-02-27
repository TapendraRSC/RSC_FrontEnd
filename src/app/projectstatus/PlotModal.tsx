"use client";

import { Controller, useForm } from "react-hook-form";
import { X, Plus } from "lucide-react";
import { useEffect } from "react";
import FormInput from "../components/Common/FormInput";
import CommonDropdown from "../components/Common/CommonDropdown";

interface PlotFormData {
    plotNumber?: string;
    facing?: string;
    plotSize?: string;
    price?: string;
    onlinePrice?: string;
    creditPoint?: number;
    city?: string;
    status?: string;
}

interface PlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePlot: (data: any) => void;
    isLoading: boolean;
    currentPlot: any | null;
    projectTitle?: string;
}

const facingOptions = [
    { id: 1, label: "North", value: "north" },
    { id: 2, label: "South", value: "south" },
    { id: 3, label: "East", value: "east" },
    { id: 4, label: "West", value: "west" },
];

const defaultValues: PlotFormData = {
    plotNumber: "",
    facing: undefined,
    plotSize: "",
    price: "",
    onlinePrice: "",
    creditPoint: 0,
    city: "",
    status: undefined,
};

export default function PlotModal({
    isOpen,
    onClose,
    onSavePlot,
    isLoading,
    currentPlot,
    projectTitle,
}: PlotModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        clearErrors,
    } = useForm<PlotFormData>({ defaultValues });

    const isEditMode = !!currentPlot;

    // ✅ Add mode = "Available", Edit mode = API value — both disabled
    const displayStatus = isEditMode ? (currentPlot?.status || "—") : "Available";
    const displayProjectTitle = isEditMode ? currentPlot?.projectTitle : projectTitle || "—";

    useEffect(() => {
        if (currentPlot) {
            reset({
                plotNumber: currentPlot.plotNumber || "",
                facing: currentPlot.facing || undefined,
                plotSize: currentPlot.plotSize || "",
                price: currentPlot.price || "",
                onlinePrice: currentPlot.onlinePrice || "",
                creditPoint: currentPlot.creditPoint ?? 0,
                city: currentPlot.city || "",
            });
        } else {
            reset(defaultValues);
        }
    }, [currentPlot, reset]);

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
            clearErrors();
        }
    }, [isOpen, reset, clearErrors]);

    const onSubmit = (data: PlotFormData) => {
        onSavePlot({
            plotNumber: data.plotNumber,
            facing: data.facing || null,
            plotSize: data.plotSize,
            price: data.price,
            onlinePrice: data.onlinePrice,
            creditPoint: Number(data.creditPoint),
            city: data.city || null,
            status: displayStatus,
        });
    };

    const handleClose = () => {
        reset(defaultValues);
        clearErrors();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {isEditMode ? "Edit Plot" : "Add New Plot"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="space-y-6">

                        {/* Plot Number + City */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Plot No — editable in add, disabled in edit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Plot Number {!isEditMode && <span className="text-red-500">*</span>}
                                </label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={currentPlot?.plotNumber || ""}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                                                   bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Enter plot number"
                                            {...register("plotNumber", { required: "Plot number is required" })}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm
                                                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                       focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                                       ${errors.plotNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                        {errors.plotNumber && (
                                            <p className="mt-1 text-sm text-red-600">{errors.plotNumber.message}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* City — editable in add, disabled in edit */}
                            {/* {isEditMode ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={currentPlot?.city || "—"}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                                                   bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            ) : (
                                <FormInput<PlotFormData>
                                    name="city"
                                    label="City"
                                    register={register}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    placeholder="Enter city"
                                    className="dark:bg-gray-800 dark:text-gray-100"
                                />
                            )} */}


                            <FormInput<PlotFormData>
                                name="city"
                                label="City"
                                register={register}
                                errors={errors}
                                clearErrors={clearErrors}
                                placeholder="Enter city"
                                className="dark:bg-gray-800 dark:text-gray-100"
                            />


                        </div>

                        {/* Plot Size + Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput<PlotFormData>
                                name="plotSize"
                                label="Plot Size"
                                type="number"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                                step="any"
                                placeholder="Enter plot size"
                                className="dark:bg-gray-800 dark:text-gray-100"
                            />
                            <FormInput<PlotFormData>
                                name="price"
                                label="Price (₹)"
                                type="number"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                                step="any"
                                placeholder="Enter price"
                                className="dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Online Price + Credit Point */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput<PlotFormData>
                                name="onlinePrice"
                                label="Online Price (₹)"
                                type="number"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                                step="any"
                                placeholder="Enter online price"
                                className="dark:bg-gray-800 dark:text-gray-100"
                            />
                            <FormInput<PlotFormData>
                                name="creditPoint"
                                label="Credit Point"
                                type="number"
                                register={register}
                                errors={errors}
                                clearErrors={clearErrors}
                                step="1"
                                placeholder="Enter credit point"
                                className="dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Facing + Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Facing — always editable */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Facing
                                </label>
                                <Controller
                                    name="facing"
                                    control={control}
                                    render={({ field }) => (
                                        <CommonDropdown
                                            options={facingOptions}
                                            selected={facingOptions.find(f => f.value === field.value) || null}
                                            onChange={(value: any) => field.onChange(value?.value || null)}
                                            placeholder="Select facing"
                                            error={!!errors.facing}
                                            className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                                        />
                                    )}
                                />
                            </div>

                            {/* Status — always disabled */}
                            {/* Add = "Available", Edit = API value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Status
                                </label>
                                <input
                                    type="text"
                                    value={displayStatus}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                                               bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Project — always disabled */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Project
                            </label>
                            <input
                                type="text"
                                value={displayProjectTitle}
                                disabled
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                                           bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[120px]"
                        >
                            {isLoading ? (
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    {isEditMode ? "Update Plot" : "Add Plot"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}