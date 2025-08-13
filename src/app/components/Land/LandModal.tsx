"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Map } from "lucide-react"; // Lucide icons

type LandModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { type: string }) => void;
    initialData?: { id?: number | null; type: string } | null;
};

type FormData = {
    type: string;
};

const LandModal: React.FC<LandModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    useEffect(() => {
        if (initialData) {
            reset({ type: initialData.type });
        } else {
            reset({ type: "" });
        }
    }, [initialData, reset]);

    if (!isOpen) return null;

    const onSubmit = (data: FormData) => {
        onSave(data);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" style={{ margin: "0px" }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        {/* <Map className="w-5 h-5 text-blue-600" /> */}
                        <h2 className="text-lg font-semibold text-gray-800">
                            {initialData ? "Edit Land" : "Add Land"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Type Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("type", { required: "Type is required" })}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter land type"
                        />
                        {errors.type && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.type.message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
                        >
                            {initialData ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LandModal;
