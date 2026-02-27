'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { exportUsers } from '../../../../store/userSlice';
import { RootState } from '../../../../store/store';
import CollectionTable from '../Common/CollectionTable';
import UploadCollection from '../../components/Common/UploadCollection';
import CollectionModal from './CollectionModal';
import { API_BASE_URL } from '../../../libs/api';
import * as XLSX from 'xlsx';

interface CollectionData {
    collectionId: number;
    registryStatus: string;
    totalAmount: string;
    paymentReceived: string;
    paymentPending: string;
    maintenance: string;
    stampDuty: string;
    legalFees: string;
    commission: string;
    incentive: string;
    createdAt: string;
    onlinePaymentReceived: string;
    creditPointReceived: string;
    onlinePaymentPending: string;
    creditPointsPending: string;
    projectId: number;
    projectTitle: string;
    plotId: number;
    plotNumber: string;
    plotSize: string;
    price: string;
    onlinePrice: string;
    creditPoint: number;
    bookingNumber: string;
    bookingAmount: string;
    bookingDate: string;
    cpName: string;
    remark: string | null;
    leadId: number;
    leadName: string;
    leadEmail: string;
    leadPhone: string;
    assignedToId: number;
    assignedToName: string;
    employeeId: number;
    employeeName: string;
    employeeEmail: string;
    paymentPlanId: number;
    paymentPlanName: string;
}

interface CollectionApiResponse {
    success: boolean;
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    role: string;
    data: CollectionData[];
}

interface Project {
    id: number | string;
    title: string;
    name?: string;
}

interface Permission {
    id: number;
    permissionName: string;
}

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const possibleKeys = ['token', 'accessToken', 'access_token', 'authToken', 'auth_token'];
    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token && token !== 'undefined' && token !== 'null') return token;
    }
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
            const user = JSON.parse(userStr);
            if (user.token && user.token !== 'undefined' && user.token !== 'null') return user.token;
            if (user.accessToken && user.accessToken !== 'undefined' && user.accessToken !== 'null') return user.accessToken;
            if (user.access_token && user.access_token !== 'undefined' && user.access_token !== 'null') return user.access_token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }
    }
    for (const key of possibleKeys) {
        const token = sessionStorage.getItem(key);
        if (token && token !== 'undefined' && token !== 'null') return token;
    }
    return null;
};

