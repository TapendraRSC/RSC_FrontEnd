import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

interface CreditFormData {
    projectName: string;
    plotNumber: string;
    employeeName: string;
    amount: number | string;
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

    // Dropdown options
    const [projectOptions, setProjectOptions] = useState<string[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<string[]>([]);
    const [plotOptions, setPlotOptions] = useState<string[]>([]);

    // Selected values
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedPlot, setSelectedPlot] = useState<string>('');

    const isEditMode = !!currentData;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        clearErrors,
        formState: { errors }
    } = useForm<CreditFormData>();

    // Fetch unique project names
    const fetchProjects = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/collection/getAllCollections`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch projects');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            // Normalize: trim spaces and convert to consistent case for comparison
            const projectMap = new Map<string, string>();
            collections.forEach((item: any) => {
                if (item.projectName) {
                    const trimmed = item.projectName.trim();
                    const normalized = trimmed.toLowerCase();
                    // Store original case version (first occurrence)
                    if (!projectMap.has(normalized)) {
                        projectMap.set(normalized, trimmed);
                    }
                }
            });

            const uniqueProjects = Array.from(projectMap.values()).sort();
            setProjectOptions(uniqueProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch employees based on selected project
    const fetchEmployees = async (projectName: string) => {
        const token = getAuthToken();
        if (!token || !projectName) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/collection/getAllCollections`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch employees');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            // Filter by project (case-insensitive, trimmed comparison)
            const normalizedProject = projectName.trim().toLowerCase();
            const filteredCollections = collections.filter((item: any) =>
                item.projectName && item.projectName.trim().toLowerCase() === normalizedProject
            );

            // Normalize employee names
            const employeeMap = new Map<string, string>();
            filteredCollections.forEach((item: any) => {
                if (item.employeeName) {
                    const trimmed = item.employeeName.trim();
                    const normalized = trimmed.toLowerCase();
                    if (!employeeMap.has(normalized)) {
                        employeeMap.set(normalized, trimmed);
                    }
                }
            });

            const uniqueEmployees = Array.from(employeeMap.values()).sort();
            setEmployeeOptions(uniqueEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Fetch plots based on selected project and employee
    const fetchPlots = async (projectName: string, employeeName: string) => {
        const token = getAuthToken();
        if (!token || !projectName || !employeeName) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/collection/getAllCollections`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch plots');

            const result = await response.json();
            const collections = result.data || result.collections || result || [];

            // Filter by project and employee (case-insensitive, trimmed)
            const normalizedProject = projectName.trim().toLowerCase();
            const normalizedEmployee = employeeName.trim().toLowerCase();

            const filteredCollections = collections.filter(
                (item: any) =>
                    item.projectName && item.projectName.trim().toLowerCase() === normalizedProject &&
                    item.employeeName && item.employeeName.trim().toLowerCase() === normalizedEmployee
            );

            // Normalize plot numbers
            const plotMap = new Map<string, string>();
            filteredCollections.forEach((item: any) => {
                if (item.plotNumber) {
                    const trimmed = String(item.plotNumber).trim();
                    const normalized = trimmed.toLowerCase();
                    if (!plotMap.has(normalized)) {
                        plotMap.set(normalized, trimmed);
                    }
                }
            });

            const uniquePlots = Array.from(plotMap.values()).sort((a, b) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            });

            setPlotOptions(uniquePlots);
        } catch (error) {
            console.error('Error fetching plots:', error);
        }
    };

    // Handle project change
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedProject(value);
        setSelectedEmployee('');
        setSelectedPlot('');
        setEmployeeOptions([]);
        setPlotOptions([]);
        setValue('projectName', value);
        setValue('employeeName', '');
        setValue('plotNumber', '');

        if (value) {
            fetchEmployees(value);
        }
    };

    // Handle employee change
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedEmployee(value);
        setSelectedPlot('');
        setPlotOptions([]);
        setValue('employeeName', value);
        setValue('plotNumber', '');

        if (value && selectedProject) {
            fetchPlots(selectedProject, value);
        }
    };

    // Handle plot change
    const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPlot(value);
        setValue('plotNumber', value);
    };

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                // Edit mode - set data as read-only
                reset({
                    projectName: currentData.projectName || '',
                    plotNumber: currentData.plotNumber || '',
                    employeeName: currentData.employeeName || '',
                    amount: currentData.amount || '',
                });
                setSelectedProject(currentData.projectName || '');
                setSelectedEmployee(currentData.employeeName || '');
                setSelectedPlot(currentData.plotNumber || '');
            } else {
                // Add mode - fetch projects and reset form
                reset({
                    projectName: '',
                    plotNumber: '',
                    employeeName: '',
                    amount: ''
                });
                setSelectedProject('');
                setSelectedEmployee('');
                setSelectedPlot('');
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
                    {/* Project Name - Dropdown in Add mode, Text in Edit mode */}
                    <div>
                        <label className={labelStyles}>
                            Project Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                {...register('projectName')}
                                disabled={true}
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedProject}
                                onChange={handleProjectChange}
                                className={inputStyles}
                                required
                            >
                                <option value="">Select Project</option>
                                {projectOptions.map((project) => (
                                    <option key={project} value={project}>
                                        {project}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.projectName && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.projectName.message)}</p>
                        )}
                    </div>

                    {/* Employee Name - Dropdown in Add mode, Text in Edit mode */}
                    <div>
                        <label className={labelStyles}>
                            Employee Name {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                {...register('employeeName')}
                                disabled={true}
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedEmployee}
                                onChange={handleEmployeeChange}
                                disabled={!selectedProject}
                                className={`${inputStyles} ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employeeOptions.map((employee) => (
                                    <option key={employee} value={employee}>
                                        {employee}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.employeeName && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.employeeName.message)}</p>
                        )}
                    </div>

                    {/* Plot Number - Dropdown in Add mode, Text in Edit mode */}
                    <div>
                        <label className={labelStyles}>
                            Plot Number {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        {isEditMode ? (
                            <input
                                type="text"
                                {...register('plotNumber')}
                                disabled={true}
                                className={`${inputStyles} ${disabledStyles}`}
                            />
                        ) : (
                            <select
                                value={selectedPlot}
                                onChange={handlePlotChange}
                                disabled={!selectedEmployee}
                                className={`${inputStyles} ${!selectedEmployee ? 'opacity-50 cursor-not-allowed' : ''}`}
                                required
                            >
                                <option value="">Select Plot</option>
                                {plotOptions.map((plot) => (
                                    <option key={plot} value={plot}>
                                        {plot}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.plotNumber && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.plotNumber.message)}</p>
                        )}
                    </div>

                    {/* Amount - Always Editable */}
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
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> {isEditMode ? 'Update' : 'Save'} Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreditCollectionModal;