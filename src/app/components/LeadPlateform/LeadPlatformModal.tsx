// components/LeadPlatformModal.tsx
"use client";

import React, { useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../Common/FormInput";

interface LeadPlatform {
    id: number;
    platformType: string;
}

interface LeadPlatformModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePlatform: (platform: Omit<LeadPlatform, "id">) => void;
    currentPlatform: LeadPlatform | null;
    isLoading: boolean; // 👈 add kiya
}

interface FormData {
    platformType: string;
}

const LeadPlatformModal: React.FC<LeadPlatformModalProps> = ({
    isOpen,
    onClose,
    onSavePlatform,
    currentPlatform,
    isLoading,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>();

    useEffect(() => {
        if (currentPlatform) {
            reset({ platformType: currentPlatform.platformType });
        } else {
            reset({ platformType: "" });
        }
    }, [currentPlatform, reset]);

    const onSubmit = (data: FormData) => {
        if (!isLoading) {
            onSavePlatform(data);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            style={{ margin: "0px" }}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentPlatform ? "Edit Lead Platform" : "Add New Lead Platform"}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <FormInput<FormData>
                        name="platformType"
                        label="Platform Name"
                        register={register}
                        errors={errors}
                        required
                        placeholder="Enter platform name"
                        clearErrors={clearErrors}
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {currentPlatform ? "Update Platform" : "Add Platform"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadPlatformModal;
