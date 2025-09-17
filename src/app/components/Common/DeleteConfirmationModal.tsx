// components/DeleteConfirmationModal.tsx
import { useEffect } from 'react';
import { LucideIcon, X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    title?: string;
    message?: string;
    cancelText?: string;
    deleteText?: string;
    Icon?: LucideIcon;
    isBulk?: boolean;   // Optional flag for bulk delete
    itemCount?: number; // Optional count for bulk delete
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onDelete,
    title: propTitle,
    message: propMessage,
    cancelText = 'Cancel',
    deleteText = 'Delete',
    Icon: PropIcon,
    isBulk = false,
    itemCount = 0,
}: DeleteConfirmationModalProps) {
    // Escape key support
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Defaults for single/bulk
    const defaultTitle = isBulk
        ? `Delete ${itemCount} item${itemCount !== 1 ? 's' : ''}?`
        : 'Delete this item?';

    const defaultMessage = isBulk
        ? `Are you sure you want to permanently delete these ${itemCount} items? This action cannot be undone.`
        : 'Are you sure you want to permanently delete this item? This action cannot be undone.';

    const defaultIcon = isBulk ? Trash2 : AlertTriangle;

    // Final props
    const title = propTitle || defaultTitle;
    const message = propMessage || defaultMessage;
    const Icon = PropIcon || defaultIcon;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" style={{ margin: "0px" }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-auto max-w-2xl min-w-80 border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 pb-4">
                    <div
                        className={`flex items-center justify-center flex-shrink-0 rounded-full
                        ${isBulk ? "w-12 h-12 bg-red-200 dark:bg-red-900/60" : "w-10 h-10 bg-red-100 dark:bg-red-900/40"}`}
                    >
                        <Icon
                            className={isBulk ? "text-red-700 dark:text-red-300" : "text-red-600 dark:text-red-400"}
                            size={isBulk ? 28 : 20}
                        />
                    </div>
                    <div className="flex-1">
                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                        >
                            {title}
                        </h2>
                        {isBulk && itemCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 rounded-full">
                                {itemCount} selected
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 ml-4"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <div className="pl-13">
                        <p
                            className={`leading-relaxed mb-6 ${isBulk
                                ? "text-red-700 dark:text-red-300 font-semibold"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            {message}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 whitespace-nowrap"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onDelete}
                                className="px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 shadow-sm whitespace-nowrap"
                            >
                                {deleteText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
