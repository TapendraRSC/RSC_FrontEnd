'use client';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { useEffect } from 'react';

interface Status {
    id: number;
    type: string;
    status: 'Active' | 'Inactive';
}

interface StatusMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveStatus: (status: Omit<Status, 'id'>) => void;
    isLoading: boolean;
    currentStatus: Status | null;
}

interface FormData {
    type: string;
    // status: 'Active' | 'Inactive';
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
    } = useForm<FormData>();

    useEffect(() => {
        if (currentStatus) {
            reset({
                type: currentStatus.type,
                // status: currentStatus.status || 'Active',
            });
        } else {
            reset({ type: '' });
        }
    }, [currentStatus, reset]);

    const onSubmit = (data: any) => {
        onSaveStatus(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentStatus ? 'Edit Lead Status' : 'Add New Lead Status'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Status</label>
                        <input
                            type="text"
                            {...register('type', { required: 'Lead Status is required' })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter lead status"
                        />
                        {errors.type && (
                            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                        )}
                    </div>

                    {/* Uncomment if you want status select */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                            {...register('status', { required: true })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div> */}

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-60 transition-colors"
                        >
                            {isLoading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {currentStatus ? 'Update Lead Status' : 'Add Lead Status'}
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
