'use client';
import React, { useState, useRef, useEffect } from "react";
import {
    UseFormRegister,
    FieldErrors,
    Path,
    RegisterOptions,
    UseFormClearErrors,
} from "react-hook-form";

interface Country {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
}

interface FormPhoneInputProps<T extends Record<string, any>> {
    name: Path<T>;
    label: string;
    placeholder?: string;
    required?: boolean;
    validation?: any;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    clearErrors: UseFormClearErrors<T>;
    className?: string;
    disabled?: boolean;
    maxLength?: number;
}

const countriesData: Country[] = [
    { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
    { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
    { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
];

const FormPhoneInput = <T extends Record<string, any>>({
    name,
    label,
    placeholder,
    required = false,
    validation = {},
    register,
    errors,
    clearErrors,
    className = "",
    disabled = false,
    maxLength = 10,
}: FormPhoneInputProps<T>) => {
    const defaultCountry = countriesData.find(c => c.code === "IN") || countriesData[0];
    const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const error = errors[name];

    const rules: RegisterOptions<T, Path<T>> = {
        ...validation,
        required: required ? validation.required || `${label} is required` : undefined,
        pattern: {
            value: /^\+\d{1,4}\d{10}$/,
            message: "Please enter a valid phone number with country code",
        },
        validate: {
            hasCountryCode: (value: string) =>
                value.startsWith("+") || "Phone number must include country code",
            validLength: (value: string) => {
                const digits = value.replace(/^\+\d{1,4}/, "");
                return digits.length === 10 || "Phone number must be exactly 10 digits";
            },
        },
    };

    const filteredCountries = countriesData.filter(
        c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.dial_code.includes(searchTerm)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current) searchInputRef.current.focus();
    }, [isDropdownOpen]);

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        setSearchTerm("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) clearErrors(name);
        let digits = e.target.value.replace(/\D/g, "");
        if (maxLength && digits.length > maxLength) digits = digits.slice(0, maxLength);
        setInputValue(digits);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setSearchTerm("");
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex">
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={toggleDropdown}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="font-medium">{selectedCountry.dial_code}</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search countries..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="overflow-y-auto max-h-64">
                                {filteredCountries.length ? (
                                    filteredCountries.map(country => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${selectedCountry.code === country.code
                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                    : "text-gray-900 dark:text-gray-100"
                                                }`}
                                        >
                                            <span className="text-lg">{country.flag}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{country.name}</div>
                                            </div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400">{country.dial_code}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No countries found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <input
                    {...register(name, rules)}
                    type="tel"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={() => {
                        const fullNumber = selectedCountry.dial_code + inputValue;
                        register(name).onChange({ target: { value: fullNumber } });
                    }}
                    className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all ${error ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400" : ""
                        } ${className}`}
                    placeholder={placeholder || "Enter phone number"}
                    disabled={disabled}
                />
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error.message as string}</p>}
        </div>
    );
};

export default FormPhoneInput;
