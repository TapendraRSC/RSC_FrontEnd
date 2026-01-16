"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../store/permissionSlice';
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Trash2,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { toast } from "react-toastify";

type Contact = {
    id: string | number;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
    message: string;
};

type SortConfig = {
    key: keyof Contact | null;
    direction: "asc" | "desc";
};

// --- Token fetching optimized ---
const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

const Director = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: "asc",
    });

    const [openMessage, setOpenMessage] = useState<string | null>(null);

    // Redux States
    const { permissions: rolePermissions, loading: roleLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Contact | null }>({
        open: false,
        item: null
    });
    const [deleting, setDeleting] = useState(false);

    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return 'http://localhost:8000';
            }
        }
        return 'https://backend.rscgroupdholera.in';
    };

    const BASE_URL = getBaseUrl();

    // 1. Initial Redux Sync (Token validation starts here)
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            dispatch(fetchRolePermissionsSidebar());
            dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
        } else {
            setLoading(false);
            toast.error("Session expired. Please login again.");
        }
    }, [dispatch]);

    // 2. Permission Calculation (Checks ID 17 and ID 4)
    const permissions = useMemo(() => {
        const pagePerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === "Assistantdirector" || p.pageId === 28
        );
        const assignedIds = pagePerm?.permissionIds || [];
        return {
            view: assignedIds.includes(17),
            delete: assignedIds.includes(4),
        };
    }, [rolePermissions]);

    // 3. Main Data Fetching (Only if permission is viewable)
    useEffect(() => {
        const fetchMainData = async () => {
            const token = getAuthToken();
            if (!token || !permissions.view) {
                if (!roleLoading) setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/allotments/allotment-requests`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                const json = await response.json();

                if (response.ok) {
                    setData(Array.isArray(json.data) ? json.data : []);
                } else if (json.message === "Invalid token") {
                    // Logic to handle invalid token
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("API error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!roleLoading) {
            fetchMainData();
        }
    }, [BASE_URL, roleLoading, permissions.view]);

    const confirmDelete = async () => {
        if (!deleteModal.item) return;
        setDeleting(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${BASE_URL}/allotments/allotment-requests/${deleteModal.item.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            if (res.ok) {
                setData(prev => prev.filter(item => item.id !== deleteModal.item?.id));
                setDeleteModal({ open: false, item: null });
                toast.success("Record deleted successfully");
            } else {
                toast.error("Unauthorized to delete");
            }
        } catch (error) {
            toast.error("Failed to delete record");
        } finally {
            setDeleting(false);
        }
    };

    // --- Pagination & Sorting (Fixed Logic) ---
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(item =>
            item.fullName?.toLowerCase().includes(query) ||
            item.email?.toLowerCase().includes(query) ||
            item.phone?.includes(query)
        );
    }, [data, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key!];
            const bVal = b[sortConfig.key!];
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    const handleSort = (key: keyof Contact) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    if (loading || roleLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!permissions.view) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p className="text-slate-500">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold">Assistant Director</h1>
                                <p className="text-sm text-slate-500">{sortedData.length} total records</p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text" placeholder="Search..."
                                    className="w-full h-11 pl-10 pr-4 text-sm rounded-xl bg-slate-800/70 text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort("fullName")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer uppercase">Name</th>
                                    <th onClick={() => handleSort("email")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-center">View</th>
                                    {permissions.delete && <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Delete</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4">{item.fullName}</td>
                                        <td className="px-4 py-4">{item.email}</td>
                                        <td className="px-4 py-4">{item.phone}</td>
                                        <td className="px-4 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => setOpenMessage(item.message)} className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                                        </td>
                                        {permissions.delete && (
                                            <td className="px-4 py-4 text-center">
                                                <button onClick={() => setDeleteModal({ open: true, item })} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - UI Intact */}
                    <div className="px-4 py-4 border-t flex justify-between items-center">
                        <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
                            {[5, 15, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft /></button>
                            <span>{currentPage} / {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}><ChevronRight /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {openMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-5 relative">
                        <button
                            onClick={() => setOpenMessage(null)}
                            className="absolute top-3 right-3 text-slate-700"
                        >
                            <X />
                        </button>

                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Message</h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {openMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-5">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Delete Record?</h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to delete <strong>{deleteModal.item?.fullName}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ open: false, item: null })}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" />Delete</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Director;