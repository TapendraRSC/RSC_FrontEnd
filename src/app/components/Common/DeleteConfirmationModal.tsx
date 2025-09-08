// components/DeleteConfirmationModal.tsx
import { useEffect } from 'react';
import { LucideIcon, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    title: string;
    message: string;
    cancelText?: string;
    deleteText?: string;
    Icon?: LucideIcon;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onDelete,
    title,
    message,
    cancelText = 'Cancel',
    deleteText = 'Delete',
    Icon = AlertTriangle,
}: DeleteConfirmationModalProps) {
    // Handle escape key press
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

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            style={{ marginTop: '0px' }}
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
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <Icon className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    <div className="flex-1">
                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                        >
                            {title}
                        </h2>
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
                        {/* Align with title text */}
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            {/* Cancel button */}
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 whitespace-nowrap"
                            >
                                {cancelText}
                            </button>

                            {/* Delete button */}
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
