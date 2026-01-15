"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, ChevronLeft, ChevronRight, ChevronUp, Phone, User, FileText, Calendar, Edit, Trash2, X, LayoutGrid, Table2, Clock, CheckCircle, XCircle, RefreshCw, Building2, Calendar as CalendarIcon, IndianRupee, Hash, Mail, Ruler, Receipt, FileCheck, Wallet, Banknote, CreditCard, Calculator, Briefcase, Scale, Gavel, Wifi, BadgeIndianRupee, TrendingUp, AlertCircle, Filter,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { fetchPermissions } from "../../../../store/permissionSlice";
import { fetchRolePermissionsSidebar } from "../../../../store/sidebarPermissionSlice";
import { exportUsers } from "../../../../store/userSlice";

interface CollectionTableProps {
  leads?: Collection[];
  onAddLead?: () => void;
  onEditLead?: (collection: Collection) => void;
  onDeleteLead?: (collection: Collection) => void;
  onBulkDelete?: (collectionIds: number[]) => void;
  onBulkAssign?: (collectionIds: number[]) => void;
  onLeadClick?: (collection: Collection) => void;
  onFollowUp?: (collection: Collection) => void;
  loading?: boolean;
  title?: string;
  hasEditPermission?: boolean;
  hasDeletePermission?: boolean;
  hasBulkPermission?: boolean;
  currentUser?: { roleId: number };
  onRefetch?: () => void;
  disableInternalFetch?: boolean;
}

interface Collection {
  id: number;
  projectName: string;
  projectTitle?: string;
  employeeName: string;
  clientName: string;
  name?: string;
  mobileNumber: string;
  phone?: string;
  emailId: string;
  email?: string;
  plotNumber: string;
  emi?: string;
  emiPlan?: string;
  plotSize: string;
  price: string;
  registryStatus: string;
  status?: string;
  plotValue: string;
  paymentReceived: string;
  pendingAmount: string;
  commission: string;
  maintenance: string;
  stampDuty: string;
  legalFees: string;
  onlineAmount: string;
  cashAmount: string;
  totalAmount: string;
  difference: string;
  incentive: string;
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  createdBy?: string;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const formatCurrency = (amount: string | number | null | undefined) => {
  if (!amount || amount === "N/A") return "N/A";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
};

const PaginationButtons = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) => {
  const getPageNumbers = () => {
    const pages: { type: string; value: number | string; key: string }[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push({ type: "page", value: i, key: `page-${i}` }); }
    else {
      pages.push({ type: "page", value: 1, key: "page-1" });
      if (currentPage <= 3) {
        for (let i = 2; i <= 3; i++) pages.push({ type: "page", value: i, key: `page-${i}` });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
      } else if (currentPage >= totalPages - 2) {
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push({ type: "page", value: i, key: `page-${i}` });
      } else {
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push({ type: "page", value: i, key: `page-${i}` });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"}`}><ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
      <div className="hidden sm:flex items-center space-x-1">
        {getPageNumbers().map((item) => item.type === "ellipsis" ? <span key={item.key} className="px-2 py-1 text-gray-400 text-sm">...</span> : <button key={item.key} onClick={() => onPageChange(item.value as number)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === item.value ? "bg-blue-500 text-white shadow-md transform scale-105" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>{item.value}</button>)}
      </div>
      <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"}`}><ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
    </div>
  );
};

const getCollectionColumns = () => [
  { label: "Project Name", accessor: "projectName", sortable: true, minWidth: 150 },
  { label: "Registry Status", accessor: "registryStatus", sortable: true, minWidth: 120 },
  { label: "Employee Name", accessor: "employeeName", sortable: true, minWidth: 130 },
  { label: "Client Name", accessor: "clientName", sortable: true, minWidth: 130 },
  { label: "Mobile Number", accessor: "mobileNumber", sortable: true, minWidth: 120 },
  { label: "Email Id", accessor: "emailId", sortable: true, minWidth: 180 },
  { label: "Plot Number", accessor: "plotNumber", sortable: true, minWidth: 100 },
  { label: "EMI Plan", accessor: "emi", sortable: true, minWidth: 100 },
  { label: "Plot Size", accessor: "plotSize", sortable: true, minWidth: 100 },
  { label: "Price", accessor: "price", sortable: true, minWidth: 120 },
  { label: "Plot Value", accessor: "plotValue", sortable: true, minWidth: 120 },
  { label: "Online Amount", accessor: "onlineAmount", sortable: true, minWidth: 130 },
  { label: "Credit Points", accessor: "cashAmount", sortable: true, minWidth: 120 },
  { label: "Payment Received", accessor: "paymentReceived", sortable: true, minWidth: 140 },
  { label: "Pending Amount", accessor: "pendingAmount", sortable: true, minWidth: 130 },
  { label: "Maintenance", accessor: "maintenance", sortable: true, minWidth: 120 },
  { label: "Stamp Duty", accessor: "stampDuty", sortable: true, minWidth: 120 },
  { label: "Legal Fees", accessor: "legalFees", sortable: true, minWidth: 120 },
  { label: "Cp Commission", accessor: "commission", sortable: true, minWidth: 120 },
  { label: "User Incentive", accessor: "incentive", sortable: true, minWidth: 120 },
  { label: "Total Amount", accessor: "totalAmount", sortable: true, minWidth: 130 },
  { label: "Difference", accessor: "difference", sortable: true, minWidth: 120 },
];

const getStatusColor = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "active" || s === "completed" || s === "done") return "bg-green-100 text-green-800 border-green-200";
  if (s === "cancelled" || s === "rejected") return "bg-red-100 text-red-800 border-red-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
};

const getStatusIcon = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "active" || s === "completed" || s === "done") return <CheckCircle className="w-3 h-3" />;
  if (s === "cancelled" || s === "rejected") return <XCircle className="w-3 h-3" />;
  return <Clock className="w-3 h-3" />;
};

