'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import LeadModal from './LeadModal'; // 👈 New modal import
import { toast } from 'react-toastify';

const LeadComponent: React.FC = () => {
    const staticLeads = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '9876543210', status: 'New' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', status: 'In Progress' },
        { id: 3, name: 'Michael Lee', email: 'michael@example.com', phone: '9876543212', status: 'Converted' },
    ];

    const [leadList, setLeadList] = useState(staticLeads);
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

    const totalRecords = leadList.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const loading = false;

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
            setLeadList((prev) => prev.filter((l) => l.id !== leadToDelete.id));
            toast.success('Lead deleted successfully');
            setIsDeleteModalOpen(false);
        }
    };

    const handleSaveLead = (data: any) => {
        setIsSaving(true);
        setTimeout(() => {
            if (currentLead) {
                // Edit case
                setLeadList((prev) =>
                    prev.map((lead) =>
                        lead.id === currentLead.id ? { ...lead, ...data } : lead
                    )
                );
                toast.success('Lead updated successfully');
            } else {
                // Add case
                const newLead = { ...data, id: Date.now() };
                setLeadList((prev) => [...prev, newLead]);
                toast.success('Lead added successfully');
            }
            setIsSaving(false);
            setIsModalOpen(false);
        }, 500);
    };

    const columns: any = [
        { label: 'Sr', accessor: 'id', sortable: true },
        { label: 'Name', accessor: 'name', sortable: true },
        { label: 'Email', accessor: 'email', sortable: true },
        { label: 'Phone', accessor: 'phone', sortable: true },
        { label: 'Status', accessor: 'status', sortable: true },
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
                    data={leadList}
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
                    totalRecords={totalRecords}
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
                        </div>
                    )}
                />
            </div>

            {/* Lead Modal */}
            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveLead}
                initialData={currentLead}
                isLoading={isSaving}
            />

            {/* Delete Confirmation */}
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
