// "use client";
// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../../store/store';
// import { fetchRolePermissionsSidebar } from '../../../store/sidebarPermissionSlice';
// import { fetchPermissions } from '../../../store/permissionSlice';
// import {
//     Search, ChevronLeft, ChevronRight, Eye, X, Trash2, Loader2,
//     AlertTriangle, Users, Plus,
//     CheckCircle2, ChevronDown, IndianRupee, Calendar, Building2, Hash
// } from "lucide-react";
// import { toast } from "react-toastify";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type Client = {
//     id: number;
//     name: string;
//     phone: string;
//     status: "active" | "pending" | "inactive";
//     totalPlotAmount: string;
//     onlineAmount: string;
//     creditPlotAmount: string;
//     onlinePaid: string;
//     onlinePending: string;
//     creditPaid: string;
//     creditPending: string;
//     createdAt: string;
//     bookingNumber: string;
//     bookingDate: string;
//     projectName: string;
//     plotNumber: string;
// };

// type UserBooking = {
//     id: number;
//     bookingNumber?: string;
//     clientName?: string;
//     plotNumber?: string;
//     projectName?: string;
//     [key: string]: any;
// };

// type PaymentPlan = {
//     id: number;
//     planName?: string;
//     name?: string;
//     description?: string;
//     [key: string]: any;
// };

// type SortConfig = { key: keyof Client | null; direction: "asc" | "desc" };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const getAuthToken = (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("accessToken") || localStorage.getItem("token");
// };

// const getBaseUrl = () => {
//     if (typeof window !== 'undefined') {
//         const h = window.location.hostname;
//         if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:8000';
//     }
//     return 'https://backend.rscgroupdholera.in';
// };

// const fmt = (val: string | number) =>
//     Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// const statusConfig = {
//     active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
//     pending: { label: "Pending", cls: "bg-amber-500/15  text-amber-400  border border-amber-500/30" },
//     inactive: { label: "Inactive", cls: "bg-slate-500/15  text-slate-400  border border-slate-500/30" },
// };

// // ─── Searchable Dropdown ──────────────────────────────────────────────────────

// interface DropdownOption { value: number; label: string; sub?: string; }

// const SearchableDropdown = ({
//     options, value, onChange, placeholder, loading, disabled, onOpen
// }: {
//     options: DropdownOption[];
//     value: number | "";
//     onChange: (val: number | "") => void;
//     placeholder: string;
//     loading?: boolean;
//     disabled?: boolean;
//     onOpen?: () => void;
// }) => {
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState("");
//     const ref = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, []);

//     const filtered = options.filter(o =>
//         o.label.toLowerCase().includes(search.toLowerCase()) ||
//         (o.sub || "").toLowerCase().includes(search.toLowerCase())
//     );

//     const selected = options.find(o => o.value === value);

//     const handleOpen = () => {
//         if (disabled || loading) return;
//         const next = !open;
//         setOpen(next);
//         if (next) { setSearch(""); onOpen?.(); }
//     };

//     return (
//         <div ref={ref} className="relative">
//             <button type="button" onClick={handleOpen} disabled={disabled}
//                 className="w-full h-10 px-3 pr-9 rounded-xl bg-slate-800 border border-slate-700 text-left text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
//                 {loading ? (
//                     <span className="text-slate-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</span>
//                 ) : selected ? (
//                     <span className="text-slate-200 truncate">{selected.label}</span>
//                 ) : (
//                     <span className="text-slate-500">{placeholder}</span>
//                 )}
//                 <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
//             </button>

//             {open && (
//                 <div className="absolute z-50 mt-1.5 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
//                     <div className="p-2 border-b border-slate-700">
//                         <div className="relative">
//                             <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                             <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
//                                 placeholder="Search..." className="w-full h-8 pl-7 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500" />
//                         </div>
//                     </div>
//                     <div className="max-h-52 overflow-y-auto">
//                         {loading ? (
//                             <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-xs">
//                                 <Loader2 size={14} className="animate-spin" /> Loading...
//                             </div>
//                         ) : filtered.length === 0 ? (
//                             <p className="text-center text-slate-500 text-xs py-4">No results</p>
//                         ) : filtered.map(o => (
//                             <button key={o.value} type="button"
//                                 onClick={() => { onChange(o.value); setOpen(false); }}
//                                 className={`w-full text-left px-3 py-2.5 hover:bg-slate-700 transition-colors ${value === o.value ? "bg-orange-500/10" : ""}`}>
//                                 <p className={`text-xs font-semibold ${value === o.value ? "text-orange-400" : "text-slate-200"}`}>{o.label}</p>
//                                 {o.sub && <p className="text-slate-500 text-xs mt-0.5">{o.sub}</p>}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // ─── View Client Modal ─────────────────────────────────────────────────────────

// const ViewClientModal = ({ client, onClose }: { client: Client; onClose: () => void }) => (
//     <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
//             <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
//                         {client.name?.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                         <p className="font-bold text-white">{client.name}</p>
//                         <p className="text-xs text-slate-500 font-mono">{client.phone}</p>
//                     </div>
//                 </div>
//                 <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
//                     <X size={18} />
//                 </button>
//             </div>
//             <div className="p-5 space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                     {[
//                         { icon: Hash, color: "text-orange-400", label: "Booking No.", value: client.bookingNumber },
//                         { icon: Building2, color: "text-blue-400", label: "Project / Plot", value: `${client.projectName} · #${client.plotNumber}` },
//                         { icon: Calendar, color: "text-purple-400", label: "Booking Date", value: new Date(client.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
//                         { icon: IndianRupee, color: "text-emerald-400", label: "Total Amount", value: `₹${fmt(client.totalPlotAmount)}` },
//                     ].map(({ icon: Icon, color, label, value }) => (
//                         <div key={label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 flex items-start gap-2.5">
//                             <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
//                             <div>
//                                 <p className="text-xs text-slate-500">{label}</p>
//                                 <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
//                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 border-b border-slate-700/40">Payment Breakdown</p>
//                     {[
//                         { label: "Online", total: client.onlineAmount, paid: client.onlinePaid, pending: client.onlinePending, color: "text-blue-400" },
//                         { label: "Credit", total: client.creditPlotAmount, paid: client.creditPaid, pending: client.creditPending, color: "text-purple-400" },
//                     ].map(row => (
//                         <div key={row.label} className="px-4 py-3 grid grid-cols-3 gap-2 text-xs border-b border-slate-700/20 last:border-0">
//                             <div><p className="text-slate-500">{row.label} Total</p><p className={`font-semibold mt-0.5 ${row.color}`}>₹{fmt(row.total)}</p></div>
//                             <div><p className="text-slate-500">Paid</p><p className="font-semibold mt-0.5 text-emerald-400">₹{fmt(row.paid)}</p></div>
//                             <div><p className="text-slate-500">Pending</p><p className="font-semibold mt-0.5 text-amber-400">₹{fmt(row.pending)}</p></div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="flex items-center justify-between px-1">
//                     <span className="text-xs text-slate-500">Status</span>
//                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig[client.status || "pending"].cls}`}>
//                         {statusConfig[client.status || "pending"].label}
//                     </span>
//                 </div>
//             </div>
//         </div>
//     </div>
// );

// // ─── Create Client Modal ───────────────────────────────────────────────────────

// const CreateClientModal = ({ onClose, onSuccess, BASE_URL }: { onClose: () => void; onSuccess: () => void; BASE_URL: string }) => {
//     const [bookings, setBookings] = useState<UserBooking[]>([]);
//     const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
//     const [loadingBookings, setLoadingBookings] = useState(false);
//     const [loadingPlans, setLoadingPlans] = useState(true);
//     const [bookingsLoaded, setBookingsLoaded] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     const [selectedBookingId, setSelectedBookingId] = useState<number | "">("");
//     const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");

//     // Load payment plans on mount
//     useEffect(() => {
//         (async () => {
//             try {
//                 const token = getAuthToken();
//                 const res = await fetch(`${BASE_URL}/payment_plan/get-all-payment-plans`, {
//                     headers: { "Authorization": `Bearer ${token}` }
//                 });
//                 const json = await res.json();
//                 const d = json.data?.plans || json.data || [];
//                 setPaymentPlans(Array.isArray(d) ? d : []);
//             } catch { toast.error("Failed to load payment plans"); }
//             finally { setLoadingPlans(false); }
//         })();
//     }, [BASE_URL]);

//     // Load bookings lazily when dropdown is first opened
//     const loadBookings = async () => {
//         if (bookingsLoaded || loadingBookings) return;
//         setLoadingBookings(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/get-user-booking`, {
//                 headers: { "Authorization": `Bearer ${token}` }
//             });
//             const json = await res.json();
//             setBookings(Array.isArray(json.data) ? json.data : []);
//             setBookingsLoaded(true);
//         } catch { toast.error("Failed to load bookings"); }
//         finally { setLoadingBookings(false); }
//     };

//     const bookingOptions: DropdownOption[] = bookings.map(b => ({
//         value: b.id,
//         label: `#${b.id} · ${b.name || b.clientName || "Unknown"}`,
//         sub: [b.phone, b.bookingNumber, b.projectName && `${b.projectName}${b.plotNumber ? ` · Plot ${b.plotNumber}` : ""}`].filter(Boolean).join(" · "),
//     }));

//     const planOptions: DropdownOption[] = paymentPlans.map(p => ({
//         value: p.id,
//         label: p.planName || p.name || `Plan #${p.id}`,
//         sub: p.description,
//     }));

//     const handleSubmit = async () => {
//         if (!selectedBookingId || !selectedPlanId) {
//             toast.error("Please select both a booking and a payment plan");
//             return;
//         }
//         setSubmitting(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/create-client`, {
//                 method: "POST",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//                 body: JSON.stringify({ bookingId: selectedBookingId, paymentPlanId: selectedPlanId }),
//             });
//             const json = await res.json();
//             if (res.ok) {
//                 toast.success("Client created successfully!");
//                 onSuccess();
//                 onClose();
//             } else {
//                 toast.error(json?.message || "Failed to create client");
//             }
//         } catch { toast.error("Network error while creating client"); }
//         finally { setSubmitting(false); }
//     };

//     const selBooking = bookings.find(b => b.id === selectedBookingId);
//     const selPlan = paymentPlans.find(p => p.id === selectedPlanId);

//     return (
//         <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
//                 <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
//                             <Plus size={18} className="text-orange-400" />
//                         </div>
//                         <div>
//                             <h2 className="text-base font-bold text-white">Create New Client</h2>
//                             <p className="text-xs text-slate-500">Link a booking with a payment plan</p>
//                         </div>
//                     </div>
//                     <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
//                         <X size={18} />
//                     </button>
//                 </div>

//                 <div className="p-5 space-y-4">
//                     <div className="space-y-2">
//                         <label className="block text-sm font-semibold text-slate-300">
//                             User Booking <span className="text-red-400">*</span>
//                         </label>
//                         <SearchableDropdown
//                             options={bookingOptions}
//                             value={selectedBookingId}
//                             onChange={setSelectedBookingId}
//                             placeholder="Click to select a booking"
//                             loading={loadingBookings}
//                             onOpen={loadBookings}
//                         />
//                         {bookingsLoaded && bookings.length === 0 && (
//                             <p className="text-xs text-slate-500">No bookings available</p>
//                         )}
//                     </div>

//                     <div className="space-y-2">
//                         <label className="block text-sm font-semibold text-slate-300">
//                             Payment Plan <span className="text-red-400">*</span>
//                         </label>
//                         <SearchableDropdown
//                             options={planOptions}
//                             value={selectedPlanId}
//                             onChange={setSelectedPlanId}
//                             placeholder="Select a payment plan"
//                             loading={loadingPlans}
//                             disabled={loadingPlans}
//                         />
//                     </div>

//                     {selectedBookingId && selectedPlanId && (
//                         <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
//                             <div className="flex items-center gap-2">
//                                 <CheckCircle2 size={14} className="text-emerald-400" />
//                                 <span className="text-xs font-semibold text-emerald-400">Ready to create</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                                 <div className="bg-slate-900/60 rounded-lg p-2.5">
//                                     <p className="text-slate-500 mb-0.5">Booking</p>
//                                     <p className="text-slate-200 font-semibold truncate">{selBooking?.bookingNumber || `#${selectedBookingId}`}</p>
//                                 </div>
//                                 <div className="bg-slate-900/60 rounded-lg p-2.5">
//                                     <p className="text-slate-500 mb-0.5">Payment Plan</p>
//                                     <p className="text-slate-200 font-semibold truncate">{selPlan?.planName || selPlan?.name || `Plan #${selectedPlanId}`}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <div className="px-5 pb-5 flex gap-3">
//                     <button onClick={onClose} disabled={submitting}
//                         className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-700 transition-colors">
//                         Cancel
//                     </button>
//                     <button onClick={handleSubmit} disabled={submitting || loadingPlans || !selectedBookingId || !selectedPlanId}
//                         className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
//                         {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Client</>}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const Clients = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const BASE_URL = getBaseUrl();

//     const [data, setData] = useState<Client[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
//     const [viewModal, setViewModal] = useState<Client | null>(null);
//     const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Client | null }>({ open: false, item: null });
//     const [deleting, setDeleting] = useState(false);
//     const [createModal, setCreateModal] = useState(false);

//     const { permissions: rolePermissions, loading: roleLoading } = useSelector((state: RootState) => state.sidebarPermissions);

//     useEffect(() => {
//         const token = getAuthToken();
//         if (token) {
//             dispatch(fetchRolePermissionsSidebar());
//             dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
//         } else {
//             setLoading(false);
//             toast.error("Session expired. Please login again.");
//         }
//     }, [dispatch]);

//     const permissions = useMemo(() => {
//         const pagePerm = rolePermissions?.permissions?.find((p: any) => p.pageName === "Clients" || p.pageId === 28);
//         const ids = pagePerm?.permissionIds || [];
//         return { view: ids.includes(17), delete: ids.includes(4), create: ids.includes(21) };
//     }, [rolePermissions]);

