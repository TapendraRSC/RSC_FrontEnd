'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, ChevronLeft, ChevronRight, ChevronUp, Phone, User, FileText,
    Calendar, Edit, Trash2, X, LayoutGrid, Table2, Clock, CheckCircle,
    XCircle, RefreshCw, Building2, Calendar as CalendarIcon, IndianRupee,
    Hash, CreditCard, Download
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import axiosInstance from "@/libs/axios";
import { toast } from "react-toastify";
import PaymentReceipt, { convertNumberToWords } from './PaymentReceiptDownload';
import WelcomeLetterDownload, { WelcomeLetterData } from './WelcomeLetterDownload';
import { API_BASE_URL } from '../../../libs/api';
interface BookingTableProps {
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
    createdByOption?: { id: number; name: string }[];
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
    approvedByName?: string;
    createdByName?: string;
    approvedAt?: string;
    status: string;
    stage?: string;
    payment_reference: string;
    payment_platform_id: number | string;
    paymentPlatformName?: string;
    cpName?: string;
    remark?: string;
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
    lastFollowUp?: string;
    lastFollowUpDate?: string;
    latestFollowUpDate?: string;
    leadStatus?: string;
    leadStage?: string;
    interestStatus?: string;
    platformType?: string;
    plotPrice?: string;
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

const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined || amount === '' || amount === 'N/A') {
        return 'N/A';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return String(amount);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

const formatDateForReceipt = (dateString: string | any) => {
    if (!dateString) return format(new Date(), 'dd-MM-yyyy');
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return format(new Date(), 'dd-MM-yyyy');
        return format(date, 'dd-MM-yyyy');
    } catch {
        return format(new Date(), 'dd-MM-yyyy');
    }
};

