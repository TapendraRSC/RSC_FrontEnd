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
    min?: number;
    validation?: RegisterOptions<T, Path<T>>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    clearErrors: UseFormClearErrors<T>;
    className?: string;
    accept?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    step?: string | number;
    maxLength?: number;
}

const FormInput = <T extends Record<string, any>>({
    name,
    label,
    type = 'text',
    placeholder,
    min,
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


    if (type === 'number' && min !== undefined) {
        rules.validate = {
            ...rules.validate,
            minValue: (value) =>
                Number(value) >= min || `${label} cannot be less than ${min}`,
        };
    }

    if (type === 'number' && maxLength) {
        rules.validate = {
            ...rules.validate,
            maxLength: (value) =>
                !value || value.toString().length <= maxLength
                || `Must be at most ${maxLength} digits`,
        };
    }

    const error = errors[name];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) {
            clearErrors(name);
        }
        if (type === 'number' && maxLength) {
            const value = e.target.value;
            if (value.length > maxLength) {
                e.target.value = value.slice(0, maxLength);
            }
        }
        register(name, rules).onChange(e);
        onChange?.(e);
    };

    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
        ...register(name, rules),
        type,
        min,
        inputMode: type === 'number' ? 'decimal' : undefined,
        placeholder,
        disabled,
        step,
        accept,
        className: `
            w-full px-3 py-2 border rounded-lg
            border-gray-300 dark:border-gray-600
            bg-white dark:bg-slate-800
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2
            focus:ring-orange-500 dark:focus:ring-orange-400
            transition-all
            ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' : ''}
            ${className}
            ${type === 'number' ? 'no-spinner' : ''}
        `,


        onKeyDown: (e) => {
            if (
                type === 'number' &&
                (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+')
            ) {
                e.preventDefault();
            }
        },

        onInput: (e) => {
            if (type === 'number') {
                const input = e.currentTarget;
                input.value = input.value.replace(/[^0-9.]/g, '');

                if (maxLength && input.value.length > maxLength) {
                    input.value = input.value.slice(0, maxLength);
                }
            }
        },
        onChange: handleInputChange,
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input {...inputProps} />
            {error && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {error.message as string}
                </p>
            )}
        </div>
    );
};

export default FormInput;
