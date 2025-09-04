import React from 'react';
import {
    UseFormRegister,
    FieldErrors,
    Path,
    RegisterOptions,
    UseFormClearErrors,
} from 'react-hook-form';

interface FormInputProps<T extends Record<string, any>> {
    name: Path<T>;
    label: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'file' | 'url' | 'textarea' | 'time' | 'date';
    placeholder?: string;
    required?: boolean;
    validation?: RegisterOptions<T, Path<T>>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    clearErrors: UseFormClearErrors<T>;
    className?: string;
    accept?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    step?: string | number;
    maxLength?: number; // Add maxLength prop
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
    clearErrors,
    className = '',
    accept,
    onChange,
    disabled = false,
    step,
    maxLength,
}: FormInputProps<T>) => {
    const rules: RegisterOptions<T, Path<T>> = {
        ...validation,
        ...(required && { required: `${label} is required` }),
    };

    if (type === 'number' && maxLength) {
        rules.validate = {
            ...rules.validate,
            maxLength: (value) =>
                (value && value.toString().length <= maxLength) ||
                `Must be at most ${maxLength} digits`,
        };
    }

    const error = errors[name];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) {
            clearErrors(name);
        }
        if (type === 'number' && maxLength) {
            const inputValue = e.target.value;
            if (inputValue.length > maxLength) {
                e.target.value = inputValue.slice(0, maxLength);
            }
        }
        register(name, rules).onChange(e);
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
        step,
        onChange: handleInputChange,
        onInput: type === 'number' && maxLength
            ? (e: React.FormEvent<HTMLInputElement>) => {
                const input = e.target as HTMLInputElement;
                if (input.value.length > maxLength) {
                    input.value = input.value.slice(0, maxLength);
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
