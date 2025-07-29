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

    useEffect(() => {
        if (currentPermission) {
            reset({ pageName: currentPermission.pageName });
        } else {
            reset({ pageName: '' });
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" style={{ margin: "0px" }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentPermission ? 'Edit Page Permission' : 'Add New Page Permission'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <FormInput<FormData>
                        name="pageName"
                        label="Page Name"
                        register={register}
                        errors={errors}
                        required
                        placeholder="Enter page name"
                        clearErrors={clearErrors}
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
