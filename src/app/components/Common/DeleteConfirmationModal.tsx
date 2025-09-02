// components/DeleteConfirmationModal.tsx
import { ReactNode, useEffect } from 'react';
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
            style={{ marginTop: "0px" }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-auto max-w-2xl min-w-80 border border-gray-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 pb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="text-red-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-gray-900 whitespace-nowrap"
                        >
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 flex-shrink-0 ml-4"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <div className="pl-13"> {/* Align with title text */}
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 whitespace-nowrap"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onDelete}
                                className="px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm whitespace-nowrap"
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