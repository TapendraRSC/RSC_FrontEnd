'use client';
import React, { useState, useEffect } from 'react';
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
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import axiosInstance from "@/libs/axios";

interface CollectionTableProps {
    leads?: Booking[];
    onAddLead?: () => void;
    onEditLead?: (booking: Booking) => void;
    onDeleteLead?: (booking: Booking) => void;
    onBulkDelete?: (bookingIds: number[]) => void;
    onBulkAssign?: (bookingIds: number[]) => void;
    onLeadClick?: (booking: Booking) => void;
    onFollowUp?: (booking: Booking) => void;
    loading?: boolean;
    title?: string;
    hasEditPermission?: boolean;
    hasDeletePermission?: boolean;
    hasBulkPermission?: boolean;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    totalRecords?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    currentUser?: { roleId: number };
    fromDate?: string;
    toDate?: string;
    onDateChange?: (fromDate: string, toDate: string) => void;
    searchTerm?: string;
    onSearch?: (term: string) => void;
    onRefetch?: () => void;
    selectedPlatform?: string;
    onPlatformChange?: (platform: string) => void;
    selectedAssignedTo?: string;
    onAssignedToChange?: (createdBy: string) => void;
    Selectedactivity?: string;
    onselectedActivity?: (activityStatus: string) => void;
    disableInternalFetch?: boolean;
}

interface Booking {
    id: number;
    bookingNumber: string;
    leadNo?: string;
    name: string;
    phone: string;
    email?: string;
    projectName: string;
    projectTitle?: string;
    plotNumber: string;
    bookingAmount: string;
    totalPlotAmount: string;
    budget?: string;
    status: string;
    stage?: string;
    createdBy: string;
    assignedUserName?: string;
    createdDate: string;
    createdAt?: string;
    updatedAt?: string;
    bookingDate?: string;
    leadId?: number;
    profession?: string;
    address?: string;
    city?: string;
    state?: string;
    nextFollowUp?: string;
    interestedIn?: string;
    sharedBy?: string;
    source?: string;
    remark?: string;
    lastFollowUp?: string;
    lastFollowUpDate?: string;
    latestFollowUpDate?: string;
    leadStatus?: string;
    leadStage?: string;
    interestStatus?: string;
    platformType?: string;
    plotPrice?: string;
    // New fields
    employeeName?: string;
    clientName?: string;
    mobileNumber?: string;
    emailId?: string;
    emi?: string;
    plotSize?: string;
    price?: string;
    registryStatus?: string;
    plotValue?: string;
    paymentReceived?: string;
    pendingAmount?: string;
    commission?: string;
    maintenance?: string;
    stampDuty?: string;
    legalFees?: string;
    onlineAmount?: string;
    cashAmount?: string;
    totalAmount?: string;
    difference?: string;
    incentive?: string;
}

interface Project {
    id: number;
    title: string;
    name?: string;
}

