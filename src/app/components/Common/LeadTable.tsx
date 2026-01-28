'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Eye, EyeOff, ChevronLeft, ChevronRight, ChevronUp, Phone, Home,
    Briefcase, DollarSign, User, FileText, Calendar, Tag, ListFilter, Plus, Edit,
    Trash2, UserPlus, X, LayoutGrid, Table2, MoreHorizontal, Clock, AlertTriangle,
    CheckCircle, XCircle, RefreshCw, Bell, ShieldAlert, MapPin, Building2,
    IndianRupee, Calendar as CalendarIcon, Filter, Users, Hash
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

interface LeadPanelProps {
    leads?: Lead[];
    onAddLead?: () => void;
    onEditLead?: (lead: Lead) => void;
    onDeleteLead?: (lead: Lead) => void;
    onBulkDelete?: (leadIds: number[]) => void;
    onBulkAssign?: (leadIds: number[]) => void;
    onLeadClick?: (lead: Lead) => void;
    onFollowUp?: (lead: Lead) => void;
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
    onTabChange?: (tab: string) => void;
    activeTab?: string;
    searchTerm?: string;
    onSearch?: (term: string) => void;
    onRefetch?: () => void;
    selectedPlatform?: string;
    onPlatformChange?: (platform: string) => void;
    selectedAssignedTo?: string;
    onAssignedToChange?: (assignedTo: string) => void;
    disableInternalFetch?: boolean;
}

interface Lead {
    id: number;
    name: string;
    phone: string;
    profession: string;
    address: string;
    city: string;
    state: string;
    nextFollowUp: string;
    stage: string;
    status: string;
    interestedIn: string;
    budget: string;
    assignedTo: string;
    assignedUserName?: string;
    assignedUserEmail?: string;
    sharedBy: string;
    createdBy: string;
    source: string;
    remark: string;
    lastFollowUp: string;
    leadNo?: string;
    email?: string;
    createdDate?: string;
    lastFollowUpDate?: string;
    createdAt?: string;
    updatedAt?: string;
    latestFollowUpDate?: string;
    leadStatus?: string;
    leadStage?: string;
    interestStatus?: string;
    platformType?: string;
    plotNumber?: string;
    plotPrice?: string;
}

