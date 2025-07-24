'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
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
    profileImage: FileList;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    roleId: number;
    profileImage: string;
    status: string;
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

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
        setValue,
        clearErrors,
    } = useForm<UserFormData>();

    const profileImage = watch('profileImage');
    const roleId = watch('roleId');
    const status = watch('status');
    const [preview, setPreview] = useState<string | null>(null);

    // Fetch roles when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(getRoles({ page: 1, limit: 10, searchValue: '' }));
        }
    }, [isOpen, dispatch]);

    // Prepopulate form when editing user
    useEffect(() => {
        if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
            setValue('phoneNumber', user.phoneNumber);
            setValue('roleId', Number(user.roleId));
            setValue('status', user.status || 'active');
            if (user.profileImage) {
                setPreview(user.profileImage);
            }
        } else {
            reset({ status: 'active' });
            setPreview(null);
        }
    }, [user, setValue, reset]);

    useEffect(() => {
        register('roleId', {
            required: 'Role is required',
        });
        register('status', {
            required: 'Status is required',
        });
    }, [register]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleClose = () => {
        reset();
        setPreview(null);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        onClose();
    };

    const submitHandler = (data: UserFormData) => {
        onSubmit(data); // Now includes status directly from form
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {user ? 'Edit User' : 'Add New User'}
                </h2>
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<UserFormData>
                            name="name"
                            label="Full Name"
                            placeholder="Enter full name"
                            required
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                            validation={{
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                maxLength: { value: 50, message: 'Name must not exceed 50 characters' },
                            }}
                        />
                        <FormInput<UserFormData>
                            name="email"
                            label="Email Address"
                            type="email"
                            placeholder="Enter email address"
                            required
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<UserFormData>
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Enter password"
                            required={!user}
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                            validation={{
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                                maxLength: {
                                    value: 16,
                                    message: 'Password must not exceed 16 characters',
                                },
                                validate: (value: any) => {
                                    if (!user && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                                        return 'Password must contain at least one uppercase, lowercase, and number';
                                    }
                                    return true;
                                },
                            }}
                        />
                        <FormInput<UserFormData>
                            name="phoneNumber"
                            label="Phone Number"
                            type="tel"
                            placeholder="Enter 10-digit number"
                            required
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                            validation={{
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Phone number must be exactly 10 digits',
                                },
                            }}
                        />
                    </div>

                    {/* Role Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role<span className="text-red-500 ml-1">*</span>
                        </label>
                        <CommonDropdown
                            options={roleOptions}
                            selected={roleOptions.find((r) => r.value === Number(roleId)) || null}
                            onChange={(value) => setValue('roleId', Number((value as any).value))}
                            placeholder="Select a role"
                        />
                        {errors.roleId && (
                            <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status<span className="text-red-500 ml-1">*</span>
                        </label>
                        <CommonDropdown
                            options={statusOptions}
                            selected={statusOptions.find((s) => s.value === status) || null}
                            onChange={(value) => setValue('status', (value as any).value)}
                            placeholder="Select status"
                        />
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                        )}
                    </div>

                    {/* Profile Image */}
                    <div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-1">
                                <FormInput<UserFormData>
                                    name="profileImage"
                                    label="Profile Image"
                                    type="file"
                                    accept="image/*"
                                    register={register}
                                    errors={errors}
                                    onChange={handleImageChange}
                                    clearErrors={clearErrors}
                                    className="file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                    validation={{
                                        validate: (files: any) => {
                                            if (!files || files.length === 0) return true;
                                            const file = files[0];
                                            const maxSize = 5 * 1024 * 1024;
                                            if (file.size > maxSize) {
                                                return 'File size must be less than 5MB';
                                            }
                                            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                                            if (!allowedTypes.includes(file.type)) {
                                                return 'Only JPEG, PNG, GIF, and WebP images are allowed';
                                            }
                                            return true;
                                        },
                                    }}
                                />
                            </div>
                            {preview && (
                                <div className="flex-shrink-0">
                                    <Image
                                        src={preview}
                                        alt="Profile Preview"
                                        width={80}
                                        height={80}
                                        className="rounded-full object-cover border-2 border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            {user ? 'Update User' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsersModal;
