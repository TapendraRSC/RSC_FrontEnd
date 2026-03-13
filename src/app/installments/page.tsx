"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../store/sidebarPermissionSlice';
import { fetchPermissions } from '../../../store/permissionSlice';
import {
    Search, ChevronLeft, ChevronRight,
    Eye, X, Trash2, Loader2, AlertTriangle,
    IndianRupee, CheckCircle2, Hourglass, CalendarClock, Receipt
} from "lucide-react";
import { toast } from "react-toastify";

type Installment = {
    id: number;
    clientId: number;
    phaseName: string;
    installmentNumber: number;
    dueDate: string;
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    status: "paid" | "partial" | "overdue" | "pending";
    clientName: string;
    clientPhone: string;
    bookingNumber: string;
    createdBy: number;
};

type SortConfig = {
    key: keyof Installment | null;
    direction: "asc" | "desc";
};

const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

const statusConfig = {
    paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
    partial: { label: "Partial", cls: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
    overdue: { label: "Overdue", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
};

const fmt = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "—";
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// paid & total are numbers
const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    const color = pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-slate-600";
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{fmt(paid)} <span className="text-slate-600">paid</span></span>
                <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, color, accent }: any) => (
    <div className={`bg-slate-800/60 border rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${accent}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 font-medium truncate">{label}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
        </div>
    </div>
);

const Installments = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Installment | null }>({ open: false, item: null });
    const [deleting, setDeleting] = useState(false);

    const [clientInstallments, setClientInstallments] = useState<Installment[]>([]);
    const [clientInstallmentsLoading, setClientInstallmentsLoading] = useState(false);
    const [clientModal, setClientModal] = useState<{ open: boolean; item: Installment | null }>({ open: false, item: null });

    const { permissions: rolePermissions, loading: roleLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000';
        }
        return 'https://backend.rscgroupdholera.in';
    };
    const BASE_URL = getBaseUrl();

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

    const permissions = useMemo(() => {
        const pagePerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === "Installments" || p.pageId === 28
        );
        const assignedIds = pagePerm?.permissionIds || [];
        return { view: assignedIds.includes(17), delete: assignedIds.includes(4) };
    }, [rolePermissions]);

    // ─── GET ALL INSTALLMENTS ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            const token = getAuthToken();
            if (!token || !permissions.view) {
                if (!roleLoading) setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${BASE_URL}/installments/get-all-installments`, {
                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const json = await res.json();
                if (res.ok) {
                    setData(Array.isArray(json.installments) ? json.installments : []);
                } else if (res.status === 401 || json.message === "Invalid token") {
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login";
                } else {
                    toast.error(json.message || "Failed to load installments");
                }
            } catch {
                toast.error("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        if (!roleLoading) fetchAll();
    }, [BASE_URL, roleLoading, permissions.view]);

    // ─── GET CLIENT INSTALLMENTS ─────────────────────────────────────────────────
    const fetchClientInstallments = async (item: Installment) => {
        setClientModal({ open: true, item });
        setClientInstallmentsLoading(true);
        setClientInstallments([]);
        try {
            const token = getAuthToken();
            const res = await fetch(`${BASE_URL}/installments/${item.clientId}/installments`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const json = await res.json();
            if (res.ok) {
                setClientInstallments(Array.isArray(json.installments) ? json.installments : []);
            } else if (res.status === 401 || json.message === "Invalid token") {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
            } else {
                toast.error(json.message || "Failed to load client installments");
            }
        } catch {
            toast.error("Network error while loading client installments");
        } finally {
            setClientInstallmentsLoading(false);
        }
    };

    // ─── DELETE ──────────────────────────────────────────────────────────────────
    const confirmDelete = async () => {
        if (!deleteModal.item) return;
        setDeleting(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${BASE_URL}/installments/${deleteModal.item.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (res.ok) {
                setData(prev => prev.filter(i => i.id !== deleteModal.item?.id));
                setDeleteModal({ open: false, item: null });
                toast.success("Record deleted successfully");
            } else {
                toast.error("Unauthorized to delete");
            }
        } catch {
            toast.error("Failed to delete record");
        } finally {
            setDeleting(false);
        }
    };

    // ─── FILTER / SORT / PAGINATE ────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        let result = data;
        if (statusFilter !== "all") result = result.filter(i => i.status === statusFilter);
        if (!searchQuery.trim()) return result;
        const q = searchQuery.toLowerCase();
        return result.filter(i =>
            i.clientName?.toLowerCase().includes(q) ||
            i.clientPhone?.includes(q) ||
            i.bookingNumber?.toLowerCase().includes(q) ||
            i.phaseName?.toLowerCase().includes(q)
        );
    }, [data, searchQuery, statusFilter]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key!] ?? "";
            const bVal = b[sortConfig.key!] ?? "";
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

    const handleSort = (key: keyof Installment) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

    const stats = useMemo(() => ({
        paid: data.filter(d => d.status === "paid").length,
        partial: data.filter(d => d.status === "partial").length,
        overdue: data.filter(d => d.status === "overdue").length,
        pending: data.filter(d => d.status === "pending").length,
        totalCollected: data.reduce((s, i) => s + parseFloat(i.paidAmount || "0"), 0),
        totalDue: data.reduce((s, i) => s + parseFloat(i.remainingAmount || "0"), 0),
    }), [data]);

    if (loading || roleLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="text-slate-400 text-sm font-medium animate-pulse">Loading installment data...</p>
            </div>
        );
    }

    if (!permissions.view) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-md text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Installments</h1>
                    <p className="text-slate-400 text-sm mt-1">Track payment schedules and collection status</p>
                </div>

                {/* Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/20 border border-emerald-700/30 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <IndianRupee size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-400">{fmt(stats.totalCollected)}</p>
                            <p className="text-xs text-emerald-600 font-medium">Total Collected</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/30 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-700 flex items-center justify-center flex-shrink-0">
                            <Receipt size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-400">{fmt(stats.totalDue)}</p>
                            <p className="text-xs text-red-600 font-medium">Total Outstanding</p>
                        </div>
                    </div>
                </div>



                {/* Table Card */}
                <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">

                    {/* Controls */}
                    <div className="p-4 sm:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <div className="flex gap-2 flex-wrap">
                            {(["all", "paid", "partial", "overdue", "pending"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                                        }`}
                                >
                                    {s === "all" ? `All (${data.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${stats[s]})`}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search name, booking, phase..."
                                className="w-full h-9 pl-9 pr-4 text-sm rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 placeholder:text-slate-500 transition-all"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                                    <th onClick={() => handleSort("clientName")} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-orange-400 transition-colors select-none">Client ↕</th>
                                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking No.</th> */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Phase</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Inst. No.</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[180px]">Payment Progress</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th onClick={() => handleSort("dueDate")} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-orange-400 transition-colors select-none">Due Date ↕</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-16 text-slate-500">
                                            <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                                            <p>No installment records found</p>
                                        </td>
                                    </tr>
                                ) : paginatedData.map((item, idx) => {
                                    const total = parseFloat(item.amount || "0");
                                    const paid = parseFloat(item.paidAmount || "0");
                                    const remaining = parseFloat(item.remainingAmount || "0");
                                    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "paid";
                                    const sc = statusConfig[item.status] ?? statusConfig.pending;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-4 py-3.5 text-slate-500 text-xs">{(currentPage - 1) * rowsPerPage + idx + 1}</td>

                                            {/* Client */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {item.clientName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-200 whitespace-nowrap text-xs">{item.clientName}</p>
                                                        <p className="text-slate-500 text-xs">{item.clientPhone}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Booking No */}
                                            {/* <td className="px-4 py-3.5">
                                                <span className="font-mono text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">{item.bookingNumber}</span>
                                            </td> */}

                                            {/* Phase */}
                                            <td className="px-4 py-3.5">
                                                <span className="capitalize text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">{item.phaseName}</span>
                                            </td>

                                            {/* Installment No */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">#{item.installmentNumber}</span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3.5 text-slate-300 font-semibold text-xs whitespace-nowrap">{fmt(item.amount)}</td>

                                            {/* Progress */}
                                            <td className="px-4 py-3.5 min-w-[180px]">
                                                <ProgressBar paid={paid} total={total} />
                                            </td>

                                            {/* Remaining */}
                                            <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">
                                                <span className={remaining > 0 ? "text-red-400" : "text-emerald-400"}>
                                                    {fmt(item.remainingAmount)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
                                            </td>

                                            {/* Due Date */}
                                            <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                                                <span className={isOverdue ? "text-red-400 font-semibold" : "text-slate-400"}>
                                                    {item.dueDate
                                                        ? new Date(item.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                        : "—"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => fetchClientInstallments(item)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                                                        title="View All Installments"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    {permissions.delete && (
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, item })}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Rows:</span>
                            <select
                                value={rowsPerPage}
                                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                            >
                                {[10, 15, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="text-sm text-slate-400">
                            {sortedData.length > 0
                                ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, sortedData.length)} of ${sortedData.length} records`
                                : "No records"}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            {(() => {
                                let pages: (number | string)[] = [];
                                if (totalPages <= 5) pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                                else {
                                    pages.push(1);
                                    if (currentPage <= 3) pages.push(2, 3, "...", totalPages);
                                    else if (currentPage >= totalPages - 2) pages.push("...", totalPages - 2, totalPages - 1, totalPages);
                                    else pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                                }
                                return pages.map((page, i) =>
                                    page === "..." ? (
                                        <span key={`d-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs">•••</span>
                                    ) : (
                                        <button key={`p-${page}`} onClick={() => setCurrentPage(page as number)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${currentPage === page ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`}>
                                            {page}
                                        </button>
                                    )
                                );
                            })()}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Installments Modal */}
            {clientModal.open && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="p-5 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                                    {clientModal.item?.clientName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{clientModal.item?.clientName}</p>
                                    <p className="text-slate-500 text-xs">
                                        {clientInstallmentsLoading
                                            ? "Loading..."
                                            : `${clientInstallments.length} installment${clientInstallments.length !== 1 ? "s" : ""}`}
                                        {" · "}{clientModal.item?.bookingNumber}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setClientModal({ open: false, item: null }); setClientInstallments([]); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-5">
                            {clientInstallmentsLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    <p className="text-slate-400 text-sm animate-pulse">Loading installments...</p>
                                </div>
                            ) : clientInstallments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                    <Receipt size={40} className="mb-3 opacity-30" />
                                    <p>No installment records found for this client</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {clientInstallments.map((inst, idx) => {
                                        const total = parseFloat(inst.amount || "0");
                                        const paid = parseFloat(inst.paidAmount || "0");
                                        const remaining = parseFloat(inst.remainingAmount || "0");
                                        const isOverdue = inst.dueDate && new Date(inst.dueDate) < new Date() && inst.status !== "paid";
                                        const sc = statusConfig[inst.status] ?? statusConfig.pending;
                                        return (
                                            <div key={inst.id ?? idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                                                            #{inst.installmentNumber}
                                                        </span>
                                                        <span className="capitalize text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-lg">{inst.phaseName}</span>
                                                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">{inst.bookingNumber}</span>
                                                    </div>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
                                                </div>
                                                <ProgressBar paid={paid} total={total} />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                                                        <p className="text-xs text-slate-500 mb-0.5">Amount</p>
                                                        <p className="text-sm font-bold text-slate-200">{fmt(inst.amount)}</p>
                                                    </div>
                                                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                                                        <p className="text-xs text-slate-500 mb-0.5">Paid</p>
                                                        <p className="text-sm font-bold text-emerald-400">{fmt(inst.paidAmount)}</p>
                                                    </div>
                                                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                                                        <p className="text-xs text-slate-500 mb-0.5">Remaining</p>
                                                        <p className={`text-sm font-bold ${remaining > 0 ? "text-red-400" : "text-emerald-400"}`}>{fmt(inst.remainingAmount)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">Due Date</span>
                                                    <span className={`font-semibold ${isOverdue ? "text-red-400" : "text-slate-300"}`}>
                                                        {inst.dueDate
                                                            ? new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                            : "—"}
                                                        {isOverdue && <span className="ml-1.5 text-red-500">(Overdue)</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Delete Record?</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Remove installment for <span className="text-white font-semibold">{deleteModal.item?.clientName}</span>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, item: null })} disabled={deleting}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete} disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20">
                                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Installments;