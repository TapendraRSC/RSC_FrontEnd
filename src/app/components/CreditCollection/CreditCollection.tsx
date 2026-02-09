'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pencil, Trash2, Plus, Wallet, RefreshCw } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import CreditCollectionModal from './CreditCollectionModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

interface CreditRecord {
    id: number;
    projectName: string;
    plotNumber: string;
    employeeName: string;
    amount: number;
    createdAt: number;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
}

const CreditCollectionPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const role = useSelector((state: RootState) => state.auth.role);
    const isAdmin = role === 'Admin';

    const [data, setData] = useState<CreditRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<CreditRecord | null>(null);

    // Pagination state
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
    });

    const { permissions: sidebarPermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    // Fetch all credit collections
    const fetchCreditCollections = useCallback(async (page: number = 1, limit: number = 10) => {
        const token = getAuthToken();
        if (!token) {
            toast.error('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/credit/get-all-credit-collection?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch credit collections');
            }

            const result = await response.json();

            // Debug: Console log to see API response structure
            console.log('API Response:', result);

            // Handle different API response structures
            let records: CreditRecord[] = [];

            if (Array.isArray(result)) {
                records = result;
            } else if (result.data && Array.isArray(result.data)) {
                records = result.data;
            } else if (result.records && Array.isArray(result.records)) {
                records = result.records;
            } else if (result.creditCollections && Array.isArray(result.creditCollections)) {
                records = result.creditCollections;
            } else if (result.result && Array.isArray(result.result)) {
                records = result.result;
            }

            setData(records);

            // Update pagination info from API response
            setPagination({
                currentPage: result.currentPage || result.page || page,
                totalPages: result.totalPages || Math.ceil((result.total || result.totalRecords || records.length) / limit),
                totalRecords: result.total || result.totalRecords || result.totalCount || records.length,
                limit: result.limit || result.pageSize || limit,
            });

        } catch (error) {
            console.error('Error fetching credit collections:', error);
            toast.error('Failed to load credit collections');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new credit collection
    const createCreditCollection = async (formData: any) => {
        const token = getAuthToken();
        if (!token) {
            toast.error('Session expired. Please login again.');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/credit/create-credit-collection`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName: formData.projectName,
                    plotNumber: formData.plotNumber,
                    employeeName: formData.employeeName,
                    amount: Number(formData.amount),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create credit collection');
            }

            toast.success('Credit collection created successfully');
            return true;
        } catch (error: any) {
            console.error('Error creating credit collection:', error);
            toast.error(error.message || 'Failed to create credit collection');
            return false;
        }
    };

    // Update credit collection
    const updateCreditCollection = async (id: number, formData: any) => {
        const token = getAuthToken();
        if (!token) {
            toast.error('Session expired. Please login again.');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/credit/update-credit-collection/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName: formData.projectName,
                    plotNumber: formData.plotNumber,
                    employeeName: formData.employeeName,
                    amount: Number(formData.amount),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update credit collection');
            }

            toast.success('Credit collection updated successfully');
            return true;
        } catch (error: any) {
            console.error('Error updating credit collection:', error);
            toast.error(error.message || 'Failed to update credit collection');
            return false;
        }
    };

    // Handle save (create or update)
    const handleSave = async (formData: any) => {
        let success = false;

        if (currentRecord?.id) {
            success = await updateCreditCollection(currentRecord.id, formData);
        } else {
            success = await createCreditCollection(formData);
        }

        if (success) {
            setIsModalOpen(false);
            setCurrentRecord(null);
            fetchCreditCollections(pagination.currentPage, pagination.limit);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchCreditCollections(page, pagination.limit);
    };

    // Handle limit change
    const handleLimitChange = (newLimit: number) => {
        fetchCreditCollections(1, newLimit);
    };

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
            fetchCreditCollections(1, 10);
        });
    }, [dispatch, fetchCreditCollections]);

    const permissions = useMemo(() => {
        const pagePermission = sidebarPermissions?.permissions?.find(
            (p: any) => p.pageName === 'Credit Collection' || p.pageId === 38
        );

        const assignedIds: number[] = pagePermission?.permissionIds ?? [];

        return {
            edit: assignedIds.includes(22),
            delete: assignedIds.includes(4),
        };
    }, [sidebarPermissions]);

    const columns: any[] = [
        { label: 'Project Name', accessor: 'projectName', sortable: true },
        { label: 'Plot Number', accessor: 'plotNumber', sortable: true },
        { label: 'Employee Name', accessor: 'employeeName', sortable: true },
        {
            label: 'Amount',
            accessor: 'amount',
            sortable: true,
            render: (row: any) => `₹${row.amount?.toLocaleString() || 0}`
        },
        {
            label: 'Created At',
            accessor: 'createdAt',
            sortable: true,
            render: (row: any) => {
                if (!row.createdAt) return '-';
                const date = new Date(row.createdAt);
                return date.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });
            },
        },


    ];

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Wallet className="text-orange-500" /> Credit Collections (Offline)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage all cash and offline credit entries
                        {/* {pagination.totalRecords > 0 && (
                                    <span className="ml-2">({pagination.totalRecords} records)</span>
                                )} */}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* <button
                                onClick={() => fetchCreditCollections(pagination.currentPage, pagination.limit)}
                                disabled={loading}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button> */}
                    <button
                        onClick={() => { setCurrentRecord(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Credit Entry
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <CustomTable<any>
                    data={data}
                    columns={columns}
                    showSearch={true}
                    title="Credit Entry List"
                    // loading={loading}
                    // Pagination props - adjust based on your CustomTable component
                    // pagination={true}
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalRecords={pagination.totalRecords}
                    pageSize={pagination.limit}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handleLimitChange}
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

            {/* Manual Pagination (if CustomTable doesn't support it) */}
            {/* {pagination.totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Show</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-gray-700"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries</span>
                        <span className="ml-4">
                            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                            {pagination.totalRecords} entries
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={pagination.currentPage === 1 || loading}
                            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || loading}
                            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            Prev
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className={`px-3 py-1 rounded border dark:border-gray-700 ${pagination.currentPage === pageNum
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )} */}

            <CreditCollectionModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCurrentRecord(null); }}
                onSave={handleSave}
                currentData={currentRecord}
            />
        </div>
    );
};

export default CreditCollectionPage;