//     const fetchClients = async () => {
//         const token = getAuthToken();
//         if (!token || !permissions.view) { if (!roleLoading) setLoading(false); return; }
//         try {
//             const res = await fetch(`${BASE_URL}/client/get-clients`, {
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//             });
//             const json = await res.json();
//             if (res.ok) {
//                 setData(Array.isArray(json.data) ? json.data : []);
//             } else if (json.message === "Invalid token") {
//                 localStorage.removeItem("accessToken"); window.location.href = "/login";
//             } else {
//                 setData([]); toast.error(json.message || "Failed to fetch clients");
//             }
//         } catch { setData([]); toast.error("Network error"); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { if (!roleLoading) fetchClients(); }, [BASE_URL, roleLoading, permissions.view]); // eslint-disable-line

//     const confirmDelete = async () => {
//         if (!deleteModal.item) return;
//         setDeleting(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/get-clients/${deleteModal.item.id}`, {
//                 method: "DELETE",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//             });
//             if (res.ok) {
//                 setData(prev => prev.filter(i => i.id !== deleteModal.item?.id));
//                 setDeleteModal({ open: false, item: null });
//                 toast.success("Client deleted successfully");
//             } else { toast.error("Unauthorized to delete"); }
//         } catch { toast.error("Failed to delete record"); }
//         finally { setDeleting(false); }
//     };

//     const filteredData = useMemo(() => {
//         if (!searchQuery.trim()) return data;
//         const q = searchQuery.toLowerCase();
//         return data.filter(i =>
//             i.name?.toLowerCase().includes(q) || i.phone?.includes(q) ||
//             i.bookingNumber?.toLowerCase().includes(q) || i.projectName?.toLowerCase().includes(q) ||
//             i.plotNumber?.toLowerCase().includes(q)
//         );
//     }, [data, searchQuery]);

//     const sortedData = useMemo(() => {
//         if (!sortConfig.key) return filteredData;
//         return [...filteredData].sort((a, b) => {
//             const av = a[sortConfig.key!] ?? "", bv = b[sortConfig.key!] ?? "";
//             if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
//             if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [filteredData, sortConfig]);

//     const totalPages = Math.ceil(sortedData.length / rowsPerPage);
//     const paginatedData = useMemo(() => sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [sortedData, currentPage, rowsPerPage]);
//     const handleSort = (key: keyof Client) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

//     const stats = useMemo(() => ({ total: data.length }), [data]);

//     if (loading || roleLoading) return (
//         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
//             <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
//             <p className="text-slate-400 text-sm font-medium animate-pulse">Loading client data...</p>
//         </div>
//     );

//     if (!permissions.view) return (
//         <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
//             <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-md text-center">
//                 <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
//                     <AlertTriangle className="w-10 h-10 text-amber-500" />
//                 </div>
//                 <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
//                 <p className="text-slate-400">You don't have permission to view this page.</p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* Header */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <div>
//                         <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Clients</h1>
//                         <p className="text-slate-400 text-sm mt-1">Manage all client allotment requests in one place</p>
//                     </div>
//                     {permissions.create && (
//                         <button onClick={() => setCreateModal(true)}
//                             className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25 self-start sm:self-auto">
//                             <Plus size={17} /> Create Client
//                         </button>
//                     )}
//                 </div>

//                 {/* Table Card */}
//                 <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
//                     {/* Controls */}
//                     <div className="p-4 sm:p-5 border-b border-slate-700/50 flex justify-between items-center gap-3">
//                         <p className="text-sm text-slate-400 font-medium">{data.length} client{data.length !== 1 ? "s" : ""} total</p>
//                         <div className="relative w-full sm:w-64">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
//                             <input type="text" placeholder="Search name, booking, plot..."
//                                 className="w-full h-9 pl-9 pr-4 text-sm rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 placeholder:text-slate-500 transition-all"
//                                 value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
//                         </div>
//                     </div>

//                     {/* Table */}
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-slate-800/50 border-b border-slate-700/50">
//                                     {[
//                                         { label: "#", sort: null },
//                                         { label: "Client", sort: "name" as keyof Client },
//                                         { label: "Booking", sort: "bookingNumber" as keyof Client },
//                                         { label: "Project / Plot", sort: null },
//                                         { label: "Total Amount", sort: "totalPlotAmount" as keyof Client },
//                                         { label: "Pending", sort: null },
//                                         { label: "Status", sort: null },
//                                         { label: "Date", sort: "createdAt" as keyof Client },
//                                         { label: "Actions", sort: null },
//                                     ].map(({ label, sort }) => (
//                                         <th key={label}
//                                             onClick={sort ? () => handleSort(sort) : undefined}
//                                             className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${sort ? "cursor-pointer hover:text-orange-400 transition-colors select-none" : ""} ${label === "Actions" ? "text-center" : ""}`}>
//                                             {label}{sort ? " ↕" : ""}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-800">
//                                 {paginatedData.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={9} className="text-center py-16 text-slate-500">
//                                             <Users size={40} className="mx-auto mb-3 opacity-30" />
//                                             <p className="text-sm">No clients found</p>
//                                         </td>
//                                     </tr>
//                                 ) : paginatedData.map((item, idx) => {
//                                     const totalPending = Number(item.onlinePending) + Number(item.creditPending);
//                                     return (
//                                         <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
//                                             <td className="px-4 py-3.5 text-slate-500 text-xs">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
//                                             <td className="px-4 py-3.5">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                                                         {item.name?.charAt(0).toUpperCase()}
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-medium text-slate-200 whitespace-nowrap">{item.name}</p>
//                                                         <p className="text-xs text-slate-500 font-mono">{item.phone}</p>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <p className="text-xs text-orange-400 font-semibold">{item.bookingNumber}</p>
//                                                 <p className="text-xs text-slate-500 mt-0.5">{new Date(item.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <p className="text-xs text-slate-200 font-semibold">{item.projectName}</p>
//                                                 <p className="text-xs text-slate-500">Plot #{item.plotNumber}</p>
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <p className="text-xs font-semibold text-emerald-400">₹{fmt(item.totalPlotAmount)}</p>
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 {totalPending > 0
//                                                     ? <p className="text-xs font-semibold text-amber-400">₹{fmt(totalPending)}</p>
//                                                     : <span className="text-xs font-semibold text-emerald-400">Cleared</span>}
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[item.status || "pending"].cls}`}>
//                                                     {statusConfig[item.status || "pending"].label}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
//                                                 {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <div className="flex items-center justify-center gap-2">
//                                                     <button onClick={() => setViewModal(item)}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all" title="View Details">
//                                                         <Eye size={15} />
//                                                     </button>
//                                                     {permissions.delete && (
//                                                         <button onClick={() => setDeleteModal({ open: true, item })}
//                                                             className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all" title="Delete">
//                                                             <Trash2 size={15} />
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
//                         <div className="flex items-center gap-2">
//                             <span className="text-sm text-slate-400">Rows:</span>
//                             <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
//                                 className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer">
//                                 {[10, 15, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
//                             </select>
//                         </div>
//                         <div className="text-sm text-slate-400">
//                             {sortedData.length > 0
//                                 ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, sortedData.length)} of ${sortedData.length} clients`
//                                 : "No records"}
//                         </div>
//                         <div className="flex items-center gap-1">
//                             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
//                                 className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                                 <ChevronLeft size={16} />
//                             </button>
//                             {(() => {
//                                 let pages: (number | string)[] = [];
//                                 if (totalPages <= 5) pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//                                 else {
//                                     pages.push(1);
//                                     if (currentPage <= 3) pages.push(2, 3, "...", totalPages);
//                                     else if (currentPage >= totalPages - 2) pages.push("...", totalPages - 2, totalPages - 1, totalPages);
//                                     else pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
//                                 }
//                                 return pages.map((page, i) =>
//                                     page === "..." ? (
//                                         <span key={`d-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs">•••</span>
//                                     ) : (
//                                         <button key={`p-${page}`} onClick={() => setCurrentPage(page as number)}
//                                             className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${currentPage === page ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`}>
//                                             {page}
//                                         </button>
//                                     )
//                                 );
//                             })()}
//                             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
//                                 className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                                 <ChevronRight size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Modals */}
//             {createModal && <CreateClientModal BASE_URL={BASE_URL} onClose={() => setCreateModal(false)} onSuccess={fetchClients} />}
//             {viewModal && <ViewClientModal client={viewModal} onClose={() => setViewModal(null)} />}

//             {deleteModal.open && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
//                         <div className="text-center">
//                             <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                                 <Trash2 className="w-7 h-7 text-red-400" />
//                             </div>
//                             <h3 className="text-lg font-bold text-white mb-2">Delete Client?</h3>
//                             <p className="text-slate-400 text-sm mb-6">
//                                 Are you sure you want to remove <span className="text-white font-semibold">{deleteModal.item?.name}</span>? This cannot be undone.
//                             </p>
//                             <div className="flex gap-3">
//                                 <button onClick={() => setDeleteModal({ open: false, item: null })} disabled={deleting}
//                                     className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-700 transition-colors">
//                                     Cancel
//                                 </button>
//                                 <button onClick={confirmDelete} disabled={deleting}
//                                     className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20">
//                                     {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Clients;



// "use client";
// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../../store/store';
// import { fetchRolePermissionsSidebar } from '../../../store/sidebarPermissionSlice';
// import { fetchPermissions } from '../../../store/permissionSlice';
// import {
//     Search, ChevronLeft, ChevronRight, Eye, X, Trash2, Loader2,
//     AlertTriangle, Users, Plus,
//     CheckCircle2, ChevronDown, IndianRupee, Calendar, Building2, Hash, XCircle
// } from "lucide-react";
// import { toast } from "react-toastify";
// import PaymentReceipt from ".././components/Common/PaymentReceiptDownload"; // adjust path as needed
// import type { ReceiptData } from ".././components/Common/PaymentReceiptDownload"; // adjust path as needed


// // ─── Types ────────────────────────────────────────────────────────────────────

// type Client = {
//     id: number;
//     name: string;
//     phone: string;
//     status: "active" | "pending" | "inactive";
//     totalPlotAmount: string;
//     onlineAmount: string;
//     creditPlotAmount: string;
//     onlinePaid: string;
//     onlinePending: string;
//     creditPaid: string;
//     creditPending: string;
//     createdAt: string;
//     bookingNumber: string;
//     bookingDate: string;
//     projectName: string;
//     plotNumber: string;
//     address?: string;
//     createdByName?: string;
// };

// type UserBooking = {
//     id: number;
//     bookingNumber?: string;
//     clientName?: string;
//     plotNumber?: string;
//     projectName?: string;
//     [key: string]: any;
// };

// type PaymentPlan = {
//     id: number;
//     planName?: string;
//     name?: string;
//     description?: string;
//     [key: string]: any;
// };

// type PaymentPlatform = {
//     id: number;
//     platform_name: string;
// };

// type Installment = {
//     id: number;
//     clientId: number;
//     phaseName: string;
//     installmentNumber: number;
//     dueDate: string;
//     amount: string;
//     paidAmount: string;
//     remainingAmount: string;
//     status: "paid" | "partial" | "overdue" | "pending" | "approved" | "rejected" | "review";
//     bookingNumber?: string;
//     payment_reference?: string;
//     payment_platform_id?: number;
//     paymentPlatformName?: string;
//     transactionDate?: string;
// };

// type SortConfig = { key: keyof Client | null; direction: "asc" | "desc" };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const getAuthToken = (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("accessToken") || localStorage.getItem("token");
// };

// const getUserRole = (): string => {
//     if (typeof window === "undefined") return "";
//     return (localStorage.getItem("role") || "").trim();
// };

// const getBaseUrl = () => {
//     if (typeof window !== 'undefined') {
//         const h = window.location.hostname;
//         if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:8000';
//     }
//     return 'https://backend.rscgroupdholera.in';
// };

// const fmt = (val: string | number) =>
//     Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// const fmtAmt = (val: string | number) => {
//     const num = typeof val === "string" ? parseFloat(val) : val;
//     if (isNaN(num)) return "—";
//     return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const statusConfig = {
//     active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
//     pending: { label: "Pending", cls: "bg-amber-500/15   text-amber-400   border border-amber-500/30" },
//     inactive: { label: "Inactive", cls: "bg-slate-500/15   text-slate-400   border border-slate-500/30" },
// };

// const instStatusConfig: Record<string, { label: string; cls: string }> = {
//     paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
//     partial: { label: "Partial", cls: "bg-blue-500/15    text-blue-400    border border-blue-500/30" },
//     overdue: { label: "Overdue", cls: "bg-red-500/15     text-red-400     border border-red-500/30" },
//     pending: { label: "Pending", cls: "bg-amber-500/15   text-amber-400   border border-amber-500/30" },
//     approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
//     rejected: { label: "Rejected", cls: "bg-red-500/15     text-red-400     border border-red-500/30" },
//     review: { label: "In Review", cls: "bg-blue-500/15    text-blue-400    border border-blue-500/30" },
// };

// // ─── Number to Words ──────────────────────────────────────────────────────────

// const numberToWords = (num: number): string => {
//     if (!num || num === 0) return "Zero Rupees Only";
//     const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
//     const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//     const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
//     const cvt = (n: number): string => {
//         if (n === 0) return "";
//         if (n < 10) return ones[n];
//         if (n < 20) return teens[n - 10];
//         if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
//         return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + cvt(n % 100) : "");
//     };
//     const intNum = Math.floor(num);
//     let w = "";
//     const cr = Math.floor(intNum / 10000000); if (cr > 0) w += cvt(cr) + " Crore ";
//     const lk = Math.floor((intNum % 10000000) / 100000); if (lk > 0) w += cvt(lk) + " Lakh ";
//     const th = Math.floor((intNum % 100000) / 1000); if (th > 0) w += cvt(th) + " Thousand ";
//     const rm = intNum % 1000; if (rm > 0) w += cvt(rm) + " ";
//     return w.trim() + " Rupees Only";
// };

// // ─── Searchable Dropdown ──────────────────────────────────────────────────────

// interface DropdownOption { value: number; label: string; sub?: string; }

// const SearchableDropdown = ({
//     options, value, onChange, placeholder, loading, disabled, onOpen
// }: {
//     options: DropdownOption[];
//     value: number | "";
//     onChange: (val: number | "") => void;
//     placeholder: string;
//     loading?: boolean;
//     disabled?: boolean;
//     onOpen?: () => void;
// }) => {
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState("");
//     const ref = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, []);

