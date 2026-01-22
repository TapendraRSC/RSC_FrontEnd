'use client';

import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import FormInput from '../Common/FormInput';
import { useEffect } from 'react';

// ---------------- Types ----------------
interface Permission {
    id: number;
    permissionName: string;
}

interface PermissionModalShowProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePermission: (permission: Omit<Permission, 'id'>) => void;
    isLoading: boolean;
    currentPermission: Permission | null;
}

interface FormData {
    permissionName: string;
}

// ---------------- Component ----------------
const PermissionModalShow: React.FC<PermissionModalShowProps> = ({
    isOpen,
    onClose,
    onSavePermission,
    isLoading,
    currentPermission,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>();

    // ✅ Reset form when modal opens with existing data
    useEffect(() => {
        if (currentPermission) {
            reset({
                permissionName: currentPermission.permissionName,
            });
        } else {
            reset({ permissionName: '' });
        }
    }, [currentPermission, reset]);

    const onSubmit = (data: FormData) => {
        onSavePermission(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    // ---------------- UI ----------------
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            style={{ margin: '0px' }}
        >
            {/* Modal Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentPermission ? 'Edit Permission' : 'Add New Permission'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                    {/* Input Field */}
                    <FormInput<FormData>
                        name="permissionName"
                        label="Permission Name"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter permission name"
                    />

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2">

                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                       text-gray-700 dark:text-gray-300 
                                       hover:bg-gray-100 dark:hover:bg-gray-700 
                                       transition-colors"
                        >
                            Cancel
                        </button>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 
                                       bg-orange-500 hover:bg-orange-600 
                                       text-white rounded-md 
                                       disabled:opacity-60 
                                       transition-colors shadow-md dark:shadow-orange-800/30"
                        >
                            {isLoading ? (
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
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
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {currentPermission ? 'Update Permission' : 'Add Permission'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionModalShow;
