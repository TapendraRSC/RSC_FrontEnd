"use client";
import { useEffect, useMemo } from "react";
import { X, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { AppDispatch, RootState } from "../../../../store/store";
import { exportUsers } from "../../../../store/userSlice";
import CommonDropdown from "./CommonDropdown";

interface BulkAssignRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (assignedToId: string | number) => void;
    selectedIds: (string | number)[];
    currentUser: { id: number; roleId: number };
}

export default function BulkAssignRoleModal({
    isOpen,
    onClose,
    onConfirm,
    selectedIds,
    currentUser,
}: BulkAssignRoleModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { data: users = [] } = useSelector((state: RootState) => state.users);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<{ assignedTo: string | number | null }>({
        defaultValues: { assignedTo: null },
    });

    useEffect(() => {
        if (isOpen) {
            dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
        } else {
            reset();
        }
    }, [isOpen, dispatch, reset]);

    const actualUsersData = useMemo(() => {
        if (Array.isArray(users)) return users;
        if (users?.data) {
            if (Array.isArray(users.data)) return users.data;
            if (users.data?.data && Array.isArray(users.data.data)) return users.data.data;
        }
        return [];
    }, [users]);

    const assignedToOptions = useMemo(
        () => actualUsersData.map((user: any) => ({
            label: `${user.name}`,
            value: user.id
        })),
        [actualUsersData]
    );

    const filteredAssignedToOptions = useMemo(() => {
        if (currentUser.roleId === 36) {
            const userOption = assignedToOptions.find((u: any) => u.value === currentUser.id);
            return userOption ? [userOption] : [];
        }
        return assignedToOptions;
    }, [assignedToOptions, currentUser]);

    const submitHandler = (data: { assignedTo: string | number | null }) => {
        if (data.assignedTo) {
            onConfirm(data.assignedTo);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" style={{ margin: "0px" }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/40">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Assign to Sales Person
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {selectedIds.length} selected lead{selectedIds.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(submitHandler)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Select Sales Person <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="assignedTo"
                                control={control}
                                rules={{ required: "Please select a sales person" }}
                                render={({ field }) => (
                                    <CommonDropdown
                                        options={filteredAssignedToOptions}
                                        selected={filteredAssignedToOptions.find((opt: any) => opt.value === field.value) || null}
                                        onChange={(value: any) => field.onChange(value?.value || null)}
                                        placeholder="Search or select sales person"
                                        error={!!errors.assignedTo}
                                        allowClear={true}
                                        className="w-full"
                                    />
                                )}
                            />
                            {errors.assignedTo && (
                                <p className="mt-1.5 text-sm text-red-600">
                                    {errors.assignedTo.message as string}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Assign Selected Leads
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
