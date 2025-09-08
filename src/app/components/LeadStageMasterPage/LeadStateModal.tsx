'use client';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import FormInput from '../Common/FormInput';
import { useEffect } from 'react';

// Updated interface to match API structure
interface LeadStage {
    id: number;
    type: string;
}

interface LeadStateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveLeadStage: (leadStageType: string) => void; // Updated parameter name
    isLoading: boolean;
    currentLeadStage: LeadStage | null;
}

interface FormData {
    type: string;
}

export default function LeadStateModal({
    isOpen,
    onClose,
    onSaveLeadStage,
    isLoading,
    currentLeadStage
}: LeadStateModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>();

    useEffect(() => {
        if (currentLeadStage) {
            reset({ type: currentLeadStage.type });
        } else {
            reset({ type: '' });
        }
    }, [currentLeadStage, reset, isOpen]);

    const onSubmit = (data: FormData) => {
        onSaveLeadStage(data.type);
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" style={{ marginTop: "0px" }}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentLeadStage ? 'Edit Lead Stage' : 'Add New Lead Stage'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <FormInput<FormData>
                        name="type"
                        label="Lead Stage Type"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter lead stage type (e.g., Hot, Cool, Raw)"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    {currentLeadStage ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {currentLeadStage ? 'Update Lead Stage' : 'Add Lead Stage'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}