//     const filtered = options.filter(o =>
//         o.label.toLowerCase().includes(search.toLowerCase()) ||
//         (o.sub || "").toLowerCase().includes(search.toLowerCase())
//     );
//     const selected = options.find(o => o.value === value);

//     const handleOpen = () => {
//         if (disabled || loading) return;
//         const next = !open;
//         setOpen(next);
//         if (next) { setSearch(""); onOpen?.(); }
//     };

//     return (
//         <div ref={ref} className="relative">
//             <button type="button" onClick={handleOpen} disabled={disabled}
//                 className="w-full h-10 px-3 pr-9 rounded-xl bg-slate-800 border border-slate-700 text-left text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
//                 {loading ? (
//                     <span className="text-slate-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</span>
//                 ) : selected ? (
//                     <span className="text-slate-200 truncate">{selected.label}</span>
//                 ) : (
//                     <span className="text-slate-500">{placeholder}</span>
//                 )}
//                 <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
//             </button>
//             {open && (
//                 <div className="absolute z-50 mt-1.5 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
//                     <div className="p-2 border-b border-slate-700">
//                         <div className="relative">
//                             <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                             <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
//                                 placeholder="Search..." className="w-full h-8 pl-7 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500" />
//                         </div>
//                     </div>
//                     <div className="max-h-52 overflow-y-auto">
//                         {loading ? (
//                             <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-xs">
//                                 <Loader2 size={14} className="animate-spin" /> Loading...
//                             </div>
//                         ) : filtered.length === 0 ? (
//                             <p className="text-center text-slate-500 text-xs py-4">No results</p>
//                         ) : filtered.map(o => (
//                             <button key={o.value} type="button"
//                                 onClick={() => { onChange(o.value); setOpen(false); }}
//                                 className={`w-full text-left px-3 py-2.5 hover:bg-slate-700 transition-colors ${value === o.value ? "bg-orange-500/10" : ""}`}>
//                                 <p className={`text-xs font-semibold ${value === o.value ? "text-orange-400" : "text-slate-200"}`}>{o.label}</p>
//                                 {o.sub && <p className="text-slate-500 text-xs mt-0.5">{o.sub}</p>}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // ─── Progress Bar ─────────────────────────────────────────────────────────────

// const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
//     const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
//     const color = pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-slate-600";
//     return (
//         <div className="w-full">
//             <div className="flex justify-between text-xs text-slate-500 mb-1">
//                 <span>{fmtAmt(paid)} <span className="text-slate-600">paid</span></span>
//                 <span>{Math.round(pct)}%</span>
//             </div>
//             <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
//                 <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
//             </div>
//         </div>
//     );
// };

// // ─── View Client Modal ────────────────────────────────────────────────────────

// const ViewClientModal = ({
//     client,
//     onClose,
//     BASE_URL,
//     onOpenReceipt,
// }: {
//     client: Client;
//     onClose: () => void;
//     BASE_URL: string;
//     onOpenReceipt: (data: ReceiptData) => void;
// }) => {
//     const [tab, setTab] = useState<"info" | "installments">("info");
//     const [installments, setInstallments] = useState<Installment[]>([]);
//     const [loadingInst, setLoadingInst] = useState(false);
//     const [actionLoading, setActionLoading] = useState<number | null>(null);

//     // ── Role ──────────────────────────────────────────────────────────────────
//     const userRole = getUserRole();
//     const isAdmin = userRole === "Admin";
//     const isAccountant = userRole === "Accountant";
//     const isAssistant = userRole === "Assistant Accountant";
//     const canSeeActions = isAdmin || isAccountant || isAssistant;

//     // ── Submit-review modal state ─────────────────────────────────────────────
//     const [reviewInst, setReviewInst] = useState<Installment | null>(null);
//     const [payRef, setPayRef] = useState("");
//     const [platformId, setPlatformId] = useState<number | "">("");
//     const [platforms, setPlatforms] = useState<PaymentPlatform[]>([]);
//     const [loadingPlatforms, setLoadingPlatforms] = useState(false);
//     const [submittingReview, setSubmittingReview] = useState(false);

//     // ── Fetch installments ────────────────────────────────────────────────────
//     const fetchInstallments = async () => {
//         setLoadingInst(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/installments/${client.id}/installments`, {
//                 headers: { "Authorization": `Bearer ${token}` },
//             });
//             const json = await res.json();
//             setInstallments(
//                 Array.isArray(json.installments) ? json.installments :
//                     Array.isArray(json.data) ? json.data : []
//             );
//         } catch { toast.error("Failed to load installments"); }
//         finally { setLoadingInst(false); }
//     };

//     // ── Fetch payment platforms ───────────────────────────────────────────────
//     const fetchPlatforms = async () => {
//         if (platforms.length > 0) return;
//         setLoadingPlatforms(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/payment/get-payment-Platforms`, {
//                 headers: { "Authorization": `Bearer ${token}` },
//             });
//             const json = await res.json();
//             setPlatforms(Array.isArray(json.data?.platforms) ? json.data.platforms : []);
//         } catch { toast.error("Failed to load platforms"); }
//         finally { setLoadingPlatforms(false); }
//     };

//     const handleTabChange = (t: "info" | "installments") => {
//         setTab(t);
//         if (t === "installments" && installments.length === 0 && !loadingInst) fetchInstallments();
//     };

//     // ── Build ReceiptData and pass to parent ──────────────────────────────────
//     const buildAndOpenReceipt = (inst: Installment) => {
//         const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
//         const paidNum = parseFloat(inst.paidAmount || "0");
//         const platName = inst.paymentPlatformName
//             || platforms.find(p => p.id === inst.payment_platform_id)?.platform_name
//             || "—";
//         const receiptData: ReceiptData = {
//             receiptNo: String(inst.id),
//             receiptDate: today,
//             name: client.name,
//             receivedAmount: `₹${fmt(paidNum)} (${numberToWords(paidNum)})`,
//             plotNo: client.plotNumber,
//             projectName: client.projectName,
//             bookingDate: new Date(client.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
//             paymentCondition: "45 Days",
//             address: client.address || "",
//             payments: [{
//                 paymentBy: platName,
//                 transactionDate: inst.transactionDate || today,
//                 bank: "—",
//                 transactionNo: inst.payment_reference || "—",
//                 branch: "—",
//                 amount: fmt(paidNum),
//             }],
//         };
//         onOpenReceipt(receiptData);
//     };

//     // ── Accountant / Admin: approve or reject (only when status === "review") ─
//     const handleAction = async (instId: number, action: "approve" | "reject") => {
//         setActionLoading(instId);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/installments/installment/${instId}/${action}`, {
//                 method: "PUT",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//             });
//             const json = await res.json();
//             if (res.ok) {
//                 const newStatus = action === "approve" ? "approved" : "rejected";
//                 toast.success(`Installment ${newStatus} successfully`);
//                 setInstallments(prev =>
//                     prev.map(i => i.id === instId ? { ...i, status: newStatus as Installment["status"] } : i)
//                 );
//                 // Show receipt on approve
//                 if (action === "approve") {
//                     const inst = installments.find(i => i.id === instId);
//                     if (inst) buildAndOpenReceipt(inst);
//                 }
//             } else { toast.error(json?.message || "Action failed"); }
//         } catch { toast.error("Network error"); }
//         finally { setActionLoading(null); }
//     };

//     // ── Assistant Accountant: open submit-review modal ────────────────────────
//     const openReview = (inst: Installment) => {
//         setReviewInst(inst);
//         setPayRef("");
//         setPlatformId("");
//         fetchPlatforms();
//     };

//     // ── Submit for review ─────────────────────────────────────────────────────
//     const submitReview = async () => {
//         if (!reviewInst) return;
//         if (!payRef.trim()) { toast.error("Payment reference is required"); return; }
//         if (!platformId) { toast.error("Please select a payment platform"); return; }
//         setSubmittingReview(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/installments/installment/${reviewInst.id}/submit-review`, {
//                 method: "PUT",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//                 body: JSON.stringify({ payment_reference: payRef, payment_platform_id: platformId }),
//             });
//             const json = await res.json();
//             if (res.ok) {
//                 toast.success("Submitted for review successfully");
//                 setInstallments(prev =>
//                     prev.map(i => i.id === reviewInst.id
//                         ? { ...i, status: "review", payment_reference: payRef, payment_platform_id: platformId as number }
//                         : i
//                     )
//                 );
//                 setReviewInst(null);
//             } else { toast.error(json?.message || "Submission failed"); }
//         } catch { toast.error("Network error"); }
//         finally { setSubmittingReview(false); }
//     };

//     return (
//         <>
//             {/* ── Main Modal ── */}
//             <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                 <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">

//                     {/* Header */}
//                     <div className="p-5 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0">
//                         <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                                 {client.name?.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                                 <p className="font-bold text-white">{client.name}</p>
//                                 <p className="text-xs text-slate-500 font-mono">{client.phone} · {client.bookingNumber}</p>
//                             </div>
//                         </div>
//                         <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
//                             <X size={18} />
//                         </button>
//                     </div>

//                     {/* Tabs */}
//                     <div className="flex border-b border-slate-700/60 flex-shrink-0 px-5 pt-1">
//                         {([["info", "Client Info"], ["installments", "Installment Plan"]] as const).map(([key, label]) => (
//                             <button key={key} onClick={() => handleTabChange(key)}
//                                 className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${tab === key ? "border-orange-500 text-orange-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
//                                 {label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Body */}
//                     <div className="overflow-y-auto flex-1 p-5 min-h-0">

//                         {/* ── Info Tab ── */}
//                         {tab === "info" && (
//                             <div className="space-y-4">
//                                 <div className="grid grid-cols-2 gap-3">
//                                     {[
//                                         { icon: Hash, color: "text-orange-400", label: "Booking No.", value: client.bookingNumber },
//                                         { icon: Building2, color: "text-blue-400", label: "Project / Plot", value: `${client.projectName} · #${client.plotNumber}` },
//                                         { icon: Calendar, color: "text-purple-400", label: "Booking Date", value: new Date(client.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
//                                         { icon: IndianRupee, color: "text-emerald-400", label: "Total Amount", value: `₹${fmt(client.totalPlotAmount)}` },
//                                     ].map(({ icon: Icon, color, label, value }) => (
//                                         <div key={label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 flex items-start gap-2.5">
//                                             <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
//                                             <div>
//                                                 <p className="text-xs text-slate-500">{label}</p>
//                                                 <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
//                                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 border-b border-slate-700/40">Payment Breakdown</p>
//                                     {[
//                                         { label: "Online", total: client.onlineAmount, paid: client.onlinePaid, pending: client.onlinePending, color: "text-blue-400" },
//                                         { label: "Credit", total: client.creditPlotAmount, paid: client.creditPaid, pending: client.creditPending, color: "text-purple-400" },
//                                     ].map(row => (
//                                         <div key={row.label} className="px-4 py-3 grid grid-cols-3 gap-2 text-xs border-b border-slate-700/20 last:border-0">
//                                             <div><p className="text-slate-500">{row.label} Total</p><p className={`font-semibold mt-0.5 ${row.color}`}>₹{fmt(row.total)}</p></div>
//                                             <div><p className="text-slate-500">Paid</p><p className="font-semibold mt-0.5 text-emerald-400">₹{fmt(row.paid)}</p></div>
//                                             <div><p className="text-slate-500">Pending</p><p className="font-semibold mt-0.5 text-amber-400">₹{fmt(row.pending)}</p></div>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div className="flex items-center justify-between px-1">
//                                     <span className="text-xs text-slate-500">Status</span>
//                                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig[client.status || "pending"].cls}`}>
//                                         {statusConfig[client.status || "pending"].label}
//                                     </span>
//                                 </div>
//                             </div>
//                         )}

//                         {/* ── Installments Tab ── */}
//                         {tab === "installments" && (
//                             <div>
//                                 {loadingInst ? (
//                                     <div className="flex flex-col items-center justify-center py-16 gap-3">
//                                         <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
//                                         <p className="text-slate-400 text-sm animate-pulse">Loading installments...</p>
//                                     </div>
//                                 ) : installments.length === 0 ? (
//                                     <div className="flex flex-col items-center justify-center py-16 text-slate-500">
//                                         <IndianRupee size={40} className="mb-3 opacity-30" />
//                                         <p className="text-sm">No installment records found</p>
//                                     </div>
//                                 ) : (() => {
//                                     const totalCollected = installments.reduce((s, i) => s + (parseFloat(i.paidAmount) || 0), 0);
//                                     const totalOutstanding = installments.reduce((s, i) => s + (parseFloat(i.remainingAmount) || 0), 0);
//                                     const countByStatus: Record<string, number> = {};
//                                     installments.forEach(i => { countByStatus[i.status] = (countByStatus[i.status] || 0) + 1; });

//                                     return (
//                                         <div className="space-y-4">
//                                             {/* Summary Banner */}
//                                             <div className="grid grid-cols-2 gap-2">
//                                                 <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/30 rounded-xl p-3 flex items-center gap-3">
//                                                     <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
//                                                         <IndianRupee size={14} className="text-white" />
//                                                     </div>
//                                                     <div>
//                                                         <p className="text-sm font-bold text-emerald-400">{fmtAmt(totalCollected)}</p>
//                                                         <p className="text-xs text-emerald-700 font-medium">Collected</p>
//                                                     </div>
//                                                 </div>
//                                                 <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/30 rounded-xl p-3 flex items-center gap-3">
//                                                     <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center flex-shrink-0">
//                                                         <IndianRupee size={14} className="text-white" />
//                                                     </div>
//                                                     <div>
//                                                         <p className="text-sm font-bold text-red-400">{fmtAmt(totalOutstanding)}</p>
//                                                         <p className="text-xs text-red-700 font-medium">Outstanding</p>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Status chips */}
//                                             <div className="flex flex-wrap gap-1.5">
//                                                 {[
//                                                     { key: "paid", label: "Paid", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
//                                                     { key: "partial", label: "Partial", cls: "bg-blue-500/10    text-blue-400    border-blue-500/30" },
//                                                     { key: "pending", label: "Pending", cls: "bg-amber-500/10   text-amber-400   border-amber-500/30" },
//                                                     { key: "overdue", label: "Overdue", cls: "bg-red-500/10     text-red-400     border-red-500/30" },
//                                                     { key: "review", label: "In Review", cls: "bg-blue-500/10    text-blue-400    border-blue-500/30" },
//                                                     { key: "approved", label: "Approved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
//                                                     { key: "rejected", label: "Rejected", cls: "bg-red-500/10     text-red-400     border-red-500/30" },
//                                                 ].filter(s => (countByStatus[s.key] || 0) > 0).map(s => (
//                                                     <span key={s.key} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
//                                                         {s.label}: {countByStatus[s.key]}
//                                                     </span>
//                                                 ))}
//                                                 <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-700/50 text-slate-400 border-slate-600">
//                                                     Total: {installments.length}
//                                                 </span>
//                                             </div>

