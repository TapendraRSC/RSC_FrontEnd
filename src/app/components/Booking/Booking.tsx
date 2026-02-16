'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import BookingModal from './BookingModal';
import BookingTable from '../Common/BookingTable';

interface BookingData {
    id: number;
    bookingNumber: string;
    name: string;
    phone: string;
    leadId: number;
    bookingAmount: string;
    paymentPlatformName?: string;
    totalPlotAmount: string;
    bookingDate: string;
    status: string;
    projectName: string;
    createdByName?: string;
    plotNumber: string;
    payment_reference: string;
    payment_platform_id: number | string;
    cpName: string;
    remark: string;
    approvedByName?: string;
    approvedAt?: string;
    address?: string;
    city?: string;
    state?: string;
}

interface BookingApiResponse {
    success: boolean;
    data: BookingData[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const possibleKeys = ['token', 'accessToken', 'access_token', 'authToken', 'auth_token'];

    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token && token !== 'undefined' && token !== 'null') {
            return token;
        }
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.token && user.token !== 'undefined') return user.token;
            if (user.accessToken && user.accessToken !== 'undefined') return user.accessToken;
            if (user.access_token && user.access_token !== 'undefined') return user.access_token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }
    }

    for (const key of possibleKeys) {
        const token = sessionStorage.getItem(key);
        if (token && token !== 'undefined' && token !== 'null') {
            return token;
        }
    }

    return null;
};