const CollectionTable: React.FC<CollectionTableProps> = ({
  leads = [], onAddLead, onEditLead, onDeleteLead, onBulkDelete, onBulkAssign, onLeadClick, onFollowUp, loading = false, title = "Collection Panel", hasEditPermission = true, hasDeletePermission = true, hasBulkPermission = true, currentUser, onRefetch, disableInternalFetch = false,
}) => {
  const dispatch = useDispatch<any>();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Collection; direction: "asc" | "desc"; } | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedPlot, setSelectedPlot] = useState("All");
  const [selectedRegistry, setSelectedRegistry] = useState("All");
  const [selectedEmiPlan, setSelectedEmiPlan] = useState("All");

  useEffect(() => {
    if (!disableInternalFetch) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchRolePermissionsSidebar());
    }
  }, [dispatch, disableInternalFetch]);

  // Logic: Employee badalne par Plot reset ho jaye
  useEffect(() => { setSelectedPlot("All"); }, [selectedUser]);

  const filterOptions = useMemo(() => ({
    projects: ["All", ...Array.from(new Set(leads.map(l => l.projectName || l.projectTitle).filter(Boolean)))],
    users: ["All", ...Array.from(new Set(leads.map(l => l.employeeName || l.createdBy).filter(Boolean)))],
    registries: ["All", ...Array.from(new Set(leads.map(l => l.registryStatus).filter(Boolean)))],
    emiPlans: ["All", ...Array.from(new Set(leads.map(l => l.emiPlan || l.emi).filter(Boolean)))]
  }), [leads]);

  // Dependent Logic: Employee select ho toh uske hi plots dikhe
  const availablePlots = useMemo(() => {
    const data = selectedUser === "All" ? leads : leads.filter(l => (l.employeeName || l.createdBy) === selectedUser);
    return ["All", ...Array.from(new Set(data.map(l => l.plotNumber).filter(Boolean)))];
  }, [leads, selectedUser]);

  const filteredCollections = useMemo(() => leads.filter((item) => {
    const lowSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = !lowSearch || (item.clientName || "").toLowerCase().includes(lowSearch) || (item.employeeName || "").toLowerCase().includes(lowSearch) || (item.plotNumber || "").toLowerCase().includes(lowSearch) || (item.mobileNumber || "").toLowerCase().includes(lowSearch);
    const matchesProject = selectedProject === "All" || (item.projectName || item.projectTitle) === selectedProject;
    const matchesUser = selectedUser === "All" || (item.employeeName || item.createdBy) === selectedUser;
    const matchesPlot = selectedPlot === "All" || item.plotNumber === selectedPlot;
    const matchesRegistry = selectedRegistry === "All" || item.registryStatus === selectedRegistry;
    const matchesEmi = selectedEmiPlan === "All" || (item.emiPlan || item.emi) === selectedEmiPlan;
    return matchesSearch && matchesProject && matchesUser && matchesPlot && matchesRegistry && matchesEmi;
  }), [leads, searchTerm, selectedProject, selectedUser, selectedPlot, selectedRegistry, selectedEmiPlan]);

  const sortedCollections = useMemo(() => {
    if (!sortConfig) return filteredCollections;
    return [...filteredCollections].sort((a, b) => {
      const aVal = String(a[sortConfig.key] || "").toLowerCase();
      const bVal = String(b[sortConfig.key] || "").toLowerCase();
      return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [filteredCollections, sortConfig]);

  const paginatedCollections = useMemo(() => sortedCollections.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sortedCollections, currentPage, pageSize]);
  const totalRecords = sortedCollections.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, pageSize, selectedProject, selectedUser, selectedPlot, selectedRegistry, selectedEmiPlan]);

  const handleSort = (key: keyof Collection) => setSortConfig({ key, direction: sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });

  const formatCollectionData = (collection: Collection) => ({
    ...collection,
    formattedRegistryStatus: <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(collection.registryStatus)}`}>{getStatusIcon(collection.registryStatus)}<span className="ml-1 capitalize">{collection.registryStatus || "N/A"}</span></span>,
    formattedPrice: formatCurrency(collection.price),
    formattedPlotValue: formatCurrency(collection.plotValue),
    formattedPaymentReceived: formatCurrency(collection.paymentReceived),
    formattedPendingAmount: formatCurrency(collection.pendingAmount),
    formattedCommission: formatCurrency(collection.commission),
    formattedMaintenance: formatCurrency(collection.maintenance),
    formattedStampDuty: formatCurrency(collection.stampDuty),
    formattedLegalFees: formatCurrency(collection.legalFees),
    formattedOnlineAmount: formatCurrency(collection.onlineAmount),
    formattedCashAmount: formatCurrency(collection.cashAmount),
    formattedTotalAmount: formatCurrency(collection.totalAmount),
    formattedDifference: formatCurrency(collection.difference),
    formattedIncentive: formatCurrency(collection.incentive),
    formattedEmi: collection.emiPlan || collection.emi,
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Info */}
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Showing <span className="font-bold text-blue-600">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-green-700">{totalRecords.toLocaleString()}</span>
          </div>
          {totalPages > 1 && <PaginationButtons currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      </div>

      {/* Filter Box */}
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border dark:bg-gray-800 border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <div className="flex gap-2">
             <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-sm border rounded-lg p-1.5 bg-white dark:bg-gray-800"><option value={5}>5 entries</option><option value={25}>25 entries</option> <option value={50}>50 entries</option> <option value={100}>100 entries</option></select>
           <div className="flex border rounded-lg overflow-hidden">
  <button
    onClick={() => setViewMode("card")}
    className={`p-1.5 hover:bg-black hover:text-white ${
      viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-black text-white'
    }`}
  >
    <LayoutGrid size={16} />
  </button>

  <button
    onClick={() => setViewMode("table")}
    className={`p-1.5 hover:bg-black hover:text-white ${
      viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-black text-white'
    }`}
  >
    <Table2 size={16} />
  </button>
</div>

          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t">
          <div><label className="text-[10px] uppercase font-bold text-gray-500">Project</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">{filterOptions.projects.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500">Employee</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">{filterOptions.users.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500">Plot No.</label>
            <select value={selectedPlot} onChange={(e) => setSelectedPlot(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">{availablePlots.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500">Registry</label>
            <select value={selectedRegistry} onChange={(e) => setSelectedRegistry(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">{filterOptions.registries.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500">EMI Plan</label>
            <select value={selectedEmiPlan} onChange={(e) => setSelectedEmiPlan(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">{filterOptions.emiPlans.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-lg border"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
      ) : viewMode === "table" ? (
        <div className="rounded-lg shadow-sm border overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>{getCollectionColumns().map(c => <th key={c.accessor} className="px-4 py-3 text-left font-medium uppercase text-gray-500" onClick={() => handleSort(c.accessor as any)}>{c.label}</th>)}<th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCollections.map(item => (
                <tr key={item.id}>
                  {getCollectionColumns().map(c => <td key={c.accessor} className="px-4 py-4">{(item as any)[c.accessor] || "N/A"}</td>)}
                  <td className="px-4 py-4"><button onClick={() => onEditLead && onEditLead(item)} className="text-blue-500"><Edit size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedCollections.map((collection) => {
            const formatted = formatCollectionData(collection);
            return (
              <div key={collection.id} onMouseEnter={() => setHoveredId(collection.id)} onMouseLeave={() => setHoveredId(null)} className="relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{collection.projectName || "N/A"}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Registry Status:</span>
                        {!collection.registryStatus || collection.registryStatus === "N/A" ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700">
                            <Clock className="w-3 h-3" /><span className="capitalize">Pending</span>
                          </span>
                        ) : formatted.formattedRegistryStatus}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 cursor-pointer" onClick={() => onLeadClick && onLeadClick(collection)}>{collection.clientName || "Unnamed Client"}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-indigo-500" />{collection.mobileNumber || "N/A"}</div>
                    <div className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /><span className="truncate">{collection.emailId || "N/A"}</span></div>
                    <div className="flex items-center gap-2"><User size={14} className="text-green-500" />{collection.employeeName || "N/A"}</div>
                    <div className="flex items-center gap-2"><Hash size={14} className="text-purple-500" />Plot: {collection.plotNumber || "N/A"}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div><p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1"><Ruler className="h-3 w-3" /> Plot Size</p><p className="text-sm font-bold">{collection.plotSize || "N/A"}</p></div>
                    <div><p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-1"><IndianRupee className="h-3 w-3" /> Price</p><p className="text-sm font-bold">{formatted.formattedPrice}</p></div>
                    <div><p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-1"><Building2 className="h-3 w-3" /> Plot Value</p><p className="text-sm font-bold">{formatted.formattedPlotValue}</p></div>
                    <div><p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">EMI Plan</p><p className="text-sm font-bold">{formatted.formattedEmi}</p></div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><Wifi className="h-3 w-3 mr-1 text-blue-500" /> Online Amount</p><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatted.formattedOnlineAmount}</p></div>
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><Banknote className="h-3 w-3 mr-1 text-emerald-500" /> Credit Points</p><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatted.formattedCashAmount}</p></div>
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Payment Received</p><p className="text-lg font-bold text-green-600 dark:text-green-400">{formatted.formattedPaymentReceived}</p></div>
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><AlertCircle className="h-3 w-3 mr-1 text-red-500" /> Pending Amount</p><p className="text-lg font-bold text-red-600 dark:text-red-400">{formatted.formattedPendingAmount}</p></div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1"><Calculator className="h-3 w-3 mr-1" /> Maintenance</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedMaintenance}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1"><FileCheck className="h-3 w-3 mr-1" /> Stamp Duty</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedStampDuty}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1"><Gavel className="h-3 w-3 mr-1" /> Legal Fees</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedLegalFees}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1"><Briefcase className="h-3 w-3 mr-1" /> Cp Commission</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedCommission}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1"><TrendingUp className="h-3 w-3 mr-1" /> User Incentive</p><p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{formatted.formattedIncentive}</p></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700">
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><Wallet className="h-3 w-3 mr-1" /> Total Amount</p><p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatted.formattedTotalAmount}</p></div>
                    <div><p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1"><Scale className="h-3 w-3 mr-1" /> Difference</p><p className={`text-xl font-bold ${parseFloat(String(collection.difference || 0)) < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{formatted.formattedDifference}</p></div>
                  </div>

                  {hoveredId === collection.id && onEditLead && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                        <button onClick={() => onEditLead(collection)} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"><Edit className="h-4 w-4" /> Edit</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CollectionTable;