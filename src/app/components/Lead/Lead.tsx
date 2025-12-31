'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pencil, Trash2, Plus, Upload, Loader2, Download, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
    createLead,
    deleteLead,
    fetchLeads,
    updateLead,
    uploadLeads,
    deleteBulkLeads,
    transferSelectedLeads
} from '../../../../store/leadSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { fetchLeadPlatforms } from '../../../../store/leadPlateformSlice';
import { exportUsers } from '../../../../store/userSlice';
import { RootState } from '../../../../store/store';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ComprehensiveLeadModal from './LeadModal';
import FollowUpLeadModal from './FollowUpLeadModal';
import TimelineLeadModal from './TimelineLeadModal';
import UploadPreviewModal from '../../components/Common/UploadPreviewModal';
import ExportModal from '../Common/ExportModal';
import BulkAssignRoleModal from '../Common/BulkAssignRoleModal';
import LeadPanel from '../Common/LeadTable';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

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

// Valid tab IDs
const VALID_TABS = [
    'list',
    'freshLead',
    'hotLead',
    'warmLead',
    'coldLead',
    'todayFollowup',
    'pendingFollowup',
    'dumpLead',
    'future-followup'
];

const LeadComponent: React.FC = () => {
    const dispatch = useDispatch<any>();
    const searchParams = useSearchParams();

    const { list: leadList, loading, totalPages, total } = useSelector((state: RootState) => state.leads);
    const { permissions: rolePermissions } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    // Get initial tab from URL query parameter
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
    const [currentLead, setCurrentLead] = useState<any>(null);
    const [leadToDelete, setLeadToDelete] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineLead, setCurrentTimelineLead] = useState<any>(null);
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<any>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState("");

    // Store the last fetch parameters for intelligent refetch
    const [lastFetchParams, setLastFetchParams] = useState<any>({});

    // Update activeTab when URL changes
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            setCurrentPage(1); // Reset to first page when tab changes from URL
        }
    }, [searchParams]);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }, []);

    const getCategoryFromTab = (tabId: string) => {
        const tabToCategory: Record<string, string> = {
            'list': '',
            'todayFollowup': 'today-followup',
            'pendingFollowup': 'pending-followup',
            'freshLead': 'fresh',
            'hotLead': 'hot',
            'warmLead': 'warm',
            'coldLead': 'cold',
            'dumpLead': 'dump',
            "future-followup": "future-followup",
        };
        return tabToCategory[tabId] || '';
    };

    // Main API call - ONLY in LeadComponent
    const fetchLeadsData = useCallback((overrideTab?: string) => {
        const tabToUse = overrideTab || activeTab;
        const category = getCategoryFromTab(tabToUse);

        const params: any = {
            page: currentPage,
            limit: pageSize,
            searchValue: searchTerm,
            fromDate,
            toDate,
            ...(category && { category }),
        };

        if (selectedPlatform) {
            params.platformId = selectedPlatform;
        }

        if (selectedAssignedTo) {
            params.assignedTo = selectedAssignedTo;
        }

        // Store the last fetch parameters
        setLastFetchParams(params);

        console.log("Fetching leads with params:", params);
        dispatch(fetchLeads(params));
    }, [dispatch, currentPage, pageSize, searchTerm, activeTab, fromDate, toDate, selectedPlatform, selectedAssignedTo]);

    // Only fetch when parameters change
    useEffect(() => {
        fetchLeadsData();
    }, [fetchLeadsData]);

    // Intelligent refetch that maintains current tab context
    const handleRefetch = useCallback((force: boolean = false) => {
        // Only refetch if explicitly forced or if we have valid parameters
        if (!force && Object.keys(lastFetchParams).length === 0) {
            return;
        }

        const category = getCategoryFromTab(activeTab);
        const params: any = {
            page: currentPage,
            limit: pageSize,
            searchValue: searchTerm,
            fromDate,
            toDate,
            ...(category && { category }),
        };

        if (selectedPlatform) {
            params.platformId = selectedPlatform;
        }

        if (selectedAssignedTo) {
            params.assignedTo = selectedAssignedTo;
        }

        console.log("Refetching with current tab context:", activeTab, params);
        dispatch(fetchLeads(params));
    }, [dispatch, activeTab, currentPage, pageSize, searchTerm, fromDate, toDate, selectedPlatform, selectedAssignedTo]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
        // Update URL without full page reload (optional - for better UX)
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

    const handlePlatformChange = (platform: string) => {
        setSelectedPlatform(platform);
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

    const transformLeadsForPanel = useMemo(() => {
        return (leadList || []).map((lead: any) => {
            const createdAt = lead.createdAt ? formatDate(lead.createdAt) : 'N/A';
            const updatedAt = lead.updatedAt ? formatDate(lead.updatedAt) : 'N/A';
            const latestFollowUpDate = lead.latestFollowUpDate ? formatDate(lead.latestFollowUpDate) : 'Not Scheduled';
            const lastFollowUpDate = lead.lastFollowUpDate ? formatDate(lead.lastFollowUpDate) : 'N/A';

            return {
                id: lead.id,
                name: lead.name || 'N/A',
                phone: lead.phone || 'N/A',
                email: lead.email || '',
                profession: lead.profession || 'Not Provided',
                address: lead.address || 'Not Provided',
                city: lead.city || 'Not Provided',
                state: lead.state || 'Not Provided',
                nextFollowUp: latestFollowUpDate,
                stage: lead.leadStage || 'Lead',
                status: lead.leadStatus || 'N/A',
                interestedIn: lead.interestedIn || 'not provided',
                budget: lead.budget || lead.plotPrice || 'N/A',
                assignedTo: lead.assignedUserName || 'Not Assigned',
                assignedUserName: lead.assignedUserName || 'Not Assigned',
                assignedUserEmail: lead.assignedUserEmail || 'N/A',
                sharedBy: lead.sharedBy || lead.assignedUserName || 'N/A',
                createdBy: lead.createdBy || 'System',
                source: lead.platformType || lead.source || 'WEBSITE',
                remark: lead.remark || 'N/A',
                lastFollowUp: lead.lastFollowUp || 'DNP',
                leadNo: `#${lead.id}`,
                createdDate: createdAt,
                createdAt: lead.createdAt || null,
                updatedAt: lead.updatedAt || null,
                lastFollowUpDate: lastFollowUpDate,
                latestFollowUpDate: lead.latestFollowUpDate || null,
                platformType: lead.platformType || 'N/A',
                plotNumber: lead.plotNumber || 'N/A',
                plotPrice: lead.plotPrice || 'N/A',
                plotProjectId: lead.plotProjectId || null,
                plotProjectTitle: lead.plotProjectTitle || 'N/A',
                interestStatus: lead.interestStatus || 'N/A',
            };
        });
    }, [leadList]);

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar());
        // Fetch master data for dropdowns
        dispatch(fetchLeadPlatforms({ page: 1, limit: 100, search: '' }));
        dispatch(exportUsers({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'Lead'
        );
        return leadPerm?.permissionIds || [];
    };

    const leadPermissionIds = getLeadPermissions();

    const hasPermission = (permId: number, permName: string) => {
        if (!leadPermissionIds.includes(permId)) return false;
        const matched = allPermissions?.data?.permissions?.find(
            (p: any) => p.id === permId
        );
        if (!matched) return false;
        return (
            matched.permissionName?.trim().toLowerCase() ===
            permName.trim().toLowerCase()
        );
    };

    const handleAdd = () => {
        setCurrentLead(null);
        setIsModalOpen(true);
    };

    const handleEdit = (lead: any) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
    };

    const handleDelete = (lead: any) => {
        setDeleteMode('single');
        setDeleteTarget(lead);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteMode === 'single') {
                const id = (deleteTarget as { id: number }).id;
                await dispatch(deleteLead(id.toString())).unwrap();
                toast.success('Lead deleted successfully');
            } else if (deleteMode === 'bulk') {
                await dispatch(deleteBulkLeads(deleteTarget as number[])).unwrap();
                setSelectedIds([]);
                toast.success(`${(deleteTarget as number[]).length} lead(s) deleted successfully`);
            }
            handleRefetch(true);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        }
    };

    const handleSaveLead = async (data: any) => {
        setIsSaving(true);
        const action = currentLead
            ? updateLead({ id: currentLead.id, payload: data })
            : createLead(data);
        try {
            await dispatch(action).unwrap();
            toast.success(
                currentLead ? 'Lead updated successfully' : 'Lead added successfully'
            );
            setIsModalOpen(false);
            setCurrentLead(null);
            handleRefetch(true);
        } catch (error: any) {
            console.error('Error saving lead:', error);
            toast.error(error?.message || 'Failed to save lead');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (transformLeadsForPanel.length === 0 && total === 0) {
            toast.error('No data to export');
            return;
        }
        setIsExportModalOpen(true);
    };

    const handleBulkDelete = (selectedIds: (string | number)[]) => {
        if (!selectedIds || selectedIds.length === 0) {
            toast.error('No leads selected for deletion');
            return;
        }
        setDeleteMode('bulk');
        setDeleteTarget(selectedIds.map(id => Number(id)));
        setIsDeleteModalOpen(true);
    };

    const handleBulkAssignRole = async (assignedTo: string | number) => {
        if (!selectedIds || selectedIds?.length === 0) {
            toast.error('No leads selected for assignment');
            return;
        }

        const numericIds = selectedIds?.map(id => Number(id));
        const numericAssignedTo = Number(assignedTo);

        try {
            await dispatch(transferSelectedLeads({
                leadIds: numericIds,
                assignedTo: numericAssignedTo
            })).unwrap();
            toast.success(`${numericIds.length} lead(s) transferred successfully`);
            setSelectedIds([]);
            handleRefetch(true);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to transfer selected leads');
        } finally {
            setIsAssignModalOpen(false);
        }
    };

    const handleLeadClick = (lead: any) => {
        setCurrentLead(lead);
        setCurrentTimelineLead(lead);
        setIsTimelineModalOpen(true);
    };

    const handleAssignLeads = (leadIds: number[]) => {
        setSelectedIds(leadIds);
        setIsAssignModalOpen(true);
    };

    const resetUploadStates = () => {
        setIsUploadPreviewOpen(false);
        setPreviewData([]);
        setFileName('');
        setSelectedFile(null);
    };

    const handleOpenUploadPreview = () => {
        setIsUploadPreviewOpen(true);
    };

    const handleFileSelect = (file: File) => {
        if (!file) return;
        setFileName(file.name);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event: any) => {
            try {
                const text = event.target.result as string;
                const rows = text.split('\n').map((row: string) => row.split(','));
                const preview = rows.map((cols: string[], i: number) => ({
                    name: cols[0] || '',
                    email: cols[1] || '',
                    phone: cols[2] || '',
                    city: cols[3] || '',
                    state: cols[4] || '',
                    platform: cols[5] || '',
                }));
                setPreviewData(preview.filter((r) => r.name));
            } catch (err) {
                toast.error('Failed to parse file');
                resetUploadStates();
            }
        };
        reader.readAsText(file);
    };

    const handleClosePreview = () => resetUploadStates();

    const handleConfirmUpload = async () => {
        if (!selectedFile) {
            toast.error('No file selected');
            return;
        }
        setUploadLoading(true);
        try {
            await dispatch(uploadLeads(selectedFile)).unwrap();
            toast.success('Leads uploaded successfully');
            resetUploadStates();
            handleRefetch(true);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to upload leads');
        } finally {
            setUploadLoading(false);
        }
    };

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const exportColumns = [
        { label: 'Name', accessor: 'name' },
        { label: 'Phone', accessor: 'phone' },
        { label: 'Email', accessor: 'email' },
        // { label: 'Status', accessor: 'status' },
        // { label: 'Stage', accessor: 'stage' },
        { label: 'Assigned To', accessor: 'assignedTo' },
        // { label: 'Source', accessor: 'source' },
        { label: 'Platform', accessor: 'platformType' },
        { label: 'Created Date', accessor: 'createdDate' },
        // { label: 'Next Follow Up', accessor: 'nextFollowUp' },
        // { label: 'Profession', accessor: 'profession' },
        // { label: 'Address', accessor: 'address' },
        // { label: 'City', accessor: 'city' },
        // { label: 'State', accessor: 'state' },
        // { label: 'Budget', accessor: 'budget' },
        // { label: 'Plot Number', accessor: 'plotNumber' },
        // { label: 'Plot Price', accessor: 'plotPrice' },
        // { label: 'Remark', accessor: 'remark' },
    ];

    // Transform lead data for export
    const transformLeadForExport = (lead: any) => {
        const createdAt = lead.createdAt ? formatDate(lead.createdAt) : 'N/A';
        const latestFollowUpDate = lead.latestFollowUpDate ? formatDate(lead.latestFollowUpDate) : 'Not Scheduled';
        const lastFollowUpDate = lead.lastFollowUpDate ? formatDate(lead.lastFollowUpDate) : 'N/A';


        return {
            id: lead.id,
            name: lead.name || 'N/A',
            phone: lead.phone || 'N/A',
            email: lead.email || '',
            profession: lead.profession || 'Not Provided',
            address: lead.address || 'Not Provided',
            city: lead.city || 'Not Provided',
            state: lead.state || 'Not Provided',
            nextFollowUp: latestFollowUpDate,
            stage: lead.leadStage || 'Lead',
            status: lead.leadStatus || 'N/A',
            interestedIn: lead.interestedIn || 'not provided',
            budget: lead.budget || lead.plotPrice || 'N/A',
            assignedTo: lead.assignedUserName || 'Not Assigned',
            assignedUserName: lead.assignedUserName || 'Not Assigned',
            source: lead.platformType || lead.source || 'WEBSITE',
            remark: lead.remark || 'N/A',
            lastFollowUp: lead.lastFollowUp || 'DNP',
            createdDate: createdAt,
            lastFollowUpDate: lastFollowUpDate,
            platformType: lead.platformType || 'N/A',
            plotNumber: lead.plotNumber || 'N/A',
            plotPrice: lead.plotPrice || 'N/A',
        };
    };


    // Extract leads from API response (handles multiple response structures)
    const extractLeadsFromResponse = (resultAction: any): any[] => {
        if (!resultAction) return [];

        if (Array.isArray(resultAction)) {
            return resultAction;
        }
        if (resultAction.leads && Array.isArray(resultAction.leads)) {
            return resultAction.leads;
        }
        if (resultAction.data && Array.isArray(resultAction.data)) {
            return resultAction.data;
        }
        if (resultAction.data?.leads && Array.isArray(resultAction.data.leads)) {
            return resultAction.data.leads;
        }
        if (resultAction.data?.data && Array.isArray(resultAction.data.data)) {
            return resultAction.data.data;
        }
        return [];
    };



    // const handleFetchExportRange = useCallback(async (start: number, end: number): Promise<any[]> => {
    //     try {
    //         const totalToFetch = end - start;
    //         const category = getCategoryFromTab(activeTab);
    //         const BATCH_SIZE = 100; // Tera backend 100 deta hai ek baar mein

    //         console.log(`Export: Fetching ${totalToFetch} records`);

    //         let allLeads: any[] = [];
    //         const totalPages = Math.ceil(totalToFetch / BATCH_SIZE);

    //         // Har page ke liye API call
    //         for (let page = 1; page <= totalPages; page++) {
    //             console.log(`Fetching page ${page} of ${totalPages}...`);

    //             const params: any = {
    //                 page: page,
    //                 limit: BATCH_SIZE,
    //                 searchValue: searchTerm,
    //                 fromDate,
    //                 toDate,
    //                 ...(category && { category }),
    //                 ...(selectedPlatform && { platformId: selectedPlatform }),
    //                 ...(selectedAssignedTo && { assignedTo: selectedAssignedTo }),
    //             };

    //             const resultAction = await dispatch(fetchLeads(params)).unwrap();
    //             const batchLeads = extractLeadsFromResponse(resultAction);

    //             console.log(`Page ${page}: Got ${batchLeads.length} records`);

    //             if (batchLeads.length === 0) break;

    //             allLeads = [...allLeads, ...batchLeads];

    //             // Agar requested records mil gaye toh ruk jao
    //             if (allLeads.length >= totalToFetch) break;
    //         }

    //         console.log(`Export: Total fetched ${allLeads.length} records`);

    //         if (allLeads.length === 0) {
    //             throw new Error('No data found to export');
    //         }

    //         // Sirf utne records lo jitne maange the
    //         const slicedLeads = allLeads.slice(0, totalToFetch);
    //         const transformedLeads = slicedLeads.map(transformLeadForExport);

    //         return transformedLeads;

    //     } catch (error: any) {
    //         console.error('Export range fetch failed:', error);
    //         toast.error(error?.message || 'Failed to fetch export data');
    //         throw error;
    //     }
    // }, [dispatch, activeTab, searchTerm, fromDate, toDate, selectedPlatform, selectedAssignedTo]);



    const handleFetchExportRange = useCallback(async (start: number, end: number): Promise<any[]> => {
        try {
            const totalToFetch = end - start;
            const category = getCategoryFromTab(activeTab);
            // const BATCH_SIZE = 100;
            const BATCH_SIZE = 500;

            console.log(`Export: Fetching records from ${start} to ${end} (Total: ${totalToFetch})`);


            const startPage = Math.floor(start / BATCH_SIZE) + 1;
            const endPage = Math.ceil(end / BATCH_SIZE);

            console.log(`Starting from page ${startPage} to page ${endPage}`);

            let allLeads: any[] = [];


            for (let page = startPage; page <= endPage; page++) {
                console.log(`Fetching page ${page}...`);

                const params: any = {
                    page: page,
                    limit: BATCH_SIZE,
                    searchValue: searchTerm,
                    fromDate,
                    toDate,
                    ...(category && { category }),
                    ...(selectedPlatform && { platformId: selectedPlatform }),
                    ...(selectedAssignedTo && { assignedTo: selectedAssignedTo }),
                };

                const resultAction = await dispatch(fetchLeads(params)).unwrap();
                const batchLeads = extractLeadsFromResponse(resultAction);

                console.log(`Page ${page}: Got ${batchLeads.length} records`);

                if (batchLeads.length === 0) break;

                allLeads = [...allLeads, ...batchLeads];
            }

            console.log(`Export: Total fetched ${allLeads.length} records`);

            if (allLeads.length === 0) {
                throw new Error('No data found to export');
            }


            const offsetInFirstPage = start % BATCH_SIZE;
            const slicedLeads = allLeads.slice(offsetInFirstPage, offsetInFirstPage + totalToFetch);

            console.log(`Slicing from index ${offsetInFirstPage}, taking ${totalToFetch} records`);

            const transformedLeads = slicedLeads.map(transformLeadForExport);

            return transformedLeads;

        } catch (error: any) {
            console.error('Export range fetch failed:', error);
            toast.error(error?.message || 'Failed to fetch export data');
            throw error;
        }
    }, [dispatch, activeTab, searchTerm, fromDate, toDate, selectedPlatform, selectedAssignedTo]);



    return (
        <div className="p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Lead Master
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage leads with advanced filtering
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {hasPermission(24, 'export') && (
                        <button
                            onClick={handleExport}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Export</span>
                        </button>
                    )}
                    {hasPermission(26, 'upload') && (
                        <button
                            onClick={handleOpenUploadPreview}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            {uploadLoading ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                            <span>Upload</span>
                        </button>
                    )}
                    {hasPermission(21, 'add') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Add New</span>
                        </button>
                    )}
                </div>
            </div>

            <LeadPanel
                leads={transformLeadsForPanel}
                onAddLead={handleAdd}
                onEditLead={handleEdit}
                onDeleteLead={handleDelete}
                onBulkDelete={handleBulkDelete}
                onBulkAssign={handleAssignLeads}
                onLeadClick={handleLeadClick}
                loading={loading}
                title="Lead Panel"
                currentPage={currentPage}
                totalPages={totalPages || 1}
                pageSize={pageSize}
                totalRecords={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                fromDate={fromDate}
                toDate={toDate}
                onDateChange={handleDateChange}
                onTabChange={handleTabChange}
                activeTab={activeTab}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onFollowUp={(lead: any) => {
                    setSelectedLeadId(lead);
                    setIsFollowUpModalOpen(true);
                }}
                onRefetch={() => handleRefetch(true)}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                selectedAssignedTo={selectedAssignedTo}
                onAssignedToChange={handleAssignedToChange}
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
                    setCurrentLead(null);
                }}
                onSave={handleSaveLead}
                initialData={currentLead}
                isLoading={isSaving}
            />

            <FollowUpLeadModal
                isOpen={isFollowUpModalOpen}
                onClose={(shouldRefetch?: boolean) => {
                    setIsFollowUpModalOpen(false);
                    setSelectedLeadId(null);
                    if (shouldRefetch) {
                        handleRefetch(true);
                    }
                }}
                lead={selectedLeadId}
            />

            <TimelineLeadModal
                isOpen={isTimelineModalOpen}
                onClose={() => setIsTimelineModalOpen(false)}
                lead={currentTimelineLead}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title={deleteMode === 'bulk' ? 'Confirm Bulk Deletion' : 'Confirm Deletion'}
                message={
                    deleteMode === 'bulk'
                        ? `Are you sure you want to delete ${Array.isArray(deleteTarget) ? deleteTarget.length : 0} selected leads?`
                        : `Are you sure you want to delete "${deleteTarget?.name ?? ''}"?`
                }
                Icon={Trash2}
            />

            <UploadPreviewModal
                isOpen={isUploadPreviewOpen}
                onClose={handleClosePreview}
                onFileSelect={handleFileSelect}
                onConfirmUpload={handleConfirmUpload}
                fileName={fileName}
                previewData={previewData}
                isLoading={uploadLoading}
                totalRows={previewData.length}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={transformLeadsForPanel}
                fileName={`leads_export_${new Date().toISOString().split('T')[0]}`}
                columns={exportColumns}
                totalRecords={total}
                onFetchDataRange={handleFetchExportRange}
            />

            <BulkAssignRoleModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onConfirm={handleBulkAssignRole}
                selectedIds={selectedIds}
                currentUser={currentUser}
            />
        </div>
    );
};

export default LeadComponent;