const isFollowUpDueSoon = (followUpDate: string) => {
    if (!followUpDate) return false;
    const now = new Date();
    const followUpTime = new Date(followUpDate);
    if (isNaN(followUpTime.getTime())) return false;
    const diffMinutes = (followUpTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes >= 0 && diffMinutes <= 60;
};

const formatDate = (dateString: string | any) => {
    if (!dateString) return 'Not Scheduled';
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

const getFollowUpStatus = (nextFollowUp: string) => {
    if (!nextFollowUp || nextFollowUp.toLowerCase().includes('not scheduled') || nextFollowUp.toLowerCase() === 'n/a') {
        return {
            text: 'Not Scheduled',
            color: 'text-white',
            bgColor: 'bg-red-600 dark:bg-red-700',
            icon: <ShieldAlert className="h-4 w-4" />,
            pulse: false,
            border: 'border-2 border-red-700 dark:border-red-800',
            isDueSoon: false
        };
    }
    if (nextFollowUp.toLowerCase().includes('today')) {
        const isDueSoon = isFollowUpDueSoon(nextFollowUp);
        return {
            text: nextFollowUp,
            color: 'text-yellow-800 dark:text-yellow-200',
            bgColor: 'bg-yellow-300 dark:bg-yellow-400',
            icon: <Bell className="h-4 w-4" />,
            pulse: isDueSoon,
            border: 'border-2 border-yellow-400 dark:border-yellow-500',
            isDueSoon
        };
    }
    const followUpDate = new Date(nextFollowUp);
    const today = new Date();
    if (isNaN(followUpDate.getTime())) {
        return {
            text: nextFollowUp,
            color: 'text-gray-800 dark:text-gray-200',
            bgColor: 'bg-gray-200 dark:bg-gray-700',
            icon: <ShieldAlert className="h-4 w-4" />,
            pulse: false,
            border: 'border border-gray-300 dark:border-gray-600',
            isDueSoon: false
        };
    }
    const followUpDateOnly = new Date(followUpDate.getFullYear(), followUpDate.getMonth(), followUpDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (followUpDateOnly < todayOnly) {
        return {
            text: nextFollowUp,
            color: 'text-orange-800 dark:text-orange-200',
            bgColor: 'bg-orange-200 dark:bg-orange-300',
            icon: <AlertTriangle className="h-4 w-4" />,
            pulse: true,
            border: 'border-2 border-orange-300 dark:border-orange-400',
            isDueSoon: false
        };
    }
    const isDueSoon = isFollowUpDueSoon(nextFollowUp);
    return {
        text: nextFollowUp,
        color: 'text-green-800 dark:text-green-200',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: <CheckCircle className="h-4 w-4" />,
        pulse: isDueSoon,
        border: 'border border-green-200 dark:border-green-700',
        isDueSoon
    };
};



const DateFilterDropdown = ({ fromDate, toDate, onDateChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<any>('all');
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
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{getDisplayText()}</span>
                <ChevronUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[110%] w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
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

const PaginationButtons = ({
    currentPage,
    totalPages,
    onPageChange
}: {
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
        <div className="flex items-center space-x-1">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                title="Previous page"
            >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-1">
                {getPageNumbers().map(item => {
                    if (item.type === 'ellipsis') {
                        return (
                            <span key={item.key} className="px-2 py-1.5 text-gray-500 dark:text-gray-400 text-sm">
                                <MoreHorizontal className="h-4 w-4" />
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
            <div className="sm:hidden px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
        </div>
    );
};

const getColumnsBasedOnRole = (roleId: number) => {
    const commonColumns = [
        { label: 'Lead Id', accessor: 'id', sortable: true, minWidth: 100 },
        { label: 'Name', accessor: 'name', sortable: true, minWidth: 150 },
        { label: 'Phone', accessor: 'phone', sortable: true, minWidth: 120 },
        { label: 'Email', accessor: 'email', sortable: true, minWidth: 150 },
        { label: 'Assigned To', accessor: 'assignedUserName', sortable: true, minWidth: 120 },
        { label: 'Status', accessor: 'status', sortable: true, minWidth: 120 },
        { label: 'Stage', accessor: 'stage', sortable: true, minWidth: 120 },
        { label: 'Next Follow-up', accessor: 'latestFollowUpDate', sortable: true, minWidth: 150 },
        { label: 'Created', accessor: 'createdAt', sortable: true, minWidth: 150 },
        { label: 'Last Updated', accessor: 'updatedAt', sortable: true, minWidth: 150 }
    ];
    if (roleId === 36) {
        return [
            ...commonColumns,
            { label: 'Remark', accessor: 'remark', sortable: true, minWidth: 150 }
        ];
    }
    return [
        ...commonColumns,
        { label: 'Platform', accessor: 'platformType', sortable: true, minWidth: 120 },
        { label: 'Plot Number', accessor: 'plotNumber', sortable: true, minWidth: 120 },
        { label: 'City', accessor: 'city', sortable: true, minWidth: 120 },
        { label: 'State', accessor: 'state', sortable: true, minWidth: 120 }
    ];
};

const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'in followup':
        case 'followup':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
        case 'converted':
        case 'closed':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
        case 'pending':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
        case 'dump':
        case 'rejected':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        case 'fresh':
            return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700';
        case 'hot':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
        case 'warm':
            return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700';
        case 'cold':
            return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700';
        default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
};

const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'in followup':
        case 'followup':
            return <RefreshCw className="h-3 w-3" />;
        case 'converted':
        case 'closed':
            return <CheckCircle className="h-3 w-3" />;
        case 'pending':
            return <Clock className="h-3 w-3" />;
        case 'dump':
        case 'rejected':
            return <XCircle className="h-3 w-3" />;
        case 'fresh':
            return <AlertTriangle className="h-3 w-3" />;
        case 'hot':
            return <AlertTriangle className="h-3 w-3 text-orange-500" />;
        case 'warm':
            return <AlertTriangle className="h-3 w-3 text-amber-500" />;
        case 'cold':
            return <AlertTriangle className="h-3 w-3 text-cyan-500" />;
        default:
            return null;
    }
};

const getSourceColor = (source: string) => {
    switch (source?.toUpperCase()) {
        case 'WEBSITE':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
        case 'REFERRAL':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
        case 'SOCIAL MEDIA':
        case 'FACEBOOK':
        case 'INSTAGRAM':
            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
        case 'CALL':
        case 'PHONE':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
        case 'WALKIN':
            return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700';
        case 'EMAIL':
            return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700';
        default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
};


const LeadIdBadge = ({ id }: { id: number | string }) => {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 border border-purple-400/30 animate-subtle-glow">
            {/* <Hash className="h-3.5 w-3.5" /> */}
            Lead Id :-
            <span className="tracking-wide">{id || 'N/A'}</span>
        </div>
    );
};

const LeadIdBadgeTable = ({ id }: { id: number | string }) => {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-purple-500/25 border border-purple-400/20">
            {/* <Hash className="h-3 w-3" /> */}
            Lead Id :-
            <span>{id || 'N/A'}</span>
        </span>
    );
};

const LeadPanel: React.FC<LeadPanelProps> = ({
    leads = [],
    onAddLead,
    onEditLead,
    onDeleteLead,
    onBulkDelete,
    onBulkAssign,
    onLeadClick,
    onFollowUp,
    loading = false,
    title = 'Lead Panel',
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
    onTabChange,
    activeTab: externalActiveTab = 'list',
    searchTerm: externalSearchTerm = '',
    onSearch,
    onRefetch,
    selectedPlatform: externalSelectedPlatform = '',
    onPlatformChange,
    selectedAssignedTo: externalSelectedAssignedTo = '',
    onAssignedToChange,
    disableInternalFetch = false
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>(null);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { leadPlatforms } = useSelector((state: RootState) => state.leadPlateform);
    const { data: users = [] } = useSelector((state: RootState) => state.users);
    const { permissions: rolePermissions } = useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector((state: RootState) => state.permissions);

    const role = useSelector((state: RootState) => state.auth.role);
    const isAdmin = role === 'Admin';

    const actualUsersData = React.useMemo(() => {
        if (Array.isArray(users)) return users;
        if (users?.data) {
            if (Array.isArray(users.data)) return users.data;
            if (users.data?.data && Array.isArray(users.data.data)) return users.data.data;
        }
        return [];
    }, [users]);

    // REMOVED: All Redux dispatch calls for fetchLeadPlatforms, exportUsers, 
    // fetchPermissions, fetchRolePermissionsSidebar
    // These are already called by the parent Lead.tsx component and LayoutClient.tsx globally

    const handleFollowUp = async (lead: Lead) => {
        if (!onFollowUp) return;
        await onFollowUp(lead);
        if (onRefetch) onRefetch();
    };

    const handleBulkDelete = async () => {
        if (selectedLeads.length > 0 && onBulkDelete) {
            try {
                await onBulkDelete(selectedLeads);
                setSelectedLeads([]);
                if (onRefetch) onRefetch();
            } catch (error) {
                console.error('Bulk delete failed:', error);
            }
        }
    };

    const handleBulkAssign = async () => {
        if (onBulkAssign) {
            try {
                await onBulkAssign(selectedLeads);
                setSelectedLeads([]);
                if (onRefetch) onRefetch();
            } catch (error) {
                console.error('Bulk assign failed:', error);
            }
        }
    };

    const handleSort = (key: keyof Lead) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            const allIds = leads.map(lead => lead.id);
            setSelectedLeads(allIds);
        }
    };

    const handleSelectLead = (leadId: number) => {
        const newSelection = selectedLeads.includes(leadId)
            ? selectedLeads.filter(id => id !== leadId)
            : [...selectedLeads, leadId];
        setSelectedLeads(newSelection);
    };

    const clearSelection = () => setSelectedLeads([]);

    useEffect(() => {
        setShowBulkActions(selectedLeads.length > 0);
    }, [selectedLeads]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find((p: any) => p.pageName === 'Lead');
        return leadPerm?.permissionIds || [];
    };

    const leadPermissionIds = getLeadPermissions();
    const hasPermission = (permId: number, permName: string) => {
        if (!leadPermissionIds.includes(permId)) return false;
        const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
        if (!matched) return false;
        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const tabs = [
        { id: 'list', label: 'All Leads', icon: ListFilter },
        { id: 'freshLead', label: 'Fresh Leads', icon: Tag },
        { id: 'hotLead', label: 'Hot', icon: AlertTriangle },
        { id: 'warmLead', label: 'Warm', icon: AlertTriangle },
        { id: 'coldLead', label: 'Cold', icon: AlertTriangle },
        { id: 'todayFollowup', label: 'Today FollowUp', icon: Calendar },
        { id: 'pendingFollowup', label: 'Pending FollowUp', icon: Clock },
        { id: 'dumpLead', label: 'Dump', icon: EyeOff },
        { id: 'future-followup', label: 'Future Followup', icon: EyeOff }
    ];

    const columns = getColumnsBasedOnRole(currentUser?.roleId || 0);
    const totalPages = externalTotalPages || Math.ceil(leads.length / externalPageSize);
    const totalRecords = externalTotalRecords || leads.length;

    const formatLeadData = (lead: Lead) => ({
        ...lead,
        formattedPhone: lead.phone ? (
            <a className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{lead.phone}</a>
        ) : 'N/A',
        formattedEmail: lead.email ? (
            <a className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{lead.email}</a>
        ) : 'N/A',
        formattedStatus: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(lead.status)}`}>
                {getStatusIcon(lead.status)}
                <span>{lead.status}</span>
            </span>
        ),
        formattedSource: (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(lead.platformType || lead.source || 'WEBSITE')}`}>
                {lead.platformType || lead.source || 'WEBSITE'}
            </span>
        ),
        formattedStage: (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700">
                {lead.stage}
            </span>
        ),
        formattedCreatedAt: formatDate(lead?.createdAt),
        formattedUpdatedAt: formatDate(lead?.updatedAt),
        formattedNextFollowUp: formatDate(lead?.latestFollowUpDate)
    });

    return (
        <div className="p-2 sm:p-4">
            {totalPages > 1 && (
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 gap-3">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Showing :</span>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 rounded-md font-semibold">
                                    {leads.length > 0 ? `${(externalCurrentPage - 1) * externalPageSize + 1} - ${Math.min(externalCurrentPage * externalPageSize, totalRecords)}` : '0'}
                                </span>
                                <span>of</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md font-semibold">
                                    {totalRecords.toLocaleString()}
                                </span>
                                <span>total records</span>
                            </div>
                            {(externalSearchTerm || externalSelectedPlatform || externalSelectedAssignedTo) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">(filtered)</div>
                            )}
                        </div>
                        <PaginationButtons currentPage={externalCurrentPage} totalPages={totalPages} onPageChange={onPageChange!} />
                    </div>
                </div>
            )}

            <div className="mb-4">
                <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={`tab-${tab.id}`}
                                onClick={() => onTabChange && onTabChange(tab.id)}
                                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 whitespace-nowrap transition-all ${externalActiveTab === tab.id
                                    ? 'bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="w-full mb-4">
                <div className="rounded-lg shadow-sm border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="p-2 sm:p-3">
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 w-full">
                                <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
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

                                <select
                                    value={externalSelectedPlatform}
                                    onChange={e => onPlatformChange && onPlatformChange(e.target.value)}
                                    className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer min-w-[120px]"
                                >
                                    <option value="" className="bg-white dark:bg-gray-800 text-black dark:text-white">All Platforms</option>
                                    {leadPlatforms?.map((platform: any) => (
                                        <option key={platform.id} value={platform.id} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                                            {platform.platformType}
                                        </option>
                                    ))}
                                </select>

                                {isAdmin && (
                                    <select
                                        value={externalSelectedAssignedTo}
                                        onChange={e => onAssignedToChange && onAssignedToChange(e.target.value)}
                                        className="px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer min-w-[120px]"
                                    >
                                        <option value="" className="bg-white dark:bg-gray-800 text-black dark:text-white">All Assignees</option>
                                        {actualUsersData?.map((user: any) => (
                                            <option key={user.id} value={user.id} className="bg-white dark:bg-gray-800 text-black dark:text-white">
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
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="selectAll"
                                        checked={leads.length > 0 && selectedLeads.length === leads.length}
                                        onChange={handleSelectAll}
                                        className="h-3.5 w-3.5 text-orange-600 focus:ring-orange-500 rounded"
                                    />
                                    <label htmlFor="selectAll" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Select All ({leads.length})
                                    </label>
                                    {selectedLeads.length > 0 && (
                                        <span className="text-xs text-orange-500 dark:text-orange-400 font-semibold">
                                            {selectedLeads.length} selected
                                        </span>
                                    )}
                                </div>
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

            {showBulkActions && (
                <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 transition-all duration-300 ease-in-out">
                    <div className="rounded-lg shadow-lg p-2.5 sm:p-3 border flex items-center space-x-2 sm:space-x-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedLeads.length} leads selected
                        </span>
                        <div className="flex space-x-1.5 sm:space-x-2">
                            {hasBulkPermission && hasPermission(4, 'delete') && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] text-xs sm:text-sm shadow-sm hover:shadow-md"
                                >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                </button>
                            )}
                            {hasBulkPermission && hasPermission(25, 'bulk assign') && (
                                <button
                                    onClick={handleBulkAssign}
                                    className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] text-xs sm:text-sm shadow-sm hover:shadow-md"
                                >
                                    <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Assign</span>
                                </button>
                            )}
                            <button
                                onClick={clearSelection}
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Clear selection"
                            >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="rounded-lg p-8 sm:p-12 text-center bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4 sm:mb-6" />
                    <p className="font-medium text-gray-600 dark:text-gray-300">Loading leads...</p>
                </div>
            ) : viewMode === 'table' ? (
                <div className="rounded-lg shadow-sm border overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider w-8 sm:w-12">
                                    <input
                                        type="checkbox"
                                        checked={leads.length > 0 && selectedLeads.length === leads.length}
                                        onChange={handleSelectAll}
                                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 focus:ring-orange-500 rounded"
                                    />
                                </th>
                                {columns.map((column: any) => (
                                    <th
                                        key={column.accessor}
                                        scope="col"
                                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ minWidth: column.minWidth }}
                                        onClick={() => column.sortable && handleSort(column.accessor as keyof Lead)}
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
                                leads.map(lead => {
                                    const formattedLead = formatLeadData(lead);
                                    const followUpStatus = getFollowUpStatus(lead.latestFollowUpDate || lead.nextFollowUp);
                                    return (
                                        <tr
                                            key={`lead-${lead.id}`}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                                        >
                                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={() => handleSelectLead(lead.id)}
                                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 focus:ring-orange-500 rounded"
                                                />
                                            </td>
                                            {columns.map((column: any) => {
                                                const accessor = column.accessor as keyof Lead;
                                                const value: any = (lead as any)[accessor];


                                                if (accessor === 'id') {
                                                    return (
                                                        <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                                                            <LeadIdBadgeTable id={lead.id} />
                                                        </td>
                                                    );
                                                }
                                                if (accessor === 'createdAt') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedCreatedAt}</td>;
                                                }
                                                if (accessor === 'updatedAt') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedUpdatedAt}</td>;
                                                }
                                                if (accessor === 'latestFollowUpDate' || accessor === 'nextFollowUp') {
                                                    return (
                                                        <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                            <div className={`inline-block ${followUpStatus.isDueSoon && followUpStatus.pulse ? 'animate-blink' : ''}`}>
                                                                {formattedLead.formattedNextFollowUp}
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                if (accessor === 'status') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedStatus}</td>;
                                                }
                                                if (accessor === 'platformType' || accessor === 'source') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedSource}</td>;
                                                }
                                                if (accessor === 'stage') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedStage}</td>;
                                                }
                                                if (accessor === 'phone') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedPhone}</td>;
                                                }
                                                if (accessor === 'email') {
                                                    return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{formattedLead.formattedEmail}</td>;
                                                }
                                                return <td key={`lead-${lead.id}-${accessor}`} className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">{value || 'N/A'}</td>;
                                            })}
                                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium flex space-x-1">
                                                {onFollowUp && (
                                                    <button onClick={() => handleFollowUp(lead)} className="p-1.5 rounded-full text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" title="Follow Up">
                                                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                )}
                                                {hasEditPermission && onEditLead && (
                                                    <button onClick={() => onEditLead(lead)} className="p-1.5 rounded-full text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors" title="Edit">
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                )}
                                                {hasDeletePermission && onDeleteLead && (
                                                    <button onClick={() => onDeleteLead(lead)} className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                                                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                                                {externalSearchTerm ? `No leads match your search "${externalSearchTerm}"` : 'No leads found'}
                                            </h3>
                                            {onAddLead && (
                                                <button onClick={onAddLead} className="mt-2 sm:mt-4 bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg hover:from-orange-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md">
                                                    Add Your First Lead
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
                        leads.map(lead => {
                            const formattedLead = formatLeadData(lead);
                            const followUpStatus = getFollowUpStatus(lead.lastFollowUpDate || lead.nextFollowUp);
                            return (
                                <div
                                    key={`card-${lead.id}`}
                                    className={`rounded-lg shadow-sm border transition-all duration-200 ${selectedLeads.includes(lead.id)
                                        ? 'ring-2 ring-orange-500 border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="p-3 sm:p-4 rounded-t-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={() => handleSelectLead(lead.id)}
                                                    className="h-4 w-4 text-orange-400 focus:ring-orange-300 rounded bg-white/20 border-white/30"
                                                />
                                                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full">
                                                    <div className={`${followUpStatus.bgColor} ${followUpStatus.border} flex items-center space-x-2 px-3 py-1.5 rounded-full ${followUpStatus.isDueSoon && followUpStatus.pulse ? 'animate-blink' : ''}`}>
                                                        {followUpStatus.icon}
                                                        <span className={`text-xs sm:text-sm font-medium ${followUpStatus.color}`}>
                                                            <span className="hidden sm:inline">Next Follow-up: </span>
                                                            <span className="font-semibold">{formattedLead.formattedNextFollowUp}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                                                <LeadIdBadge id={lead.id} />
                                                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                                                    <span className="text-xs font-medium text-white/80">Stage</span>
                                                    <span className="text-xs font-semibold text-orange-200">{lead.stage || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full">
                                                    <span className="text-xs font-medium text-white/80">Status</span>
                                                    {formattedLead.formattedStatus}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-5">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-6">
                                            <div className="flex-1">
                                                <h3
                                                    className="text-lg sm:text-xl font-bold mb-1.5 text-gray-900 dark:text-gray-50 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors"
                                                // onClick={() => onLeadClick && onLeadClick(lead)}
                                                >
                                                    {lead.name || 'Unnamed Lead'}
                                                </h3>
                                                <div className="space-y-1.5 mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="h-3.5 w-3.5 text-orange-500" />
                                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{formattedLead.formattedPhone}</span>
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-3.5 w-3.5 text-green-500" />
                                                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{formattedLead.formattedEmail}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                    {lead.profession && lead.profession !== 'N/A' && lead.profession !== 'Not Provided' && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Profession</p>
                                                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{lead.profession}</p>
                                                        </div>
                                                    )}
                                                    {lead.budget && lead.budget !== 'N/A' && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Budget</p>
                                                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{lead.budget}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assigned To</p>
                                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{lead.assignedUserName || lead.assignedTo || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full sm:w-auto sm:min-w-[200px] space-y-1.5">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {lead.city && lead.city !== 'Not Provided' && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">City</p>
                                                            <p className="flex items-center space-x-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                <MapPin className="h-3 w-3 text-red-500" />
                                                                <span>{lead.city}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    {lead.state && lead.state !== 'Not Provided' && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">State</p>
                                                            <p className="flex items-center space-x-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                <Building2 className="h-3 w-3 text-orange-500" />
                                                                <span>{lead.state}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg mt-4 p-3 sm:p-4 border bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-700">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                                <div>
                                                    <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Next Follow-up</p>
                                                    <p className={`text-xs sm:text-sm text-gray-700 dark:text-gray-300 ${followUpStatus.isDueSoon && followUpStatus.pulse ? 'animate-blink' : ''}`}>
                                                        {formattedLead.formattedNextFollowUp}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Created</p>
                                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{formattedLead.formattedCreatedAt}</p>
                                                </div>
                                                {formattedLead.formattedCreatedAt !== formattedLead.formattedUpdatedAt && (
                                                    <div>
                                                        <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Last Updated</p>
                                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{formattedLead.formattedUpdatedAt}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                <div>
                                                    <p className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">Source</p>
                                                    {formattedLead.formattedSource}
                                                </div>
                                                {lead.remark && lead.remark !== 'N/A' && (
                                                    <div>
                                                        <p className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">Remark</p>
                                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{lead.remark}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                                            {onFollowUp && (
                                                <button
                                                    onClick={() => handleFollowUp(lead)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>Follow Up</span>
                                                </button>
                                            )}
                                            {hasEditPermission && onEditLead && (
                                                <button
                                                    onClick={() => onEditLead(lead)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:from-orange-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                            {hasDeletePermission && onDeleteLead && (
                                                <button
                                                    onClick={() => onDeleteLead(lead)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg p-6 sm:p-10 text-center border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="text-gray-400 dark:text-gray-500">
                                <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400 dark:text-gray-500" />
                                <h3 className="text-sm sm:text-lg font-semibold mb-2 text-gray-600 dark:text-gray-300">
                                    {externalSearchTerm ? `No leads match your search "${externalSearchTerm}"` : 'No leads found'}
                                </h3>
                                <p className="text-xs sm:text-sm mb-4 text-gray-500 dark:text-gray-400">
                                    {externalSearchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters or add some leads'}
                                </p>
                            </div>
                            {onAddLead && (
                                <button
                                    onClick={onAddLead}
                                    className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                    Add Your First Lead
                                </button>
                            )}
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
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-blink {
                    animation: blink 1s infinite;
                }
                @keyframes subtle-glow {
                    0%, 100% { 
                        box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.4);
                    }
                    50% { 
                        box-shadow: 0 4px 20px -3px rgba(139, 92, 246, 0.6);
                    }
                }
                .animate-subtle-glow {
                    animation: subtle-glow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LeadPanel;