const DateFilterDropdown = ({ fromDate, toDate, onDateChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('all');
    const [customFromDate, setCustomFromDate] = useState(fromDate || '');
    const [customToDate, setCustomToDate] = useState(toDate || '');

    useEffect(() => {
        if (fromDate && toDate) {
            setCustomFromDate(fromDate);
            setCustomToDate(toDate);
        }
    }, [fromDate, toDate]);

    const handleOptionSelect = (option: any) => {
        const today = new Date();
        let newFromDate = '';
        let newToDate = '';

        switch (option) {
            case 'today':
                newFromDate = format(startOfDay(today), 'yyyy-MM-dd');
                newToDate = format(endOfDay(today), 'yyyy-MM-dd');
                break;
            case 'yesterday':
                newFromDate = format(startOfDay(subDays(today, 1)), 'yyyy-MM-dd');
                newToDate = format(endOfDay(subDays(today, 1)), 'yyyy-MM-dd');
                break;
            case 'last7days':
                newFromDate = format(startOfDay(subDays(today, 6)), 'yyyy-MM-dd');
                newToDate = format(endOfDay(today), 'yyyy-MM-dd');
                break;
            case 'last30days':
                newFromDate = format(startOfDay(subDays(today, 29)), 'yyyy-MM-dd');
                newToDate = format(endOfDay(today), 'yyyy-MM-dd');
                break;
            case 'thisMonth':
                newFromDate = format(startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)), 'yyyy-MM-dd');
                newToDate = format(endOfDay(today), 'yyyy-MM-dd');
                break;
            case 'all':
                newFromDate = '';
                newToDate = '';
                break;
            case 'custom':
                newFromDate = customFromDate;
                newToDate = customToDate;
                break;
        }

        setSelectedOption(option);
        onDateChange(newFromDate, newToDate);

        if (option !== 'custom') {
            setIsOpen(false);
        }
    };

    const getDisplayText = () => {
        if (!fromDate && !toDate) return 'All Dates';
        if (selectedOption !== 'custom' && selectedOption !== 'all') {
            const options: any = {
                today: 'Today',
                yesterday: 'Yesterday',
                last7days: 'Last 7 Days',
                last30days: 'Last 30 Days',
                thisMonth: 'This Month'
            };
            return options[selectedOption] || 'Custom Range';
        }
        if (fromDate && toDate) {
            try {
                const from = parseISO(fromDate);
                const to = parseISO(toDate);
                if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
                    return format(from, 'MMM dd, yyyy');
                }
                return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd, yyyy')}`;
            } catch {
                return 'Custom Range';
            }
        }
        return 'Custom Range';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{getDisplayText()}</span>
                <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                    <div className="p-2 space-y-1">
                        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Select</h3>
                        {[
                            { id: 'today', label: 'Today' },
                            { id: 'yesterday', label: 'Yesterday' },
                            { id: 'last7days', label: 'Last 7 Days' },
                            { id: 'last30days', label: 'Last 30 Days' },
                            { id: 'thisMonth', label: 'This Month' },
                            { id: 'all', label: 'All Dates' },
                            { id: 'custom', label: 'Custom Range' }
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                className={`w-full text-left px-2 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${selectedOption === option.id
                                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                        {selectedOption === 'custom' && (
                            <div className="pt-2 space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={customFromDate}
                                        onChange={(e) => setCustomFromDate(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={customToDate}
                                        onChange={(e) => setCustomToDate(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        onDateChange(customFromDate, customToDate);
                                        setIsOpen(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium hover:from-orange-600 hover:to-indigo-700 transition-all"
                                >
                                    Apply Custom Range
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
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
                                ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-md transform scale-105'
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
        { label: 'Booking #', accessor: 'bookingNumber', sortable: true, minWidth: 130 },
        { label: 'Name', accessor: 'name', sortable: true, minWidth: 150 },
        { label: 'Phone', accessor: 'phone', sortable: true, minWidth: 120 },
        { label: 'Transaction ID', accessor: 'payment_reference', sortable: true, minWidth: 120 },
        { label: 'Transaction Platform', accessor: 'paymentPlatformName', sortable: true, minWidth: 120 },
        { label: 'CP Name', accessor: 'cpName', sortable: true, minWidth: 120 },
        { label: 'Remarks', accessor: 'remark', sortable: true, minWidth: 120 },
        { label: 'Lead Id', accessor: 'leadId', sortable: true, minWidth: 120 },
        { label: 'Project', accessor: 'projectName', sortable: true, minWidth: 180 },
        { label: 'Plot #', accessor: 'plotNumber', sortable: true, minWidth: 80 },
        { label: 'Booking Amt', accessor: 'bookingAmount', sortable: true, minWidth: 130 },
        { label: 'Total Amt', accessor: 'totalPlotAmount', sortable: true, minWidth: 130 },
        { label: 'Status', accessor: 'status', sortable: true, minWidth: 100 },
        { label: 'Booking Date', accessor: 'createdAt', sortable: true, minWidth: 150 },
        { label: 'Created At', accessor: 'createdDate', sortable: true, minWidth: 150 },
        { label: 'Generated By', accessor: 'createdByName', sortable: true, minWidth: 120 },
        { label: 'Approved By Name', accessor: 'approvedByName', sortable: true, minWidth: 120 },
    ];
};

const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'active':
        case 'confirmed':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
        case 'cancelled':
        case 'rejected':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        case 'moved_to_client':
        case 'move_to_client':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
        case 'pending':
            return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700';
        default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
};

const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'active':
        case 'confirmed':
            return <CheckCircle className="w-3 h-3" />;
        case 'pending':
            return <Clock className="w-3 h-3" />;
        case 'cancelled':
        case 'canceled':
        case 'inactive':
        case 'rejected':
            return <XCircle className="w-3 h-3" />;
        case 'moved_to_client':
        case 'move_to_client':
            return <RefreshCw className="w-3 h-3" />;
        default:
            return null;
    }
};

const BookingTable: React.FC<BookingTableProps> = ({
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
    createdByOption = [],
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
    const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'asc' | 'desc' } | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);

    const [showWelcomeLetterModal, setShowWelcomeLetterModal] = useState(false);
    const [welcomeLetterData, setWelcomeLetterData] = useState<WelcomeLetterData | null>(null);

    const projectsFetchedRef = useRef(false);

    const { data: users = [] } = useSelector((state: RootState) => state.users);
    const { permissions: rolePermissions } = useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector((state: RootState) => state.permissions);
    const role = useSelector((state: RootState) => state.auth.role);

    const isAdmin = role === 'Admin' || role === "accountant";

    useEffect(() => {
        if (projectsFetchedRef.current) return;
        projectsFetchedRef.current = true;

        const fetchProjects = async () => {
            setProjectsLoading(true);
            try {
                const response = await axiosInstance.get('/projects/getAllProjects?page=1&limit=100');
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

    const handleDownloadPaymentSlip = async (booking: Booking) => {
        try {
            const amount = parseFloat(booking.bookingAmount.toString().replace(/[^\d.]/g, ''));
            const amountInWords = convertNumberToWords(amount);

            const receipt = {
                receiptNo: booking.bookingNumber || booking.leadNo || 'N/A',
                receiptDate: formatDateForReceipt(booking.createdAt || booking.bookingDate),
                name: booking.name || 'N/A',
                receivedAmount: amountInWords,
                plotNo: booking.plotNumber || 'N/A',
                projectName: booking.projectName || booking.projectTitle || 'N/A',
                bookingDate: formatDateForReceipt(booking.bookingDate || booking.createdAt),
                paymentCondition: '45 Days',
                address: booking.address || booking.city || booking.state || 'N/A',
                payments: [
                    {
                        paymentBy: booking.paymentPlatformName || 'NEFT/IMPS/RTGS/CHEQUE',
                        transactionDate: formatDateForReceipt(booking.createdAt),
                        bank: 'None',
                        transactionNo: booking.payment_reference || 'N/A',
                        branch: '-',
                        amount: `${formatCurrency(booking.bookingAmount)}`
                    }
                ]
            };

            setReceiptData(receipt);
            setSelectedBookingForReceipt(booking);
            setShowReceiptModal(true);
        } catch (error) {
            console.error('Error preparing payment slip:', error);
            toast.error('Failed to generate payment slip');
        }
    };

    const handleDownloadWelcomeLetter = async (booking: Booking) => {
        try {
            const letterData: WelcomeLetterData = {
                customerName: booking.name || 'N/A',
                address: booking.address || booking.city || booking.state || 'Not Provided',
                date: formatDateForReceipt(booking.createdAt || booking.bookingDate),
                plotNo: booking.plotNumber || 'N/A',
                projectName: booking.projectName || booking.projectTitle || 'N/A',
            };

            setWelcomeLetterData(letterData);
            setShowWelcomeLetterModal(true);
        } catch (error) {
            console.error('Error preparing welcome letter:', error);
            toast.error('Failed to generate welcome letter');
        }
    };

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
        formattedPhone: booking.phone ? (
            <a href={`tel:${booking.phone}`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{booking.phone}</a>
        ) : 'N/A',
        formattedStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="capitalize">{booking.status}</span>
            </span>
        ),
        formattedBookingAmount: formatCurrency(booking.bookingAmount),
        formattedTotalAmount: formatCurrency(booking.totalPlotAmount),
        formattedCreatedAt: formatDate(booking.createdAt || booking.bookingDate),
        formattedTransactionId: booking.payment_reference || 'N/A',
        formattedTransactionPlatform: booking.paymentPlatformName || 'N/A',
        cpName: booking.cpName || 'N/A',
        remark: booking.remark || 'N/A',
    });

   

    const handleBookingAction = async (id: number, action: 'approve' | 'reject') => {
        if (role !== 'Admin') {
            toast.error("Only Admin can perform this action");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            let payload: any = {};

            const response = await axiosInstance.post(
                `${API_BASE_URL}/bookings/bookings/${id}/${action}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(`Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
            if (onRefetch) onRefetch();
        } catch (error: any) {
            console.error(`Error ${action}ing booking:`, error);
            const errMsg = error.response?.data?.message || `Failed to ${action} booking`;
            toast.error(errMsg);
        }
    };




    return (
        <div className="space-y-3 sm:space-y-4">
            {totalPages > 1 && (
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 gap-3">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Showing:</span>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 rounded-md font-semibold">
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

            <div className="w-full mb-4">
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="p-2 sm:p-3">
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 w-full">
                                <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={externalSearchTerm}
                                        onChange={e => onSearch && onSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                </div>

                                <div className="flex items-center space-x-1 min-w-fit">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Show</span>
                                    <select
                                        value={externalPageSize}
                                        onChange={e => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        {[5, 15, 50, 100].map(size => (
                                            <option key={`page-size-${size}`} value={size} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">entries</span>
                                </div>

                                <div className="flex items-center space-x-1 min-w-fit">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Status</span>
                                    <select
                                        value={externalSelectedActivity}
                                        onChange={e => onselectedActivity && onselectedActivity(e.target.value)}
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="" className="bg-white dark:bg-gray-800 text-black dark:text-white">All Status</option>
                                        {['Pending', 'Confirmed', 'Rejected', 'Move_To_Client', 'Become_Customer', 'Cancelled'].map(status => (
                                            <option key={`status-${status}`} value={status} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                                                {status.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-1 min-w-fit">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Project</span>
                                    <select
                                        value={externalSelectedProject}
                                        onChange={e => {
                                            console.log('Selected Project ID:', e.target.value);
                                            onPlatformChange && onPlatformChange(e.target.value);
                                        }}
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
                                        disabled={projectsLoading}
                                    >
                                        <option value="" className="bg-white dark:bg-gray-800 text-black dark:text-white">
                                            {projectsLoading ? 'Loading Projects...' : 'All Projects'}
                                        </option>
                                        {projectList.map((project) => (
                                            <option
                                                key={`project-${project.id}`}
                                                value={String(project.id)}
                                                className="bg-white dark:bg-gray-800 text-black dark:text-white"
                                            >
                                                {project.title || project.name || `Project ${project.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isAdmin && (
                                    <select
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
                                        value={externalSelectedAssignedTo}
                                        onChange={(e) =>
                                            onAssignedToChange && onAssignedToChange(e.target.value)
                                        }
                                    >
                                        <option value="">All Created By</option>
                                        {createdByOption.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <DateFilterDropdown fromDate={externalFromDate} toDate={externalToDate} onDateChange={externalOnDateChange} />

                                <div className="flex items-center space-x-3 ml-auto">
                                    <button
                                        onClick={() => setViewMode('card')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'card'
                                            ? 'bg-gradient-to-r from-orange-500 to-indigo-600 text-white transform scale-105 shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                                            }`}
                                        title="Card View"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'table'
                                            ? 'bg-gradient-to-r from-orange-500 to-indigo-600 text-white transform scale-105 shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                                            }`}
                                        title="Table View"
                                    >
                                        <Table2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-gray-200 dark:border-gray-700 gap-2">
                                <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-300">
                                    <span>Filtered</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">{leads.length}</span>
                                    <span>Page {externalCurrentPage} of {totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-lg p-8 sm:p-12 text-center bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4 sm:mb-6" />
                    <p className="font-medium text-gray-600 dark:text-gray-300">Loading bookings...</p>
                </div>
            ) : viewMode === 'table' ? (
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
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedBookings.includes(booking.id) ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                                        >
                                            {columns.map((column: any) => {
                                                const accessor = column.accessor as keyof Booking;

                                                if (accessor === 'bookingNumber') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            <span className="font-mono text-orange-600 dark:text-orange-400">{booking.bookingNumber || booking.leadNo}</span>
                                                        </td>
                                                    );
                                                }
                                                if (accessor === 'createdAt') {
                                                    return <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedBooking.formattedCreatedAt}</td>;
                                                }
                                                if (accessor === 'status') {
                                                    return <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedBooking.formattedStatus}</td>;
                                                }
                                                if (accessor === 'phone') {
                                                    return <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedBooking.formattedPhone}</td>;
                                                }
                                                if (accessor === 'bookingAmount') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                                                            {formattedBooking.formattedBookingAmount}
                                                        </td>
                                                    );
                                                }
                                                if (accessor === 'totalPlotAmount') {
                                                    return (
                                                        <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
                                                            {formattedBooking.formattedTotalAmount}
                                                        </td>
                                                    );
                                                }
                                                const value: any = (booking as any)[accessor];
                                                return <td key={`booking-${booking.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">{value || 'N/A'}</td>;
                                            })}
                                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium flex space-x-1">
                                                {booking.status?.toLowerCase() === 'rejected' || booking.status?.toLowerCase() === 'confirmed' ? null : (
                                                    <>
                                                        {hasEditPermission && onEditLead && (
                                                            <button onClick={() => onEditLead(booking)} className="p-1.5 rounded-full text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors" title="Edit">
                                                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {isAdmin && booking.status?.toLowerCase() === 'pending' && (
                                                    <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, 'approve'); }}
                                                            className="px-4 py-1.5 text-xs font-bold uppercase text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, 'reject'); }}
                                                            className="px-4 py-1.5 text-xs font-bold uppercase text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                )}



                                                {booking.status?.toLowerCase() === "confirmed" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownloadPaymentSlip(booking)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                                                        >
                                                            Payment Slip
                                                        </button>

                                                        <button
                                                            onClick={() => handleDownloadWelcomeLetter(booking)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                                        >
                                                            Welcome Letter
                                                        </button>
                                                    </div>
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
                                                {externalSearchTerm ? `No bookings match your search "${externalSearchTerm}"` : 'No bookings found'}
                                            </h3>
                                            {onAddLead && (
                                                <button onClick={onAddLead} className="mt-2 sm:mt-4 bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg hover:from-orange-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md">
                                                    Add Your First Booking
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {leads.length > 0 ? (
                        leads.map(booking => {
                            const formattedBooking = formatBookingData(booking);
                            const isHovered = hoveredId === booking.id;
                            const isAdmin = role === 'Admin';
                            const isPending = booking.status?.toLowerCase() === 'pending';
                            const isConfirmed = booking.status?.toLowerCase() === 'confirmed';
                            const isRejected = booking.status?.toLowerCase() === 'rejected';

                            return (
                                <div
                                    key={`card-${booking.id}`}
                                    onMouseEnter={() => setHoveredId(booking.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className="relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500"
                                >
                                    <span className={`absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-indigo-200/20 via-purple-200/20 to-pink-200/20 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />

                                    <div className="relative p-5 space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                                        {booking.bookingNumber || booking.leadNo}
                                                    </span>
                                                    {formattedBooking.formattedStatus}
                                                </div>

                                                <h3
                                                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                                                    onClick={() => onLeadClick && onLeadClick(booking)}
                                                >
                                                    {booking.name || 'Unnamed Booking'}
                                                </h3>
                                            </div>

                                            {isHovered && isAdmin && isPending && (
                                                <div className="flex items-center gap-2 self-end sm:self-start animate-in fade-in duration-200">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, 'approve'); }}
                                                        className="px-4 py-1.5 text-xs font-bold uppercase text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, 'reject'); }}
                                                        className="px-4 py-1.5 text-xs font-bold uppercase text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" /> Reject
                                                    </button>
                                                </div>
                                            )}

                                            {!isPending && booking.approvedByName && booking.bookingDate && (
                                                <div className="flex items-center gap-3 opacity-75 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <User
                                                            className={`h-4 w-4 ${booking.status?.toLowerCase() === "confirmed"
                                                                ? "text-green-500"
                                                                : "text-red-500"
                                                                }`}
                                                        />

                                                        <span
                                                            className={`font-medium ${booking.status?.toLowerCase() === "confirmed"
                                                                ? "text-green-700 dark:text-green-300"
                                                                : "text-red-700 dark:text-red-300"
                                                                }`}
                                                        >
                                                            {booking.status?.toLowerCase() === "confirmed"
                                                                ? `Approved By ${booking.approvedByName}`
                                                                : booking.status?.toLowerCase() === "rejected"
                                                                    ? `Rejected By ${booking.approvedByName}`
                                                                    : ""}
                                                        </span>
                                                    </div>

                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        • {new Date(booking.bookingDate).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-indigo-500" />
                                                {booking.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">CP:</span>
                                                {booking.cpName || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Lead:</span>
                                                {booking.leadId || 'N/A'}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span className="font-medium text-green-700 dark:text-green-300">
                                                    Generated By: {booking.createdByName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-1">
                                                    <Building2 className="h-3 w-3" /> Project
                                                </p>
                                                <p className="text-sm font-bold text-green-700 dark:text-green-300">{booking.projectName || booking.projectTitle || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">
                                                    <Hash className="h-3 w-3" /> Plot Number
                                                </p>
                                                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">{booking.plotNumber ?? 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">

                                                    <Calendar className="h-3 w-3 mr-1" /> Booking Date
                                                </p>
                                                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">{formattedBooking.formattedCreatedAt}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    Booking Amount
                                                </p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formattedBooking.formattedBookingAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    <IndianRupee className="h-3 w-3 mr-1" /> Total Plot Amount
                                                </p>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formattedBooking.formattedTotalAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    Payment Ref
                                                </p>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{booking.payment_reference || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1">
                                                    Payment Platform
                                                </p>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                    {booking.paymentPlatformName || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 min-w-fit">Remarks:</span>
                                                <span className="break-all italic">
                                                    {booking.remark || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {isHovered && (
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 animate-[fadeSlideUp_0.25s_ease-out]">
                                                {!isConfirmed && !isRejected && (
                                                    <>
                                                        {hasEditPermission && onEditLead && (
                                                            <button
                                                                onClick={() => onEditLead(booking)}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                                                            >
                                                                <Edit className="h-4 w-4" /> Edit
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {isConfirmed && (
                                                    <>
                                                        <button
                                                            onClick={() => handleDownloadPaymentSlip(booking)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download Payment Slip
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadWelcomeLetter(booking)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download Welcome Letter
                                                        </button>
                                                    </>
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
                                    {externalSearchTerm ? `No bookings match your search "${externalSearchTerm}"` : 'No bookings found'}
                                </h3>
                                <p className="text-xs sm:text-sm mb-4 text-gray-500 dark:text-gray-400">
                                    {externalSearchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters or add some bookings'}
                                </p>
                            </div>
                            {onAddLead && (
                                <button
                                    onClick={onAddLead}
                                    className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                    Add Your First Booking
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showReceiptModal && receiptData && (
                <PaymentReceipt
                    data={receiptData}
                    onClose={() => {
                        setShowReceiptModal(false);
                        setReceiptData(null);
                        setSelectedBookingForReceipt(null);
                    }}
                />
            )}

            {showWelcomeLetterModal && welcomeLetterData && (
                <WelcomeLetterDownload
                    data={welcomeLetterData}
                    onClose={() => {
                        setShowWelcomeLetterModal(false);
                        setWelcomeLetterData(null);
                    }}
                />
            )}

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingTable;