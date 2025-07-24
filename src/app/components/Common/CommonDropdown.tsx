'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import clsx from 'clsx';

interface Option {
    label: string;
    value: string | number;
}

interface CommonDropdownProps {
    options: Option[];
    selected: Option | Option[] | null;
    onChange: (value: Option | Option[] | null) => void;
    isMulti?: boolean;
    placeholder?: string;
    className?: string;
}

export default function CommonDropdown({
    options,
    selected,
    onChange,
    isMulti = false,
    placeholder = 'Select...',
    className = '',
}: CommonDropdownProps) {
    const [open, setOpen] = useState(false);

    const isSelected = (option: Option) => {
        if (isMulti && Array.isArray(selected)) {
            return selected.some((item) => item.value === option.value);
        }
        return (selected as Option)?.value === option.value;
    };

    const handleSelect = (option: Option) => {
        if (isMulti) {
            const selectedArray = Array.isArray(selected) ? selected : [];
            const exists = selectedArray.find((item) => item.value === option.value);
            if (exists) {
                onChange(selectedArray.filter((item) => item.value !== option.value));
            } else {
                onChange([...selectedArray, option]);
            }
        } else {
            onChange(option);
            setOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                className="w-full border rounded-xl px-4 py-2 flex justify-between items-center text-sm bg-white shadow-sm hover:shadow transition"
                onClick={() => setOpen(!open)}
            >
                <span className="truncate">
                    {isMulti && Array.isArray(selected)
                        ? selected.length > 0
                            ? selected.map((s) => s.label).join(', ')
                            : placeholder
                        : (selected as Option)?.label || placeholder}
                </span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {open && (
                <div className="absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto scrollbar-thin">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={clsx(
                                'cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100',
                                isSelected(option) && 'bg-gray-100 font-medium'
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            <span>{option.label}</span>
                            {isSelected(option) && <Check size={16} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
