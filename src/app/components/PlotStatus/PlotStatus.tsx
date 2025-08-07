import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, FileText, Image } from 'lucide-react';
import CustomTable from '../Common/CustomTable';
// import PlotStatusModal from './PlotStatusModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
// import { fetchBrochures, addBrochure, updateBrochure, deleteBrochure } from '../../../../store/brochureSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { toast } from 'react-toastify';

interface BrochureMaster {
    id: number;
    title: string;
    image?: string;
    pdf?: string;
    status: 'active' | 'inactive';
}

interface SortConfig {
    key: keyof BrochureMaster;
    direction: 'asc' | 'desc';
}

const PlotStatus: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentBrochure, setCurrentBrochure] = useState<BrochureMaster | null>(null);
    const [brochureToDelete, setBrochureToDelete] = useState<BrochureMaster | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.pages);

    useEffect(() => {
        // dispatch(fetchBrochures({ page: currentPage, limit: pageSize, searchValue }));
    }, [dispatch, currentPage, pageSize, searchValue]);

    const columns: any = [
        {
            label: 'Sr',
            accessor: 'id',
            sortable: true,
        },
        {
            label: 'Title',
            accessor: 'title',
            sortable: true,
        },
        {
            label: 'Image',
            accessor: 'image',
            sortable: false,
            render: (row: BrochureMaster) => (
                <div className="w-16 h-12 bg-gray-200 rounded border overflow-hidden">
                    {row.image ? (
                        <img
                            src={row.image}
                            alt={row.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                            <Image className="w-4 h-4" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Pdf',
            accessor: 'pdf',
            sortable: false,
            render: (row: BrochureMaster) => (
                <div className="flex justify-center">
                    {row.pdf ? (
                        <a
                            href={row.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <FileText className="w-4 h-4 text-white" />
                        </a>
                    ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-500" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Status',
            accessor: 'status',
            sortable: true,
            render: (row: BrochureMaster) => (
                <span className={`text-sm ${row.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.status}
                </span>
            ),
        },
    ];

    const filteredData: any = [];

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleSort = (config: any) => {
        setSortConfig(config);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleColumnVisibilityChange = (columns: string[]) => {
        setHiddenColumns(columns);
    };

    const handleEdit = (row: BrochureMaster) => {
        setCurrentBrochure(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: BrochureMaster) => {
        setBrochureToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (brochureToDelete) {
                // await dispatch(deleteBrochure(brochureToDelete.id));
                // await dispatch(fetchBrochures({ page: currentPage, limit: pageSize, searchValue }));
                toast.success('Brochure deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete brochure');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleAdd = () => {
        setCurrentBrochure(null);
        setIsModalOpen(true);
    };

    const handleSaveBrochure = async (brochure: Omit<BrochureMaster, 'id'>) => {
        try {
            if (currentBrochure) {
                // await dispatch(updateBrochure({
                //     id: currentBrochure.id,
                //     ...brochure
                // }));
                toast.success('Brochure updated successfully');
            } else {
                // await dispatch(addBrochure(brochure));
                toast.success('Brochure added successfully');
            }
            // await dispatch(fetchBrochures({ page: currentPage, limit: pageSize, searchValue }));
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save brochure');
        }
    };

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

    return (
        <div className="space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brochure Master Data</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage brochure master data</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <CustomTable<BrochureMaster>
                        data={filteredData}
                        columns={columns}
                        isLoading={loading}
                        title="Brochure Master"
                        searchValue={searchValue}
                        onSearchChange={handleSearch}
                        searchPlaceholder="Search brochures..."
                        showSearch={true}
                        sortConfig={sortConfig}
                        onSortChange={handleSort}
                        currentPage={currentPage}
                        totalPages={list?.data?.totalPages || 1}
                        pageSize={pageSize}
                        totalRecords={list?.data?.total || 0}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[10, 25, 50, 100]}
                        showPagination={true}
                        emptyMessage="No brochures found"
                        showColumnToggle={true}
                        hiddenColumns={hiddenColumns}
                        onColumnVisibilityChange={handleColumnVisibilityChange}
                        actions={(row: BrochureMaster) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
            {/* <PlotStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveBrochure={handleSaveBrochure}
                currentBrochure={currentBrochure}
            /> */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the brochure "${brochureToDelete?.title}"?`}
                Icon={Trash2}
            />
        </div>
    );
};

export default PlotStatus;