const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    if (dateString instanceof Date) {
        if (isNaN(dateString.getTime())) return 'N/A';
        return dateString.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const VALID_TABS = ['list', 'active', 'inactive', 'pending', 'cancelled'];

// Download columns — matches card view exactly
const DOWNLOAD_COLUMNS = [
    { key: 'bookingDate', label: 'Booking Date' },
    { key: 'projectTitle', label: 'Project Name' },
    { key: 'employeeEmail', label: 'Employee Email' },
    { key: 'leadName', label: 'Client Name' },
    { key: 'bookingAmount', label: 'Booking Amount' },
    { key: 'leadPhone', label: 'Mobile Number' },
    { key: 'leadEmail', label: 'Email Id' },
    { key: 'plotNumber', label: 'Plot Number' },
    { key: 'paymentPlanName', label: 'EMI Plan' },
    { key: 'plotSize', label: 'Plot Size' },
    { key: 'price', label: 'Price' },
    { key: 'onlinePrice', label: 'Online Price' },
    { key: 'creditPoint', label: 'Credit Point' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'stampDuty', label: 'Stamp Duty' },
    { key: 'legalFees', label: 'Legal Fees' },
    { key: 'onlinePaymentReceived', label: 'Online Payment Received' },
    { key: 'creditPointReceived', label: 'Credit Point Received' },
    { key: 'onlinePaymentPending', label: 'Online Payment Pending' },
    { key: 'creditPointsPending', label: 'Credit Points Pending' },
    { key: 'incentive', label: 'Incentive' },
    { key: 'cpName', label: 'CP Name' },
    { key: 'remark', label: 'Remark' },
    { key: 'commission', label: 'Commission' },
    { key: 'registryStatus', label: 'Registry Status' },
];

const CollectionComponent: React.FC = () => {
    const dispatch = useDispatch<any>();
    const searchParams = useSearchParams();

    const [collectionList, setCollectionList] = useState<CollectionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const { permissions: rolePermissions } = useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector((state: RootState) => state.permissions);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCollection, setCurrentCollection] = useState<any>(null);

    const handleSave = async (formData: any) => {
        setIsLoading(true);
        try {
            const id = currentCollection?.id;
            if (!id) return;
            const response = await fetch(`${API_BASE_URL}/collection/updateCollection/${id}`, {
                method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Collection updated successfully');
                setIsModalOpen(false);
                fetchCollectionsData();
            } else {
                toast.error(result.message || 'Update failed');
            }
        } catch (error: any) {
            toast.error('Something went wrong during update');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitialTab = (): string => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) return tabFromUrl;
        return 'list';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [lastFetchParams, setLastFetchParams] = useState<any>({});

    // ─── FIX: use refs to always hold latest fromDate / toDate ───────────────
    const fromDateRef = useRef(fromDate);
    const toDateRef = useRef(toDate);
    useEffect(() => { fromDateRef.current = fromDate; }, [fromDate]);
    useEffect(() => { toDateRef.current = toDate; }, [toDate]);
    // ─────────────────────────────────────────────────────────────────────────

    const permissionsFetchedRef = useRef(false);

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            setCurrentPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        if (permissionsFetchedRef.current) return;
        permissionsFetchedRef.current = true;
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }) as any);
        dispatch(exportUsers({ page: 1, limit: 100, searchValue: '' }) as any);
    }, [dispatch]);

    const getAllPermissionsList = useCallback((): Permission[] => {
        const permissionsList = allPermissions?.data?.permissions || allPermissions?.data || (Array.isArray(allPermissions) ? allPermissions : []);
        return Array.isArray(permissionsList) ? permissionsList : [];
    }, [allPermissions]);

    const getCollectionPermissionIds = useCallback((): number[] => {
        const collectionPerm = rolePermissions?.permissions?.find((p: any) => p.pageName === 'Collection' || p.pageName === 'collection');
        if (collectionPerm?.permissionIds?.length > 0) return collectionPerm.permissionIds;
        const leadPerm = rolePermissions?.permissions?.find((p: any) => p.pageName === 'Lead' || p.pageName === 'lead');
        return leadPerm?.permissionIds || [];
    }, [rolePermissions]);

    const hasPermission = useCallback((permId: number, permName: string): boolean => {
        const collectionPermissionIds = getCollectionPermissionIds();
        if (!collectionPermissionIds.includes(permId)) return false;
        const permissionsList = getAllPermissionsList();
        const matchedPermission = permissionsList.find((p: Permission) => p.id === permId);
        if (!matchedPermission) return false;
        return matchedPermission.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    }, [getCollectionPermissionIds, getAllPermissionsList]);

    const getStatusFromTab = (tabId: string) => {
        const tabToStatus: Record<string, string> = { list: '', active: 'active', inactive: 'inactive', pending: 'pending', cancelled: 'cancelled' };
        return tabToStatus[tabId] || '';
    };

    const fetchProjectsData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/getAllProjects?page=1&limit=100`, {
                method: 'GET', headers: getAuthHeaders(), credentials: 'include',
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) setProjectList(result.data);
                else if (Array.isArray(result)) setProjectList(result);
                else if (result.data && Array.isArray(result.data)) setProjectList(result.data);
            }
        } catch (error) { console.error('Error fetching projects:', error); }
    }, []);

    // ─── FIX: fetchCollectionsData accepts optional overrides for dates ───────
    const fetchCollectionsData = useCallback(async (overrideTab?: string, overrideFromDate?: string, overrideToDate?: string) => {
        setLoading(true);
        try {
            const tabToUse = overrideTab || activeTab;
            const statusFilter = getStatusFromTab(tabToUse);
            // Use override values first, then refs (always fresh), then state
            const effectiveFromDate = overrideFromDate !== undefined ? overrideFromDate : fromDateRef.current;
            const effectiveToDate = overrideToDate !== undefined ? overrideToDate : toDateRef.current;

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedProject) queryParams.append('projectId', selectedProject);
            if (selectedStatus) queryParams.append('status', selectedStatus);
            else if (statusFilter) queryParams.append('status', statusFilter);
            if (selectedActivity) queryParams.append('status', selectedActivity.toLowerCase());
            if (selectedCreatedBy) queryParams.append('createdBy', selectedCreatedBy);
            if (effectiveFromDate) queryParams.append('fromDate', effectiveFromDate);
            if (effectiveToDate) queryParams.append('toDate', effectiveToDate);
            if (selectedAssignedTo) queryParams.append('createdBy', selectedAssignedTo);
            queryParams.append('page', currentPage.toString());
            queryParams.append('limit', pageSize.toString());

            const apiUrl = `${API_BASE_URL}/collection/getAllCollections?${queryParams.toString()}`;
            setLastFetchParams({ search: searchTerm, projectId: selectedProject, status: selectedStatus || statusFilter, createdBy: selectedCreatedBy, fromDate: effectiveFromDate, toDate: effectiveToDate, assignedTo: selectedAssignedTo, page: currentPage, limit: pageSize });

            const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders(), credentials: 'include' });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    setCollectionList([]); setTotal(0); setTotalPages(1);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: CollectionApiResponse = await response.json();
            if (result.success) {
                setCollectionList(result.data || []);
                setTotal(result.totalRecords || result.data?.length || 0);
                setTotalPages(result.totalPages || Math.ceil((result.totalRecords || result.data?.length || 0) / pageSize));
            } else {
                setCollectionList([]); setTotal(0); setTotalPages(1);
            }
        } catch (error: any) {
            console.error('Error fetching collections:', error);
            if (!error.message?.includes('401')) toast.error(error?.message || 'Failed to fetch collections');
            setCollectionList([]); setTotal(0); setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, pageSize, searchTerm, selectedProject, selectedStatus, selectedCreatedBy, selectedAssignedTo, selectedActivity]);
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => { fetchCollectionsData(); }, [fetchCollectionsData]);
    useEffect(() => { fetchProjectsData(); }, [fetchProjectsData]);

    const handleRefetch = useCallback((force: boolean = false) => {
        if (!force && Object.keys(lastFetchParams).length === 0) return;
        fetchCollectionsData();
    }, [fetchCollectionsData, lastFetchParams]);

    // Map new API response fields to table format
    const transformCollectionsForTable = useMemo((): any[] => {
        return (collectionList || []).map((collection: CollectionData) => ({
            id: collection.collectionId,
            collectionId: collection.collectionId,
            projectName: collection.projectTitle || 'N/A',
            projectTitle: collection.projectTitle || 'N/A',
            plotNumber: collection.plotNumber || 'N/A',
            plotSize: collection.plotSize || 'N/A',
            employeeName: collection.employeeName || 'N/A',
            clientName: collection.leadName || 'N/A',
            name: collection.leadName || 'N/A',
            createdBy: collection.employeeName || 'N/A',
            mobileNumber: collection.leadPhone || 'N/A',
            phone: collection.leadPhone || 'N/A',
            emailId: collection.leadEmail || 'N/A',
            email: collection.leadEmail || 'N/A',
            price: collection.price || '0',
            plotValue: collection.price || '0',
            emi: collection.paymentPlanName || 'N/A',
            emiPlan: collection.paymentPlanName || 'N/A',
            paymentReceived: collection.paymentReceived || '0',
            pendingAmount: collection.paymentPending || '0',
            commission: collection.commission || '0',
            maintenance: collection.maintenance || '0',
            stampDuty: collection.stampDuty || '0',
            legalFees: collection.legalFees || '0',
            onlineAmount: collection.onlinePrice || '0',
            cashAmount: String(collection.creditPoint ?? '0'),
            totalAmount: collection.totalAmount || '0',
            // difference: '0',
            incentive: collection.incentive || '0',
            registryStatus: collection.registryStatus || 'N/A',
            status: collection.registryStatus || 'N/A',
            createdAt: collection.createdAt || null,
            bookingDate: collection.bookingDate || null,
            createdDate: formatDate(collection.bookingDate || collection.createdAt),
            CPName: collection.cpName || null,
            receivedOnlineAmount: collection.onlinePaymentReceived || '0',
            receivedCreditAmount: collection.creditPointReceived || '0',
            pendingCreditAmount: collection.creditPointsPending || '0',
            pendingOnlineAmount: collection.onlinePaymentPending || '0',
            plotOnlinePrice: collection.onlinePrice || '0',
            plotCreditPrice: String(collection.creditPoint ?? '0'),
            bookingAmount: collection.bookingAmount || '0',
            bookingNumber: collection.bookingNumber || 'N/A',
            remark: collection.remark || 'N/A',
            paymentPlanName: collection.paymentPlanName || 'N/A',
        }));
    }, [collectionList]);

    const handleEdit = (collection: any) => { setCurrentCollection(collection); setIsModalOpen(true); };
    const handleDelete = (collection: any) => { setDeleteMode('single'); setDeleteTarget(collection); setIsDeleteModalOpen(true); };

    const confirmDelete = async () => {
        try {
            if (deleteMode === 'single') {
                const id = (deleteTarget as { id: number }).id;
                const response = await fetch(`${API_BASE_URL}/collection/deleteCollection/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
                if (!response.ok) throw new Error('Failed to delete collection');
                toast.success('Collection deleted successfully');
            } else if (deleteMode === 'bulk') {
                const ids = deleteTarget as number[];
                for (const id of ids) {
                    const response = await fetch(`${API_BASE_URL}/collection/deleteCollection/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
                    if (!response.ok) throw new Error('Failed to delete collection');
                }
                setSelectedIds([]);
                toast.success(`${ids.length} collection(s) deleted successfully`);
            }
            handleRefetch(true);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        } finally {
            setIsDeleteModalOpen(false); setDeleteTarget(null);
        }
    };

    const handleOpenUpload = () => setIsUploadModalOpen(true);
    const handleCloseUpload = () => setIsUploadModalOpen(false);
    const handleUploadSuccess = () => handleRefetch(true);
    const handleCollectionClick = (collection: any) => setCurrentCollection(collection);

    // Download Sample Excel
    const handleDownloadSample = () => {
        const headers = DOWNLOAD_COLUMNS.map(c => c.label);

        // 👇 EXACT order as DOWNLOAD_COLUMNS (25 values)
        const sampleRow = [
            '14/02/2026',            // Booking Date
            'Pride',                 // Project Name
            'employee@example.com',  // Employee Email
            'John Doe',              // Client Name
            '51000',                 // Booking Amount
            '9876543210',            // Mobile Number
            'john@example.com',      // Email Id
            '63',                    // Plot Number
            '45 Days',               // EMI Plan
            '155.1',                 // Plot Size
            '6500',                  // Price
            '6500',                  // Online Price
            '0',                     // Credit Point
            '15510',                 // Maintenance
            '59480',                 // Stamp Duty
            '15000',                 // Legal Fees
            '598140',                // Online Payment Received
            '500000',                // Credit Point Received
            '0',                     // Online Payment Pending
            '0',                     // Credit Points Pending
            '0',                     // Incentive
            'Pankaj',                // CP Name
            'Sample Remark',         // Remark
            '150000',                // Commission
            'pending',               // Registry Status
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
        ws['!cols'] = headers.map(() => ({ wch: 22 }));

        XLSX.utils.book_append_sheet(wb, ws, 'Collection');
        XLSX.writeFile(wb, 'sample_collection.xlsx');

        toast.success('Sample file downloaded');
    };

    // Download all collection data
    const handleDownloadCollection = async () => {
        setIsDownloading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedProject) queryParams.append('projectId', selectedProject);
            if (fromDate) queryParams.append('fromDate', fromDate);
            if (toDate) queryParams.append('toDate', toDate);
            queryParams.append('page', '1');
            queryParams.append('limit', '10000');

            const apiUrl = `${API_BASE_URL}/collection/getAllCollections?${queryParams.toString()}`;
            const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders(), credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch data for download');

            const result: CollectionApiResponse = await response.json();
            const data = result.data || [];

            const headers = DOWNLOAD_COLUMNS.map(c => c.label);
            const rows = data.map((item: CollectionData) => {
                const mapped: Record<string, any> = {
                    bookingDate: item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('en-GB') : 'N/A',
                    projectTitle: item.projectTitle || 'N/A',
                    leadEmail: item.leadEmail || 'N/A',
                    employeeEmail: item.employeeEmail || 'N/A',  // ✅ FIXED
                    leadName: item.leadName || 'N/A',
                    leadPhone: item.leadPhone || 'N/A',
                    registryStatus: item.registryStatus || 'N/A',
                    employeeName: item.employeeName || 'N/A',
                    plotNumber: item.plotNumber || 'N/A',
                    plotSize: item.plotSize || 'N/A',
                    price: item.price || '0',
                    onlinePrice: item.onlinePrice || '0',
                    creditPoint: item.creditPoint || 0,
                    paymentPlanName: item.paymentPlanName || 'N/A',
                    bookingAmount: item.bookingAmount || '0',
                    paymentReceived: item.paymentReceived || '0',
                    paymentPending: item.paymentPending || '0',
                    onlinePaymentReceived: item.onlinePaymentReceived || '0',
                    onlinePaymentPending: item.onlinePaymentPending || '0',
                    creditPointReceived: item.creditPointReceived || '0',
                    creditPointsPending: item.creditPointsPending || '0',
                    maintenance: item.maintenance || '0',
                    stampDuty: item.stampDuty || '0',
                    legalFees: item.legalFees || '0',
                    commission: item.commission || '0',
                    incentive: item.incentive || '0',
                    totalAmount: item.totalAmount || '0',
                    // difference: '0',
                    cpName: item.cpName || '',
                    remark: item.remark || '',
                    bookingNumber: item.bookingNumber || '',
                };
                return DOWNLOAD_COLUMNS.map(col => mapped[col.key] ?? '');
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            ws['!cols'] = headers.map(() => ({ wch: 22 }));
            XLSX.utils.book_append_sheet(wb, ws, 'Collection');
            XLSX.writeFile(wb, `collection_data_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success(`Downloaded ${data.length} records`);
        } catch (error: any) {
            toast.error(error?.message || 'Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    // ─── FIX: handleDateChange immediately calls fetch with fresh date values ──
    const handleDateChange = (newFromDate: string, newToDate: string) => {
        setFromDate(newFromDate);
        setToDate(newToDate);
        fromDateRef.current = newFromDate;
        toDateRef.current = newToDate;
        setCurrentPage(1);
        // Pass dates directly — bypasses stale state closure in fetchCollectionsData
        fetchCollectionsData(undefined, newFromDate, newToDate);
    };
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Collection Master</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage Collection with advanced filtering</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={handleDownloadSample}
                        className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Sample</span>
                    </button>

                    <button
                        onClick={handleDownloadCollection}
                        disabled={isDownloading}
                        className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                    </button>

                    {hasPermission(26, 'upload') && (
                        <button
                            onClick={handleOpenUpload}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Upload</span>
                        </button>
                    )}
                </div>
            </div>

            <CollectionTable
                colletion={transformCollectionsForTable}
                loading={loading}
                onEditColletion={handleEdit}
                onDeleteColletion={handleDelete}
                onLeadClick={handleCollectionClick}
                hasEditPermission={hasPermission(22, 'edit')}
                disableInternalFetch={true}
                externalFromDate={fromDate}
                externalToDate={toDate}
                onExternalDateChange={handleDateChange}
            />

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={currentCollection}
                isLoading={isLoading}
            />

            <UploadCollection
                isOpen={isUploadModalOpen}
                onClose={handleCloseUpload}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default CollectionComponent;