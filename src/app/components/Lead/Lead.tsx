'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import ComprehensiveLeadModal from './LeadModal';
import FollowUpLeadModal from './FollowUpLeadModal';
import TimelineLeadModal from './TimelineLeadModal';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { createLead, deleteLead, fetchLeads, updateLead } from '../../../../store/leadSlice';

const LeadComponent: React.FC = () => {
    const dispatch = useDispatch<any>();

    const { list: leadList, loading, page, totalPages, total } = useSelector(
        (state: any) => state.leads
    );

    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<any>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<any | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [currentFollowUpLead, setCurrentFollowUpLead] = useState<any | null>(null);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [currentTimelineLead, setCurrentTimelineLead] = useState<any | null>(null);

    useEffect(() => {
        dispatch(fetchLeads({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

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
                })
                .catch(() => toast.error('Failed to delete lead'));
            setIsDeleteModalOpen(false);
        }
    };

    const handleFollowUp = (lead: any) => {
        setCurrentFollowUpLead(lead);
        setIsFollowUpModalOpen(true);
    };

    const handleTimeline = (lead: any) => {
        setCurrentTimelineLead(lead);
        setIsTimelineModalOpen(true);
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

    /** ✅ Normalize Leads */
    const normalizedLeads = useMemo(() => {
        return (leadList || []).map((lead: any, index: number) => ({
            ...lead,
            sr: index + 1 + (currentPage - 1) * pageSize,
            leadStatus: lead?.leadStatus || "N/A",
            platformType: lead?.platformType || "N/A",
            plotNumber: lead?.plotNumber || "N/A",
            plotPrice: lead?.plotPrice || "N/A",
        }));
    }, [leadList, currentPage, pageSize]);

    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 10) - hash);
        }

        const baseHue = Math.abs(hash) % 360;

        let hue = baseHue;
        if (hue >= 40 && hue <= 60) hue = (hue + 80) % 360; // Skip brown range
        if (hue >= 200 && hue <= 220) hue = (hue + 60) % 360; // Skip muddy blue range

        return `hsl(${hue}, 65%, 92%)`;
    };

    const stringToTextColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 10) - hash);
        }

        const baseHue = Math.abs(hash) % 360;

        let hue = baseHue;
        if (hue >= 40 && hue <= 60) hue = (hue + 80) % 360;
        if (hue >= 200 && hue <= 220) hue = (hue + 60) % 360;

        return `hsl(${hue}, 75%, 25%)`;
    };

    const renderBadge = (value: string) => {
        if (!value) return null;

        const bgColor = stringToColor(value);
        const textColor = stringToTextColor(value);

        return (
            <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: bgColor, color: textColor }}
            >
                {value}
            </span>
        );
    };


    const columns: any = [
        { label: 'Sr', accessor: 'sr', sortable: true },
        { label: 'Name', accessor: 'name', sortable: true },
        { label: 'Email', accessor: 'email', sortable: true },
        {
            label: 'Lead Status',
            accessor: 'leadStatus',
            sortable: true,
            render: (row: any) => renderBadge(row.leadStatus),
        },
        {
            label: 'Platform Type',
            accessor: 'platformType',
            sortable: true,
            render: (row: any) => renderBadge(row.platformType),
        },
        {
            label: 'Assigned Person',
            accessor: 'assignedUserName',
            sortable: true,
            render: (row: any) => renderBadge(row.assignedUserName),
        },
        {
            label: 'Plot Number',
            accessor: 'plotNumber',
            sortable: true,
            render: (row: any) => renderBadge(row.plotNumber),
        },
        {
            label: 'Plot Price',
            accessor: 'plotPrice',
            sortable: true,
            render: (row: any) => renderBadge(row.plotPrice),
        },

        { label: 'Phone', accessor: 'phone', sortable: true },
        { label: 'City', accessor: 'city', sortable: true },
        { label: 'State', accessor: 'state', sortable: true },

    ];

    return (
        <div className="space-y-8 p-3 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Lead Master</h1>
                    <p className="text-sm text-gray-600">Manage leads</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add New
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <CustomTable<any>
                    data={normalizedLeads}
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
                    onSortChange={setSortConfig}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalRecords={total}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    showPagination
                    emptyMessage="No leads found"
                    showColumnToggle
                    hiddenColumns={hiddenColumns}
                    onColumnVisibilityChange={setHiddenColumns}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFollowUp(row)}
                                className="text-green-500 hover:text-green-700 p-1"
                            >
                                📞
                            </button>
                            <button
                                onClick={() => handleTimeline(row)}
                                className="text-purple-500 hover:text-purple-700 p-1"
                            >
                                🕒
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

            <FollowUpLeadModal
                isOpen={isFollowUpModalOpen}
                onClose={() => setIsFollowUpModalOpen(false)}
                onSave={(data) => {
                    console.log('Follow-up saved:', data);
                    setIsFollowUpModalOpen(false);
                }}
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
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${leadToDelete?.name}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default LeadComponent;
