'use client';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { useEffect } from 'react';
import FormInput from '../Common/FormInput';
import CommonDropdown from '../Common/CommonDropdown';

interface ProjectStatus {
    id: number;
    title: string;
    status: string;
    projectImage?: string;
    projectPdf?: string;
}

interface ProjectStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveProjectStatus: (data: FormData) => void;
    isLoading: boolean;
    currentProjectStatus: ProjectStatus | null;
}

interface FormData {
    title: string;
    status: string;
    projectImage?: FileList;
    projectPdf?: FileList;
}

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export default function ProjectStatusModal({
    isOpen,
    onClose,
    onSaveProjectStatus,
    isLoading,
    currentProjectStatus
}: ProjectStatusModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>();

    const selectedStatus = watch('status');

    useEffect(() => {
        if (currentProjectStatus) {
            reset({
                title: currentProjectStatus.title,
                status: currentProjectStatus.status,
                projectImage: undefined,
                projectPdf: undefined,
            });
        } else {
            reset({ title: '', status: '', projectImage: undefined, projectPdf: undefined });
        }
    }, [currentProjectStatus, reset]);

    const onSubmit = (data: FormData) => {
        onSaveProjectStatus(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200"
            style={{ margin: "0px" }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {currentProjectStatus ? 'Edit Project Status' : 'Add New Project Status'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 space-y-4">
                    {/* Title */}
                    <FormInput<FormData>
                        name="title"
                        label="Project Status Title"
                        register={register}
                        errors={errors}
                        required
                        clearErrors={clearErrors}
                        placeholder="Enter project status"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />

                    {/* Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status<span className="text-red-500 ml-1">*</span>
                        </label>
                        <CommonDropdown
                            options={statusOptions}
                            selected={statusOptions.find((s) => s.value === selectedStatus) || null}
                            onChange={(value) => setValue('status', (value as any).value)}
                            placeholder="Select status"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            allowClear={true}
                        />
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
                        )}
                    </div>

                    {/* Project Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register('projectImage')}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700"
                        />
                        {errors.projectImage && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectImage.message}</p>
                        )}
                        {currentProjectStatus?.projectImage && (
                            <a
                                href={currentProjectStatus.projectImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 dark:text-blue-400 text-sm hover:underline mt-1 block"
                            >
                                View Current Image
                            </a>
                        )}
                    </div>

                    {/* Project PDF Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project PDF
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            {...register('projectPdf')}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700"
                        />
                        {errors.projectPdf && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectPdf.message}</p>
                        )}
                        {currentProjectStatus?.projectPdf && (
                            <a
                                href={currentProjectStatus.projectPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 dark:text-blue-400 text-sm hover:underline mt-1 block"
                            >
                                View Current PDF
                            </a>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
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
                                    {currentProjectStatus ? 'Update Project Status' : 'Add Project Status'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
