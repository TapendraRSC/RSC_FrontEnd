'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { exportUsers } from '../../../../store/userSlice';
import { RootState } from '../../../../store/store';
import ComprehensiveLeadModal from './BookingModal';
import BookingTable from '../Common/BookingTable';

// Booking API response type
interface BookingData {
    id: number;
    bookingNumber: string;
    name: string;
    phone: string;
    leadId: number;
    bookingAmount: string;
    totalPlotAmount: string;
    bookingDate: string;
    status: string;
    projectName: string;
    plotNumber: string;
    createdByName: string;
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

// Project type
interface Project {
    id: number | string;
    title: string;
    name?: string;
}

// Helper function to get token from multiple possible storage locations
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const possibleKeys = ['token', 'accessToken', 'access_token', 'authToken', 'auth_token'];

    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {
            return token;
        }
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.token) return user.token;
            if (user.accessToken) return user.accessToken;
            if (user.access_token) return user.access_token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }
    }

    for (const key of possibleKeys) {
        const token = sessionStorage.getItem(key);
        if (token) {
            return token;
        }
    }

    return null;
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
    const dispatch = useDispatch();
    const searchParams = useSearchParams();

    const [bookingList, setBookingList] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [projectList, setProjectList] = useState<Project[]>([]);


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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineBooking, setCurrentTimelineBooking] = useState<any>(null);
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<any>(null);
    const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Filter states
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCreatedBy, setSelectedCreatedBy] = useState("");
    const [selectedActivity, setSelectedActivity] = useState('');

    const [lastFetchParams, setLastFetchParams] = useState<any>({});

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            setCurrentPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }, []);

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

    // Fetch Projects for filter dropdown
    const fetchProjectsData = useCallback(async () => {
        try {
            const token = getAuthToken();
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects/getAllProjects?page=1&limit=100`;

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setProjectList(result.data);
                } else if (Array.isArray(result)) {
                    setProjectList(result);
                } else if (result.data && Array.isArray(result.data)) {
                    setProjectList(result.data);
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }, []);

    // Main API call to fetch bookings
    const fetchBookingsData = useCallback(async (overrideTab?: string) => {
        setLoading(true);

        try {
            const tabToUse = overrideTab || activeTab;
            const statusFilter = getStatusFromTab(tabToUse);

            const queryParams = new URLSearchParams();

            // Search filter
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            // Project filter
            if (selectedProject) {
                queryParams.append('projectId', selectedProject);
            }

            // Status filter from tab or dropdown
            if (selectedStatus) {
                queryParams.append('status', selectedStatus);
            } else if (statusFilter) {
                queryParams.append('status', statusFilter);
            }

            // Activity filter (same as status in your case)
            if (selectedActivity) {
                queryParams.append('status', selectedActivity.toLowerCase());
            }

            // Created By filter
            if (selectedCreatedBy) {
                queryParams.append('createdBy', selectedCreatedBy);
            }

            // Date range filters
            if (fromDate) {
                queryParams.append('fromDate', fromDate);
            }
            if (toDate) {
                queryParams.append('toDate', toDate);
            }

            // Assigned To filter
            if (selectedAssignedTo) {
                queryParams.append('createdBy', selectedAssignedTo);
            }

            // Pagination
            queryParams.append('page', currentPage.toString());
            queryParams.append('limit', pageSize.toString());

            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/bookings/getAllBookings?${queryParams.toString()}`;

            setLastFetchParams({
                search: searchTerm,
                projectId: selectedProject,
                status: selectedStatus || statusFilter,
                createdBy: selectedCreatedBy,
                fromDate,
                toDate,
                assignedTo: selectedAssignedTo,
                page: currentPage,
                limit: pageSize
            });

            const token = getAuthToken();

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers,
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
        activeTab,
        currentPage,
        pageSize,
        searchTerm,
        fromDate,
        toDate,
        selectedProject,
        selectedStatus,
        selectedCreatedBy,
        selectedAssignedTo,
        selectedActivity
    ]);

    useEffect(() => {
        fetchBookingsData();
    }, [fetchBookingsData]);

    useEffect(() => {
        fetchProjectsData();
    }, [fetchProjectsData]);

    const handleRefetch = useCallback((force: boolean = false) => {
        if (!force && Object.keys(lastFetchParams).length === 0) {
            return;
        }
        fetchBookingsData();
    }, [fetchBookingsData, lastFetchParams]);

    const handleActivityChange = (activityStatus: string) => {
        setSelectedActivity(activityStatus);
        setCurrentPage(1);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
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

    // Transform booking data for BookingTable component
    const transformBookingsForTable = useMemo((): any[] => {
        return (bookingList || []).map((booking: BookingData) => {
            const bookingDate = booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A';

            return {

                id: booking.id,
                leadId: booking.leadId,
                bookingNumber: booking.bookingNumber || `#${booking.id}`,
                leadNo: booking.bookingNumber || `#${booking.id}`,

                name: booking.name || 'N/A',
                phone: booking.phone || 'N/A',
                email: '',


                projectName: booking.projectName || 'N/A',
                projectTitle: booking.projectName || 'N/A',
                plotProjectTitle: booking.projectName || 'N/A',
                plotNumber: booking.plotNumber || 'N/A',


                bookingAmount: booking.bookingAmount || '0',
                totalPlotAmount: booking.totalPlotAmount || '0',
                budget: booking.totalPlotAmount || 'N/A',


                status: booking.status || 'N/A',
                leadStatus: booking.status || 'N/A',
                stage: booking.status || 'Booking',


                assignedTo: booking.createdByName || 'Not Assigned',
                assignedUserName: booking.createdByName || 'Not Assigned',
                createdBy: booking.createdByName || 'System',
                sharedBy: booking.createdByName || 'N/A',


                createdDate: bookingDate,
                createdAt: booking.bookingDate || null,
                updatedAt: booking.bookingDate || null,
                bookingDate: booking.bookingDate || null,


                nextFollowUp: 'Not Scheduled',
                latestFollowUpDate: null,
                lastFollowUpDate: 'N/A',
                lastFollowUp: 'N/A',

                // Other fields for compatibility
                profession: 'Not Provided',
                address: 'Not Provided',
                city: 'Not Provided',
                state: 'Not Provided',
                interestedIn: 'not provided',
                source: 'Booking',
                platformType: 'Booking',
                remark: 'N/A',
                interestStatus: 'N/A',
                plotPrice: booking.totalPlotAmount || 'N/A',
                plotProjectId: null,
            };
        });
    }, [bookingList]);


    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }) as any);
        dispatch(fetchRolePermissionsSidebar() as any);
        dispatch(exportUsers({ page: 1, limit: 100, searchValue: '' }) as any);
    }, [dispatch]);


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
        // Handle different response structures
        const permissionsList =
            allPermissions?.data?.permissions ||
            // allPermissions?.permissions ||         
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


        const matchedPermission = permissionsList.find(
            (p: any) => p.id === permId
        );


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
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/bookings/deleteBooking/${id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to delete booking');
                }

                toast.success('Booking deleted successfully');
            } else if (deleteMode === 'bulk') {
                const ids = deleteTarget as number[];
                setSelectedIds([]);
                toast.success(`${ids.length} booking(s) deleted successfully`);
            }
            handleRefetch(true);
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
        handleRefetch(true);
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
        setIsAssignModalOpen(true);
    };

    const resetUploadStates = () => {
        setIsUploadPreviewOpen(false);
        setPreviewData([]);
        setFileName('');
        setSelectedFile(null);
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
                    {/* Permission ID 21 = add */}
                    {hasPermission(21, 'add') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
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
                onRefetch={() => handleRefetch(true)}
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

                hasBulkPermission={
                    hasPermission(25, "bulk assign") || hasPermission(4, "delete")
                }
                currentUser={currentUser}
                disableInternalFetch={true}
            />

            <ComprehensiveLeadModal
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