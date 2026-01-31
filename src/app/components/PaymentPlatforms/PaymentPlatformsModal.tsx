import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import FormInput from '../Common/FormInput';
import { useForm } from 'react-hook-form';

interface PaymentPlatform {
    id: number;
    platform_name: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePlatform: (data: Omit<PaymentPlatform, 'id'>) => void;
    currentPlatform: PaymentPlatform | null;
}

const PaymentPlatformsModal: React.FC<ModalProps> = ({ isOpen, onClose, onSavePlatform, currentPlatform }) => {
    const { register, handleSubmit, reset, formState: { errors }, clearErrors } = useForm<{ platform_name: string }>();

    useEffect(() => {
        if (currentPlatform) {
            reset({ platform_name: currentPlatform.platform_name });
        } else {
            reset({ platform_name: '' });
        }
    }, [currentPlatform, reset, isOpen]);

    if (!isOpen) return null;

    const onSubmit = (data: { platform_name: string }) => {
        onSavePlatform({ platform_name: data.platform_name.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">
                        {currentPlatform ? 'Edit Platform' : 'Add New Platform'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <FormInput
                        name="platform_name"
                        label="Platform Name"
                        register={register}
                        errors={errors}
                        required
                        placeholder="e.g. Google Pay, Cash, UPI"
                        clearErrors={clearErrors}
                        validation={{
                            required: "Platform name is required",
                            minLength: {
                                value: 2,
                                message: "Platform name must be at least 2 characters"
                            },
                            maxLength: {
                                value: 50,
                                message: "Platform name cannot exceed 50 characters"
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9\s\-()]+$/,
                                message: "Platform name can only contain letters, numbers, spaces, hyphens and parentheses"
                            }
                        }}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg dark:text-gray-300">Cancel</button>
                        <button type="submit" className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
                            <Check className="w-4 h-4" /> Save Platform
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentPlatformsModal;