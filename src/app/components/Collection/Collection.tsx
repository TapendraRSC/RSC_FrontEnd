'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { exportUsers } from '../../../../store/userSlice';
import { RootState } from '../../../../store/store';
import CollectionTable from '../Common/CollectionTable';
import UploadCollection from '../../components/Common/UploadCollection';

// Collection API response type - matching actual API response
interface CollectionData {
    id: number;
    projectName: string;
    employeeName: string;
    clientName: string;
    mobileNumber: string;
    emailId: string;
    plotNumber: string;
    emiPlan: string;
    plotSize: string;
    price: string;
    registryStatus: string;
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
    createdAt: string;
    updatedAt: string;
}

interface CollectionApiResponse {
    success: boolean;
    count: number;
    isAdmin: boolean;
    data: CollectionData[];
}

// Project type
interface Project {
    id: number | string;
    title: string;
    name?: string;
}

// Permission interface from API
interface Permission {
    id: number;
    permissionName: string;
}

// Helper function to get token
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const possibleKeys = ['token', 'accessToken', 'access_token', 'authToken', 'auth_token'];

    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) return token;
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
        if (token) return token;
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

const CollectionComponent: React.FC = () => {
    const dispatch = useDispatch<any>();
    const searchParams = useSearchParams();

    const [collectionList, setCollectionList] = useState<CollectionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [projectList, setProjectList] = useState<Project[]>([]);

    // Redux state for permissions
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
    const [currentCollection, setCurrentCollection] = useState<any>(null);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineCollection, setCurrentTimelineCollection] = useState<any>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<any>(null);
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

    // Fetch permissions on mount
    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }) as any);
        dispatch(fetchRolePermissionsSidebar() as any);
        dispatch(exportUsers({ page: 1, limit: 100, searchValue: '' }) as any);
    }, [dispatch]);

    // ============= PERMISSION LOGIC - API BASED =============

    const getAllPermissionsList = useCallback((): Permission[] => {
        const permissionsList =
            allPermissions?.data?.permissions ||
            allPermissions?.data ||
            (Array.isArray(allPermissions) ? allPermissions : []);

        return Array.isArray(permissionsList) ? permissionsList : [];
    }, [allPermissions]);

    const getCollectionPermissionIds = useCallback((): number[] => {
        const collectionPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Collection' || p.pageName === 'collection'
        );
        if (collectionPerm?.permissionIds?.length > 0) {
            return collectionPerm.permissionIds;
        }

        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Lead' || p.pageName === 'lead'
        );
        return leadPerm?.permissionIds || [];
    }, [rolePermissions]);

    const hasPermission = useCallback((permId: number, permName: string): boolean => {
        const collectionPermissionIds = getCollectionPermissionIds();

        if (!collectionPermissionIds.includes(permId)) {
            return false;
        }

        const permissionsList = getAllPermissionsList();
        const matchedPermission = permissionsList.find(
            (p: Permission) => p.id === permId
        );

        if (!matchedPermission) {
            return false;
        }

        const apiPermName = matchedPermission.permissionName?.trim().toLowerCase();
        const requestedPermName = permName.trim().toLowerCase();

        return apiPermName === requestedPermName;
    }, [getCollectionPermissionIds, getAllPermissionsList]);

    // ============= END PERMISSION LOGIC =============

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

    // Fetch Projects
    const fetchProjectsData = useCallback(async () => {
        try {
            const token = getAuthToken();
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects/getAllProjects?page=1&limit=100`;

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

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

    // Fetch Collections - GET http://localhost:8000/collection/getAllCollections
    const fetchCollectionsData = useCallback(async (overrideTab?: string) => {
        setLoading(true);

        try {
            const tabToUse = overrideTab || activeTab;
            const statusFilter = getStatusFromTab(tabToUse);
            const queryParams = new URLSearchParams();

            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedProject) queryParams.append('projectId', selectedProject);
            if (selectedStatus) queryParams.append('status', selectedStatus);
            else if (statusFilter) queryParams.append('status', statusFilter);
            if (selectedActivity) queryParams.append('status', selectedActivity.toLowerCase());
            if (selectedCreatedBy) queryParams.append('createdBy', selectedCreatedBy);
            if (fromDate) queryParams.append('fromDate', fromDate);
            if (toDate) queryParams.append('toDate', toDate);
            if (selectedAssignedTo) queryParams.append('createdBy', selectedAssignedTo);
            queryParams.append('page', currentPage.toString());
            queryParams.append('limit', pageSize.toString());

            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/collection/getAllCollections?${queryParams.toString()}`;

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
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    setCollectionList([]);
                    setTotal(0);
                    setTotalPages(1);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: CollectionApiResponse = await response.json();

            if (result.success) {
                setCollectionList(result.data || []);
                setTotal(result.count || result.data?.length || 0);
                // Calculate total pages based on count and pageSize
                setTotalPages(Math.ceil((result.count || result.data?.length || 0) / pageSize));
            } else {
                setCollectionList([]);
                setTotal(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            console.error("Error fetching collections:", error);
            if (!error.message?.includes('401')) {
                toast.error(error?.message || 'Failed to fetch collections');
            }
            setCollectionList([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, pageSize, searchTerm, fromDate, toDate, selectedProject, selectedStatus, selectedCreatedBy, selectedAssignedTo, selectedActivity]);

    useEffect(() => {
        fetchCollectionsData();
    }, [fetchCollectionsData]);

    useEffect(() => {
        fetchProjectsData();
    }, [fetchProjectsData]);

    const handleRefetch = useCallback((force: boolean = false) => {
        if (!force && Object.keys(lastFetchParams).length === 0) return;
        fetchCollectionsData();
    }, [fetchCollectionsData, lastFetchParams]);

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

    // Transform collection data for CollectionTable - mapping API response fields
    const transformCollectionsForTable = useMemo((): any[] => {
        return (collectionList || []).map((collection: CollectionData) => {
            return {
                // ID fields
                id: collection.id,

                // Project & Plot info
                projectName: collection.projectName || 'N/A',
                projectTitle: collection.projectName || 'N/A',
                plotNumber: collection.plotNumber || 'N/A',
                plotSize: collection.plotSize || 'N/A',

                // People info
                employeeName: collection.employeeName || 'N/A',
                clientName: collection.clientName || 'N/A',
                name: collection.clientName || 'N/A',
                createdBy: collection.employeeName || 'N/A',

                // Contact info
                mobileNumber: collection.mobileNumber || 'N/A',
                phone: collection.mobileNumber || 'N/A',
                emailId: collection.emailId || 'N/A',
                email: collection.emailId || 'N/A',

                // Financial info
                price: collection.price || '0',
                plotValue: collection.plotValue || '0',
                emi: collection.emiPlan || '0',
                emiPlan: collection.emiPlan || '0',
                paymentReceived: collection.paymentReceived || '0',
                pendingAmount: collection.pendingAmount || '0',
                commission: collection.commission || '0',
                maintenance: collection.maintenance || '0',
                stampDuty: collection.stampDuty || '0',
                legalFees: collection.legalFees || '0',
                onlineAmount: collection.onlineAmount || '0',
                cashAmount: collection.cashAmount || '0',
                totalAmount: collection.totalAmount || '0',
                difference: collection.difference || '0',
                incentive: collection.incentive || '0',

                // Status
                registryStatus: collection.registryStatus || 'N/A',
                status: collection.registryStatus || 'N/A',

                // Dates
                createdAt: collection.createdAt || null,
                updatedAt: collection.updatedAt || null,
                createdDate: formatDate(collection.createdAt),
            };
        });
    }, [collectionList]);

    const handleAdd = () => {
        setCurrentCollection(null);
        setIsModalOpen(true);
    };

    const handleEdit = (collection: any) => {
        setCurrentCollection(collection);
        setIsModalOpen(true);
    };

    const handleDelete = (collection: any) => {
        setDeleteMode('single');
        setDeleteTarget(collection);
        setIsDeleteModalOpen(true);
    };

    // Delete Collection - DELETE http://localhost:8000/collection/deleteCollection/:id
    const confirmDelete = async () => {
        try {
            const token = getAuthToken();

            if (deleteMode === 'single') {
                const id = (deleteTarget as { id: number }).id;
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/collection/deleteCollection/${id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) throw new Error('Failed to delete collection');
                toast.success('Collection deleted successfully');
            } else if (deleteMode === 'bulk') {
                const ids = deleteTarget as number[];
                for (const id of ids) {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/collection/deleteCollection/${id}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token && { 'Authorization': `Bearer ${token}` })
                            },
                            credentials: 'include',
                        }
                    );
                    if (!response.ok) throw new Error('Failed to delete collection');
                }
                setSelectedIds([]);
                toast.success(`${ids.length} collection(s) deleted successfully`);
            }
            handleRefetch(true);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        }
    };

    const handleOpenUpload = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUpload = () => {
        setIsUploadModalOpen(false);
    };

    const handleUploadSuccess = () => {
        handleRefetch(true);
    };

    const handleBulkDelete = (ids: number[]) => {
        if (!ids || ids.length === 0) {
            toast.error('No collections selected for deletion');
            return;
        }
        setDeleteMode('bulk');
        setDeleteTarget(ids);
        setIsDeleteModalOpen(true);
    };

    const handleCollectionClick = (collection: any) => {
        setCurrentCollection(collection);
        setCurrentTimelineCollection(collection);
        setIsTimelineModalOpen(true);
    };

    const handleAssignCollections = (collectionIds: number[]) => {
        setSelectedIds(collectionIds);
        setIsAssignModalOpen(true);
    };

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    return (
        <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Collection Master
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage Collection with advanced filtering
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Upload Button - API: id=26, name='upload' */}
                    {hasPermission(26, 'upload') && (
                        <button
                            onClick={handleOpenUpload}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Upload</span>
                        </button>
                    )}

                    {/* Add Button - API: id=21, name='add' */}
                    {hasPermission(21, 'add') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Add New Collection</span>
                        </button>
                    )}
                </div>
            </div>

            <CollectionTable
                leads={transformCollectionsForTable}
                loading={loading}
                // totalPages={totalPages}
                // totalRecords={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onAddLead={handleAdd}
                onEditLead={handleEdit}
                onDeleteLead={handleDelete}
                onBulkDelete={handleBulkDelete}
                // onBulkAssign={handleAssignCollections}
                onLeadClick={handleCollectionClick}
                // onFollowUp={(collection: any) => {
                //     setSelectedCollectionId(collection);
                //     setIsFollowUpModalOpen(true);
                // }}
                // onRefetch={() => handleRefetch(true)}
                // selectedPlatform={selectedProject}
                // onPlatformChange={handleProjectChange}
                // selectedAssignedTo={selectedAssignedTo}
                // onAssignedToChange={handleAssignedToChange}
                // Selectedactivity={selectedActivity}
                // onselectedActivity={handleActivityChange}
                // fromDate={fromDate}
                // toDate={toDate}
                // onDateChange={handleDateChange}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                // Permissions from API - hasPermission(id, name)
                hasEditPermission={hasPermission(22, 'edit')}
                // hasDeletePermission={hasPermission(4, 'delete')}
                // hasBulkPermission={hasPermission(25, 'bulk assign') || hasPermission(4, 'delete')}
                // currentUser={currentUser}
                disableInternalFetch={true}
            />

            {/* Upload Collection Modal */}
            <UploadCollection
                isOpen={isUploadModalOpen}
                onClose={handleCloseUpload}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default CollectionComponent;