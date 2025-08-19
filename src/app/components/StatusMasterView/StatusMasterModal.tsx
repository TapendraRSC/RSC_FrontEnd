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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" style={{ margin: "0px" }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentStatus ? 'Edit Lead Status' : 'Add New Lead Status'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
                        <input
                            type="text"
                            {...register('type', { required: 'Lead Status is required' })}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Enter lead status"
                        />
                        {errors.type && (
                            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                        )}
                    </div>

                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            {...register('status', { required: true })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div> */}

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
