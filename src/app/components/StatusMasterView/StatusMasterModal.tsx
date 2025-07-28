// StatusMasterModal.tsx
'use client';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import FormInput from '../Common/FormInput';
import { useEffect } from 'react';

interface Status {
    id: number;
    statusName: string;
    statusCode: string;
}

interface StatusMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveStatus: (status: Omit<Status, 'id'>) => void;
    isLoading: boolean;
    currentStatus: Status | null;
}

interface FormData {
    statusName: string;
    statusCode: string;
}

const StatusMasterModal: React.FC<StatusMasterModalProps> = ({
    isOpen,
    onClose,
    onSaveStatus,
    isLoading,
    currentStatus,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>();

    useEffect(() => {
        if (currentStatus) {
            reset({
                statusName: currentStatus.statusName,
                statusCode: currentStatus.statusCode,
            });
        } else {
            reset({ statusName: '', statusCode: '' });
        }
    }, [currentStatus, reset]);

    const onSubmit = (data: FormData) => {
        onSaveStatus(data);
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
                        {currentStatus ? 'Edit Status' : 'Add New Status'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <FormInput<FormData>
                        name="statusName"
                        label="Status Name"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter status name"
                    />
                    <FormInput<FormData>
                        name="statusCode"
                        label="Status Code"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter status code"
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
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {currentStatus ? 'Update Status' : 'Add Status'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusMasterModal;