const buildHeaders = (includeAuth: boolean = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    if (dateString instanceof Date) {
        if (isNaN(dateString.getTime())) return 'N/A';
        return dateString.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const VALID_TABS = ['list', 'active', 'inactive', 'pending', 'cancelled'];

const BookingComponent: React.FC = () => {
    const searchParams = useSearchParams();

    const [bookingList, setBookingList] = useState<BookingData[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const fetchUsers = useCallback(async () => {
        try {
            const token = getAuthToken();

            const res = await fetch(
                `${API_BASE_URL}/users/getAllUser?page=1&limit=10000`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await res.json();

            if (json?.data?.data) {
                setUsers(json.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const createdByOptions = useMemo(() => {
        return users.map(u => ({
            id: u.id,
            name: `${u.name} (${u.roleType})`,
        }));
    }, [users]);

    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const { permissions: rolePermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    const getInitialTab = (): string => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            return tabFromUrl;
        }
        return 'list';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineBooking, setCurrentTimelineBooking] = useState<any>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<any>(null);
    const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedProject, setSelectedProject] = useState("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCreatedBy, setSelectedCreatedBy] = useState("");
    const [selectedActivity, setSelectedActivity] = useState('');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const getStatusFromTab = (tabId: string) => {
        const tabToStatus: Record<string, string> = {
            'list': '',
            'active': 'active',
            'inactive': 'inactive',
            'pending': 'pending',
            'cancelled': 'cancelled',
        };
        return tabToStatus[tabId] || '';
    };

    const fetchBookingsData = useCallback(async () => {
        const token = getAuthToken();

        if (!token) {
            console.warn('No auth token available for fetching bookings');
            setBookingList([]);
            setTotal(0);
            setTotalPages(1);
            return;
        }

        setLoading(true);

        try {
            const statusFilter = getStatusFromTab(activeTab);
            const queryParams = new URLSearchParams();

            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedProject) queryParams.append('projectId', selectedProject);
            if (selectedStatus) {
                queryParams.append('status', selectedStatus);
            } else if (statusFilter) {
                queryParams.append('status', statusFilter);
            }
            if (selectedActivity) queryParams.append('status', selectedActivity.toLowerCase());
            if (fromDate) queryParams.append('fromDate', fromDate);
            if (toDate) queryParams.append('toDate', toDate);
            if (selectedAssignedTo) queryParams.append('createdBy', selectedAssignedTo);

            queryParams.append('page', currentPage.toString());
            queryParams.append('limit', pageSize.toString());

            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/bookings/getAllBookings?${queryParams.toString()}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: buildHeaders(true),
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    setBookingList([]);
                    setTotal(0);
                    setTotalPages(1);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: BookingApiResponse = await response.json();

            if (result.success) {
                setBookingList(result.data || []);
                setTotal(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
            } else {
                setBookingList([]);
                setTotal(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            console.error("Error fetching bookings:", error);
            if (!error.message?.includes('401')) {
                toast.error(error?.message || 'Failed to fetch bookings');
            }
            setBookingList([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [
        activeTab, currentPage, pageSize, searchTerm, fromDate, toDate,
        selectedProject, selectedStatus, selectedCreatedBy, selectedAssignedTo, selectedActivity
    ]);

    useEffect(() => {
        fetchBookingsData();
    }, [fetchBookingsData]);

    const handleRefetch = useCallback(() => {
        fetchBookingsData();
    }, [fetchBookingsData]);

    const handleActivityChange = (activityStatus: string) => {
        setSelectedActivity(activityStatus);
        setCurrentPage(1);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleDateChange = (newFromDate: string, newToDate: string) => {
        setFromDate(newFromDate);
        setToDate(newToDate);
        setCurrentPage(1);
    };

    const handleProjectChange = (projectId: string) => {
        setSelectedProject(projectId);
        setCurrentPage(1);
    };

    const handleAssignedToChange = (assignedTo: string) => {
        setSelectedAssignedTo(assignedTo);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const transformBookingsForTable = useMemo((): any[] => {
        return (bookingList || []).map((booking: BookingData) => {
            const bookingDate = booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A';

            return {
                id: booking.id,
                bookingNumber: booking.bookingNumber || `BK-${booking.id}`,
                leadNo: `#${booking.leadId || booking.id}`,
                name: booking.name || 'N/A',
                phone: booking.phone || 'N/A',
                payment_reference: booking.payment_reference || '',
                payment_platform_id: booking.payment_platform_id || '',
                paymentPlatformName: booking.paymentPlatformName || 'N/A',
                cpName: booking.cpName || 'N/A',
                remark: booking.remark || 'N/A',
                email: '',
                projectName: booking.projectName || 'N/A',
                projectTitle: booking.projectName || 'N/A',
                plotNumber: booking.plotNumber || 'N/A',
                bookingAmount: booking.bookingAmount || '0',
                totalPlotAmount: booking.totalPlotAmount || '0',
                budget: booking.totalPlotAmount || 'N/A',
                status: booking.status || 'pending',
                stage: 'Booking',
                createdBy: booking.createdByName || 'N/A',
                assignedUserName: booking.createdByName || 'N/A',
                createdDate: bookingDate,
                createdAt: booking.bookingDate || null,
                updatedAt: booking.bookingDate || null,
                bookingDate: booking.bookingDate || null,
                leadId: booking.leadId,
                approvedByName: booking.approvedByName || null,
                createdByName: booking.createdByName || 'N/A',
                approvedAt: booking.approvedAt ? formatDate(booking.approvedAt) : null,
                profession: 'Not Provided',
                address: booking.address || booking.city || booking.state || 'Not Provided',
                city: booking.city || 'Not Provided',
                state: booking.state || 'Not Provided',
                interestedIn: 'not provided',
                source: 'Booking',
                platformType: 'Booking',
                interestStatus: 'N/A',
                plotPrice: booking.totalPlotAmount || 'N/A',
                plotProjectId: null,
            };
        });
    }, [bookingList]);

    const getBookingPermissionIds = useCallback((): number[] => {
        const bookingPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Booking' || p.pageName === 'booking'
        );
        if (bookingPerm?.permissionIds?.length > 0) {
            return bookingPerm.permissionIds;
        }

        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Lead' || p.pageName === 'lead'
        );
        return leadPerm?.permissionIds || [];
    }, [rolePermissions]);

    const getAllPermissionsList = useCallback(() => {
        const permissionsList =
            allPermissions?.data?.permissions ||
            allPermissions?.data ||
            (Array.isArray(allPermissions) ? allPermissions : []);

        return Array.isArray(permissionsList) ? permissionsList : [];
    }, [allPermissions]);

    const hasPermission = useCallback((permId: number, permName: string): boolean => {
        const bookingPermissionIds = getBookingPermissionIds();

        if (!bookingPermissionIds.includes(permId)) {
            return false;
        }

        const permissionsList = getAllPermissionsList();
        const matchedPermission = permissionsList.find((p: any) => p.id === permId);

        if (!matchedPermission) {
            return permissionsList.length === 0;
        }

        const apiPermName = matchedPermission.permissionName?.trim().toLowerCase();
        const requestedPermName = permName.trim().toLowerCase();

        return apiPermName === requestedPermName;
    }, [getBookingPermissionIds, getAllPermissionsList]);

    const handleAdd = () => {
        setCurrentBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booking: any) => {
        const modalData = {
            id: booking.id,
            leadId: booking.leadId,
            name: booking.name,
            phone: booking.phone,
            payment_reference: booking.payment_reference || '',
            payment_platform_id: booking.paymentPlatformName || '',
            //    payment_platform_id : booking.payment_platform_id || ''
            cpName: booking.cpName || 'N/A',
            remark: booking.remark || 'N/A',
            projectTitle: booking.projectTitle || booking.projectName,
            plotNumber: booking.plotNumber,
            bookingAmount: booking.bookingAmount,
            totalPlotAmount: booking.totalPlotAmount,
            status: booking.status,
        };
        setCurrentBooking(modalData);
        setIsModalOpen(true);
    };

    const handleDelete = (booking: any) => {
        setDeleteMode('single');
        setDeleteTarget(booking);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteMode === 'single') {
                const id = (deleteTarget as { id: number }).id;
                const token = getAuthToken();

                if (!token) {
                    toast.error('Authentication required. Please login again.');
                    return;
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/bookings/deleteBooking/${id}`,
                    {
                        method: 'DELETE',
                        headers: buildHeaders(true),
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        toast.error('Session expired. Please login again.');
                        return;
                    }
                    throw new Error('Failed to delete booking');
                }

                toast.success('Booking deleted successfully');
            } else if (deleteMode === 'bulk') {
                const ids = deleteTarget as number[];
                setSelectedIds([]);
                toast.success(`${ids.length} booking(s) deleted successfully`);
            }
            handleRefetch();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        }
    };

    const handleSaveBooking = () => {
        toast.success(currentBooking ? 'Booking updated successfully' : 'Booking added successfully');
        setIsModalOpen(false);
        setCurrentBooking(null);
        handleRefetch();
    };

    const handleBulkDelete = (ids: number[]) => {
        if (!ids || ids.length === 0) {
            toast.error('No bookings selected for deletion');
            return;
        }
        setDeleteMode('bulk');
        setDeleteTarget(ids);
        setIsDeleteModalOpen(true);
    };

    const handleBookingClick = (booking: any) => {
        setCurrentBooking(booking);
        setCurrentTimelineBooking(booking);
        setIsTimelineModalOpen(true);
    };

    const handleAssignBookings = (bookingIds: number[]) => {
        setSelectedIds(bookingIds);
    };

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    return (
        <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Booking Master
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage Bookings with advanced filtering
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {hasPermission(21, 'add') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-indigo-600 text-white rounded-lg hover:from-orange-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Add New Booking</span>
                        </button>
                    )}
                </div>
            </div>

            <BookingTable
                leads={transformBookingsForTable}
                loading={loading}
                createdByOption={createdByOptions}
                totalPages={totalPages}
                totalRecords={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onAddLead={handleAdd}
                onEditLead={handleEdit}
                onDeleteLead={handleDelete}
                onBulkDelete={handleBulkDelete}
                onBulkAssign={handleAssignBookings}
                onLeadClick={handleBookingClick}
                onFollowUp={(booking: any) => {
                    setSelectedBookingId(booking);
                    setIsFollowUpModalOpen(true);
                }}
                onRefetch={handleRefetch}
                selectedPlatform={selectedProject}
                onPlatformChange={handleProjectChange}
                selectedAssignedTo={selectedAssignedTo}
                onAssignedToChange={handleAssignedToChange}
                Selectedactivity={selectedActivity}
                onselectedActivity={handleActivityChange}
                fromDate={fromDate}
                toDate={toDate}
                onDateChange={handleDateChange}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                hasEditPermission={hasPermission(22, "edit")}
                hasDeletePermission={hasPermission(4, "delete")}
                hasBulkPermission={hasPermission(25, "bulk assign") || hasPermission(4, "delete")}
                currentUser={currentUser}
                disableInternalFetch={true}
            />

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentBooking(null);
                }}
                onSave={handleSaveBooking}
                initialData={currentBooking}
                isLoading={isSaving}
            />
        </div>
    );
};

export default BookingComponent;