//                                             {/* Installment Cards */}
//                                             <div className="space-y-3">
//                                                 {installments.map((inst) => {
//                                                     const total = parseFloat(inst.amount || "0");
//                                                     const paid = parseFloat(inst.paidAmount || "0");
//                                                     const remaining = parseFloat(inst.remainingAmount || "0");
//                                                     const isOverdue = inst.dueDate && new Date(inst.dueDate) < new Date() && inst.status !== "paid";
//                                                     const sc = instStatusConfig[inst.status] ?? instStatusConfig.pending;
//                                                     const isActing = actionLoading === inst.id;

//                                                     const isInReview = inst.status === "review";
//                                                     const isActionable = inst.status === "pending" || inst.status === "partial" || inst.status === "overdue";
//                                                     const isDone = inst.status === "paid" || inst.status === "approved" || inst.status === "rejected";

//                                                     return (
//                                                         <div key={inst.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
//                                                             {/* Top row */}
//                                                             <div className="flex items-center justify-between gap-2 flex-wrap">
//                                                                 <div className="flex items-center gap-2 flex-wrap">
//                                                                     <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
//                                                                         ID: {inst.id}
//                                                                     </span>
//                                                                     <span className="capitalize text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-lg border border-slate-600">
//                                                                         {inst.phaseName}
//                                                                     </span>
//                                                                     {inst.dueDate && (
//                                                                         <span className={`text-xs px-2 py-1 rounded-lg ${isOverdue ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-slate-400 bg-slate-800 border border-slate-700"}`}>
//                                                                             Due: {new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//                                                                             {isOverdue && " ⚠"}
//                                                                         </span>
//                                                                     )}
//                                                                 </div>
//                                                                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
//                                                             </div>

//                                                             {/* Progress */}
//                                                             <ProgressBar paid={paid} total={total} />

//                                                             {/* Amount grid */}
//                                                             <div className="grid grid-cols-3 gap-2">
//                                                                 <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
//                                                                     <p className="text-xs text-slate-500 mb-0.5">Amount</p>
//                                                                     <p className="text-xs font-bold text-slate-200">{fmtAmt(inst.amount)}</p>
//                                                                 </div>
//                                                                 <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
//                                                                     <p className="text-xs text-slate-500 mb-0.5">Paid</p>
//                                                                     <p className="text-xs font-bold text-emerald-400">{fmtAmt(inst.paidAmount)}</p>
//                                                                 </div>
//                                                                 <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
//                                                                     <p className="text-xs text-slate-500 mb-0.5">Remaining</p>
//                                                                     <p className={`text-xs font-bold ${remaining > 0 ? "text-red-400" : "text-emerald-400"}`}>{fmtAmt(inst.remainingAmount)}</p>
//                                                                 </div>
//                                                             </div>

//                                                             {/* ── Role-based Action Buttons ── */}
//                                                             {canSeeActions && (() => {
//                                                                 // Approved: show receipt button for all roles
//                                                                 if (inst.status === "approved") {
//                                                                     return (
//                                                                         <button
//                                                                             onClick={() => buildAndOpenReceipt(inst)}
//                                                                             className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
//                                                                         >
//                                                                             <CheckCircle2 size={13} /> View / Download Receipt
//                                                                         </button>
//                                                                     );
//                                                                 }
//                                                                 // paid / rejected → no buttons
//                                                                 if (isDone) return null;

//                                                                 // ONLY Assistant Accountant: Submit for Review
//                                                                 if (isAssistant && isActionable) {
//                                                                     return (
//                                                                         <button
//                                                                             onClick={() => openReview(inst)}
//                                                                             disabled={isActing}
//                                                                             className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
//                                                                         >
//                                                                             <IndianRupee size={13} /> Submit Payment for Review
//                                                                         </button>
//                                                                     );
//                                                                 }
//                                                                 // Admin OR Accountant: Approve / Reject only when status === "review"
//                                                                 if ((isAdmin || isAccountant) && isInReview) {
//                                                                     return (
//                                                                         <div className="flex gap-2 pt-1">
//                                                                             <button
//                                                                                 onClick={() => handleAction(inst.id, "approve")}
//                                                                                 disabled={isActing}
//                                                                                 className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
//                                                                             >
//                                                                                 {isActing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
//                                                                                 Approve
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => handleAction(inst.id, "reject")}
//                                                                                 disabled={isActing}
//                                                                                 className="flex-1 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/10"
//                                                                             >
//                                                                                 {isActing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
//                                                                                 Reject
//                                                                             </button>
//                                                                         </div>
//                                                                     );
//                                                                 }
//                                                                 return null;
//                                                             })()}
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     );
//                                 })()}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* ── Submit Review Modal ── */}
//             {reviewInst && (
//                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
//                     <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-base font-bold text-white">Submit Payment for Review</h3>
//                             <button onClick={() => setReviewInst(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
//                                 <X size={16} />
//                             </button>
//                         </div>
//                         <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400">
//                             <span className="text-orange-400 font-bold">ID: {reviewInst.id}</span>
//                             {" · "}<span className="capitalize">{reviewInst.phaseName}</span>
//                             {" · "}<span className="text-slate-200 font-semibold">{fmtAmt(reviewInst.amount)}</span>
//                         </div>
//                         <div className="space-y-3">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-300 mb-1.5">
//                                     Payment Reference <span className="text-red-400">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={payRef}
//                                     onChange={e => setPayRef(e.target.value)}
//                                     placeholder="e.g. TXN123456789"
//                                     className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-300 mb-1.5">
//                                     Payment Platform <span className="text-red-400">*</span>
//                                 </label>
//                                 <div className="relative">
//                                     <select
//                                         value={platformId}
//                                         onChange={e => setPlatformId(e.target.value ? Number(e.target.value) : "")}
//                                         disabled={loadingPlatforms}
//                                         className="w-full h-10 pl-3 pr-8 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 appearance-none disabled:opacity-50 cursor-pointer"
//                                     >
//                                         <option value="">{loadingPlatforms ? "Loading..." : "Select Platform"}</option>
//                                         {platforms.map(p => (
//                                             <option key={p.id} value={p.id}>{p.platform_name}</option>
//                                         ))}
//                                     </select>
//                                     <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex gap-3 pt-1">
//                             <button
//                                 onClick={() => setReviewInst(null)}
//                                 disabled={submittingReview}
//                                 className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm border border-slate-700 disabled:opacity-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={submitReview}
//                                 disabled={submittingReview || !payRef.trim() || !platformId}
//                                 className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
//                             >
//                                 {submittingReview
//                                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                                     : "Submit for Review"
//                                 }
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// // ─── Create Client Modal ───────────────────────────────────────────────────────

// const CreateClientModal = ({ onClose, onSuccess, BASE_URL }: { onClose: () => void; onSuccess: () => void; BASE_URL: string }) => {
//     const [bookings, setBookings] = useState<UserBooking[]>([]);
//     const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
//     const [loadingBookings, setLoadingBookings] = useState(false);
//     const [loadingPlans, setLoadingPlans] = useState(true);
//     const [bookingsLoaded, setBookingsLoaded] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     const [selectedBookingId, setSelectedBookingId] = useState<number | "">("");
//     const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");

//     useEffect(() => {
//         (async () => {
//             try {
//                 const token = getAuthToken();
//                 const res = await fetch(`${BASE_URL}/payment_plan/get-all-payment-plans`, {
//                     headers: { "Authorization": `Bearer ${token}` }
//                 });
//                 const json = await res.json();
//                 const d = json.data?.plans || json.data || [];
//                 setPaymentPlans(Array.isArray(d) ? d : []);
//             } catch { toast.error("Failed to load payment plans"); }
//             finally { setLoadingPlans(false); }
//         })();
//     }, [BASE_URL]);

//     const loadBookings = async () => {
//         if (bookingsLoaded || loadingBookings) return;
//         setLoadingBookings(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/get-user-booking`, {
//                 headers: { "Authorization": `Bearer ${token}` }
//             });
//             const json = await res.json();
//             setBookings(Array.isArray(json.data) ? json.data : []);
//             setBookingsLoaded(true);
//         } catch { toast.error("Failed to load bookings"); }
//         finally { setLoadingBookings(false); }
//     };

//     const bookingOptions: DropdownOption[] = bookings.map(b => ({
//         value: b.id,
//         label: `#${b.id} · ${b.name || b.clientName || "Unknown"}`,
//         sub: [b.phone, b.bookingNumber, b.projectName && `${b.projectName}${b.plotNumber ? ` · Plot ${b.plotNumber}` : ""}`].filter(Boolean).join(" · "),
//     }));

//     const planOptions: DropdownOption[] = paymentPlans.map(p => ({
//         value: p.id,
//         label: p.planName || p.name || `Plan #${p.id}`,
//         sub: p.description,
//     }));

//     const handleSubmit = async () => {
//         if (!selectedBookingId || !selectedPlanId) { toast.error("Please select both a booking and a payment plan"); return; }
//         setSubmitting(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/create-client`, {
//                 method: "POST",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//                 body: JSON.stringify({ bookingId: selectedBookingId, paymentPlanId: selectedPlanId }),
//             });
//             const json = await res.json();
//             if (res.ok) { toast.success("Client created successfully!"); onSuccess(); onClose(); }
//             else { toast.error(json?.message || "Failed to create client"); }
//         } catch { toast.error("Network error while creating client"); }
//         finally { setSubmitting(false); }
//     };

//     const selBooking = bookings.find(b => b.id === selectedBookingId);
//     const selPlan = paymentPlans.find(p => p.id === selectedPlanId);

//     return (
//         <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
//                 <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
//                             <Plus size={18} className="text-orange-400" />
//                         </div>
//                         <div>
//                             <h2 className="text-base font-bold text-white">Create New Client</h2>
//                             <p className="text-xs text-slate-500">Link a booking with a payment plan</p>
//                         </div>
//                     </div>
//                     <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
//                         <X size={18} />
//                     </button>
//                 </div>
//                 <div className="p-5 space-y-4">
//                     <div className="space-y-2">
//                         <label className="block text-sm font-semibold text-slate-300">User Booking <span className="text-red-400">*</span></label>
//                         <SearchableDropdown options={bookingOptions} value={selectedBookingId} onChange={setSelectedBookingId}
//                             placeholder="Click to select a booking" loading={loadingBookings} onOpen={loadBookings} />
//                         {bookingsLoaded && bookings.length === 0 && <p className="text-xs text-slate-500">No bookings available</p>}
//                     </div>
//                     <div className="space-y-2">
//                         <label className="block text-sm font-semibold text-slate-300">Payment Plan <span className="text-red-400">*</span></label>
//                         <SearchableDropdown options={planOptions} value={selectedPlanId} onChange={setSelectedPlanId}
//                             placeholder="Select a payment plan" loading={loadingPlans} disabled={loadingPlans} />
//                     </div>
//                     {selectedBookingId && selectedPlanId && (
//                         <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
//                             <div className="flex items-center gap-2">
//                                 <CheckCircle2 size={14} className="text-emerald-400" />
//                                 <span className="text-xs font-semibold text-emerald-400">Ready to create</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                                 <div className="bg-slate-900/60 rounded-lg p-2.5">
//                                     <p className="text-slate-500 mb-0.5">Booking</p>
//                                     <p className="text-slate-200 font-semibold truncate">{selBooking?.bookingNumber || `#${selectedBookingId}`}</p>
//                                 </div>
//                                 <div className="bg-slate-900/60 rounded-lg p-2.5">
//                                     <p className="text-slate-500 mb-0.5">Payment Plan</p>
//                                     <p className="text-slate-200 font-semibold truncate">{selPlan?.planName || selPlan?.name || `Plan #${selectedPlanId}`}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//                 <div className="px-5 pb-5 flex gap-3">
//                     <button onClick={onClose} disabled={submitting}
//                         className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-700 transition-colors">
//                         Cancel
//                     </button>
//                     <button onClick={handleSubmit} disabled={submitting || loadingPlans || !selectedBookingId || !selectedPlanId}
//                         className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
//                         {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Client</>}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const Clients = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const BASE_URL = getBaseUrl();

//     const [data, setData] = useState<Client[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
//     const [projectFilter, setProjectFilter] = useState<string>("all");
//     const [plotFilter, setPlotFilter] = useState<string>("all");
//     const [viewModal, setViewModal] = useState<Client | null>(null);
//     const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Client | null }>({ open: false, item: null });
//     const [deleting, setDeleting] = useState(false);
//     const [createModal, setCreateModal] = useState(false);

//     // Payment receipt — populated by ViewClientModal after approve
//     const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

//     const { permissions: rolePermissions, loading: roleLoading } = useSelector((state: RootState) => state.sidebarPermissions);

//     useEffect(() => {
//         const token = getAuthToken();
//         if (token) {
//             dispatch(fetchRolePermissionsSidebar());
//             dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
//         } else {
//             setLoading(false);
//             toast.error("Session expired. Please login again.");
//         }
//     }, [dispatch]);

//     const permissions = useMemo(() => {
//         const pagePerm = rolePermissions?.permissions?.find((p: any) => p.pageName === "Clients" || p.pageId === 28);
//         const ids = pagePerm?.permissionIds || [];
//         return { view: ids.includes(17), delete: ids.includes(4), create: ids.includes(21) };
//     }, [rolePermissions]);

