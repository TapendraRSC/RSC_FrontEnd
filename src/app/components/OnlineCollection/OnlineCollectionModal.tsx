import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check } from 'lucide-react';
import FormInput from '../Common/FormInput';

const OnlineCollectionModal = ({ isOpen, onClose, onSave, currentData }: any) => {
    const { register, handleSubmit, reset, clearErrors, formState: { errors } } = useForm();

    useEffect(() => {
        if (currentData) reset(currentData);
        else reset({ status: 'Pending', project_name: '', plot_number: '', employee_name: '', amount: '', transaction_id: '' });
    }, [currentData, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">{currentData ? 'Edit' : 'Add'} Online Entry</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="p-4 space-y-3">
                    <FormInput name="project_name" label="Project Name" register={register} errors={errors} clearErrors={clearErrors} required validation={{required: "Required"}} />
                    <FormInput name="plot_number" label="Plot Number" register={register} errors={errors} clearErrors={clearErrors} required validation={{required: "Required"}} />
                    <FormInput name="employee_name" label="Employee Name" register={register} errors={errors} clearErrors={clearErrors} required validation={{required: "Required"}} />
                    <FormInput name="amount" label="Amount" type="number" register={register} errors={errors} clearErrors={clearErrors} required validation={{required: "Required"}} />
                    <FormInput name="transaction_id" label="Transaction ID" register={register} errors={errors} clearErrors={clearErrors} required validation={{required: "Required"}} />
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium dark:text-gray-200">Status</label>
                        <select {...register("status")} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-gray-600 dark:text-white">
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg dark:text-gray-300">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                            <Check className="w-4 h-4" /> Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnlineCollectionModal;