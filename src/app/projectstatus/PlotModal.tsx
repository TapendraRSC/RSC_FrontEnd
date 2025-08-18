"use client";

import { useForm } from "react-hook-form";
import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormInput from "../components/Common/FormInput";
import CommonDropdown from "../components/Common/CommonDropdown";
import { fetchProjectStatuses } from "../../../store/projectSlice";
import { AppDispatch } from "../../../store/store";
import { fetchLands } from "../../../store/landSlice";

interface Plot {
    id?: number;
    plotNumber: number;
    sqYard: number;
    // sqFeet?: number;
    city: string;
    remarks: string;
    facing?: string;
    status?: string;
    projectId: number;
    landId?: number | null;
}

interface PlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePlot: (data: Plot) => void;
    isLoading: boolean;
    currentPlot: Plot | null;
}

interface ProjectStatus {
    id: number;
    title: string;
}

interface Land {
    id: number;
    type: string;
}

interface RootState {
    projectStatus: {
        list: {
            projects: ProjectStatus[];
            total: number;
            totalPages: number;
        } | null;
        loading: boolean;
        error: any;
    };
    lands: {
        list: {
            roles: Land[];
        } | null;
        loading: boolean;
    };
}

const facingOptions = [
    { id: 1, label: "North", value: "north" },
    { id: 2, label: "South", value: "south" },
    { id: 3, label: "East", value: "east" },
    { id: 4, label: "West", value: "west" },
];

// Status options
const statusOptions = [
    { id: 1, label: "Available", value: "Available" },
    { id: 2, label: "Booked", value: "book" },
    { id: 4, label: "Hold", value: "hold" },
    { id: 5, label: "Registry", value: "Registry" },
];

const defaultValues: Partial<Plot> = {
    plotNumber: undefined,
    sqYard: undefined,
    city: "",
    remarks: "",
    facing: undefined,
    status: undefined,
    projectId: undefined,
    landId: null,
};

export default function PlotModal({
    isOpen,
    onClose,
    onSavePlot,
    isLoading,
    currentPlot,
}: PlotModalProps) {
    // Redux selectors
    const dispatch = useDispatch<AppDispatch>();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { list, loading, error } = useSelector((state: RootState) => state.projectStatus);
    const { list: landsList, loading: landsLoading } = useSelector((state: RootState) => state.lands);

    const projectStatusList: ProjectStatus[] = list?.projects || [];
    const landsList_data: Land[] = landsList?.roles || [];

    useEffect(() => {
        dispatch(fetchProjectStatuses({ page: currentPage, limit: pageSize, searchValue: "" }));
        dispatch(fetchLands({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const projectOptions = projectStatusList?.map((project: ProjectStatus) => ({
        id: project.id,
        label: project.title,
        value: project.id,
    }));

    const landOptions = landsList_data?.map((land: Land) => ({
        id: land.id,
        label: land.type,
        value: land.id,
    }));

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
        clearErrors,
    } = useForm<Plot>({
        defaultValues,
    });

    const selectedFacing = watch("facing");
    const selectedStatus = watch("status");
    const selectedProjectId = watch("projectId");
    const selectedLandId = watch("landId");

    useEffect(() => {
        if (currentPlot) {
            reset(currentPlot);
        } else {
            reset(defaultValues);
        }
    }, [currentPlot, reset]);

    useEffect(() => {
        if (isOpen && !currentPlot) {
            reset(defaultValues);
        }
    }, [isOpen, currentPlot, reset]);

    const onSubmit = async (data: Plot) => {

        const payload: Plot = {
            ...data,
            plotNumber: Number(data.plotNumber),
            sqYard: Number(data.sqYard),
            projectId: Number(data.projectId),
            landId: data.landId ? Number(data.landId) : null,
            facing: data.facing || undefined,
            status: data.status || undefined,
        };

        try {
            await onSavePlot(payload);
            reset(defaultValues);
        } catch (error) {
            console.error("Error saving plot:", error);
        }
    };

    const handleClose = () => {
        reset(defaultValues);
        clearErrors();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
            clearErrors();
        }
    }, [isOpen, reset, clearErrors]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
            style={{ margin: "0px" }}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentPlot ? "Edit Plot" : "Add New Plot"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput<Plot>
                                name="plotNumber"
                                label="Plot Number"
                                type="number"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                            />
                            <FormInput<Plot>
                                name="city"
                                label="City"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                            />
                        </div>

                        {/* Row 2: Square Yard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput<Plot>
                                name="sqYard"
                                label="Square Yard"
                                type="number"
                                register={register}
                                errors={errors}
                                required
                                clearErrors={clearErrors}
                                step="any"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facing
                                </label>
                                <CommonDropdown
                                    options={facingOptions}
                                    selected={
                                        facingOptions.find((f) => f.value === selectedFacing) ||
                                        null
                                    }
                                    onChange={(value: any) => {
                                        console.log("Facing selected:", value);
                                        setValue("facing", value?.value);
                                    }}
                                    placeholder="Select facing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <CommonDropdown
                                    options={statusOptions}
                                    selected={
                                        statusOptions.find((s) => s.value === selectedStatus) ||
                                        null
                                    }
                                    onChange={(value: any) => {
                                        console.log("Status selected:", value);
                                        setValue("status", value?.value);
                                    }}
                                    placeholder="Select status"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <CommonDropdown
                                    options={projectOptions || []}
                                    selected={
                                        projectOptions?.find((p) => p.value === selectedProjectId) ||
                                        null
                                    }
                                    onChange={(value: any) => {
                                        console.log("Project selected:", value);
                                        setValue("projectId", value?.value);
                                        clearErrors("projectId");
                                    }}
                                    placeholder="Select project"
                                />
                                {errors.projectId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.projectId.message || "Project is required"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Land
                                </label>
                                <CommonDropdown
                                    options={landOptions || []}
                                    selected={
                                        landOptions?.find((l) => l.value === selectedLandId) ||
                                        null
                                    }
                                    onChange={(value: any) => {
                                        console.log("Land selected:", value);
                                        setValue("landId", value?.value || null);
                                        clearErrors("landId");
                                    }}
                                    placeholder="Select land"
                                />
                                {errors.landId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.landId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="w-full">
                            <FormInput<Plot>
                                name="remarks"
                                label="Remarks"
                                register={register}
                                errors={errors}
                                clearErrors={clearErrors}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[120px]"
                        >
                            {isLoading ? (
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    {currentPlot ? "Update Plot" : "Add Plot"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}