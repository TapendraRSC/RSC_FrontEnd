import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

const OnlineCollectionModal = ({ isOpen, onClose, onSave, currentData }: any) => {
    const { register, handleSubmit, reset, setValue, clearErrors, formState: { errors } } = useForm();

    // Dropdown options
    const [projectOptions, setProjectOptions] = useState<string[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<string[]>([]);
    const [plotOptions, setPlotOptions] = useState<string[]>([]);

    // Selected values
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedPlot, setSelectedPlot] = useState<string>('');

    const isEditMode = !!currentData;

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
        setValue('project_name', value);
        setValue('employee_name', '');
        setValue('plot_number', '');

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
        setValue('employee_name', value);
        setValue('plot_number', '');

        if (value && selectedProject) {
            fetchPlots(selectedProject, value);
        }
    };

    // Handle plot change
    const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPlot(value);
        setValue('plot_number', value);
    };

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                // Edit mode
                reset({
                    project_name: currentData.projectName || '',
                    plot_number: currentData.plotNumber || '',
                    employee_name: currentData.employeeName || '',
                    bank_name: currentData.bankName || '',
                    amount: currentData.amount || '',
                    transaction_id: currentData.transactionId || '',
                    status: currentData.status || 'Pending',
                });
                setSelectedProject(currentData.projectName || '');
                setSelectedEmployee(currentData.employeeName || '');
                setSelectedPlot(currentData.plotNumber || '');
            } else {
                // Add mode
                reset({
                    status: 'Pending',
                    project_name: '',
                    plot_number: '',
                    employee_name: '',
                    bank_name: '',
                    amount: '',
                    transaction_id: ''
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

    if (!isOpen) return null;

    const inputStyles = "w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const disabledStyles = "bg-gray-100 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">{currentData ? 'Edit' : 'Add'} Online Entry</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                    <form onSubmit={handleSubmit(onSave)} className="space-y-3">
                        {/* Project Name */}
                        <div>
                            <label className={labelStyles}>
                                Project Name {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    {...register('project_name')}
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
                            {errors.project_name && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.project_name.message)}</p>
                            )}
                        </div>

                        {/* Employee Name */}
                        <div>
                            <label className={labelStyles}>
                                Employee Name {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    {...register('employee_name')}
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
                            {errors.employee_name && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.employee_name.message)}</p>
                            )}
                        </div>

                        {/* Plot Number */}
                        <div>
                            <label className={labelStyles}>
                                Plot Number {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    {...register('plot_number')}
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
                            {errors.plot_number && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.plot_number.message)}</p>
                            )}
                        </div>

                        {/* Bank Name */}
                        <div>
                            <label className={labelStyles}>
                                Bank Name {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                placeholder='Enter Bank Name'
                                {...register('bank_name', {
                                    required: isEditMode ? false : "Bank name is required"
                                })}
                                disabled={isEditMode}
                                className={`${inputStyles} ${isEditMode ? disabledStyles : ''}`}
                            />
                            {errors.bank_name && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.bank_name.message)}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className={labelStyles}>
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder='Enter Amount'
                                {...register('amount', {
                                    required: "Amount is required",
                                    min: { value: 1, message: "Amount must be greater than 0" }
                                })}
                                className={inputStyles}
                            />
                            {errors.amount && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.amount.message)}</p>
                            )}
                        </div>

                        {/* Transaction ID */}
                        <div>
                            <label className={labelStyles}>
                                Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder='Enter Transaction Id'
                                {...register('transaction_id', {
                                    required: "Transaction ID is required"
                                })}
                                className={inputStyles}
                            />
                            {errors.transaction_id && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.transaction_id.message)}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className={labelStyles}>Status</label>
                            <select
                                disabled={true}
                                {...register("status")}
                                className={`${inputStyles} ${disabledStyles}`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                            >
                                <Check className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnlineCollectionModal;