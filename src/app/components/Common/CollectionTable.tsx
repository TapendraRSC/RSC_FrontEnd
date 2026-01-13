'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, ChevronUp, Phone, User, FileText,
    Calendar, Edit, Trash2, X, LayoutGrid, Table2, Clock, CheckCircle,
    XCircle, RefreshCw, Building2, Calendar as CalendarIcon, IndianRupee,
    Hash, Mail, Ruler, Receipt, FileCheck, Wallet, Banknote, CreditCard,
    Calculator, Briefcase, Scale, Gavel, Wifi, BadgeIndianRupee, TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { exportUsers } from '../../../../store/userSlice';

interface CollectionTableProps {
    leads?: Collection[];
    onAddLead?: () => void;
    onEditLead?: (collection: Collection) => void;
    onDeleteLead?: (collection: Collection) => void;
    onBulkDelete?: (collectionIds: number[]) => void;
    onBulkAssign?: (collectionIds: number[]) => void;
    onLeadClick?: (collection: Collection) => void;
    onFollowUp?: (collection: Collection) => void;
    loading?: boolean;
    title?: string;
    hasEditPermission?: boolean;
    hasDeletePermission?: boolean;
    hasBulkPermission?: boolean;
    currentUser?: { roleId: number };
    onRefetch?: () => void;
    disableInternalFetch?: boolean;
}

interface Collection {
    id: number;
    projectName: string;
    projectTitle?: string;
    employeeName: string;
    clientName: string;
    name?: string;
    mobileNumber: string;
    phone?: string;
    emailId: string;
    email?: string;
    plotNumber: string;
    emi?: string;
    emiPlan?: string;
    plotSize: string;
    price: string;
    registryStatus: string;
    status?: string;
    plotValue: string;
    paymentReceived: string;
    pendingAmount: string;
    commission: string;
    maintenance: string;
    stampDuty: string;
    legalFees: string;
    onlineAmount: string;
    cashAmount: string;
    totalAmount: string;
    difference: string;
    incentive: string;
    createdAt?: string;
    updatedAt?: string;
    createdDate?: string;
    createdBy?: string;
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount || amount === 'N/A') return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return String(amount);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

const PaginationButtons = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => {
    const getPageNumbers = () => {
        const pages: { type: string; value: number | string; key: string }[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push({ type: 'page', value: i, key: `page-${i}` });
            }
        } else {
            pages.push({ type: 'page', value: 1, key: 'page-1' });
            if (currentPage <= 3) {
                for (let i = 2; i <= 3; i++) {
                    pages.push({ type: 'page', value: i, key: `page-${i}` });
                }
                pages.push({ type: 'ellipsis', value: '...', key: 'ellipsis-end' });
                pages.push({ type: 'page', value: totalPages, key: `page-${totalPages}` });
            } else if (currentPage >= totalPages - 2) {
                pages.push({ type: 'ellipsis', value: '...', key: 'ellipsis-start' });
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push({ type: 'page', value: i, key: `page-${i}` });
                }
            } else {
                pages.push({ type: 'ellipsis', value: '...', key: 'ellipsis-start' });
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push({ type: 'page', value: i, key: `page-${i}` });
                }
                pages.push({ type: 'ellipsis', value: '...', key: 'ellipsis-end' });
                pages.push({ type: 'page', value: totalPages, key: `page-${totalPages}` });
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center space-x-1 sm:space-x-2">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                title="Previous page"
            >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-1">
                {getPageNumbers().map(item => {
                    if (item.type === 'ellipsis') {
                        return (
                            <span key={item.key} className="px-2 py-1 text-gray-400 dark:text-gray-500 text-sm">
                                ...
                            </span>
                        );
                    }
                    return (
                        <button
                            key={item.key}
                            onClick={() => onPageChange(item.value as number)}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === item.value
                                ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md transform scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                        >
                            {item.value}
                        </button>
                    );
                })}
            </div>
            <div className="sm:hidden text-xs text-gray-600 dark:text-gray-400 px-2">
                {currentPage} / {totalPages}
            </div>
            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                title="Next page"
            >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
};

const getCollectionColumns = () => {
    return [
        { label: 'Project Name', accessor: 'projectName', sortable: true, minWidth: 150 },
        { label: 'Employee Name', accessor: 'employeeName', sortable: true, minWidth: 130 },
        { label: 'Client Name', accessor: 'clientName', sortable: true, minWidth: 130 },
        { label: 'Mobile Number', accessor: 'mobileNumber', sortable: true, minWidth: 120 },
        { label: 'Email Id', accessor: 'emailId', sortable: true, minWidth: 180 },
        { label: 'Plot Number', accessor: 'plotNumber', sortable: true, minWidth: 100 },
        { label: 'EMI Plan', accessor: 'emi', sortable: true, minWidth: 100 },
        { label: 'Plot Size', accessor: 'plotSize', sortable: true, minWidth: 100 },
        { label: 'Price', accessor: 'price', sortable: true, minWidth: 120 },
        { label: 'Registry Status', accessor: 'registryStatus', sortable: true, minWidth: 120 },
        { label: 'Plot Value', accessor: 'plotValue', sortable: true, minWidth: 120 },
        { label: 'Payment Received', accessor: 'paymentReceived', sortable: true, minWidth: 140 },
        { label: 'Pending Amount', accessor: 'pendingAmount', sortable: true, minWidth: 130 },
        { label: 'Commission', accessor: 'commission', sortable: true, minWidth: 120 },
        { label: 'Maintenance', accessor: 'maintenance', sortable: true, minWidth: 120 },
        { label: 'Stamp Duty', accessor: 'stampDuty', sortable: true, minWidth: 120 },
        { label: 'Legal Fees', accessor: 'legalFees', sortable: true, minWidth: 120 },
        { label: 'Online Amount', accessor: 'onlineAmount', sortable: true, minWidth: 130 },
        { label: 'Cash Amount', accessor: 'cashAmount', sortable: true, minWidth: 120 },
        { label: 'Total Amount', accessor: 'totalAmount', sortable: true, minWidth: 130 },
        { label: 'Difference', accessor: 'difference', sortable: true, minWidth: 120 },
        { label: 'Incentive', accessor: 'incentive', sortable: true, minWidth: 120 },
    ];
};

const getStatusColor = (status: string | null | undefined) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'active':
        case 'completed':
        case 'done':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
        case 'cancelled':
        case 'rejected':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        case 'moved_to_client':
        case 'pending':
        case 'in_progress':
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
        case 'partial':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
        default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
};

const getStatusIcon = (status: string | null | undefined) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'active':
        case 'completed':
        case 'done':
            return <CheckCircle className="w-3 h-3" />;
        case 'pending':
        case 'in_progress':
            return <Clock className="w-3 h-3" />;
        case 'cancelled':
        case 'canceled':
        case 'inactive':
        case 'rejected':
            return <XCircle className="w-3 h-3" />;
        case 'moved_to_client':
            return <RefreshCw className="w-3 h-3" />;
        default:
            return null;
    }
};

