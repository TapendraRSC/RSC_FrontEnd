import React from 'react';
import {
    UseFormRegister,
    FieldErrors,
    Path,
    RegisterOptions,
    UseFormClearErrors,
} from 'react-hook-form';

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
    type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'file' | 'url' | 'textarea' | 'time' | 'date';
    placeholder?: string;
    required?: boolean;
    validation?: RegisterOptions<T, Path<T>>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    clearErrors: UseFormClearErrors<T>; // Add this prop
    className?: string;
    accept?: string;
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
    clearErrors, // Add this
    className = '',
    accept,
    onChange,
    disabled = false,
}: FormInputProps<T>) => {
    // Combine default rules
    const rules: RegisterOptions<T, Path<T>> = {
        ...validation,
        ...(required && { required: `${label} is required` }),
    };

    // Add default patterns if not provided
    if (type === 'email' && !validation?.pattern) {
        rules.pattern = {
            value: /^\S+@\S+\.\S+$/,
            message: 'Invalid email format',
        };
    }

    if (type === 'tel' && !validation?.pattern) {
        rules.pattern = {
            value: /^[0-9]{10}$/,
            message: 'Enter a valid 10-digit number',
        };
    }

    const error = errors[name];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clear error when user starts typing
        if (error) {
            clearErrors(name);
        }

        // Call the original onChange from register
        register(name, rules).onChange(e);

        // Call custom onChange if provided
        if (onChange) {
            onChange(e);
        }
    };

    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
        ...register(name, rules),
        type,
        className: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''
            } ${className}`,
        placeholder,
        disabled,
        maxLength: type === 'tel' ? 10 : undefined,
        inputMode: type === 'tel' ? 'numeric' : undefined,
        pattern: type === 'tel' ? '[0-9]*' : undefined,
        accept,
        onChange: handleInputChange, // Use our custom handler
        onKeyDown:
            type === 'tel'
                ? (e: React.KeyboardEvent<HTMLInputElement>) => {
                    const allowedKeys = [
                        'Backspace',
                        'Delete',
                        'ArrowLeft',
                        'ArrowRight',
                        'Tab',
                    ];
                    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                        e.preventDefault();
                    }
                }
                : undefined,
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input {...inputProps} />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error.message as string}</p>
            )}
        </div>
    );
};

export default FormInput;