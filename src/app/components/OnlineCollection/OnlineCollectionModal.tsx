import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check } from 'lucide-react';
import { API_BASE_URL } from '../../../libs/api';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

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

const OnlineCollectionModal = ({ isOpen, onClose, onSave, currentData }: any) => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const [allCollections, setAllCollections] = useState<any[]>([]);
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [plotOptions, setPlotOptions] = useState<PlotOption[]>([]);

    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
    const [selectedPlotId, setSelectedPlotId] = useState<number | ''>('');

    const isEditMode = !!currentData;

    // Fetch all collections ONCE — filter in memory
    const loadAllCollections = async () => {
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
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();

            // getAllCollections response: result is array directly OR result.data
            const collections: any[] = Array.isArray(result)
                ? result
                : result.data || result.collections || [];

            setAllCollections(collections);

            // Unique projects by projectId
            // getAllCollections item has: projectId, projectTitle, plotId, plotNumber, employeeId, employeeName
            const projectMap = new Map<number, ProjectOption>();
            collections.forEach((item: any) => {
                const pid = item.projectId;
                const ptitle = item.projectTitle || item.projectName || '';
                if (pid && ptitle && !projectMap.has(pid)) {
                    projectMap.set(pid, { projectId: pid, projectTitle: ptitle });
                }
            });

            const uniqueProjects = Array.from(projectMap.values()).sort((a, b) =>
                a.projectTitle.localeCompare(b.projectTitle)
            );
            setProjectOptions(uniqueProjects);
        } catch (error) {
            console.error('Error loading collections:', error);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectId = e.target.value ? Number(e.target.value) : '';
        setSelectedProjectId(projectId);
        setSelectedEmployeeId('');
        setSelectedPlotId('');
        setEmployeeOptions([]);
        setPlotOptions([]);
        setValue('projectId', projectId || '');
        setValue('userId', '');
        setValue('plotId', '');

        if (!projectId) return;

        // Filter employees for this projectId
        const filtered = allCollections.filter((item: any) => item.projectId === projectId);
        const employeeMap = new Map<number, EmployeeOption>();
        filtered.forEach((item: any) => {
            const empId = item.employeeId;
            const empName = item.employeeName || '';
            if (empId && empName && !employeeMap.has(empId)) {
                employeeMap.set(empId, { employeeId: empId, employeeName: empName });
            }
        });
        const uniqueEmployees = Array.from(employeeMap.values()).sort((a, b) =>
            a.employeeName.localeCompare(b.employeeName)
        );
        setEmployeeOptions(uniqueEmployees);
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const employeeId = e.target.value ? Number(e.target.value) : '';
        setSelectedEmployeeId(employeeId);
        setSelectedPlotId('');
        setPlotOptions([]);
        setValue('userId', employeeId || '');
        setValue('plotId', '');

        if (!employeeId || !selectedProjectId) return;

        // Filter plots for this projectId + employeeId
        const filtered = allCollections.filter(
            (item: any) => item.projectId === selectedProjectId && item.employeeId === employeeId
        );
        const plotMap = new Map<number, PlotOption>();
        filtered.forEach((item: any) => {
            const pid = item.plotId;
            const pnum = String(item.plotNumber || '').trim();
            if (pid && pnum && !plotMap.has(pid)) {
                plotMap.set(pid, { plotId: pid, plotNumber: pnum });
            }
        });
        const uniquePlots = Array.from(plotMap.values()).sort((a, b) => {
            const na = parseFloat(a.plotNumber);
            const nb = parseFloat(b.plotNumber);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.plotNumber.localeCompare(b.plotNumber);
        });
        setPlotOptions(uniquePlots);
    };

    const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const plotId = e.target.value ? Number(e.target.value) : '';
        setSelectedPlotId(plotId);
        setValue('plotId', plotId || '');
    };

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                reset({
                    projectId: currentData.projectId || '',
                    plotId: currentData.plotId || '',
                    userId: currentData.employeeId || '',
                    bank_name: currentData.bankName || '',
                    amount: currentData.amount || '',
                    transaction_id: currentData.transactionId || '',
                    status: currentData.status || 'Pending',
                });
                setSelectedProjectId(currentData.projectId || '');
                setSelectedEmployeeId(currentData.employeeId || '');
                setSelectedPlotId(currentData.plotId || '');
            } else {
                reset({ status: 'Pending', projectId: '', plotId: '', userId: '', bank_name: '', amount: '', transaction_id: '' });
                setSelectedProjectId('');
                setSelectedEmployeeId('');
                setSelectedPlotId('');
                setEmployeeOptions([]);
                setPlotOptions([]);
                loadAllCollections();
            }
        }
    }, [currentData, isOpen]);

    if (!isOpen) return null;

    const inputStyles = "w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const disabledStyles = "bg-gray-100 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">{currentData ? 'Edit' : 'Add'} Online Entry</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4">
                    <form onSubmit={handleSubmit(onSave)} className="space-y-3">

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

                        {/* Bank Name */}
                        <div>
                            <label className={labelStyles}>
                                Bank Name {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                placeholder='Enter Bank Name'
                                {...register('bank_name', { required: isEditMode ? false : "Bank name is required" })}
                                disabled={isEditMode}
                                className={`${inputStyles} ${isEditMode ? disabledStyles : ''}`}
                            />
                            {errors.bank_name && <p className="text-red-500 text-xs mt-1">{String(errors.bank_name.message)}</p>}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className={labelStyles}>Amount <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                placeholder='Enter Amount'
                                {...register('amount', { required: "Amount is required", min: { value: 1, message: "Amount must be greater than 0" } })}
                                className={inputStyles}
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{String(errors.amount.message)}</p>}
                        </div>

                        {/* Transaction ID */}
                        <div>
                            <label className={labelStyles}>Transaction ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder='Enter Transaction Id'
                                {...register('transaction_id', { required: "Transaction ID is required" })}
                                className={inputStyles}
                            />
                            {errors.transaction_id && <p className="text-red-500 text-xs mt-1">{String(errors.transaction_id.message)}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className={labelStyles}>Status</label>
                            <select disabled {...register("status")} className={`${inputStyles} ${disabledStyles}`}>
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