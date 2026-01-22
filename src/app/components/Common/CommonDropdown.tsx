// old
// 'use client';
// import { useState } from 'react';
// import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
// import clsx from 'clsx';

// interface Option {
//     label: string;
//     value: string | number;
// }

// interface CommonDropdownProps {
//     options: Option[];
//     selected: Option | Option[] | null;
//     onChange: (value: Option | Option[] | null) => void;
//     isMulti?: boolean;
//     placeholder?: string;
//     className?: string;
//     error?: boolean;
//     allowClear?: boolean;
//     disabled?: boolean; // New prop for disabled state
// }

// export default function CommonDropdown({
//     options,
//     selected,
//     onChange,
//     isMulti = false,
//     placeholder = 'Select...',
//     className = '',
//     error = false,
//     allowClear = true,
//     disabled = false, // Default to false
// }: CommonDropdownProps) {
//     const [open, setOpen] = useState(false);

//     const isSelected = (option: Option) => {
//         if (isMulti && Array.isArray(selected)) {
//             return selected.some((item) => item.value === option.value);
//         }
//         return (selected as Option)?.value === option.value;
//     };

//     const handleSelect = (option: Option) => {
//         if (disabled) return;

//         if (isMulti) {
//             const selectedArray = Array.isArray(selected) ? selected : [];
//             const exists = selectedArray.find((item) => item.value === option.value);
//             if (exists) {
//                 onChange(selectedArray.filter((item) => item.value !== option.value));
//             } else {
//                 onChange([...selectedArray, option]);
//             }
//         } else {
//             if (allowClear && (selected as Option)?.value === option.value) {
//                 onChange(null);
//             } else {
//                 onChange(option);
//             }
//             setOpen(false);
//         }
//     };

//     const handleClear = (e: React.MouseEvent) => {
//         if (disabled) return;
//         e.stopPropagation();
//         onChange(isMulti ? [] : null);
//     };

//     const toggleDropdown = () => {
//         if (disabled) return;
//         setOpen(!open);
//     };

//     const hasSelection = isMulti
//         ? Array.isArray(selected) && selected.length > 0
//         : selected !== null;

//     return (
//         <div className={`relative ${className}`}>
//             <button
//                 type="button"
//                 className={clsx(
//                     "w-full border rounded-xl px-4 py-2 flex justify-between items-center text-sm transition-all",
//                     error
//                         ? "border-red-500 focus:ring-red-500 text-red-500 dark:text-red-400 dark:border-red-500"
//                         : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm",
//                     disabled && "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 hover:shadow-none"
//                 )}
//                 onClick={toggleDropdown}
//                 disabled={disabled}
//             >
//                 <span className={clsx("truncate", error && "text-red-500 dark:text-red-400")}>
//                     {isMulti && Array.isArray(selected)
//                         ? selected.length > 0
//                             ? selected.map((s) => s.label).join(', ')
//                             : placeholder
//                         : (selected as Option)?.label || placeholder}
//                 </span>
//                 <div className="flex items-center gap-1">
//                     {allowClear && hasSelection && !disabled && (
//                         <div
//                             onClick={handleClear}
//                             className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
//                         >
//                             <X size={14} className="text-gray-500 dark:text-gray-400" />
//                         </div>
//                     )}
//                     {!disabled && (open ? (
//                         <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
//                     ) : (
//                         <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
//                     ))}
//                 </div>
//             </button>

//             {open && !disabled && (
//                 <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto scrollbar-thin">
//                     {/* Default "Select" option for single select */}
//                     {!isMulti && (
//                         <div
//                             className={clsx(
//                                 'cursor-pointer px-4 py-2 text-sm flex items-center justify-between transition-colors',
//                                 'hover:bg-gray-100 dark:hover:bg-gray-600',
//                                 selected === null && 'bg-gray-100 dark:bg-gray-600 font-medium'
//                             )}
//                             onClick={() => {
//                                 onChange(null);
//                                 setOpen(false);
//                             }}
//                         >
//                             <span className="text-gray-500 dark:text-gray-400 italic">{placeholder}</span>
//                             {selected === null && <Check size={16} className="text-blue-500 dark:text-blue-400" />}
//                         </div>
//                     )}

//                     {/* Separator line if default option is shown */}
//                     {!isMulti && options.length > 0 && (
//                         <div className="border-t border-gray-200 dark:border-gray-600"></div>
//                     )}

