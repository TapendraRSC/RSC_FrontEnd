'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Globe } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import OnlineCollectionModal from './OnlineCollectionModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../libs/api';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

interface OnlineRecord {
    id: number;
    projectId: number;
    projectTitle: string;
    projectName: string;
    plotId: number;
    plotNumber: string;
    employeeId: number;
    employeeName: string;
    bankName: string;
    amount: number;
    transactionId: string;
    status: string;
    createdAt: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
}

const OnlineCollectionPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const role = useSelector((state: RootState) => state?.auth?.role);

    const isAdmin = role === 'Admin';
    const isAccountant = role === 'Accountant';

    const [data, setData] = useState<OnlineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<OnlineRecord | null>(null);

    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
    });

    const { permissions: sidebarPermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const fetchOnlineCollections = useCallback(async (page: number = 1, limit: number = 10) => {
        const token = getAuthToken();
        if (!token) {
            toast.error('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/online/get-all-online-collection?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch online collections');

            const result = await response.json();
            const records: OnlineRecord[] = result.data || [];
            setData(records);

            setPagination({
                currentPage: result.pagination?.page || page,
                totalPages: result.pagination?.totalPages || 1,
                totalRecords: result.pagination?.totalRecords || records.length,
                limit: result.pagination?.limit || limit,
            });

        } catch (error: any) {
            console.error('Error fetching online collections:', error);
            toast.error(error.message || 'Failed to load online collections');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

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
        ]).then(() => {
            fetchOnlineCollections(1, 10);
        });
    }, [dispatch, fetchOnlineCollections]);

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

    const handleApprove = async (row: any) => {
        try {
            const token = getAuthToken();
            if (!token) { toast.error('Session expired. Please login again.'); return; }

            const response = await fetch(`${API_BASE_URL}/online/online-collection/${row.id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve payment');
            }

            toast.success('Payment Approved Successfully');
            fetchOnlineCollections(pagination.currentPage, pagination.limit);
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve payment');
        }
    };

    const handleReject = async (row: any) => {
        try {
            const token = getAuthToken();
            if (!token) { toast.error('Session expired. Please login again.'); return; }

            const response = await fetch(`${API_BASE_URL}/online/online-collection/${row.id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject payment');
            }

            toast.error('Payment Rejected');
            fetchOnlineCollections(pagination.currentPage, pagination.limit);
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject payment');
        }
    };

    const handleSave = async (formData: any) => {
        try {
            const token = getAuthToken();
            if (!token) { toast.error('Session expired. Please login again.'); return; }

            let response;

            if (currentRecord) {
                // Edit — only amount & transactionId
                const payload = {
                    amount: Number(formData.amount),
                    transactionId: formData.transaction_id,
                };
                response = await fetch(`${API_BASE_URL}/online/update-online-collection/${currentRecord.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create — id-based payload
                const payload = {
                    projectId: Number(formData.projectId),
                    plotId: Number(formData.plotId),
                    userId: Number(formData.userId),   // employeeId as userId
                    amount: Number(formData.amount),
                    transactionId: formData.transaction_id,
                    bankName: formData.bank_name,
                };
                response = await fetch(`${API_BASE_URL}/online/create-online-collection`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || (currentRecord ? 'Failed to update' : 'Failed to create'));
            }

            toast.success(currentRecord ? 'Record updated successfully' : 'Record created successfully');
            setIsModalOpen(false);
            setCurrentRecord(null);
            fetchOnlineCollections(pagination.currentPage, pagination.limit);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save record');
        }
    };

    const handlePageChange = (page: number) => fetchOnlineCollections(page, pagination.limit);
    const handleLimitChange = (newLimit: number) => fetchOnlineCollections(1, newLimit);

    const columns: any[] = [
        // { label: 'Project', accessor: 'projectTitle', sortable: true },
        {
            label: 'Project',
            accessor: 'projectTitle',
            sortable: true,
            render: (row: any) => row.projectTitle || row.projectName || '-',
        },
        { label: 'Plot No.', accessor: 'plotNumber', sortable: true },
        { label: 'Employee', accessor: 'employeeName', sortable: true },
        { label: 'Bank Name', accessor: 'bankName', sortable: true },
        {
            label: 'Amount',
            accessor: 'amount',
            sortable: true,
            render: (row: any) => `₹${Number(row.amount).toLocaleString()}`,
        },
        { label: 'Transaction ID', accessor: 'transactionId' },
        {
            label: 'Status',
            accessor: 'status',
            render: (row: any) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.status === 'Confirmed' ? 'bg-green-100 text-green-700'
                    : row.status === 'Rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            label: 'Created At',
            accessor: 'createdAt',
            sortable: true,
            render: (row: any) => {
                if (!row.createdAt) return '-';
                const date = new Date(row.createdAt);
                date.setHours(date.getHours() - 5);
                date.setMinutes(date.getMinutes() - 30);
                return date.toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                    timeZone: 'Asia/Kolkata',
                });
            },
        },
    ];

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Globe className="text-indigo-500" /> Online Collections
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage all online payment collections
                    </p>
                </div>
                <button
                    onClick={() => { setCurrentRecord(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Online
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <CustomTable<any>
                    data={data}
                    columns={columns}
                    showSearch={true}
                    title="Online Collection List"
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalRecords={pagination.totalRecords}
                    pageSize={pagination.limit}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handleLimitChange}
                    actions={(row: any) => (
                        <div className="flex gap-2">
                            {permissions.edit && isAccountant && row.status === 'Pending' && (
                                <button
                                    onClick={() => { setCurrentRecord(row); setIsModalOpen(true); }}
                                    title="Edit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                >
                                    Edit
                                </button>
                            )}
                            {isAccountant && row.status === 'Pending' && (
                                <>
                                    <button onClick={() => handleApprove(row)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                                    <button onClick={() => handleReject(row)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                                </>
                            )}
                        </div>
                    )}
                />
            </div>

            <OnlineCollectionModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCurrentRecord(null); }}
                currentData={currentRecord}
                onSave={handleSave}
            />
        </div>
    );
};

export default OnlineCollectionPage;