const formatDate = (dateString: string | any) => {
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

const formatCurrency = (amount: string | number) => {
    if (!amount || amount === 'N/A') return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};


const PaginationButtons = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: any) => void;
}) => {
    const getPageNumbers = () => {
        const pages: any[] = [];

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
                            onClick={() => onPageChange(item?.value)}
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

const getBookingColumns = () => {
    return [
        { label: 'Project Name', accessor: 'projectName', sortable: true, minWidth: 150 },
        { label: 'Employee Name', accessor: 'employeeName', sortable: true, minWidth: 130 },
        { label: 'Client Name', accessor: 'clientName', sortable: true, minWidth: 130 },
        { label: 'Mobile Number', accessor: 'mobileNumber', sortable: true, minWidth: 120 },
        { label: 'Email Id', accessor: 'emailId', sortable: true, minWidth: 180 },
        { label: 'Plot Number', accessor: 'plotNumber', sortable: true, minWidth: 100 },
        { label: 'EMI', accessor: 'emi', sortable: true, minWidth: 100 },
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

const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
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

const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase();
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
    title = 'Booking Panel',
    hasEditPermission = true,
    hasDeletePermission = true,
    hasBulkPermission = true,
    currentPage: externalCurrentPage = 1,
    totalPages: externalTotalPages = 1,
    pageSize: externalPageSize = 5,
    totalRecords: externalTotalRecords = 0,
    onPageChange,
    onPageSizeChange,
    currentUser,
    fromDate: externalFromDate = '',
    toDate: externalToDate = '',
    onDateChange: externalOnDateChange,
    searchTerm: externalSearchTerm = '',
    onSearch,
    onRefetch,
    selectedPlatform: externalSelectedProject = '',
    onPlatformChange,
    selectedAssignedTo: externalSelectedAssignedTo = '',
    onAssignedToChange,
    Selectedactivity: externalSelectedActivity = '',
    onselectedActivity,
    disableInternalFetch = false
}) => {
    const dispatch = useDispatch<any>();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'asc' | 'desc' } | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);


    const { data: users = [] } = useSelector((state: RootState) => state.users);
    const { permissions: rolePermissions } = useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector((state: RootState) => state.permissions);
    const role = useSelector((state: RootState) => state.auth.role);

    const isAdmin = role === 'Admin' || "accountant";

    // Fetch projects using axiosInstance (same as BookingModal)
    useEffect(() => {
        const fetchProjects = async () => {
            setProjectsLoading(true);
            try {
                const response = await axiosInstance.get('/projects/getAllProjects?page=1&limit=100');

                // Handle response structure like BookingModal does
                const projectData = response.data?.data?.projects || response.data?.projects || response.data?.data || [];

                setProjectList(Array.isArray(projectData) ? projectData : []);
            } catch (error: any) {
                console.error("Error fetching projects:", error);
                setProjectList([]);
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchProjects();
    }, []);

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

    const handleBulkDelete = async () => {
        if (selectedBookings.length > 0 && onBulkDelete) {
            try {
                await onBulkDelete(selectedBookings);
                setSelectedBookings([]);
                if (onRefetch) onRefetch();
            } catch (error) {
                console.error('Bulk delete failed:', error);
            }
        }
    };

    const handleSort = (key: keyof Booking) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = () => {
        if (selectedBookings.length === leads.length) {
            setSelectedBookings([]);
        } else {
            const allIds = leads.map(booking => booking.id);
            setSelectedBookings(allIds);
        }
    };

    const handleSelectBooking = (bookingId: number) => {
        const newSelection = selectedBookings.includes(bookingId)
            ? selectedBookings.filter(id => id !== bookingId)
            : [...selectedBookings, bookingId];
        setSelectedBookings(newSelection);
    };

    useEffect(() => {
        setShowBulkActions(selectedBookings.length > 0);
    }, [selectedBookings]);

    const columns = getBookingColumns();
    const totalPages = externalTotalPages || Math.ceil(leads.length / externalPageSize);
    const totalRecords = externalTotalRecords || leads.length;

    const formatBookingData = (booking: Booking) => ({
        ...booking,
        formattedPhone: booking.phone || booking.mobileNumber ? (
            <a href={`tel:${booking.phone || booking.mobileNumber}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{booking.phone || booking.mobileNumber}</a>
        ) : 'N/A',
        formattedStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(booking.status || booking.registryStatus || '')}`}>
                {getStatusIcon(booking.status || booking.registryStatus || '')}
                <span className="capitalize">{booking.status || booking.registryStatus || 'N/A'}</span>
            </span>
        ),
        formattedRegistryStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(booking.registryStatus || '')}`}>
                {getStatusIcon(booking.registryStatus || '')}
                <span className="capitalize">{booking.registryStatus || 'N/A'}</span>
            </span>
        ),
        formattedBookingAmount: formatCurrency(booking.bookingAmount),
        formattedTotalAmount: formatCurrency(booking.totalPlotAmount || booking.totalAmount),
        formattedCreatedAt: formatDate(booking.createdAt || booking.bookingDate),
        formattedPrice: formatCurrency(booking.price),
        formattedPlotValue: formatCurrency(booking.plotValue),
        formattedPaymentReceived: formatCurrency(booking.paymentReceived),
        formattedPendingAmount: formatCurrency(booking.pendingAmount),
        formattedCommission: formatCurrency(booking.commission),
        formattedMaintenance: formatCurrency(booking.maintenance),
        formattedStampDuty: formatCurrency(booking.stampDuty),
        formattedLegalFees: formatCurrency(booking.legalFees),
        formattedOnlineAmount: formatCurrency(booking.onlineAmount),
        formattedCashAmount: formatCurrency(booking.cashAmount),
        formattedTotalAmountNew: formatCurrency(booking.totalAmount),
        formattedDifference: formatCurrency(booking.difference),
        formattedIncentive: formatCurrency(booking.incentive),
        formattedEmi: formatCurrency(booking.emi),
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
                                    {leads.length > 0 ? `${(externalCurrentPage - 1) * externalPageSize + 1} - ${Math.min(externalCurrentPage * externalPageSize, totalRecords)}` : '0'}
                                </span>
                                <span>of</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md font-semibold">
                                    {totalRecords.toLocaleString()}
                                </span>
                                <span>total bookings</span>
                            </div>
                            {(externalSearchTerm || externalSelectedProject || externalSelectedAssignedTo || externalSelectedActivity) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">(filtered)</div>
                            )}
                        </div>
                        <PaginationButtons currentPage={externalCurrentPage} totalPages={totalPages} onPageChange={onPageChange!} />
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
                                        placeholder="Search bookings..."
                                        value={externalSearchTerm}
                                        onChange={e => onSearch && onSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                </div>

                                {/* Page Size Selector */}
                                <div className="flex items-center space-x-1 min-w-fit">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Show</span>
                                    <select
                                        value={externalPageSize}
                                        onChange={e => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {[5, 15, 50, 100].map(size => (
                                            <option key={`page-size-${size}`} value={size} className="bg-white dark:bg-gray-800 text-black dark:text-white">
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
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{leads.length}</span>
                                    <span>Page {externalCurrentPage} of {totalPages}</span>
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
                    <p className="font-medium text-gray-600 dark:text-gray-300">Loading bookings...</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="rounded-lg shadow-sm border overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {columns.map((column: any) => (
                                    <th
                                        key={column.accessor}
                                        scope="col"
                                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ minWidth: column.minWidth }}
                                        onClick={() => column.sortable && handleSort(column.accessor as keyof Booking)}
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
                            {leads.length > 0 ? (
                                leads.map(booking => {
                                    const formattedBooking = formatBookingData(booking);
                                    return (
                                        <tr
                                            key={`booking-${booking.id}`}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedBookings.includes(booking.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            {columns.map((column: any) => {
                                                const accessor = column.accessor as keyof Booking;

                                                // Currency fields
                                                if (['price', 'plotValue', 'paymentReceived', 'pendingAmount', 'commission', 'maintenance', 'stampDuty', 'legalFees', 'onlineAmount', 'cashAmount', 'totalAmount', 'difference', 'incentive', 'emi'].includes(accessor)) {
                                                    const formattedKey = `formatted${accessor.charAt(0).toUpperCase() + accessor.slice(1)}` as keyof typeof formattedBooking;
                                                    const value = formattedBooking[formattedKey] || formatCurrency((booking as any)[accessor]);

                                                    // Color coding for specific fields
                                                    let colorClass = 'text-gray-700 dark:text-gray-300';
                                                    if (accessor === 'paymentReceived') colorClass = 'text-green-600 dark:text-green-400 font-medium';
                                                    if (accessor === 'pendingAmount') colorClass = 'text-red-600 dark:text-red-400 font-medium';
                                                    if (accessor === 'totalAmount') colorClass = 'text-blue-600 dark:text-blue-400 font-medium';
                                                    if (accessor === 'difference') {
                                                        const diffValue = parseFloat(String(booking.difference || 0));
                                                        colorClass = diffValue < 0 ? 'text-red-600 dark:text-red-400 font-medium' : diffValue > 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400';
                                                    }
                                                    if (accessor === 'incentive') colorClass = 'text-purple-600 dark:text-purple-400 font-medium';

                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className={`px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${colorClass}`}>
                                                            {value}
                                                        </td>
                                                    );
                                                }

                                                // Registry Status
                                                if (accessor === 'registryStatus') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            {formattedBooking.formattedRegistryStatus}
                                                        </td>
                                                    );
                                                }

                                                // Mobile Number with link
                                                if (accessor === 'mobileNumber') {
                                                    const phoneValue = booking.mobileNumber || booking.phone;
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
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
                                                    const emailValue = booking.emailId || booking.email;
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
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
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                            {booking.projectName || booking.projectTitle || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Employee Name
                                                if (accessor === 'employeeName') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                            {booking.employeeName || booking.createdBy || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Client Name
                                                if (accessor === 'clientName') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {booking.clientName || booking.name || 'N/A'}
                                                        </td>
                                                    );
                                                }

                                                // Default text field
                                                const value: any = (booking as any)[accessor];
                                                return (
                                                    <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {value || 'N/A'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium flex space-x-1">
                                                {hasEditPermission && onEditLead && (
                                                    <button onClick={() => onEditLead(booking)} className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-2 sm:px-4 py-8 sm:py-12 text-center">
                                        <div className="text-gray-400 dark:text-gray-500">
                                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400 dark:text-gray-500" />
                                            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-600 dark:text-gray-300">
                                                {externalSearchTerm ? `No collection match your search "${externalSearchTerm}"` : 'No collection found'}
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
                    {leads.length > 0 ? (
                        leads.map(booking => {
                            const formattedBooking = formatBookingData(booking);
                            return (
                                <div
                                    key={`card-${booking.id}`}
                                    onMouseEnter={() => setHoveredId(booking.id)}
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
                                      ${hoveredId === booking.id ? 'opacity-100' : ''}
                                    `}
                                    />

                                    <div className="relative p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                                        {booking.projectName || booking.projectTitle || 'N/A'}
                                                    </span>
                                                    {formattedBooking.formattedRegistryStatus}
                                                </div>
                                                <h3
                                                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                                                    onClick={() => onLeadClick && onLeadClick(booking)}
                                                >
                                                    {booking.clientName || booking.name || 'Unnamed Client'}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Contact & Employee Info */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-indigo-500" />
                                                {booking.mobileNumber || booking.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                <span className="truncate">{booking.emailId || booking.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-green-500" />
                                                {booking.employeeName || booking.createdBy || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-purple-500" />
                                                Plot: {booking.plotNumber || 'N/A'}
                                            </div>
                                        </div>

                                        {/* Plot & Property Details */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                                                    <Ruler className="h-3 w-3" /> Plot Size
                                                </p>
                                                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{booking.plotSize || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-1">
                                                    <IndianRupee className="h-3 w-3" /> Price
                                                </p>
                                                <p className="text-sm font-bold text-green-700 dark:text-green-300">{formattedBooking.formattedPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-1">
                                                    <Building2 className="h-3 w-3" /> Plot Value
                                                </p>
                                                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{formattedBooking.formattedPlotValue}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">
                                                    <Receipt className="h-3 w-3" /> EMI
                                                </p>
                                                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">{formattedBooking.formattedEmi}</p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Payment Received
                                                </p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formattedBooking.formattedPaymentReceived}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <AlertCircle className="h-3 w-3 mr-1 text-red-500" /> Pending Amount
                                                </p>
                                                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formattedBooking.formattedPendingAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Wifi className="h-3 w-3 mr-1 text-blue-500" /> Online Amount
                                                </p>
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formattedBooking.formattedOnlineAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Banknote className="h-3 w-3 mr-1 text-emerald-500" /> Cash Amount
                                                </p>
                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formattedBooking.formattedCashAmount}</p>
                                            </div>
                                        </div>

                                        {/* Fees & Charges */}
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Briefcase className="h-3 w-3 mr-1" /> Commission
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedBooking.formattedCommission}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Calculator className="h-3 w-3 mr-1" /> Maintenance
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedBooking.formattedMaintenance}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <FileCheck className="h-3 w-3 mr-1" /> Stamp Duty
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedBooking.formattedStampDuty}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <Gavel className="h-3 w-3 mr-1" /> Legal Fees
                                                </p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedBooking.formattedLegalFees}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                    <TrendingUp className="h-3 w-3 mr-1" /> Incentive
                                                </p>
                                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{formattedBooking.formattedIncentive}</p>
                                            </div>
                                        </div>

                                        {/* Total & Difference */}
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Wallet className="h-3 w-3 mr-1" /> Total Amount
                                                </p>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formattedBooking.formattedTotalAmountNew}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <Scale className="h-3 w-3 mr-1" /> Difference
                                                </p>
                                                <p className={`text-xl font-bold ${parseFloat(String(booking.difference || 0)) < 0 ? 'text-red-600 dark:text-red-400' : parseFloat(String(booking.difference || 0)) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {formattedBooking.formattedDifference}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {hoveredId === booking.id && (
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 animate-[fadeSlideUp_0.25s_ease-out]">
                                                {hasEditPermission && onEditLead && (
                                                    <button
                                                        onClick={() => onEditLead(booking)}
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
                                    {externalSearchTerm ? `No collection match your search "${externalSearchTerm}"` : 'No collection found'}
                                </h3>
                                <p className="text-xs sm:text-sm mb-4 text-gray-500 dark:text-gray-400">
                                    {externalSearchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters or add some bookings'}
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