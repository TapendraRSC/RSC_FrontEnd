'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '../Common/FormInput';
import CommonDropdown from '../Common/CommonDropdown';
import { AppDispatch, RootState } from '../../../../store/store';
import { getRoles } from '../../../../store/roleSlice';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    roleId: number;
    profileImage: File | null;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    roleId: number;
    profileImage: string | null;
    status: string;
    password: string;
}

interface UsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    user: User | null;
}

const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: roles = [] } = useSelector((state: RootState) => state.roles);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const { register, handleSubmit, watch, formState: { errors }, reset, setValue, clearErrors } = useForm<UserFormData>();
    const password = watch('password') || '';
    const roleId = watch('roleId');
    const status = watch('status');

    const passwordRules = [
        { label: 'At least 1 uppercase letter', regex: /[A-Z]/ },
        { label: 'At least 1 lowercase letter', regex: /[a-z]/ },
        { label: 'At least 1 number', regex: /\d/ },
        { label: 'At least 1 special character (@$!%*?&)', regex: /[@$!%*?&]/ },
        { label: 'Length between 8–16 characters', regex: /^.{8,16}$/ },
    ];

    useEffect(() => {
        if (isOpen) {
            dispatch(getRoles({ page: 1, limit: 10, searchValue: '' }));
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                roleId: Number(user.roleId),
                password: user.password,
                status: user.status || 'active',
            });
            if (user.profileImage) setPreview(user.profileImage);
        } else {
            reset({ status: 'active' });
            setPreview(null);
            setSelectedFile(null);
        }
    }, [user, reset]);

    useEffect(() => {
        register('roleId', { required: 'Role is required' });
        register('status', { required: 'Status is required' });
    }, [register]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleClose = () => {
        reset();
        setPreview(null);
        setSelectedFile(null);
        onClose();
    };

    const submitHandler = (data: UserFormData) => {
        onSubmit({ ...data, profileImage: selectedFile });
    };

    if (!isOpen) return null;

    const roleOptions = roles.map((role: any) => ({
        label: role.roleType,
        value: Number(role.id),
    }));

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <div className="p-4 sm:p-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 sm:space-y-6">
                        {/* Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name<span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    {...register('name', {
                                        required: 'Full name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                        maxLength: { value: 50, message: 'Name must not exceed 50 characters' },
                                    })}
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address<span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    type="email"
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                            </div>
                        </div>
                        {/* Password & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password{!user && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <input
                                    {...register('password', {
                                        required: !user ? 'Password is required' : false,
                                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                                        maxLength: { value: 16, message: "Password must not exceed 16 characters" },
                                        validate: (value: any) => {
                                            if (!user) {
                                                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
                                                if (!regex.test(value)) return "Password must contain uppercase, lowercase, number, and special character";
                                            }
                                            return true;
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {!user && password && (
                                    <ul className="mt-2 text-sm space-y-1 text-red-500 dark:text-red-400">
                                        {passwordRules.filter(rule => !rule.regex.test(password)).map((rule, i) => (
                                            <li key={i}>❌ {rule.label}</li>
                                        ))}
                                    </ul>
                                )}
                                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number<span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    {...register('phoneNumber', {
                                        required: 'Phone number is required',
                                        validate: {
                                            is10Digits: (value) =>
                                                (value && value.toString().length === 10) ||
                                                "Phone number must be exactly 10 digits",
                                        },
                                    })}
                                    type="number"
                                    placeholder="Enter 10-digit number"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber.message}</p>}
                            </div>
                        </div>
                        {/* Role & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role<span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    {...register('roleId', { required: 'Role is required' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Select a role</option>
                                    {roleOptions.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.roleId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleId.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    {...register('status', { required: 'Status is required' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Select status</option>
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>}
                            </div>
                        </div>
                        {/* Profile Image */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-3 sm:space-y-0">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-blue-300 w-full"
                                    />
                                </div>
                                {preview && (
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={preview}
                                            alt="Profile Preview"
                                            width={80}
                                            height={80}
                                            className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                                {user ? 'Update User' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UsersModal;
