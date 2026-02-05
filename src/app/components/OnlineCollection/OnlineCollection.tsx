'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Plus, Globe } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import OnlineCollectionModal from './OnlineCollectionModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { toast } from 'react-toastify';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

const OnlineCollectionPage = () => {
    const dispatch = useDispatch<AppDispatch>();


    const role = useSelector((state: RootState) => state.auth.role);
    const isAdmin = role === 'Admin';

    const [data] = useState([
        {
            id: 1,
            project_name: 'Green Valley',
            plot_number: 'A-101',
            employee_name: 'Rahul Sharma',
            amount: 50000,
            transaction_id: 'TXN987654321',
            status: 'Completed',
        },
        {
            id: 2,
            project_name: 'Skyline Residency',
            plot_number: 'B-205',
            employee_name: 'Amit Patel',
            amount: 25000,
            transaction_id: 'TXN123456789',
            status: 'Pending',
        },
    ]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);

    const { permissions: sidebarPermissions, loading: roleLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    useEffect(() => {
        const token = getAuthToken();

        if (!token) {
            toast.error('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        Promise.all([
            dispatch(fetchRolePermissionsSidebar()),
            dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' })),
        ]).finally(() => setLoading(false));
    }, [dispatch]);

    /**
     * 🔐 Permission Mapping
     * edit  -> permissionId 22
     * delete-> permissionId 4
     */
    const permissions = useMemo(() => {
        const pagePermission = sidebarPermissions?.permissions?.find(
            (p: any) => p.pageName === 'Online Collection' || p.pageId === 36
        );

        const assignedIds: number[] = pagePermission?.permissionIds ?? [];

        return {
            edit: assignedIds.includes(22),
            delete: assignedIds.includes(4),
        };
    }, [sidebarPermissions]);

    const columns: any[] = [
        { label: 'Project', accessor: 'project_name', sortable: true },
        { label: 'Plot No.', accessor: 'plot_number', sortable: true },
        { label: 'Employee', accessor: 'employee_name', sortable: true },
        {
            label: 'Amount',
            accessor: 'amount',
            sortable: true,
            render: (row: any) => `₹${row.amount.toLocaleString()}`,
        },
        { label: 'Transaction ID', accessor: 'transaction_id' },
        {
            label: 'Status',
            accessor: 'status',
            render: (row: any) => (
                <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${row.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : row.status === 'Rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
    ];

    if (loading || roleLoading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading Online Collections...
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <Globe className="text-indigo-500" /> Online Collections
                </h1>

                {permissions.edit && (
                    <button
                        onClick={() => {
                            setCurrentRecord(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Online
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-gray-800 overflow-hidden">
                <CustomTable<any>
                    data={data}
                    columns={columns}
                    showSearch
                    actions={(row: any) => (
                        <div className="flex gap-2">
                            {(permissions.edit && isAdmin) && (
                                <button
                                    onClick={() => {
                                        setCurrentRecord(row);
                                        setIsModalOpen(true);
                                    }}
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}

                            {/* {permissions.delete && (
                                <button className="text-red-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )} */}
                        </div>
                    )}
                />
            </div>

            <OnlineCollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentData={currentRecord}
                onSave={(data: any) => {
                    console.log('Saved Data:', data);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

export default OnlineCollectionPage;