//                     {options.length > 0 ? (
//                         options.map((option) => (
//                             <div
//                                 key={option.value}
//                                 className={clsx(
//                                     'cursor-pointer px-4 py-2 text-sm flex items-center justify-between transition-colors',
//                                     'hover:bg-gray-100 dark:hover:bg-gray-600',
//                                     isSelected(option) && 'bg-gray-100 dark:bg-gray-600 font-medium'
//                                 )}
//                                 onClick={() => handleSelect(option)}
//                             >
//                                 <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
//                                 {isSelected(option) && <Check size={16} className="text-blue-500 dark:text-blue-400" />}
//                             </div>
//                         ))
//                     ) : (
//                         <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
//                             No Data found
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }


'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface Option {
    label: string;
    value: string | number;
    disabled?: boolean;  // 👈 ye add kiya
}

interface CommonDropdownProps {
    options: Option[];
    selected: Option | Option[] | null;
    onChange: (value: Option | Option[] | null) => void;
    isMulti?: boolean;
    placeholder?: string;
    className?: string;
    error?: boolean;
    allowClear?: boolean;
    disabled?: boolean;
}

export default function CommonDropdown({
    options,
    selected,
    onChange,
    isMulti = false,
    placeholder = 'Select...',
    className = '',
    error = false,
    allowClear = true,
    disabled = false,
}: CommonDropdownProps) {
    const [open, setOpen] = useState(false);

    const isSelected = (option: Option) => {
        if (isMulti && Array.isArray(selected)) {
            return selected.some((item) => item.value === option.value);
        }
        return (selected as Option)?.value === option.value;
    };

    const handleSelect = (option: Option) => {
        if (disabled || option.disabled) return;  // 👈 option.disabled check add kiya

        if (isMulti) {
            const selectedArray = Array.isArray(selected) ? selected : [];
            const exists = selectedArray.find((item) => item.value === option.value);
            if (exists) {
                onChange(selectedArray.filter((item) => item.value !== option.value));
            } else {
                onChange([...selectedArray, option]);
            }
        } else {
            if (allowClear && (selected as Option)?.value === option.value) {
                onChange(null);
            } else {
                onChange(option);
            }
            setOpen(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        if (disabled) return;
        e.stopPropagation();
        onChange(isMulti ? [] : null);
    };

    const toggleDropdown = () => {
        if (disabled) return;
        setOpen(!open);
    };

    const hasSelection = isMulti
        ? Array.isArray(selected) && selected.length > 0
        : selected !== null;

    return (
        <div className={clsx('relative w-full', className)}>
            <button
                type="button"
                className={clsx(
                    'w-full h-11 border rounded-lg px-3 flex justify-between items-center text-sm transition-all',
                    error
                        ? 'border-red-500 focus:ring-red-500 text-red-500 dark:text-red-400 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm',
                    disabled &&
                    'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 hover:shadow-none'
                )}
                onClick={toggleDropdown}
                disabled={disabled}
            >
                <span
                    className={clsx(
                        'truncate',
                        error && 'text-red-500 dark:text-red-400'
                    )}
                >
                    {isMulti && Array.isArray(selected)
                        ? selected.length > 0
                            ? selected.map((s) => s.label).join(', ')
                            : placeholder
                        : (selected as Option)?.label || placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {allowClear && hasSelection && !disabled && (
                        <div
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                        >
                            <X size={14} className="text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                    {!disabled &&
                        (open ? (
                            <ChevronUp
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                        ) : (
                            <ChevronDown
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                        ))}
                </div>
            </button>

            {open && !disabled && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {!isMulti && (
                        <div
                            className={clsx(
                                'cursor-pointer px-4 py-2 text-sm flex items-center justify-between transition-colors',
                                'hover:bg-gray-100 dark:hover:bg-gray-600',
                                selected === null && 'bg-gray-100 dark:bg-gray-600 font-medium'
                            )}
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                        >
                            <span className="text-gray-500 dark:text-gray-400 italic">
                                {placeholder}
                            </span>
                            {selected === null && (
                                <Check
                                    size={16}
                                    className="text-orange-500 dark:text-orange-400"
                                />
                            )}
                        </div>
                    )}

                    {!isMulti && options.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600" />
                    )}

                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className={clsx(
                                    'px-4 py-2 text-sm flex items-center justify-between transition-colors',
                                    option.disabled
                                        ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-800'  // 👈 disabled style
                                        : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
                                    isSelected(option) &&
                                    'bg-gray-100 dark:bg-gray-600 font-medium'
                                )}
                                onClick={() => handleSelect(option)}
                            >
                                <span className={clsx(
                                    option.disabled
                                        ? 'text-gray-400 dark:text-gray-500'  // 👈 disabled text color
                                        : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    {option.label}
                                </span>
                                {isSelected(option) && (
                                    <Check
                                        size={16}
                                        className="text-orange-500 dark:text-orange-400"
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No Data found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}