//     const fetchClients = async () => {
//         const token = getAuthToken();
//         if (!token || !permissions.view) { if (!roleLoading) setLoading(false); return; }
//         try {
//             const res = await fetch(`${BASE_URL}/client/get-clients`, {
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//             });
//             const json = await res.json();
//             if (res.ok) {
//                 setData(Array.isArray(json.data) ? json.data : []);
//             } else if (json.message === "Invalid token") {
//                 localStorage.removeItem("accessToken"); window.location.href = "/login";
//             } else {
//                 setData([]); toast.error(json.message || "Failed to fetch clients");
//             }
//         } catch { setData([]); toast.error("Network error"); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { if (!roleLoading) fetchClients(); }, [BASE_URL, roleLoading, permissions.view]); // eslint-disable-line

//     const confirmDelete = async () => {
//         if (!deleteModal.item) return;
//         setDeleting(true);
//         try {
//             const token = getAuthToken();
//             const res = await fetch(`${BASE_URL}/client/get-clients/${deleteModal.item.id}`, {
//                 method: "DELETE",
//                 headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
//             });
//             if (res.ok) {
//                 setData(prev => prev.filter(i => i.id !== deleteModal.item?.id));
//                 setDeleteModal({ open: false, item: null });
//                 toast.success("Client deleted successfully");
//             } else { toast.error("Unauthorized to delete"); }
//         } catch { toast.error("Failed to delete record"); }
//         finally { setDeleting(false); }
//     };

//     const projectOptions = useMemo(() => {
//         const names = Array.from(new Set(data.map(d => d.projectName).filter(Boolean)));
//         return names.sort();
//     }, [data]);

//     const plotOptions = useMemo(() => {
//         const source = projectFilter !== "all" ? data.filter(d => d.projectName === projectFilter) : data;
//         const plots = Array.from(new Set(source.map(d => d.plotNumber).filter(Boolean)));
//         return plots.sort((a, b) => Number(a) - Number(b));
//     }, [data, projectFilter]);

//     const filteredData = useMemo(() => {
//         let r = data;
//         if (projectFilter !== "all") r = r.filter(i => i.projectName === projectFilter);
//         if (plotFilter !== "all") r = r.filter(i => i.plotNumber === plotFilter);
//         if (!searchQuery.trim()) return r;
//         const q = searchQuery.toLowerCase();
//         return r.filter(i =>
//             i.name?.toLowerCase().includes(q) || i.phone?.includes(q) ||
//             i.bookingNumber?.toLowerCase().includes(q) || i.projectName?.toLowerCase().includes(q) ||
//             i.plotNumber?.toLowerCase().includes(q)
//         );
//     }, [data, searchQuery, projectFilter, plotFilter]);

//     const sortedData = useMemo(() => {
//         if (!sortConfig.key) return filteredData;
//         return [...filteredData].sort((a, b) => {
//             const av = a[sortConfig.key!] ?? "", bv = b[sortConfig.key!] ?? "";
//             if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
//             if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [filteredData, sortConfig]);

//     const totalPages = Math.ceil(sortedData.length / rowsPerPage);
//     const paginatedData = useMemo(() => sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [sortedData, currentPage, rowsPerPage]);
//     const handleSort = (key: keyof Client) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

//     const stats = useMemo(() => ({
//         total: data.length,
//         active: data.filter(d => d.status === "active").length,
//         pending: data.filter(d => d.status === "pending").length,
//         inactive: data.filter(d => d.status === "inactive").length,
//         totalAmount: data.reduce((s, d) => s + (parseFloat(d.totalPlotAmount) || 0), 0),
//         totalOnlinePaid: data.reduce((s, d) => s + (parseFloat(d.onlinePaid) || 0), 0),
//         totalCreditPaid: data.reduce((s, d) => s + (parseFloat(d.creditPaid) || 0), 0),
//         totalOnlinePending: data.reduce((s, d) => s + (parseFloat(d.onlinePending) || 0), 0),
//         totalCreditPending: data.reduce((s, d) => s + (parseFloat(d.creditPending) || 0), 0),
//     }), [data]);

//     if (loading || roleLoading) return (
//         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
//             <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
//             <p className="text-slate-400 text-sm font-medium animate-pulse">Loading client data...</p>
//         </div>
//     );

//     if (!permissions.view) return (
//         <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
//             <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-md text-center">
//                 <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
//                     <AlertTriangle className="w-10 h-10 text-amber-500" />
//                 </div>
//                 <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
//                 <p className="text-slate-400">You don't have permission to view this page.</p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* Header */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <div>
//                         <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Clients</h1>
//                         <p className="text-slate-400 text-sm mt-1">Manage all client allotment requests in one place</p>
//                     </div>
//                     {permissions.create && (
//                         <button onClick={() => setCreateModal(true)}
//                             className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25 self-start sm:self-auto">
//                             <Plus size={17} /> Create Client
//                         </button>
//                     )}
//                 </div>

//                 {/* Summary Banner */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                     <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/30 rounded-2xl p-4 flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
//                             <IndianRupee size={18} className="text-white" />
//                         </div>
//                         <div>
//                             <p className="text-lg font-bold text-emerald-400">
//                                 ₹{(stats.totalOnlinePaid + stats.totalCreditPaid).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//                             </p>
//                             <p className="text-xs text-emerald-700 font-medium">Total Collected</p>
//                         </div>
//                     </div>
//                     <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/30 rounded-2xl p-4 flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center flex-shrink-0">
//                             <IndianRupee size={18} className="text-white" />
//                         </div>
//                         <div>
//                             <p className="text-lg font-bold text-red-400">
//                                 ₹{(stats.totalOnlinePending + stats.totalCreditPending).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//                             </p>
//                             <p className="text-xs text-red-700 font-medium">Total Outstanding</p>
//                         </div>
//                     </div>
//                     <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center flex-shrink-0">
//                             <Users size={18} className="text-white" />
//                         </div>
//                         <div>
//                             <p className="text-lg font-bold text-white">{stats.total}</p>
//                             <p className="text-xs text-slate-400 font-medium">Total Clients</p>
//                             <p className="text-xs text-slate-500 mt-0.5">
//                                 <span className="text-emerald-400">{stats.active} active</span>
//                                 {stats.pending > 0 && <span className="text-amber-400"> · {stats.pending} pending</span>}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-orange-500/80 flex items-center justify-center flex-shrink-0">
//                             <IndianRupee size={18} className="text-white" />
//                         </div>
//                         <div>
//                             <p className="text-lg font-bold text-orange-400">
//                                 ₹{stats.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//                             </p>
//                             <p className="text-xs text-slate-400 font-medium">Total Portfolio</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table Card */}
//                 <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
//                     {/* Controls */}
//                     <div className="p-4 sm:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                         <div className="flex items-center gap-2 flex-wrap">
//                             <p className="text-sm text-slate-400 font-medium whitespace-nowrap">{sortedData.length} client{sortedData.length !== 1 ? "s" : ""}</p>
//                             <div className="relative">
//                                 <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setPlotFilter("all"); setCurrentPage(1); }}
//                                     className="h-9 pl-3 pr-8 text-xs rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 cursor-pointer appearance-none transition-all">
//                                     <option value="all">All Projects</option>
//                                     {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
//                                 </select>
//                                 <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
//                             </div>
//                             {projectFilter !== "all" && (
//                                 <div className="relative">
//                                     <select value={plotFilter} onChange={e => { setPlotFilter(e.target.value); setCurrentPage(1); }}
//                                         className="h-9 pl-3 pr-8 text-xs rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 cursor-pointer appearance-none transition-all">
//                                         <option value="all">All Plots</option>
//                                         {plotOptions.map(p => <option key={p} value={p}>Plot #{p}</option>)}
//                                     </select>
//                                     <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
//                                 </div>
//                             )}
//                             {(projectFilter !== "all" || plotFilter !== "all") && (
//                                 <button onClick={() => { setProjectFilter("all"); setPlotFilter("all"); setCurrentPage(1); }}
//                                     className="h-9 px-3 text-xs rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-all flex items-center gap-1.5">
//                                     <X size={11} /> Clear
//                                 </button>
//                             )}
//                         </div>
//                         <div className="relative w-full sm:w-64">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
//                             <input type="text" placeholder="Search name, booking, plot..."
//                                 className="w-full h-9 pl-9 pr-4 text-sm rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 placeholder:text-slate-500 transition-all"
//                                 value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
//                         </div>
//                     </div>

//                     {/* Table */}
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-slate-800/50 border-b border-slate-700/50">
//                                     {[
//                                         { label: "#", sort: null },
//                                         { label: "Client", sort: "name" as keyof Client },
//                                         { label: "Booking", sort: "bookingNumber" as keyof Client },
//                                         { label: "Project / Plot", sort: null },
//                                         { label: "Total Amount", sort: "totalPlotAmount" as keyof Client },
//                                         { label: "Online Pending", sort: null },
//                                         { label: "Credit Pending", sort: null },
//                                         { label: "Created By", sort: null },
//                                         { label: "Status", sort: null },
//                                         { label: "Date", sort: "createdAt" as keyof Client },
//                                         { label: "Actions", sort: null },
//                                     ].map(({ label, sort }) => (
//                                         <th key={label} onClick={sort ? () => handleSort(sort) : undefined}
//                                             className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${sort ? "cursor-pointer hover:text-orange-400 transition-colors select-none" : ""} ${label === "Actions" ? "text-center" : ""}`}>
//                                             {label}{sort ? " ↕" : ""}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-800">
//                                 {paginatedData.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={11} className="text-center py-16 text-slate-500">
//                                             <Users size={40} className="mx-auto mb-3 opacity-30" />
//                                             <p className="text-sm">No clients found</p>
//                                         </td>
//                                     </tr>
//                                 ) : paginatedData.map((item, idx) => (
//                                     <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
//                                         <td className="px-4 py-3.5 text-slate-500 text-xs">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
//                                         <td className="px-4 py-3.5">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                                                     {item.name?.charAt(0).toUpperCase()}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-medium text-slate-200 whitespace-nowrap">{item.name}</p>
//                                                     <p className="text-xs text-slate-500 font-mono">{item.phone}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <p className="text-xs text-orange-400 font-semibold whitespace-nowrap">{item.bookingNumber}</p>
//                                             <p className="text-xs text-slate-500 mt-0.5">{new Date(item.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <p className="text-xs text-slate-200 font-semibold whitespace-nowrap">{item.projectName}</p>
//                                             <p className="text-xs text-slate-500">Plot #{item.plotNumber}</p>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <p className="text-xs font-semibold text-emerald-400">₹{fmt(item.totalPlotAmount)}</p>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             {Number(item.onlinePending) > 0
//                                                 ? <p className="text-xs font-semibold text-blue-400">₹{fmt(item.onlinePending)}</p>
//                                                 : <span className="text-xs font-semibold text-emerald-400">Cleared</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             {Number(item.creditPending) > 0
//                                                 ? <p className="text-xs font-semibold text-purple-400">₹{fmt(item.creditPending)}</p>
//                                                 : <span className="text-xs font-semibold text-emerald-400">Cleared</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <p className="text-xs font-semibold text-slate-200">{item.createdByName}</p>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[item.status || "pending"].cls}`}>
//                                                 {statusConfig[item.status || "pending"].label}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
//                                             {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <div className="flex items-center justify-center gap-2">
//                                                 <button onClick={() => setViewModal(item)}
//                                                     className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all" title="View Details">
//                                                     <Eye size={15} />
//                                                 </button>
//                                                 {permissions.delete && (
//                                                     <button onClick={() => setDeleteModal({ open: true, item })}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all" title="Delete">
//                                                         <Trash2 size={15} />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
//                         <div className="flex items-center gap-2">
//                             <span className="text-sm text-slate-400">Rows:</span>
//                             <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
//                                 className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer">
//                                 {[10, 15, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
//                             </select>
//                         </div>
//                         <div className="text-sm text-slate-400">
//                             {sortedData.length > 0
//                                 ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, sortedData.length)} of ${sortedData.length} clients`
//                                 : "No records"}
//                         </div>
//                         <div className="flex items-center gap-1">
//                             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
//                                 className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                                 <ChevronLeft size={16} />
//                             </button>
//                             {(() => {
//                                 let pages: (number | string)[] = [];
//                                 if (totalPages <= 5) pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//                                 else {
//                                     pages.push(1);
//                                     if (currentPage <= 3) pages.push(2, 3, "...", totalPages);
//                                     else if (currentPage >= totalPages - 2) pages.push("...", totalPages - 2, totalPages - 1, totalPages);
//                                     else pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
//                                 }
//                                 return pages.map((page, i) =>
//                                     page === "..." ? (
//                                         <span key={`d-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs">•••</span>
//                                     ) : (
//                                         <button key={`p-${page}`} onClick={() => setCurrentPage(page as number)}
//                                             className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${currentPage === page ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`}>
//                                             {page}
//                                         </button>
//                                     )
//                                 );
//                             })()}
//                             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
//                                 className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                                 <ChevronRight size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ── Modals ── */}
//             {createModal && (
//                 <CreateClientModal BASE_URL={BASE_URL} onClose={() => setCreateModal(false)} onSuccess={fetchClients} />
//             )}
//             {viewModal && (
//                 <ViewClientModal
//                     client={viewModal}
//                     onClose={() => setViewModal(null)}
//                     BASE_URL={BASE_URL}
//                     onOpenReceipt={(data) => setReceiptData(data)}
//                 />
//             )}

//             {/* Payment Receipt — auto-opens after Accountant/Admin approves an installment */}
//             {receiptData && (
//                 <PaymentReceipt
//                     data={receiptData}
//                     onClose={() => setReceiptData(null)}
//                 />
//             )}

//             {deleteModal.open && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
//                         <div className="text-center">
//                             <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                                 <Trash2 className="w-7 h-7 text-red-400" />
//                             </div>
//                             <h3 className="text-lg font-bold text-white mb-2">Delete Client?</h3>
//                             <p className="text-slate-400 text-sm mb-6">
//                                 Are you sure you want to remove <span className="text-white font-semibold">{deleteModal.item?.name}</span>? This cannot be undone.
//                             </p>
//                             <div className="flex gap-3">
//                                 <button onClick={() => setDeleteModal({ open: false, item: null })} disabled={deleting}
//                                     className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-700 transition-colors">
//                                     Cancel
//                                 </button>
//                                 <button onClick={confirmDelete} disabled={deleting}
//                                     className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20">
//                                     {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Clients;