const CollectionTable: React.FC<CollectionTableProps> = ({
    leads = [],
    onAddLead,
    onEditLead,
    onDeleteLead,
    onBulkDelete,
    onBulkAssign,
    onLeadClick,
    onFollowUp,
    loading = false,
    title = 'Collection Panel',
    hasEditPermission = true,
    hasDeletePermission = true,
    hasBulkPermission = true,
    currentUser,
    onRefetch,
    disableInternalFetch = false
}) => {
    const dispatch = useDispatch<any>();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Collection; direction: 'asc' | 'desc' } | null>(null);
    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // Frontend search and pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const { data: users = [] } = useSelector((state: RootState) => state.users);
    const { permissions: rolePermissions } = useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector((state: RootState) => state.permissions);
    const role = useSelector((state: RootState) => state.auth.role);

    const isAdmin = role === 'Admin' || role === 'accountant';

    const actualUsersData = React.useMemo(() => {
        if (Array.isArray(users)) return users;
        if ((users as any)?.data) {
            if (Array.isArray((users as any).data)) return (users as any).data;
            if ((users as any).data?.data && Array.isArray((users as any).data.data)) return (users as any).data.data;
        }
        return [];
    }, [users]);

    useEffect(() => {
        if (!disableInternalFetch) {
            dispatch(exportUsers({ page: 1, limit: 100, searchValue: '' }));
        }
    }, [dispatch, disableInternalFetch]);

    useEffect(() => {
        if (!disableInternalFetch) {
            dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
            dispatch(fetchRolePermissionsSidebar());
        }
    }, [dispatch, disableInternalFetch]);



    // Filter logic: clientName, employeeName, emailId, mobileNumber, projectName
    const filteredCollections = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        if (!lowerSearch) return leads;

        return leads.filter(item =>
            (item.clientName || item.name || '').toLowerCase().includes(lowerSearch) ||
            (item.employeeName || item.createdBy || '').toLowerCase().includes(lowerSearch) ||
            (item.emailId || item.email || '').toLowerCase().includes(lowerSearch) ||
            (item.mobileNumber || item.phone || '').toLowerCase().includes(lowerSearch) ||
            (item.projectName || item.projectTitle || '').toLowerCase().includes(lowerSearch)
        );
    }, [leads, searchTerm]);

    // Sorting logic
    const sortedCollections = useMemo(() => {
        if (!sortConfig) return filteredCollections;
        return [...filteredCollections].sort((a, b) => {
            const aVal = String(a[sortConfig.key] || '').toLowerCase();
            const bVal = String(b[sortConfig.key] || '').toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredCollections, sortConfig]);

    // Pagination logic (Ye data table aur card dono mein use hoga)
    const paginatedCollections = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedCollections.slice(start, start + pageSize);
    }, [sortedCollections, currentPage, pageSize]);

    const totalRecords = sortedCollections.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Jab bhi search badle, page 1 par wapas le jao
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);
    // --- Logic Section Khatam ---



    const handleBulkDelete = async () => {
        if (selectedCollections.length > 0 && onBulkDelete) {
            try {
                await onBulkDelete(selectedCollections);
                setSelectedCollections([]);
                if (onRefetch) onRefetch();
            } catch (error) {
                console.error('Bulk delete failed:', error);
            }
        }
    };

    const handleSort = (key: keyof Collection) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = () => {
        if (selectedCollections.length === paginatedCollections.length) {
            setSelectedCollections([]);
        } else {
            const allIds = paginatedCollections.map(collection => collection.id);
            setSelectedCollections(allIds);
        }
    };

    const handleSelectCollection = (collectionId: number) => {
        const newSelection = selectedCollections.includes(collectionId)
            ? selectedCollections.filter(id => id !== collectionId)
            : [...selectedCollections, collectionId];
        setSelectedCollections(newSelection);
    };

    useEffect(() => {
        setShowBulkActions(selectedCollections.length > 0);
    }, [selectedCollections]);

    const columns = getCollectionColumns();

    const formatCollectionData = (collection: Collection) => ({
        ...collection,
        formattedPhone: collection.mobileNumber || collection.phone ? (
            <a href={`tel:${collection.mobileNumber || collection.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {collection.mobileNumber || collection.phone}
            </a>
        ) : 'N/A',
        formattedStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(collection.status || collection.registryStatus)}`}>
                {getStatusIcon(collection.status || collection.registryStatus)}
                <span className="capitalize">{collection.status || collection.registryStatus || 'N/A'}</span>
            </span>
        ),
        formattedRegistryStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(collection.registryStatus)}`}>
                {getStatusIcon(collection.registryStatus)}
                <span className="capitalize">{collection.registryStatus || 'N/A'}</span>
            </span>
        ),
        formattedCreatedAt: formatDate(collection.createdAt),
        formattedPrice: formatCurrency(collection.price),
        formattedPlotValue: formatCurrency(collection.plotValue),
        formattedPaymentReceived: formatCurrency(collection.paymentReceived),
        formattedPendingAmount: formatCurrency(collection.pendingAmount),
        formattedCommission: formatCurrency(collection.commission),
        formattedMaintenance: formatCurrency(collection.maintenance),
        formattedStampDuty: formatCurrency(collection.stampDuty),
        formattedLegalFees: formatCurrency(collection.legalFees),
        formattedOnlineAmount: formatCurrency(collection.onlineAmount),
        formattedCashAmount: formatCurrency(collection.cashAmount),
        formattedTotalAmount: formatCurrency(collection.totalAmount),
        formattedDifference: formatCurrency(collection.difference),
        formattedIncentive: formatCurrency(collection.incentive),
        formattedEmi: collection.emi || collection.emiPlan,
    });

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Header Section with Pagination */}
            {totalPages > 1 && (
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 gap-3">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Showing:</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-md font-semibold">
                                    {paginatedCollections.length > 0 ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalRecords)}` : '0'}
                                </span>
                                <span>of</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md font-semibold">
                                    {totalRecords.toLocaleString()}
                                </span>
                                <span>total collections</span>
                            </div>
                            {searchTerm && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">(filtered)</div>
                            )}
                        </div>
                        <PaginationButtons currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            )}

            {/* Controls Row */}
            <div className="w-full mb-4">
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="p-2 sm:p-3">
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 w-full">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Search by client, employee, email, mobile, or project..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                </div>

                                {/* Page Size Selector */}
                                <div className="flex items-center space-x-1 min-w-fit">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Show</span>
                                    <select
                                        value={pageSize}
                                        onChange={e => setPageSize(Number(e.target.value))}
                                    >
                                        {[5, 25, 50, 100].map(size => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="text-xs text-gray-600 dark:text-gray-300">entries</span>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center space-x-3 ml-auto">
                                    <button
                                        onClick={() => setViewMode('card')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'card'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white transform scale-105 shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                                            }`}
                                        title="Card View"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'table'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white transform scale-105 shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                                            }`}
                                        title="Table View"
                                    >
                                        <Table2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Selection Info */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-gray-200 dark:border-gray-700 gap-2">
                                <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-300">
                                    <span>Filtered</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{totalRecords}</span>
                                    <span>Page {currentPage} of {totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="rounded-lg p-8 sm:p-12 text-center bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4 sm:mb-6" />
                    <p className="font-medium text-gray-600 dark:text-gray-300">Loading collections...</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="rounded-lg shadow-sm border overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.accessor}
                                        scope="col"
                                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ minWidth: column.minWidth }}
                                        onClick={() => column.sortable && handleSort(column.accessor as keyof Collection)}
                                    >
                                        <div className="flex items-center space-x-1 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                            <span>{column.label}</span>
                                            {column.sortable && <ChevronUp className="h-3 w-3 text-gray-400 dark:text-gray-500" />}
                                        </div>
                                    </th>
                                ))}
                                <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider w-12 sm:w-20">
                                    <span className="text-gray-500 dark:text-gray-400">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedCollections.length > 0 ? (
                                paginatedCollections.map(collection => {
                                    const formattedCollection = formatCollectionData(collection);
                                    return (
                                        <tr
                                            key={`collection-${collection.id}`}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCollections.includes(collection.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            {columns.map((column) => {
                                                const accessor = column.accessor as keyof Collection;

                                                // Currency fields
                                                if (['price', 'plotValue', 'paymentReceived', 'pendingAmount', 'commission', 'maintenance', 'stampDuty', 'legalFees', 'onlineAmount', 'cashAmount', 'totalAmount', 'difference', 'incentive', 'emi'].includes(accessor)) {
                                                    const formattedKey = `formatted${accessor.charAt(0).toUpperCase() + accessor.slice(1)}` as keyof typeof formattedCollection;
                                                    const value = formattedCollection[formattedKey] || formatCurrency((collection as any)[accessor]);

                                                    let colorClass = 'text-gray-700 dark:text-gray-300';
                                                    if (accessor === 'paymentReceived') colorClass = 'text-green-600 dark:text-green-400 font-medium';
                                                    if (accessor === 'pendingAmount') colorClass = 'text-red-600 dark:text-red-400 font-medium';
                                                    if (accessor === 'totalAmount') colorClass = 'text-blue-600 dark:text-blue-400 font-medium';
                                                    if (accessor === 'difference') {
                                                        const diffValue = parseFloat(String(collection.difference || 0));
                                                        colorClass = diffValue < 0 ? 'text-red-600 dark:text-red-400 font-medium' : diffValue > 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400';
                                                    }
                                                    if (accessor === 'incentive') colorClass = 'text-purple-600 dark:text-purple-400 font-medium';

                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className={`px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${colorClass}`}>
                                                            {value}
                                                        </td>
                                                    );
                                                }

                                                // Registry Status
                                                if (accessor === 'registryStatus') {
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            {formattedCollection.formattedRegistryStatus}
                                                        </td>
                                                    );
                                                }

                                                // Mobile Number with link
                                                if (accessor === 'mobileNumber') {
                                                    const phoneValue = collection.mobileNumber || collection.phone;
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            {phoneValue ? (
                                                                <a href={`tel:${phoneValue}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                                                    {phoneValue}
                                                                </a>
                                                            ) : 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Email with link
                                                if (accessor === 'emailId') {
                                                    const emailValue = collection.emailId || collection.email;
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            {emailValue ? (
                                                                <a href={`mailto:${emailValue}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                                                    {emailValue}
                                                                </a>
                                                            ) : 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Project Name
                                                if (accessor === 'projectName') {
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                            {collection.projectName || collection.projectTitle || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Employee Name
                                                if (accessor === 'employeeName') {
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                            {collection.employeeName || collection.createdBy || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Client Name
                                                if (accessor === 'clientName') {
                                                    return (
                                                        <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {collection.clientName || collection.name || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Default text field
                                                const value = (collection as any)[accessor];
                                                return (
                                                    <td key={`collection-${collection.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {value || 'N/A'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium flex space-x-1">
                                                {hasEditPermission && onEditLead && (
                                                    <button onClick={() => onEditLead(collection)} className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-2 sm:px-4 py-8 sm:py-12 text-center">
                                        <div className="text-gray-400 dark:text-gray-500">
                                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400 dark:text-gray-500" />
                                            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-600 dark:text-gray-300">
                                                {searchTerm ? `No collection match your search "${searchTerm}"` : 'No collection found'}
                                            </h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Card View */
                <div className="space-y-3 sm:space-y-4">
                    {paginatedCollections.length > 0 ? (
                        paginatedCollections.map(collection => {
                            const formattedCollection = formatCollectionData(collection);
                            return (
                                <div
                                    key={`card-${collection.id}`}
                                    onMouseEnter={() => setHoveredId(collection.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className={`
                                        relative overflow-hidden rounded-2xl border
                                        bg-white dark:bg-gray-900
                                        border-gray-200 dark:border-gray-700
                                        shadow-sm transition-all duration-300
                                        hover:shadow-2xl hover:-translate-y-1
                                        hover:border-indigo-400 dark:hover:border-indigo-500
                                    `}
                                >
                                    {/* Gradient overlay glow */}
                                    <span
                                        className={`
                                            absolute inset-0 rounded-2xl
                                            pointer-events-none
                                            bg-gradient-to-r from-indigo-200/20 via-purple-200/20 to-pink-200/20
                                            opacity-0 transition-opacity duration-300
                                            ${hoveredId === collection.id ? 'opacity-100' : ''}
                                        `}
                                    />

                                    <div className="relative p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                                        {collection.projectName || collection.projectTitle || 'N/A'}
                                                    </span>
                                                    {formattedCollection.formattedRegistryStatus}
                                                </div>
                                                <h3
                                                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                                                    onClick={() => onLeadClick && onLeadClick(collection)}
                                                >
                                                    {collection.clientName || collection.name || 'Unnamed Client'}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Contact & Employee Info */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-indigo-500" />
                                                {collection.mobileNumber || collection.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                <span className="truncate">{collection.emailId || collection.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-green-500" />
                                                {collection.employeeName || collection.createdBy || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-purple-500" />
                                                Plot: {collection.plotNumber || 'N/A'}
                                            </div>
                                        </div>

                                        {/* Plot & Property Details */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                                                    <Ruler className="h-3 w-3" /> Plot Size
                                                </p>
                                                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{collection.plotSize || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-1">
                                                    <IndianRupee className="h-3 w-3" /> Price
                                                </p>
                                                <p className="text-sm font-bold text-green-700 dark:text-green-300">{formattedCollection.formattedPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-1">
                                                    <Building2 className="h-3 w-3" /> Plot Value
                                                </p>
                                                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{formattedCollection.formattedPlotValue}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">
                                                    EMI Plan
                                                </p>
                                                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">{formattedCollection.formattedEmi}</p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Payment Received
                                                </p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formattedCollection.formattedPaymentReceived}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <AlertCircle className="h-3 w-3 mr-1 text-red-500" /> Pending Amount
                                                </p>
                                                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formattedCollection.formattedPendingAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Wifi className="h-3 w-3 mr-1 text-blue-500" /> Online Amount
                                                </p>
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formattedCollection.formattedOnlineAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Banknote className="h-3 w-3 mr-1 text-emerald-500" /> Cash Amount
                                                </p>
                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formattedCollection.formattedCashAmount}</p>
                                            </div>
                                        </div>

                                        {/* Fees & Charges */}
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Briefcase className="h-3 w-3 mr-1" /> Commission
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedCollection.formattedCommission}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Calculator className="h-3 w-3 mr-1" /> Maintenance
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedCollection.formattedMaintenance}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <FileCheck className="h-3 w-3 mr-1" /> Stamp Duty
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedCollection.formattedStampDuty}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Gavel className="h-3 w-3 mr-1" /> Legal Fees
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedCollection.formattedLegalFees}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <TrendingUp className="h-3 w-3 mr-1" /> Incentive
                                                </p>
                                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{formattedCollection.formattedIncentive}</p>
                                            </div>
                                        </div>

                                        {/* Total & Difference */}
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Wallet className="h-3 w-3 mr-1" /> Total Amount
                                                </p>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formattedCollection.formattedTotalAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Scale className="h-3 w-3 mr-1" /> Difference
                                                </p>
                                                <p className={`text-xl font-bold ${parseFloat(String(collection.difference || 0)) < 0 ? 'text-red-600 dark:text-red-400' : parseFloat(String(collection.difference || 0)) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {formattedCollection.formattedDifference}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {hoveredId === collection.id && (
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 animate-[fadeSlideUp_0.25s_ease-out]">
                                                {hasEditPermission && onEditLead && (
                                                    <button
                                                        onClick={() => onEditLead(collection)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                                                    >
                                                        <Edit className="h-4 w-4" /> Edit
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg p-6 sm:p-10 text-center border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="text-gray-400 dark:text-gray-500">
                                <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400 dark:text-gray-500" />
                                <h3 className="text-sm sm:text-lg font-semibold mb-2 text-gray-600 dark:text-gray-300">
                                    {searchTerm ? `No collection match your search "${searchTerm}"` : 'No collection found'}
                                </h3>
                                <p className="text-xs sm:text-sm mb-4 text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters or add some collections'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default CollectionTable;

