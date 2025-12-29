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
    const [currentLead, setCurrentLead] = useState<any | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineLead, setCurrentTimelineLead] = useState<any | null>(null);
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<number | any>(null);
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
            handleRefetch();
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
            handleRefetch();
        } catch (error: any) {
            console.error('Error saving lead:', error);
            toast.error(error?.message || 'Failed to save lead');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (transformLeadsForPanel.length === 0) {
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
            handleRefetch();
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
            handleRefetch();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to upload leads');
        } finally {
            setUploadLoading(false);
        }
    };

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const exportColumns = [
        { label: 'Name', accessor: 'name' },
        { label: 'Phone', accessor: 'phone' },
        { label: 'Email', accessor: 'email' },
        { label: 'Status', accessor: 'status' },
        { label: 'Stage', accessor: 'stage' },
        { label: 'Assigned To', accessor: 'assignedTo' },
        { label: 'Source', accessor: 'source' },
        { label: 'Platform', accessor: 'platformType' },
        { label: 'Created Date', accessor: 'createdDate' },
        { label: 'Next Follow Up', accessor: 'nextFollowUp' },
        { label: 'Profession', accessor: 'profession' },
        { label: 'Address', accessor: 'address' },
        { label: 'City', accessor: 'city' },
        { label: 'State', accessor: 'state' },
        { label: 'Budget', accessor: 'budget' },
        { label: 'Plot Number', accessor: 'plotNumber' },
        { label: 'Plot Price', accessor: 'plotPrice' },
        { label: 'Remark', accessor: 'remark' },
    ];

    return (
        <div className="space-y-8 p-3 sm:p-6 dark:bg-gray-900 dark:text-gray-100">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Lead Master</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Manage leads with advanced filtering
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {hasPermission(24, 'export') && (
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm
                            bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-medium"
                        >
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    )}
                    {hasPermission(26, 'upload') && (
                        <button
                            onClick={handleOpenUploadPreview}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm
                            bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                        >
                            {uploadLoading ? (
                                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                            <span className="hidden sm:inline">Upload</span>
                        </button>
                    )}
                    {hasPermission(21, 'add') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm
                            bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-3.5 h-3.5 sm:w-4" />
                            <span className="hidden sm:inline">Add New</span>
                        </button>
                    )}
                </div>
            </div>

            <LeadPanel
                leads={transformLeadsForPanel}
                loading={loading}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                fromDate={fromDate}
                toDate={toDate}
                onDateChange={handleDateChange}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onAddLead={hasPermission(21, "add") ? handleAdd : undefined}
                onEditLead={hasPermission(22, "edit") ? handleEdit : undefined}
                onDeleteLead={hasPermission(4, "delete") ? handleDelete : undefined}
                onBulkDelete={hasPermission(4, "delete") ? handleBulkDelete : undefined}
                onBulkAssign={hasPermission(25, "bulk assign") ? handleAssignLeads : undefined}
                onLeadClick={handleLeadClick}
                onFollowUp={(lead: any) => {
                    setSelectedLeadId(lead);
                    setIsFollowUpModalOpen(true);
                }}
                onRefetch={handleRefetch}
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
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveLead}
                initialData={currentLead}
                isLoading={isSaving}
            />

            {/* ✅ FIXED: Always render FollowUpLeadModal, control with isOpen */}
            <FollowUpLeadModal
                isOpen={!!selectedLeadId && isFollowUpModalOpen}
                onClose={(shouldRefetch?: boolean) => {
                    setIsFollowUpModalOpen(false);
                    setSelectedLeadId(null); // Reset selected lead
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
