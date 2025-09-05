'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Pencil, Trash2, Plus, Upload, Loader2, Download } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import { FilterConfig, FilterValue } from '../Common/TableFilter';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ComprehensiveLeadModal from './LeadModal';
import FollowUpLeadModal from './FollowUpLeadModal';
import TimelineLeadModal from './TimelineLeadModal';
import UploadPreviewModal from '../../components/Common/UploadPreviewModal';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
    createLead,
    deleteLead,
    fetchLeads,
    updateLead,
    uploadLeads,
} from '../../../../store/leadSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import { RootState } from '../../../../store/store';
import ExportModal from '../Common/ExportModal';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

const LeadComponent: React.FC = () => {
    const dispatch = useDispatch<any>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { list: leadList, loading, totalPages, total } = useSelector(
        (state: RootState) => state.leads
    );
    const { permissions: rolePermissions, loading: rolePermissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<any | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineLead, setCurrentTimelineLead] = useState<any | null>(null);
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<number | any>(null);
    const [filterValues, setFilterValues] = useState<FilterValue>({});
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        dispatch(fetchRolePermissionsSidebar());
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
        const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
        if (!matched) return false;
        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const normalizedLeads = useMemo(() => {
        return (leadList || [])?.map((lead: any, index: number) => ({
            ...lead,
            sr: index + 1 + (currentPage - 1) * pageSize,
            leadStatus: lead?.leadStatus || 'N/A',
            platformType: lead?.platformType || 'N/A',
            plotNumber: lead?.plotNumber || 'N/A',
            plotPrice: lead?.plotPrice || 'N/A',
            plotProjectId: lead?.plotProjectId || null,
            plotProjectTitle: lead?.plotProjectTitle || 'N/A',
        }));
    }, [leadList, currentPage, pageSize]);

    const filters: FilterConfig<any>[] = [
        {
            key: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Search by name...',
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text',
            placeholder: 'Search by email...',
        },
        {
            key: 'phone',
            label: 'Phone',
            type: 'text',
            placeholder: 'Search by phone...',
        },
        {
            key: 'leadStatus',
            label: 'Lead Status',
            type: 'multiSelect',
            placeholder: 'Select lead status...',
        },
        {
            key: 'leadStage',
            label: 'Lead Stage',
            type: 'multiSelect',
            placeholder: 'Select lead stage...',
        },
        {
            key: 'platformType',
            label: 'Platform Type',
            type: 'multiSelect',
            placeholder: 'Select platform type...',
        },
        {
            key: 'assignedUserName',
            label: 'Assigned Person',
            type: 'select',
            placeholder: 'Select assigned person...',
        },
        {
            key: 'city',
            label: 'City',
            type: 'multiSelect',
            placeholder: 'Select cities...',
        },
        {
            key: 'state',
            label: 'State',
            type: 'multiSelect',
            placeholder: 'Select states...',
        },
        {
            key: 'plotNumber',
            label: 'Plot Number',
            type: 'text',
            placeholder: 'Search by plot number...',
        },
        {
            key: 'plotPrice',
            label: 'Plot Price',
            type: 'text',
            placeholder: 'Search by plot price...',
        },
        {
            key: 'createdAt',
            label: 'Created Date',
            type: 'dateRange',
        },
    ];

    const resetUploadStates = () => {
        setIsUploadPreviewOpen(false);
        setPreviewData([]);
        setFileName('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event: any) => {
            try {
                const text = event.target.result as string;
                const rows = text.split('\n').map((row: string) => row.split(','));
                const preview = rows.map((cols: string[], i: number) => ({
                    id: i + 1,
                    name: cols[0] || '',
                    email: cols[1] || '',
                    phone: cols[2] || '',
                    city: cols[3] || '',
                    state: cols[4] || '',
                }));
                setPreviewData(preview.filter((r) => r.name));
                setIsUploadPreviewOpen(true);
            } catch (err) {
                toast.error('Failed to parse file');
                resetUploadStates();
            }
        };
        reader.readAsText(file);
    };

    const handleClosePreview = () => {
        resetUploadStates();
    };

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
            dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error(err?.message || 'Failed to upload leads');
        } finally {
            setUploadLoading(false);
        }
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
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (leadToDelete) {
            dispatch(deleteLead(leadToDelete.id))
                .unwrap()
                .then(() => {
                    toast.success('Lead deleted successfully');
                    dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
                })
                .catch(() => toast.error('Failed to delete lead'));
            setIsDeleteModalOpen(false);
        }
    };

    const handleSaveLead = async (data: any) => {
        setIsSaving(true);
        if (currentLead) {
            await dispatch(updateLead({ id: currentLead.id, payload: data }))
                .unwrap()
                .then(() => {
                    toast.success('Lead updated successfully');
                    setIsModalOpen(false);
                    dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
                })
                .catch(() => toast.error('Failed to update lead'))
                .finally(() => setIsSaving(false));
        } else {
            await dispatch(createLead(data))
                .unwrap()
                .then(() => {
                    toast.success('Lead added successfully');
                    setIsModalOpen(false);
                    dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
                })
                .catch(() => toast.error('Failed to add lead'))
                .finally(() => setIsSaving(false));
        }
    };

    const handleExport = () => {
        if (sortedData.length === 0) {
            toast.error('No data to export');
            return;
        }
        setIsExportModalOpen(true);
    };

    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 10) - hash);
        }
        const baseHue = Math.abs(hash) % 360;
        return `hsl(${baseHue}, 65%, 92%)`;
    };

    const stringToTextColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 10) - hash);
        }
        const baseHue = Math.abs(hash) % 360;
        return `hsl(${baseHue}, 75%, 25%)`;
    };

    const renderBadge = (value: string) => {
        if (!value) return null;
        return (
            <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                    backgroundColor: stringToColor(value),
                    color: stringToTextColor(value),
                }}
            >
                {value}
            </span>
        );
    };

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const getColumnsBasedOnRole = (roleId: any) => {
        if (roleId === 36) {
            return [
                {
                    label: 'Name',
                    accessor: 'name',
                    sortable: true,
                    minWidth: 200,
                    maxWidth: 300,
                    showTooltip: true,
                },
                {
                    label: 'Phone',
                    accessor: 'phone',
                    sortable: true,
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Email',
                    accessor: 'email',
                    sortable: true,
                    showTooltip: true,
                },
                {
                    label: 'Assigned Person',
                    accessor: 'assignedUserName',
                    sortable: true,
                    render: (row: any) => renderBadge(row.assignedUserName),
                    showTooltip: true,
                },
                {
                    label: 'Lead Status',
                    accessor: 'leadStatus',
                    sortable: true,
                    render: (row: any) => renderBadge(row.leadStatus),
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Lead Stage',
                    accessor: 'leadStage',
                    sortable: true,
                    render: (row: any) => renderBadge(row.leadStage),
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Remark',
                    accessor: 'remark',
                    sortable: true,
                    showTooltip: true,
                },
            ];
        } else {
            return [
                {
                    label: 'Name',
                    accessor: 'name',
                    sortable: true,
                    minWidth: 200,
                    maxWidth: 300,
                    showTooltip: true,
                },
                {
                    label: 'Email',
                    accessor: 'email',
                    sortable: true,
                    showTooltip: true,
                },
                {
                    label: 'Phone',
                    accessor: 'phone',
                    sortable: true,
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Assigned Person',
                    accessor: 'assignedUserName',
                    sortable: true,
                    render: (row: any) => renderBadge(row.assignedUserName),
                    showTooltip: true,
                },
                {
                    label: 'Lead Status',
                    accessor: 'leadStatus',
                    sortable: true,
                    render: (row: any) => renderBadge(row.leadStatus),
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Lead Stage',
                    accessor: 'leadStage',
                    sortable: true,
                    render: (row: any) => renderBadge(row.leadStage),
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
                {
                    label: 'Platform Type',
                    accessor: 'platformType',
                    sortable: true,
                    render: (row: any) => renderBadge(row.platformType),
                    showTooltip: true,
                },
                {
                    label: 'Plot Number',
                    accessor: 'plotNumber',
                    sortable: true,
                    render: (row: any) => renderBadge(row.plotNumber),
                    showTooltip: true,
                },
                {
                    label: 'Plot Price',
                    accessor: 'plotPrice',
                    sortable: true,
                    render: (row: any) => renderBadge(row.plotPrice),
                    showTooltip: true,
                },
                {
                    label: 'City',
                    accessor: 'city',
                    sortable: true,
                    showTooltip: true,
                },
                {
                    label: 'State',
                    accessor: 'state',
                    sortable: true,
                    minWidth: 200,
                    maxWidth: 500,
                    showTooltip: true,
                },
            ];
        }
    };

    const columns = getColumnsBasedOnRole(currentUser?.roleId);

    const handleSort = (config: any) => setSortConfig(config);

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const filteredData = useMemo(() => {
        return normalizedLeads.filter((lead) => {
            return Object.entries(filterValues).every(([key, value]) => {
                if (!value) return true;
                if (key === 'createdAt') {
                    return true; // Placeholder: Implement your date range logic here
                }
                if (Array.isArray(value)) {
                    return value.includes(lead[key]);
                }
                return String(lead[key]).toLowerCase().includes(String(value).toLowerCase());
            });
        });
    }, [normalizedLeads, filterValues]);

    const sortedData = useMemo(() => {
        const dataArray = Array.isArray(filteredData) ? filteredData : [];
        if (!sortConfig) return dataArray;
        return [...dataArray].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    return (
        <div className="space-y-8 p-3 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Lead Master</h1>
                    <p className="text-sm text-gray-600">Manage leads with advanced filtering</p>
                </div>
                <div className="flex gap-3">
                    {hasPermission(24, "export") && (
                        <label
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base
                 bg-purple-500 hover:bg-purple-600 text-white font-medium
                 shadow-md hover:shadow-lg transition-all duration-200
                 cursor-pointer"
                        >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Export</span>
                        </label>
                    )}

                    {hasPermission(20, "upload") && (
                        <label
                            className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base
                   bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        >
                            {uploadLoading ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            <span className="hidden sm:inline">Upload</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </label>
                    )}

                    <div data-tooltip-id="add-permission-tooltip">
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleAdd}
                                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Add New</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <style jsx>{`
                    @keyframes greenBlink {
                        0%,
                        100% {
                            background-color: inherit;
                        }
                        50% {
                            background-color: rgba(34, 197, 94, 0.25);
                            box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                        }
                    }

                    .fresh-lead-blink {
                        animation: greenBlink 2s infinite;
                        transition: all 0.3s ease;
                    }

                    .fresh-lead-blink:hover {
                        animation-play-state: paused;
                        background-color: rgba(34, 197, 94, 0.15) !important;
                    }

                    /* Alternative faster blink */
                    .fresh-lead-blink-fast {
                        animation: greenBlink 1s infinite;
                    }
                `}</style>

                <CustomTable<any>
                    data={sortedData}
                    columns={columns}
                    isLoading={loading}
                    title="Leads"
                    searchValue={searchValue}
                    onSearchChange={(val) => {
                        setSearchValue(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search leads..."
                    showSearch
                    sortConfig={sortConfig}
                    onSortChange={handleSort}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalRecords={total}
                    onPageChange={handlePageChange}
                    pageSizeOptions={[10, 25, 50, 100]}
                    showPagination
                    emptyMessage="No leads found"
                    showColumnToggle
                    hiddenColumns={hiddenColumns}
                    onColumnVisibilityChange={setHiddenColumns}
                    rowClassName={(row: any) => {
                        if (row.leadStatus === 'Fresh' || row.leadStatus === 'fresh') {
                            return 'fresh-lead-blink';
                        }
                        return '';
                    }}
                    showFilters={true}
                    filters={filters}
                    filterValues={filterValues}
                    onFilterChange={setFilterValues}
                    onPageSizeChange={handlePageSizeChange}
                    actions={(row) => (
                        <div className="flex gap-2">
                            {hasPermission(22, 'edit') && (
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="p-1 rounded text-blue-500 hover:text-blue-700 cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            {hasPermission(4, 'delete') && (
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="p-1 rounded text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedLeadId(row);
                                    setIsFollowUpModalOpen(true);
                                }}
                                className="text-green-500 hover:text-green-700 p-1 cursor-pointer"
                            >
                                📞
                            </button>
                        </div>
                    )}
                />
            </div>
            {/* Modals */}
            <ComprehensiveLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveLead}
                initialData={currentLead}
                isLoading={isSaving}
            />
            {selectedLeadId && (
                <FollowUpLeadModal
                    isOpen={isFollowUpModalOpen}
                    onClose={() => setIsFollowUpModalOpen(false)}
                    lead={selectedLeadId}
                />
            )}
            <TimelineLeadModal
                isOpen={isTimelineModalOpen}
                onClose={() => setIsTimelineModalOpen(false)}
                lead={currentTimelineLead}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${leadToDelete?.name}"?`}
                Icon={Trash2}
            />
            <UploadPreviewModal
                isOpen={isUploadPreviewOpen}
                onClose={handleClosePreview}
                onConfirmUpload={handleConfirmUpload}
                fileName={fileName}
                previewData={previewData}
                isLoading={uploadLoading}
                totalRows={previewData.length}
            />
            {/* Add Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={sortedData}
                fileName={`leads_export_${new Date().toISOString().split('T')[0]}`}
                columns={columns}
            />
        </div>
    );
};

export default LeadComponent;