"use client";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchRolePermissionsSidebar } from "../../../store/sidebarPermissionSlice";
import { fetchPermissions } from "../../../store/permissionSlice";
import {
    Search, ChevronLeft, ChevronRight, Eye, X, Loader2,
    AlertTriangle, Users, Plus, CheckCircle2, ChevronDown,
    IndianRupee, Calendar, Building2, Hash, XCircle, Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import PaymentReceipt from ".././components/Common/PaymentReceiptDownload";
import type { ReceiptData } from ".././components/Common/PaymentReceiptDownload";

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = {
    id: number;
    name: string;
    phone: string;
    status: "active" | "pending" | "inactive";
    totalPlotAmount: string;
    onlineAmount: string;
    creditPlotAmount: string;
    onlinePaid: string;
    onlinePending: string;
    creditPaid: string;
    creditPending: string;
    createdAt: string;
    bookingNumber: string;
    bookingDate: string;
    projectName: string;
    plotNumber: string;
    address?: string;
    createdByName?: string;
};

type UserBooking = {
    id: number;
    bookingNumber?: string;
    clientName?: string;
    plotNumber?: string;
    projectName?: string;
    [key: string]: any;
};

type PaymentPlan = {
    id: number;
    planName?: string;
    name?: string;
    description?: string;
    [key: string]: any;
};

type PaymentPlatform = { id: number; platform_name: string };

type Installment = {
    id: number;
    clientId: number;
    phaseName: string;
    installmentNumber: number;
    dueDate: string;
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    status: "paid" | "partial" | "overdue" | "pending" | "approved" | "rejected" | "review";
    bookingNumber?: string;
    payment_reference?: string;
    payment_platform_id?: number;
    bankName?: string;
    paymentPlatform?: string;
    transactionDate?: string;
    paidAt?: string;
    submittedByName?: string;
    approvedByName?: string;
    approved_at?: string;
};

type ClientSummary = {
    totalPlotAmount: string;
    onlineAmount: string;
    creditPlotAmount: string;
    onlinePaid: string;
    onlinePending: string;
    creditPaid: string;
    creditPending: string;
    status: string;
    address?: string;
    bookingDate?: string;
};

type SortConfig = { key: keyof Client | null; direction: "asc" | "desc" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuthToken = (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem("accessToken") || localStorage.getItem("token");

const getUserRole = (): string =>
    typeof window === "undefined" ? "" : (localStorage.getItem("role") || "").trim();

const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        const h = window.location.hostname;
        if (h === "localhost" || h === "127.0.0.1") return "http://localhost:8000";
    }
    return "https://backend.rscgroupdholera.in";
};

const fmt = (val: string | number) =>
    Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtReceipt = (val: string | number) =>
    Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtAmt = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "—";
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const authHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "application/json",
});

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig = {
    active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" },
    inactive: { label: "Inactive", cls: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30" },
};

const instStatusConfig: Record<string, { label: string; cls: string }> = {
    paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
    partial: { label: "Partial", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" },
    overdue: { label: "Overdue", cls: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" },
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" },
    approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" },
    review: { label: "In Review", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" },
};

// ─── Number to Words ──────────────────────────────────────────────────────────

const numberToWords = (num: number): string => {
    if (!num || num === 0) return "Zero Rupees Only";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const cvt = (n: number): string => {
        if (n === 0) return "";
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + cvt(n % 100) : "");
    };
    const intNum = Math.floor(num);
    const paiseNum = Math.round((num - intNum) * 100);
    let w = "";
    const cr = Math.floor(intNum / 10000000); if (cr > 0) w += cvt(cr) + " Crore ";
    const lk = Math.floor((intNum % 10000000) / 100000); if (lk > 0) w += cvt(lk) + " Lakh ";
    const th = Math.floor((intNum % 100000) / 1000); if (th > 0) w += cvt(th) + " Thousand ";
    const rm = intNum % 1000; if (rm > 0) w += cvt(rm) + " ";
    let result = w.trim() + " Rupees";
    if (paiseNum > 0) result += " and " + cvt(paiseNum) + " Paise";
    return result + " Only";
};

// ─── Searchable Dropdown ──────────────────────────────────────────────────────

interface DropdownOption { value: number; label: string; sub?: string }

const SearchableDropdown = ({
    options, value, onChange, placeholder, loading, disabled, onOpen,
}: {
    options: DropdownOption[];
    value: number | "";
    onChange: (val: number | "") => void;
    placeholder: string;
    loading?: boolean;
    disabled?: boolean;
    onOpen?: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.sub || "").toLowerCase().includes(search.toLowerCase())
    );
    const selected = options.find(o => o.value === value);

    const handleOpen = () => {
        if (disabled || loading) return;
        const next = !open;
        setOpen(next);
        if (next) { setSearch(""); onOpen?.(); }
    };

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={handleOpen} disabled={disabled}
                className="w-full h-10 px-3 pr-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                {loading ? (
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Loading...
                    </span>
                ) : selected ? (
                    <span className="text-slate-800 dark:text-slate-200 truncate">{selected.label}</span>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
                )}
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full h-8 pl-7 pr-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500" />
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 dark:text-slate-500 text-xs">
                                <Loader2 size={14} className="animate-spin" /> Loading...
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="text-center text-slate-400 dark:text-slate-500 text-xs py-4">No results</p>
                        ) : filtered.map(o => (
                            <button key={o.value} type="button"
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${value === o.value ? "bg-orange-500/10" : ""}`}>
                                <p className={`text-xs font-semibold ${value === o.value ? "text-orange-500 dark:text-orange-400" : "text-slate-800 dark:text-slate-200"}`}>{o.label}</p>
                                {o.sub && <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">{o.sub}</p>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    const color = pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600";
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mb-1">
                <span>{fmtAmt(paid)} <span className="text-slate-400 dark:text-slate-600">paid</span></span>
                <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ─── View Client Modal ────────────────────────────────────────────────────────

const ViewClientModal = ({
    client, onClose, BASE_URL, onOpenReceipt,
}: {
    client: Client;
    onClose: () => void;
    BASE_URL: string;
    onOpenReceipt: (data: ReceiptData) => void;
}) => {
    const [tab, setTab] = useState<"info" | "installments">("info");
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [clientSummary, setClientSummary] = useState<ClientSummary | null>(null);
    const [loadingInst, setLoadingInst] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [reviewInst, setReviewInst] = useState<Installment | null>(null);
    const [payRef, setPayRef] = useState("");
    const [bankName, setbankName] = useState("");
    const [platformId, setPlatformId] = useState<number | "">("");
    const [platforms, setPlatforms] = useState<PaymentPlatform[]>([]);
    const [loadingPlatforms, setLoadingPlatforms] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const userRole = getUserRole();
    const isAdmin = userRole === "Admin";
    const isAccountant = userRole === "Accountant";
    const isAssistant = userRole === "Assistant Accountant";
    const canSeeActions = isAdmin || isAccountant || isAssistant;

    const fetchInstallments = useCallback(async () => {
        setLoadingInst(true);
        try {
            const res = await fetch(`${BASE_URL}/installments/${client.id}/installments`, { headers: authHeaders() });
            const json = await res.json();
            setInstallments(Array.isArray(json.installments) ? json.installments : Array.isArray(json.data) ? json.data : []);
            if (json.client) setClientSummary(json.client);
        } catch { toast.error("Failed to load installments"); }
        finally { setLoadingInst(false); }
    }, [BASE_URL, client.id]);

    const fetchPlatforms = async () => {
        if (platforms.length > 0) return;
        setLoadingPlatforms(true);
        try {
            const res = await fetch(`${BASE_URL}/payment/get-payment-Platforms`, { headers: authHeaders() });
            const json = await res.json();
            setPlatforms(Array.isArray(json.data?.platforms) ? json.data.platforms : []);
        } catch { toast.error("Failed to load platforms"); }
        finally { setLoadingPlatforms(false); }
    };

    const handleTabChange = (t: "info" | "installments") => {
        setTab(t);
        if (t === "installments" && installments.length === 0 && !loadingInst) fetchInstallments();
    };

    const buildAndOpenReceipt = useCallback((inst: Installment) => {
        const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const paidNum = parseFloat(inst.paidAmount || "0");
        const platName = inst.paymentPlatform || platforms.find(p => p.id === inst.payment_platform_id)?.platform_name || "—";
        const txnDate = inst.paidAt
            ? new Date(inst.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : inst.transactionDate || today;
        const resolvedAddress = clientSummary?.address ?? client.address ?? "";
        const rawBookingDate = clientSummary?.bookingDate ?? client.bookingDate;
        const resolvedBookingDate = rawBookingDate
            ? new Date(rawBookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : today;
        onOpenReceipt({
            receiptNo: String(inst.id),
            receiptDate: inst.approved_at
                ? new Date(inst.approved_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : today,
            name: client.name,
            receivedAmount: `₹${fmtReceipt(paidNum)} (${numberToWords(paidNum)})`,
            plotNo: client.plotNumber,
            projectName: client.projectName,
            bookingDate: resolvedBookingDate,
            paymentCondition: "45 Days",
            address: resolvedAddress,
            payments: [{
                paymentBy: platName,
                transactionDate: txnDate,
                bank: inst.bankName || "—",
                transactionNo: inst.payment_reference || "—",
                branch: "—",
                amount: fmtReceipt(paidNum),
            }],
        });
    }, [client, clientSummary, platforms, onOpenReceipt]);

    const handleAction = async (instId: number, action: "approve" | "reject") => {
        setActionLoading(instId);
        try {
            const res = await fetch(`${BASE_URL}/installments/installment/${instId}/${action}`, {
                method: "PUT", headers: authHeaders(),
            });
            const json = await res.json();
            if (res.ok) {
                toast.success(`Installment ${action === "approve" ? "approved" : "rejected"} successfully`);
                const refreshRes = await fetch(`${BASE_URL}/installments/${client.id}/installments`, { headers: authHeaders() });
                const refreshJson = await refreshRes.json();
                const refreshed: Installment[] = Array.isArray(refreshJson.installments)
                    ? refreshJson.installments
                    : Array.isArray(refreshJson.data) ? refreshJson.data : [];
                setInstallments(refreshed);
                if (refreshJson.client) setClientSummary(refreshJson.client);
                if (action === "approve") {
                    const approvedInst = refreshed.find(i => i.id === instId);
                    if (approvedInst) buildAndOpenReceipt(approvedInst);
                }
            } else { toast.error(json?.message || "Action failed"); }
        } catch { toast.error("Network error"); }
        finally { setActionLoading(null); }
    };

    const openReview = (inst: Installment) => {
        setReviewInst(inst); setPayRef(""); setbankName(""); setPlatformId("");
        fetchPlatforms();
    };

    const submitReview = async () => {
        if (!reviewInst) return;
        if (!payRef.trim()) { toast.error("Payment reference is required"); return; }
        if (!platformId) { toast.error("Please select a payment platform"); return; }
        // if (!bankName.trim()) { toast.error("Bank name is required"); return; }
        setSubmittingReview(true);
        try {
            const res = await fetch(`${BASE_URL}/installments/installment/${reviewInst.id}/submit-review`, {
                method: "PUT", headers: authHeaders(),
                body: JSON.stringify({ installmentId: reviewInst.id, payment_reference: payRef, payment_platform_id: platformId, bankName }),
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Submitted for review successfully");
                setInstallments(prev => prev.map(i =>
                    i.id === reviewInst.id
                        ? { ...i, status: "review", payment_reference: payRef, payment_platform_id: platformId as number, bankName }
                        : i
                ));
                setReviewInst(null);
            } else { toast.error(json?.message || "Submission failed"); }
        } catch { toast.error("Network error"); }
        finally { setSubmittingReview(false); }
    };






    const summary = clientSummary ?? client;

    return (
        <>
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-shrink-0 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {client.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{client.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{client.phone} · {client.bookingNumber}</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700/60 flex-shrink-0 px-4 sm:px-5 pt-1">
                        {(["info", "installments"] as const).map(key => (
                            <button key={key} onClick={() => handleTabChange(key)}
                                className={`px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${key === tab ? "border-orange-500 text-orange-500 dark:text-orange-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                                {key === "info" ? "Client Info" : "Installment Plan"}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 p-4 sm:p-5 min-h-0">

                        {/* Info Tab */}
                        {tab === "info" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Hash, color: "text-orange-500 dark:text-orange-400", label: "Booking No.", value: client.bookingNumber },
                                        { icon: Building2, color: "text-blue-500 dark:text-blue-400", label: "Project / Plot", value: `${client.projectName} · #${client.plotNumber}` },
                                        { icon: Calendar, color: "text-purple-500 dark:text-purple-400", label: "Booking Date", value: new Date(client.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                                        { icon: IndianRupee, color: "text-emerald-500 dark:text-emerald-400", label: "Total Amount", value: `₹${fmt(summary.totalPlotAmount)}` },
                                    ].map(({ icon: Icon, color, label, value }) => (
                                        <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/40 flex items-start gap-2.5">
                                            <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">{label}</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/40 overflow-hidden">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 border-b border-slate-200 dark:border-slate-700/40">
                                        Payment Breakdown
                                    </p>
                                    {[
                                        { label: "Online", total: summary.onlineAmount, paid: summary.onlinePaid, pending: summary.onlinePending, color: "text-blue-500 dark:text-blue-400" },
                                        { label: "Credit", total: summary.creditPlotAmount, paid: summary.creditPaid, pending: summary.creditPending, color: "text-purple-500 dark:text-purple-400" },
                                    ].map(row => (
                                        <div key={row.label} className="px-4 py-3 grid grid-cols-3 gap-2 text-xs border-b border-slate-200/60 dark:border-slate-700/20 last:border-0">
                                            <div>
                                                <p className="text-slate-500">{row.label} Total</p>
                                                <p className={`font-semibold mt-0.5 ${row.color}`}>₹{fmt(row.total)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Paid</p>
                                                <p className="font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">₹{fmt(row.paid)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Pending</p>
                                                <p className="font-semibold mt-0.5 text-amber-600 dark:text-amber-400">₹{fmt(row.pending)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs text-slate-500">Status</span>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig[(summary.status as keyof typeof statusConfig) || "pending"].cls}`}>
                                        {statusConfig[(summary.status as keyof typeof statusConfig) || "pending"].label}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Installments Tab */}
                        {tab === "installments" && (
                            <div>
                                {loadingInst ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading installments...</p>
                                    </div>
                                ) : installments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                                        <IndianRupee size={40} className="mb-3 opacity-30" />
                                        <p className="text-sm">No installment records found</p>
                                    </div>
                                ) : (() => {
                                    const totalCollected = installments.reduce((s, i) => s + (parseFloat(i.paidAmount) || 0), 0);
                                    const totalOutstanding = installments.reduce((s, i) => s + (parseFloat(i.remainingAmount) || 0), 0);
                                    const countByStatus: Record<string, number> = {};
                                    installments.forEach(i => { countByStatus[i.status] = (countByStatus[i.status] || 0) + 1; });

                                    return (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { val: totalCollected, label: "Collected", bg: "from-emerald-50 dark:from-emerald-900/40 to-emerald-100/50 dark:to-emerald-800/20", border: "border-emerald-200 dark:border-emerald-700/30", iconBg: "bg-emerald-600", text: "text-emerald-600 dark:text-emerald-400", sub: "text-emerald-600/70 dark:text-emerald-700" },
                                                    { val: totalOutstanding, label: "Outstanding", bg: "from-red-50 dark:from-red-900/40 to-red-100/50 dark:to-red-800/20", border: "border-red-200 dark:border-red-700/30", iconBg: "bg-red-600", text: "text-red-600 dark:text-red-400", sub: "text-red-600/70 dark:text-red-700" },
                                                ].map(c => (
                                                    <div key={c.label} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-xl p-3 flex items-center gap-2 sm:gap-3`}>
                                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                            <IndianRupee size={13} className="text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-xs sm:text-sm font-bold ${c.text}`}>{fmtAmt(c.val)}</p>
                                                            <p className={`text-xs ${c.sub} font-medium`}>{c.label}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {[
                                                    { key: "paid", label: "Paid", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                                                    { key: "partial", label: "Partial", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
                                                    { key: "pending", label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
                                                    { key: "overdue", label: "Overdue", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
                                                    { key: "review", label: "In Review", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
                                                    { key: "approved", label: "Approved", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                                                    { key: "rejected", label: "Rejected", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
                                                ].filter(s => (countByStatus[s.key] || 0) > 0).map(s => (
                                                    <span key={s.key} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                                                        {s.label}: {countByStatus[s.key]}
                                                    </span>
                                                ))}
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600">
                                                    Total: {installments.length}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {installments.map(inst => {
                                                    const total = parseFloat(inst.amount || "0");
                                                    const paid = parseFloat(inst.paidAmount || "0");
                                                    const remaining = parseFloat(inst.remainingAmount || "0");
                                                    const isOverdue = inst.dueDate && new Date(inst.dueDate) < new Date() && inst.status !== "paid";
                                                    const sc = instStatusConfig[inst.status] ?? instStatusConfig.pending;
                                                    const isActing = actionLoading === inst.id;
                                                    const isInReview = inst.status === "review";
                                                    const isActionable = inst.status === "pending" || inst.status === "partial" || inst.status === "overdue";
                                                    const isDone = inst.status === "paid" || inst.status === "approved" || inst.status === "rejected";

                                                    return (
                                                        <div key={inst.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 sm:p-4 space-y-3">
                                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-xs font-bold text-orange-500 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                                                                        ID: {inst.id}
                                                                    </span>
                                                                    <span className="capitalize text-xs text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600">
                                                                        {inst.phaseName}
                                                                    </span>
                                                                    {inst.dueDate && (
                                                                        <span className={`text-xs px-2 py-1 rounded-lg ${isOverdue ? "text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20" : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
                                                                            Due: {new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                                            {isOverdue && " ⚠"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
                                                            </div>

                                                            <ProgressBar paid={paid} total={total} />

                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    { label: "Amount", val: inst.amount, cls: "text-slate-800 dark:text-slate-200" },
                                                                    { label: "Paid", val: inst.paidAmount, cls: "text-emerald-600 dark:text-emerald-400" },
                                                                    { label: "Remaining", val: inst.remainingAmount, cls: remaining > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400" },
                                                                ].map(f => (
                                                                    <div key={f.label} className="bg-white dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5 border border-slate-200 dark:border-slate-700/30">
                                                                        <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                                                                        <p className={`text-[11px] font-bold break-all ${f.cls}`}>{fmtAmt(f.val)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {inst.status === "approved" && (inst.paymentPlatform || inst.payment_reference || inst.bankName) && (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {inst.paymentPlatform && (
                                                                        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5 border border-slate-200 dark:border-slate-700/30">
                                                                            <p className="text-xs text-slate-500 mb-0.5">Platform</p>
                                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{inst.paymentPlatform}</p>
                                                                        </div>
                                                                    )}
                                                                    {inst.bankName && (
                                                                        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5 border border-slate-200 dark:border-slate-700/30">
                                                                            <p className="text-xs text-slate-500 mb-0.5">Bank</p>
                                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{inst.bankName}</p>
                                                                        </div>
                                                                    )}
                                                                    {inst.payment_reference && (
                                                                        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2 sm:p-2.5 border border-slate-200 dark:border-slate-700/30">
                                                                            <p className="text-xs text-slate-500 mb-0.5">Ref No.</p>
                                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{inst.payment_reference}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {inst.status === "approved" && inst.approvedByName && (
                                                                <div className="flex items-center justify-between flex-wrap gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-700/30">
                                                                    <span>Approved by <span className="font-semibold text-emerald-600 dark:text-emerald-400">{inst.approvedByName}</span></span>
                                                                    {inst.approved_at && (
                                                                        <span>{new Date(inst.approved_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {inst.status === "review" && inst.submittedByName && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-700/30">
                                                                    Submitted by <span className="font-semibold text-blue-600 dark:text-blue-400">{inst.submittedByName}</span>
                                                                </div>
                                                            )}

                                                            {canSeeActions && (() => {
                                                                if (inst.status === "approved") return (
                                                                    <button onClick={() => buildAndOpenReceipt(inst)}
                                                                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors">
                                                                        <CheckCircle2 size={13} /> View / Download Receipt
                                                                    </button>
                                                                );
                                                                if (isDone) return null;
                                                                if (isAssistant && isActionable) return (
                                                                    <button onClick={() => openReview(inst)} disabled={isActing}
                                                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                                                                        <IndianRupee size={13} /> Submit Payment for Review
                                                                    </button>
                                                                );
                                                                if ((isAdmin || isAccountant) && isInReview) return (
                                                                    <div className="flex gap-2 pt-1">
                                                                        <button onClick={() => handleAction(inst.id, "approve")} disabled={isActing}
                                                                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                                            {isActing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Approve
                                                                        </button>
                                                                        <button onClick={() => handleAction(inst.id, "reject")} disabled={isActing}
                                                                            className="flex-1 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                                            {isActing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
                                                                        </button>
                                                                    </div>
                                                                );
                                                                return null;
                                                            })()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Review Modal */}
            {reviewInst && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-4 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Submit Payment for Review</h3>
                            <button onClick={() => setReviewInst(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
                            <span className="text-orange-500 dark:text-orange-400 font-bold">ID: {reviewInst.id}</span>
                            {" · "}<span className="capitalize">{reviewInst.phaseName}</span>
                            {" · "}<span className="text-slate-800 dark:text-slate-200 font-semibold">{fmtAmt(reviewInst.amount)}</span>
                        </div>
                        <div className="space-y-3">
                            {/* {[
                                { label: "Payment Reference", value: payRef, setter: setPayRef, placeholder: "e.g. TXN123456789" },
                                { label: "Bank Name", value: bankName, setter: setbankName, placeholder: "Bank of Baroda" },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {f.label} <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" />
                                </div>
                            ))} */}
                            {[
                                { label: "Payment Reference", value: payRef, setter: setPayRef, placeholder: "e.g. TXN123456789", required: true },
                                { label: "Bank Name", value: bankName, setter: setbankName, placeholder: "Bank of Baroda", required: false },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {f.label}
                                        {f.required && <span className="text-red-500"> *</span>}
                                    </label>

                                    <input
                                        type="text"
                                        value={f.value}
                                        onChange={e => f.setter(e.target.value)}
                                        placeholder={f.placeholder}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Payment Platform <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select value={platformId} onChange={e => setPlatformId(e.target.value ? Number(e.target.value) : "")} disabled={loadingPlatforms}
                                        className="w-full h-10 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 appearance-none disabled:opacity-50 cursor-pointer">
                                        <option value="">{loadingPlatforms ? "Loading..." : "Select Platform"}</option>
                                        {platforms.map(p => <option key={p.id} value={p.id}>{p.platform_name}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setReviewInst(null)} disabled={submittingReview}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={submitReview} disabled={submittingReview || !payRef.trim() || !platformId}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
                                {submittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit for Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Create Client Modal ──────────────────────────────────────────────────────

const DISABLED_FIELDS = ["customerName", "phone", "gender", "projectName", "plotNumber"] as const;
const EDITABLE_FIELDS = ["plotSize", "price", "onlinePrice", "creditPoint", "facing", "city"] as const;

const FIELD_LABELS: Record<string, string> = {
    customerName: "Customer Name", phone: "Phone", gender: "Gender",
    projectName: "Project Name", plotNumber: "Plot Number",
    plotSize: "Plot Size", price: "Price", onlinePrice: "Online Price",
    creditPoint: "Credit Points", facing: "Facing", city: "City",
};

type EditableFields = { plotSize: string; price: string; onlinePrice: string; creditPoint: string; facing: string; city: string };

const CreateClientModal = ({ onClose, onSuccess, BASE_URL }: { onClose: () => void; onSuccess: () => void; BASE_URL: string }) => {
    const [bookings, setBookings] = useState<UserBooking[]>([]);
    const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [bookingsLoaded, setBookingsLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingId, setbookingId] = useState<number | "">("");
    const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
    const [bookingData, setBookingData] = useState<Record<string, any> | null>(null);
    const [loadingBookingData, setLoadingBookingData] = useState(false);
    const [editableFields, setEditableFields] = useState<EditableFields>({
        plotSize: "", price: "", onlinePrice: "", creditPoint: "", facing: "", city: "",
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${BASE_URL}/payment_plan/get-all-payment-plans`, { headers: authHeaders() });
                const json = await res.json();
                const d = json.data?.plans || json.data || [];
                setPaymentPlans(Array.isArray(d) ? d : []);
            } catch { toast.error("Failed to load payment plans"); }
            finally { setLoadingPlans(false); }
        })();
    }, [BASE_URL]);

    useEffect(() => {
        if (!bookingId) {
            setBookingData(null);
            setEditableFields({ plotSize: "", price: "", onlinePrice: "", creditPoint: "", facing: "", city: "" });
            return;
        }
        (async () => {
            setLoadingBookingData(true);
            setBookingData(null);
            try {
                const res = await fetch(`${BASE_URL}/client/get-booking-data/${bookingId}`, { headers: authHeaders() });
                const json = await res.json();
                const data = json.data || json || null;
                setBookingData(data);
                if (data) setEditableFields({
                    plotSize: data.plotSize ?? "", price: data.price ?? "", onlinePrice: data.onlinePrice ?? "",
                    creditPoint: data.creditPoint ?? "", facing: data.facing ?? "", city: data.city ?? "",
                });
            } catch { toast.error("Failed to load booking details"); }
            finally { setLoadingBookingData(false); }
        })();
    }, [bookingId, BASE_URL]);

    const loadBookings = async () => {
        if (bookingsLoaded || loadingBookings) return;
        setLoadingBookings(true);
        try {
            const res = await fetch(`${BASE_URL}/client/get-user-booking`, { headers: authHeaders() });
            const json = await res.json();
            setBookings(Array.isArray(json.data) ? json.data : []);
            setBookingsLoaded(true);
        } catch { toast.error("Failed to load bookings"); }
        finally { setLoadingBookings(false); }
    };

    const bookingOptions: DropdownOption[] = bookings.map(b => ({
        value: b.id,
        label: `#${b.id} · ${b.name || b.clientName || "Unknown"}`,
        sub: [b.phone, b.bookingNumber, b.projectName && `${b.projectName}${b.plotNumber ? ` · Plot ${b.plotNumber}` : ""}`].filter(Boolean).join(" · "),
    }));

    const planOptions: DropdownOption[] = paymentPlans.map(p => ({
        value: p.id, label: p.planName || p.name || `Plan #${p.id}`, sub: p.description,
    }));

    const handleSubmit = async () => {
        if (!bookingId || !selectedPlanId) { toast.error("Please select both a booking and a payment plan"); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/client/create-client`, {
                method: "POST", headers: authHeaders(),
                body: JSON.stringify({
                    bookingId, paymentPlanId: selectedPlanId,
                    plotSize: editableFields.plotSize, price: editableFields.price,
                    onlinePrice: editableFields.onlinePrice, creditPoint: editableFields.creditPoint,
                    facing: editableFields.facing || null, city: editableFields.city || null,
                }),
            });
            const json = await res.json();
            if (res.ok) { toast.success("Client created successfully!"); onSuccess(); onClose(); }
            else { toast.error(json?.message || "Failed to create client"); }
        } catch { toast.error("Network error while creating client"); }
        finally { setSubmitting(false); }
    };

    const selPlan = paymentPlans.find(p => p.id === selectedPlanId);
    const disabledCls = "w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none";
    const editCls = "w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 dark:focus:border-orange-400 transition-all placeholder:text-slate-400";

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">

                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                            <Plus size={18} className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Create New Client</h2>
                            <p className="text-xs text-slate-500">Link a booking with a payment plan</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all flex-shrink-0">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            User Booking <span className="text-red-500">*</span>
                        </label>
                        <SearchableDropdown options={bookingOptions} value={bookingId} onChange={setbookingId}
                            placeholder="Click to select a booking" loading={loadingBookings} onOpen={loadBookings} />
                        {bookingsLoaded && bookings.length === 0 && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">No bookings available</p>
                        )}
                    </div>

                    {bookingId && (loadingBookingData ? (
                        <div className="flex items-center gap-2 py-3 px-1 text-sm text-slate-400 dark:text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" /><span>Loading booking details...</span>
                        </div>
                    ) : bookingData && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Booking Info</span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {DISABLED_FIELDS.map(key => (
                                        <div key={key} className="space-y-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">{FIELD_LABELS[key]}</label>
                                            <input type="text" readOnly disabled value={bookingData[key] != null ? String(bookingData[key]) : "—"} className={disabledCls} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
                                        <Pencil size={10} /> Editable Fields
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {EDITABLE_FIELDS.map(key => (
                                        <div key={key} className="space-y-1">
                                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">{FIELD_LABELS[key]}</label>
                                            <input type="text" value={editableFields[key]}
                                                onChange={e => setEditableFields(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder={`Enter ${FIELD_LABELS[key]}`} className={editCls} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Payment Plan <span className="text-red-500">*</span>
                        </label>
                        <SearchableDropdown options={planOptions} value={selectedPlanId} onChange={setSelectedPlanId}
                            placeholder="Select a payment plan" loading={loadingPlans} disabled={loadingPlans} />
                    </div>

                    {bookingId && selectedPlanId && !loadingBookingData && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ready to create</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                    { label: "Customer", val: bookingData?.customerName },
                                    { label: "Project · Plot", val: bookingData?.projectName ? `${bookingData.projectName}${bookingData.plotNumber ? ` · ${bookingData.plotNumber}` : ""}` : null },
                                    { label: "Payment Plan", val: selPlan?.planName || selPlan?.name || `Plan #${selectedPlanId}` },
                                    { label: "Plot Size", val: editableFields.plotSize },
                                ].map(f => (
                                    <div key={f.label} className="bg-white dark:bg-slate-900/60 rounded-lg p-2.5">
                                        <p className="text-slate-500 mb-0.5">{f.label}</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">{f.val || "—"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-3 flex-shrink-0 border-t border-slate-200 dark:border-slate-700/60 pt-4">
                    <button onClick={onClose} disabled={submitting}
                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 border border-slate-200 dark:border-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || loadingPlans || !bookingId || !selectedPlanId || loadingBookingData}
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Client</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Clients = () => {
    const dispatch = useDispatch<AppDispatch>();
    const BASE_URL = getBaseUrl();

    const [data, setData] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
    const [projectFilter, setProjectFilter] = useState("all");
    const [plotFilter, setPlotFilter] = useState("all");
    const [createdByFilter, setCreatedByFilter] = useState("all");
    const [viewModal, setViewModal] = useState<Client | null>(null);
    const [createModal, setCreateModal] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    const { permissions: rolePermissions, loading: roleLoading } = useSelector((state: RootState) => state.sidebarPermissions);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            dispatch(fetchRolePermissionsSidebar());
            dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: "" }));
        } else {
            setLoading(false);
            toast.error("Session expired. Please login again.");
        }
    }, [dispatch]);

    const permissions = useMemo(() => {
        const pagePerm = rolePermissions?.permissions?.find((p: any) => p.pageName === "Clients" || p.pageId === 28);
        const ids = pagePerm?.permissionIds || [];
        return { view: ids.includes(17), delete: ids.includes(4), create: ids.includes(21) };
    }, [rolePermissions]);

    const fetchClients = useCallback(async () => {
        const token = getAuthToken();
        if (!token || !permissions.view) { if (!roleLoading) setLoading(false); return; }
        try {
            const res = await fetch(`${BASE_URL}/client/get-clients`, { headers: authHeaders() });
            const json = await res.json();
            if (res.ok) {
                setData(Array.isArray(json.data) ? json.data : []);
            } else if (json.message === "Invalid token") {
                localStorage.removeItem("accessToken"); window.location.href = "/login";
            } else {
                setData([]); toast.error(json.message || "Failed to fetch clients");
            }
        } catch { setData([]); toast.error("Network error"); }
        finally { setLoading(false); }
    }, [BASE_URL, permissions.view, roleLoading]);

    useEffect(() => { if (!roleLoading) fetchClients(); }, [roleLoading, fetchClients]);

    // Filter options derived from data
    const projectOptions = useMemo(() =>
        Array.from(new Set(data.map(d => d.projectName).filter(Boolean))).sort()
        , [data]);

    const plotOptions = useMemo(() => {
        const source = projectFilter !== "all" ? data.filter(d => d.projectName === projectFilter) : data;
        return Array.from(new Set(source.map(d => d.plotNumber).filter(Boolean))).sort((a, b) => Number(a) - Number(b));
    }, [data, projectFilter]);

    const createdByOptions = useMemo(() =>
        Array.from(new Set(data.map(d => d.createdByName).filter(Boolean))).sort() as string[]
        , [data]);

    const filteredData = useMemo(() => {
        let r = data;
        if (projectFilter !== "all") r = r.filter(i => i.projectName === projectFilter);
        if (plotFilter !== "all") r = r.filter(i => i.plotNumber === plotFilter);
        if (createdByFilter !== "all") r = r.filter(i => i.createdByName === createdByFilter);
        if (!searchQuery.trim()) return r;
        const q = searchQuery.toLowerCase();
        return r.filter(i =>
            i.name?.toLowerCase().includes(q) || i.phone?.includes(q) ||
            i.bookingNumber?.toLowerCase().includes(q) || i.projectName?.toLowerCase().includes(q) ||
            i.plotNumber?.toLowerCase().includes(q)
        );
    }, [data, searchQuery, projectFilter, plotFilter, createdByFilter]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const av = a[sortConfig.key!] ?? "", bv = b[sortConfig.key!] ?? "";
            if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
            if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = useMemo(() =>
        sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
        , [sortedData, currentPage, rowsPerPage]);

    const handleSort = (key: keyof Client) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

    const clearFilters = () => { setProjectFilter("all"); setPlotFilter("all"); setCreatedByFilter("all"); setCurrentPage(1); };
    const hasFilters = projectFilter !== "all" || plotFilter !== "all" || createdByFilter !== "all";

    const stats = useMemo(() => ({
        total: data.length,
        active: data.filter(d => d.status === "active").length,
        pending: data.filter(d => d.status === "pending").length,
        totalAmount: data.reduce((s, d) => s + (parseFloat(d.totalPlotAmount) || 0), 0),
        totalOnlinePaid: data.reduce((s, d) => s + (parseFloat(d.onlinePaid) || 0), 0),
        totalCreditPaid: data.reduce((s, d) => s + (parseFloat(d.creditPaid) || 0), 0),
        totalOnlinePending: data.reduce((s, d) => s + (parseFloat(d.onlinePending) || 0), 0),
        totalCreditPending: data.reduce((s, d) => s + (parseFloat(d.creditPending) || 0), 0),
    }), [data]);

    if (loading || roleLoading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Loading client data...</p>
        </div>
    );

    if (!permissions.view) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sm:p-10 max-w-md text-center">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                <p className="text-slate-500 dark:text-slate-400">You don't have permission to view this page.</p>
            </div>
        </div>
    );

    const selectCls = "h-9 pl-3 pr-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 cursor-pointer appearance-none transition-all";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Manage all client allotment requests in one place</p>
                    </div>
                    {permissions.create && (
                        <button onClick={() => setCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25 self-start sm:self-auto whitespace-nowrap">
                            <Plus size={17} /> Create Client
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        {
                            val: `₹${(stats.totalOnlinePaid + stats.totalCreditPaid).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                            label: "Total Collected", iconBg: "bg-emerald-600",
                            bg: "bg-gradient-to-br from-emerald-50 dark:from-emerald-900/40 to-emerald-100/50 dark:to-emerald-800/20",
                            border: "border-emerald-200 dark:border-emerald-700/30",
                            text: "text-emerald-600 dark:text-emerald-400", sub: "text-emerald-600/70 dark:text-emerald-700",
                            icon: <IndianRupee size={16} className="text-white" />,
                        },
                        {
                            val: `₹${(stats.totalOnlinePending + stats.totalCreditPending).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                            label: "Total Outstanding", iconBg: "bg-red-600",
                            bg: "bg-gradient-to-br from-red-50 dark:from-red-900/40 to-red-100/50 dark:to-red-800/20",
                            border: "border-red-200 dark:border-red-700/30",
                            text: "text-red-600 dark:text-red-400", sub: "text-red-600/70 dark:text-red-700",
                            icon: <IndianRupee size={16} className="text-white" />,
                        },
                        {
                            val: String(stats.total),
                            label: "Total Clients", iconBg: "bg-blue-600/80",
                            bg: "bg-white dark:bg-slate-800/60",
                            border: "border-slate-200 dark:border-slate-700/40",
                            text: "text-slate-900 dark:text-white", sub: "text-slate-500 dark:text-slate-400",
                            extra: `${stats.active} active${stats.pending > 0 ? ` · ${stats.pending} pending` : ""}`,
                            icon: <Users size={16} className="text-white" />,
                        },
                        {
                            val: `₹${stats.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                            label: "Total Portfolio", iconBg: "bg-orange-500/80",
                            bg: "bg-gradient-to-br from-orange-50 dark:from-orange-900/40 to-orange-100/50 dark:to-orange-800/20",
                            border: "border-orange-200 dark:border-orange-700/30",
                            text: "text-orange-500 dark:text-orange-400", sub: "text-slate-500 dark:text-slate-400",
                            icon: <IndianRupee size={16} className="text-white" />,
                        },
                    ].map((c, i) => (
                        <div key={i} className={`${c.bg} border ${c.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3`}>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                                {c.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm sm:text-lg font-bold ${c.text} break-words`}>{c.val}</p>
                                <p className={`text-xs ${c.sub} font-medium`}>{c.label}</p>
                                {c.extra && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">{c.extra}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">

                    {/* Controls */}
                    <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-700/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                    {sortedData.length} client{sortedData.length !== 1 ? "s" : ""}
                                </span>

                                {/* Project Filter */}
                                <div className="relative">
                                    <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setPlotFilter("all"); setCurrentPage(1); }} className={selectCls}>
                                        <option value="all">All Projects</option>
                                        {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                </div>

                                {/* Plot Filter */}
                                {projectFilter !== "all" && (
                                    <div className="relative">
                                        <select value={plotFilter} onChange={e => { setPlotFilter(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                            <option value="all">All Plots</option>
                                            {plotOptions.map(p => <option key={p} value={p}>Plot #{p}</option>)}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    </div>
                                )}

                                {/* Created By Filter */}
                                <div className="relative">
                                    <select value={createdByFilter} onChange={e => { setCreatedByFilter(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                        <option value="all">All Creators</option>
                                        {createdByOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                </div>

                                {hasFilters && (
                                    <button onClick={clearFilters}
                                        className="h-9 px-3 text-xs rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap">
                                        <X size={11} /> Clear
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-64 flex-shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <input type="text" placeholder="Search name, booking, plot..."
                                    className="w-full h-9 pl-9 pr-4 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                    value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                            </div>
                        </div>
                    </div>

                    {/* Table — horizontal scroll on small screens */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
                                    {[
                                        { label: "#", sort: null },
                                        { label: "Client", sort: "name" as keyof Client },
                                        { label: "Booking", sort: "bookingNumber" as keyof Client },
                                        { label: "Project / Plot", sort: null },
                                        { label: "Total Amount", sort: "totalPlotAmount" as keyof Client },
                                        { label: "Online Pending", sort: null },
                                        { label: "Credit Pending", sort: null },
                                        { label: "Created By", sort: null },
                                        { label: "Status", sort: null },
                                        { label: "Date", sort: "createdAt" as keyof Client },
                                        { label: "Actions", sort: null },
                                    ].map(({ label, sort }) => (
                                        <th key={label} onClick={sort ? () => handleSort(sort) : undefined}
                                            className={`px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap ${sort ? "cursor-pointer hover:text-orange-500 dark:hover:text-orange-400 transition-colors select-none" : ""} ${label === "Actions" ? "text-center" : ""}`}>
                                            {label}{sort ? " ↕" : ""}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-16 text-slate-400 dark:text-slate-500">
                                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No clients found</p>
                                        </td>
                                    </tr>
                                ) : paginatedData.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-3 sm:px-4 py-3 text-slate-400 dark:text-slate-500 text-xs">
                                            {(currentPage - 1) * rowsPerPage + idx + 1}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {item.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{item.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{item.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <p className="text-xs text-orange-500 dark:text-orange-400 font-semibold whitespace-nowrap">{item.bookingNumber}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                                                {new Date(item.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </p>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">{item.projectName}</p>
                                            <p className="text-xs text-slate-500">Plot #{item.plotNumber}</p>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">₹{fmt(item.totalPlotAmount)}</p>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            {Number(item.onlinePending) > 0
                                                ? <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">₹{fmt(item.onlinePending)}</p>
                                                : <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Cleared</span>}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            {Number(item.creditPending) > 0
                                                ? <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">₹{fmt(item.creditPending)}</p>
                                                : <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Cleared</span>}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{item.createdByName || "—"}</p>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap ${statusConfig[item.status || "pending"].cls}`}>
                                                {statusConfig[item.status || "pending"].label}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <button onClick={() => setViewModal(item)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                                                    title="View Details">
                                                    <Eye size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Rows:</span>
                            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer">
                                {[10, 15, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            {sortedData.length > 0
                                ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, sortedData.length)} of ${sortedData.length}`
                                : "No records"}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
                                        <span key={`d-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">•••</span>
                                    ) : (
                                        <button key={`p-${page}`} onClick={() => setCurrentPage(page as number)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${currentPage === page ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                                            {page}
                                        </button>
                                    )
                                );
                            })()}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {createModal && <CreateClientModal BASE_URL={BASE_URL} onClose={() => setCreateModal(false)} onSuccess={fetchClients} />}

            {viewModal && (
                <ViewClientModal client={viewModal} onClose={() => setViewModal(null)} BASE_URL={BASE_URL}
                    onOpenReceipt={d => setReceiptData(d)} />
            )}

            {receiptData && <PaymentReceipt data={receiptData} onClose={() => setReceiptData(null)} />}
        </div>
    );
};

export default Clients;