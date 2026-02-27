import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../libs/api';


const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

interface CreditFormData {
    projectId: number | string;
    plotId: number | string;
    userId: number | string;
    amount: number | string;
}

interface ProjectOption {
    projectId: number;
    projectTitle: string;
}

interface EmployeeOption {
    employeeId: number;
    employeeName: string;
}

interface PlotOption {
    plotId: number;
    plotNumber: string;
}

interface CreditCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreditFormData) => Promise<void>;
    currentData: any;
}

const CreditCollectionModal: React.FC<CreditCollectionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentData
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dropdown options (id + name)
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [plotOptions, setPlotOptions] = useState<PlotOption[]>([]);

    // Selected IDs
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
    const [selectedPlotId, setSelectedPlotId] = useState<number | ''>('');

    const isEditMode = !!currentData;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<CreditFormData>();

    // Fetch unique projects
    const fetchProjects = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/collection/getAllCollections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch projects');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            // Unique projects by projectId
            const projectMap = new Map<number, ProjectOption>();
            collections.forEach((item: any) => {
                if (item.projectId && item.projectTitle && !projectMap.has(item.projectId)) {
                    projectMap.set(item.projectId, {
                        projectId: item.projectId,
                        projectTitle: item.projectTitle,
                    });
                }
            });

            const uniqueProjects = Array.from(projectMap.values()).sort((a, b) =>
                a.projectTitle.localeCompare(b.projectTitle)
            );
            setProjectOptions(uniqueProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch employees based on selected projectId
    const fetchEmployees = async (projectId: number) => {
        const token = getAuthToken();
        if (!token || !projectId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/collection/getAllCollections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch employees');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            const filtered = collections.filter((item: any) => item.projectId === projectId);

            const employeeMap = new Map<number, EmployeeOption>();
            filtered.forEach((item: any) => {
                if (item.employeeId && item.employeeName && !employeeMap.has(item.employeeId)) {
                    employeeMap.set(item.employeeId, {
                        employeeId: item.employeeId,
                        employeeName: item.employeeName,
                    });
                }
            });

            const uniqueEmployees = Array.from(employeeMap.values()).sort((a, b) =>
                a.employeeName.localeCompare(b.employeeName)
            );
            setEmployeeOptions(uniqueEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Fetch plots based on selected projectId and employeeId
    const fetchPlots = async (projectId: number, employeeId: number) => {
        const token = getAuthToken();
        if (!token || !projectId || !employeeId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/collection/getAllCollections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch plots');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            const filtered = collections.filter(
                (item: any) => item.projectId === projectId && item.employeeId === employeeId
            );

            const plotMap = new Map<number, PlotOption>();
            filtered.forEach((item: any) => {
                if (item.plotId && item.plotNumber && !plotMap.has(item.plotId)) {
                    plotMap.set(item.plotId, {
                        plotId: item.plotId,
                        plotNumber: String(item.plotNumber),
                    });
                }
            });

            const uniquePlots = Array.from(plotMap.values()).sort((a, b) => {
                const numA = parseFloat(a.plotNumber);
                const numB = parseFloat(b.plotNumber);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.plotNumber.localeCompare(b.plotNumber);
            });

            setPlotOptions(uniquePlots);
        } catch (error) {
            console.error('Error fetching plots:', error);
        }
    };

    // Handle project change
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSelectedProjectId(id);
        setSelectedEmployeeId('');
        setSelectedPlotId('');
        setEmployeeOptions([]);
        setPlotOptions([]);
        setValue('projectId', id);
        setValue('userId', '');
        setValue('plotId', '');

        if (id) fetchEmployees(id as number);
    };

    // Handle employee change
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSelectedEmployeeId(id);
        setSelectedPlotId('');
        setPlotOptions([]);
        setValue('userId', id);
        setValue('plotId', '');

        if (id && selectedProjectId) fetchPlots(selectedProjectId as number, id as number);
    };

    // Handle plot change
    const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSelectedPlotId(id);
        setValue('plotId', id);
    };

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                // Edit mode
                reset({
                    projectId: currentData.projectId || '',
                    plotId: currentData.plotId || '',
                    userId: currentData.employeeId || '',
                    amount: currentData.amount || '',
                });
                setSelectedProjectId(currentData.projectId || '');
                setSelectedEmployeeId(currentData.employeeId || '');
                setSelectedPlotId(currentData.plotId || '');
            } else {
                // Add mode
                reset({ projectId: '', plotId: '', userId: '', amount: '' });
                setSelectedProjectId('');
                setSelectedEmployeeId('');
                setSelectedPlotId('');
                setEmployeeOptions([]);
                setPlotOptions([]);
                fetchProjects();
            }
        }
    }, [currentData, reset, isOpen]);

    const onSubmit = async (data: CreditFormData) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyles = "w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
    const disabledStyles = "bg-gray-100 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">
                        {isEditMode ? 'Edit' : 'Add'} Credit Record
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Project */}
                    <div>
                        <label className={labelStyles}>
                            Project Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={currentData?.projectTitle || currentData?.projectName || ''}
                                disabled
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                                className={inputStyles}
                                required
                            >
                                <option value="">Select Project</option>
                                {projectOptions.map((p) => (
                                    <option key={p.projectId} value={p.projectId}>
                                        {p.projectTitle}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Employee */}
                    <div>
                        <label className={labelStyles}>
                            Employee Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={currentData?.employeeName || ''}
                                disabled
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedEmployeeId}
                                onChange={handleEmployeeChange}
                                disabled={!selectedProjectId}
                                className={`${inputStyles} ${!selectedProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employeeOptions.map((emp) => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.employeeName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Plot */}
                    <div>
                        <label className={labelStyles}>
                            Plot Number {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={currentData?.plotNumber || ''}
                                disabled
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedPlotId}
                                onChange={handlePlotChange}
                                disabled={!selectedEmployeeId}
                                className={`${inputStyles} ${!selectedEmployeeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                required
                            >
                                <option value="">Select Plot</option>
                                {plotOptions.map((plot) => (
                                    <option key={plot.plotId} value={plot.plotId}>
                                        {plot.plotNumber}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className={labelStyles}>
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('amount', {
                                required: "Amount is required",
                                min: { value: 1, message: "Amount must be greater than 0" }
                            })}
                            className={inputStyles}
                            placeholder="Enter amount"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.amount.message)}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Check className="w-4 h-4" /> {isEditMode ? 'Update' : 'Save'} Record</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreditCollectionModal;