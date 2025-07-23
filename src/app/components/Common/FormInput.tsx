// FormInput.tsx
import React from 'react';
import { UseFormRegister, FieldErrors, Path } from 'react-hook-form';

interface ValidationRule {
    required?: string | boolean;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    validate?: (value: any) => boolean | string;
}

interface FormInputProps<T extends Record<string, any>> {
    name: Path<T>;
    label: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'file' | 'url';
    placeholder?: string;
    required?: boolean;
    validation?: ValidationRule;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    className?: string;
    accept?: string; // for file inputs
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const FormInput = <T extends Record<string, any>>({
    name,
    label,
    type = 'text',
    placeholder,
    required = false,
    validation = {},
    register,
    errors,
    className = '',
    accept,
    onChange,
    disabled = false,
}: FormInputProps<T>) => {
    // Build validation rules
    const rules: ValidationRule = {
        ...validation,
        ...(required && { required: `${label} is required` }),
    };

    // Add common validation patterns
    if (type === 'email' && !validation.pattern) {
        rules.pattern = {
            value: /^\S+@\S+$/i,
            message: 'Invalid email format'
        };
    }

    if (type === 'tel' && !validation.pattern) {
        rules.pattern = {
            value: /^[0-9]{10}$/,
            message: 'Enter a valid 10-digit number'
        };
    }

    const error = errors[name];

    const inputProps = {
        ...register(name, rules),
        type,
        className: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''
            } ${className}`,
        placeholder,
        disabled,
        ...(accept && { accept }),
        ...(onChange && {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                register(name, rules).onChange(e);
                onChange(e);
            }
        }),
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input {...inputProps} />
            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {error.message as string}
                </p>
            )}
        </div>
    );
};

export default FormInput;