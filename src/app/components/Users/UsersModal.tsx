'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Image from 'next/image';
import FormInput from '../Common/FormInput';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    roleId: string;
    profileImage: FileList;
}

interface UsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
}

const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<UserFormData>();

    const profileImage = watch('profileImage');
    const [preview, setPreview] = useState<string | null>(null);

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
        onSubmit(data);
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative  overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h2>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<UserFormData>
                            name="name"
                            label="Full Name"
                            placeholder="Enter full name"
                            required
                            register={register}
                            errors={errors}
                            validation={{
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                maxLength: { value: 50, message: 'Name must not exceed 50 characters' }
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
                        />
                    </div>

                    {/* Password and Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<UserFormData>
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Enter password"
                            required
                            register={register}
                            errors={errors}
                            validation={{
                                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                maxLength: { value: 128, message: 'Password must not exceed 128 characters' },
                                validate: (value: string) => {
                                    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                                        return 'Password must contain at least one uppercase, lowercase, and number';
                                    }
                                    return true;
                                }
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
                        />
                    </div>

                    {/* Role ID - Full Width */}
                    <FormInput<UserFormData>
                        name="roleId"
                        label="Role ID"
                        placeholder="Enter role ID"
                        required
                        register={register}
                        errors={errors}
                        validation={{
                            pattern: {
                                value: /^[A-Z0-9_]+$/,
                                message: 'Role ID must contain only uppercase letters, numbers, and underscores'
                            }
                        }}
                    />

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
                                    className="file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                    validation={{
                                        validate: (files: FileList) => {
                                            if (!files || files.length === 0) return true;
                                            const file = files[0];
                                            const maxSize = 5 * 1024 * 1024; // 5MB
                                            if (file.size > maxSize) {
                                                return 'File size must be less than 5MB';
                                            }
                                            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                                            if (!allowedTypes.includes(file.type)) {
                                                return 'Only JPEG, PNG, GIF, and WebP images are allowed';
                                            }
                                            return true;
                                        }
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

                    {/* Submit Button */}
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
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsersModal;