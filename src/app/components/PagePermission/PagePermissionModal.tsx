// components/PagePermissionModal.tsx
import React, { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import FormInput from '../Common/FormInput';
import { useForm } from 'react-hook-form';

interface PagePermission {
    id: number;
    pageName: string;
}

interface PagePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePermission: (permission: Omit<PagePermission, 'id'>) => void;
    currentPermission: PagePermission | null;
}

interface FormData {
    pageName: string;
}

const PagePermissionModal: React.FC<PagePermissionModalProps> = ({
    isOpen,
    onClose,
    onSavePermission,
    currentPermission,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors
    } = useForm<FormData>();

    // Reset form when currentPermission changes
    useEffect(() => {
        if (currentPermission) {
            reset({ pageName: currentPermission.pageName });
        } else {
            reset({ pageName: '' });
        }
    }, [currentPermission, reset]);

    // Handle form submission
    const onSubmit = (data: FormData) => {
        onSavePermission(data);
    };

    // Handle modal close
    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        // Modal backdrop with dark theme support
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" style={{ margin: "0px" }}>
            {/* Modal container with dark theme support */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                {/* Modal header with dark theme support */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {currentPermission ? 'Edit Page Permission' : 'Add New Page Permission'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form with dark theme support */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Form input with dark theme support (passed through FormInput component) */}
                    <FormInput<FormData>
                        name="pageName"
                        label="Page Name"
                        register={register}
                        errors={errors}
                        required
                        placeholder="Enter page name"
                        clearErrors={clearErrors}
                        className="dark:bg-slate-800 dark:border-gray-600 dark:text-gray-100"
                    />

                    {/* Action buttons with dark theme support */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {currentPermission ? 'Update Page Permission' : 'Add Page Permission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PagePermissionModal;
