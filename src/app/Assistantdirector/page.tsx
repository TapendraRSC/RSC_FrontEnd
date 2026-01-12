"use client";
import React, { useEffect, useState, useMemo } from "react";
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

// Helper function to get token
const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    const possibleKeys = ["token", "accessToken", "access_token", "authToken", "auth_token"];
    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) return token;
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.token) return user.token;
            if (user.accessToken) return user.accessToken;
        } catch (e) {
            console.error("Error parsing user:", e);
        }
    }
    return null;
};

// Get roleId from localStorage
const getRoleId = (): string => {
    if (typeof window === "undefined") return "1";
    const roleId = localStorage.getItem("roleId");
    if (roleId) return roleId;
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.roleId) return String(user.roleId);
        } catch (e) { }
    }
    return "1";
};

// Variable to track if API was called (outside component to prevent re-calls)
let apiCalled = false;

const Director = () => {
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

    // Permission states
    const [permissionIds, setPermissionIds] = useState<number[]>([]);
    const [allPermissionsList, setAllPermissionsList] = useState<any[]>([]);

    // Delete modal state
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




    useEffect(() => {
        if (apiCalled) {
            setLoading(false);
            return;
        }
        apiCalled = true;

        const fetchAllData = async () => {
            const token = getAuthToken();
            const roleId = getRoleId();

            try {

                const contactsRes = await fetch(`${BASE_URL}/allotments/allotment-requests`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                if (contactsRes.ok) {
                    const json = await contactsRes.json();
                    setData(Array.isArray(json.data) ? json.data : []);
                }


                const rolePermRes = await fetch(`${BASE_URL}/rolePermissions/roles/${roleId}/permissions`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                if (rolePermRes.ok) {
                    const json = await rolePermRes.json();
                    if (json.success && json.permissions) {
                        const perm = json.permissions.find((p: any) => p.pageName === "Assistantdirector" || p.pageId === 28);
                        if (perm) setPermissionIds(perm.permissionIds || []);
                    }
                }


                const allPermRes = await fetch(`${BASE_URL}/permissions/getAllPermissions?page=1&limit=100`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                if (allPermRes.ok) {
                    const json = await allPermRes.json();
                    setAllPermissionsList(json.data?.permissions || json.data || []);
                }

            } catch (error) {
                console.error("API error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const hasPermission = (permId: number, permName: string): boolean => {
        if (!permissionIds.includes(permId)) return false;
        const matched = allPermissionsList.find((p: any) => p.id === permId);
        if (!matched) return allPermissionsList.length === 0;
        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const canView = hasPermission(17, "view");
    const canDelete = hasPermission(4, "delete");

    const handleDeleteClick = (item: Contact) => {
        setDeleteModal({ open: true, item });
    };

    const confirmDelete = async () => {
        if (!deleteModal.item) return;
        setDeleting(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${BASE_URL}/allotments/allotment-requests/${deleteModal.item.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Delete failed");
            setData(prev => prev.filter(item => item.id !== deleteModal.item?.id));
            setDeleteModal({ open: false, item: null });
            toast.success("Record deleted successfully");
        } catch (error) {
            toast.error("Failed to delete record");
        } finally {
            setDeleting(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(
            (item) =>
                item.fullName?.toLowerCase().includes(query) ||
                item.email?.toLowerCase().includes(query) ||
                item.phone?.includes(query) ||
                new Date(item.createdAt).toLocaleDateString('en-CA').toLowerCase().includes(query) ||
                item.message?.toLowerCase().includes(query)
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage]);

    const handleSort = (key: keyof Contact) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof Contact }) => {
        if (sortConfig.key !== columnKey) {
            return (
                <span className="ml-1 inline-flex flex-col text-slate-400">
                    <ChevronUp className="w-3 h-3 -mb-1" />
                    <ChevronDown className="w-3 h-3" />
                </span>
            );
        }
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4 ml-1 text-blue-500" />
        ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-blue-500" />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400">You don&apos;t have permission to view this page.</p>
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
                                <h1 className="text-xl sm:text-2xl font-bold">
                                    Assistant Director
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {sortedData.length} total records
                                </p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="
                                        w-full
                                        h-11
                                        pl-10
                                        pr-4
                                        text-sm
                                        rounded-xl
                                        bg-slate-800/70
                                        text-slate-200
                                        placeholder:text-slate-400
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-slate-600
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <th onClick={() => handleSort("fullName")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Name <SortIcon columnKey="fullName" /></div>
                                    </th>
                                    <th onClick={() => handleSort("email")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Email <SortIcon columnKey="email" /></div>
                                    </th>
                                    <th onClick={() => handleSort("phone")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Phone <SortIcon columnKey="phone" /></div>
                                    </th>
                                    <th onClick={() => handleSort("createdAt")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">createdAt<SortIcon columnKey="createdAt" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">
                                        Message
                                    </th>
                                    {canDelete && (
                                        <th className="px-4 py-3 text-center text-xs font-semibold">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={canDelete ? 6 : 5}
                                            className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4">{item.fullName}</td>
                                            <td className="px-4 py-4">{item.email}</td>
                                            <td className="px-4 py-4">{item.phone}</td>
                                            <td className="px-4 py-4">
                                                {new Date(item.createdAt).toLocaleDateString('en-CA')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => setOpenMessage(item.message)}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                            {canDelete && (
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-4 border-t flex justify-between items-center">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                        >
                            {[5, 15, 50, 100].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="disabled:opacity-50">
                                <ChevronLeft />
                            </button>
                            <span>{currentPage} / {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="disabled:opacity-50">
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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