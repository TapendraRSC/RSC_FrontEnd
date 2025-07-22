'use client';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';

interface RolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRole: (roleName: string, roleReference: string) => void;
}

interface FormData {
    roleName: string;
    roleReference: string;
}

export default function RolesModal({ isOpen, onClose, onAddRole }: RolesModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        onAddRole(data.roleName, data.roleReference);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset(); // Reset form and clear validation errors
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Add New Role</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                            Role Name
                        </label>
                        <input
                            id="roleName"
                            {...register('roleName', { required: 'Role Name is required' })}
                            className={`mt-1 block w-full border ${errors.roleName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.roleName && <p className="mt-2 text-sm text-red-600">{errors.roleName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="roleReference" className="block text-sm font-medium text-gray-700">
                            Role Reference
                        </label>
                        <input
                            id="roleReference"
                            {...register('roleReference', {
                                required: 'Role Reference is required',
                                pattern: {
                                    value: /^[A-Za-z0-9]+$/i,
                                    message: 'Role Reference must be alphanumeric'
                                }
                            })}
                            className={`mt-1 block w-full border ${errors.roleReference ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.roleReference && <p className="mt-2 text-sm text-red-600">{errors.roleReference.message}</p>}
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            <Plus className="w-4 h-4" />
                            Add Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
