import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check, Loader2 } from 'lucide-react';
import FormInput from '../Common/FormInput';

interface CreditFormData {
    projectName: string;
    plotNumber: string;
    employeeName: string;
    amount: number | string;
}

interface CreditCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreditFormData) => Promise<void>;
    currentData: any;
}

const CreditCollectionModal: React.FC<CreditCollectionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentData
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!currentData;

    const {
        register,
        handleSubmit,
        reset,
        clearErrors,
        formState: { errors }
    } = useForm<CreditFormData>();

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                reset({
                    projectName: currentData.projectName || '',
                    plotNumber: currentData.plotNumber || '',
                    employeeName: currentData.employeeName || '',
                    amount: currentData.amount || '',
                });
            } else {
                reset({
                    projectName: '',
                    plotNumber: '',
                    employeeName: '',
                    amount: ''
                });
            }
        }
    }, [currentData, reset, isOpen]);

    const onSubmit = async (data: CreditFormData) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Common input styles
    const inputStyles = "w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
    const disabledStyles = "bg-gray-100 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">
                        {isEditMode ? 'Edit' : 'Add'} Credit Record
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Project Name */}
                    <div>
                        <label className={labelStyles}>
                            Project Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            {...register('projectName', {
                                required: isEditMode ? false : "Project name is required"
                            })}
                            disabled={isEditMode}
                            className={`${inputStyles} ${isEditMode ? disabledStyles : ''}`}
                            placeholder="Enter project name"
                        />
                        {errors.projectName && (
                            <p className="text-red-500 text-xs mt-1">{errors.projectName.message}</p>
                        )}
                    </div>

                    {/* Plot Number */}
                    <div>
                        <label className={labelStyles}>
                            Plot Number {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            {...register('plotNumber', {
                                required: isEditMode ? false : "Plot number is required"
                            })}
                            disabled={isEditMode}
                            className={`${inputStyles} ${isEditMode ? disabledStyles : ''}`}
                            placeholder="Enter plot number"
                        />
                        {errors.plotNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.plotNumber.message}</p>
                        )}
                    </div>

                    {/* Employee Name */}
                    <div>
                        <label className={labelStyles}>
                            Employee Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            {...register('employeeName', {
                                required: isEditMode ? false : "Employee name is required"
                            })}
                            disabled={isEditMode}
                            className={`${inputStyles} ${isEditMode ? disabledStyles : ''}`}
                            placeholder="Enter employee name"
                        />
                        {errors.employeeName && (
                            <p className="text-red-500 text-xs mt-1">{errors.employeeName.message}</p>
                        )}
                    </div>

                    {/* Amount - Always Editable */}
                    <div>
                        <label className={labelStyles}>
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('amount', {
                                required: "Amount is required",
                                min: { value: 1, message: "Amount must be greater than 0" }
                            })}
                            className={inputStyles}
                            placeholder="Enter amount"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Info message in edit mode */}
                    {/* {isEditMode && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                            <span>ℹ️</span>
                            <span>Only Amount can be edited. Other fields are read-only.</span>
                        </div>
                    )} */}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> {isEditMode ? 'Update' : 'Save'} Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreditCollectionModal;