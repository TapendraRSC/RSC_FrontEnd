
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Edit,
  LayoutGrid,
  Table2,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  IndianRupee,
  Hash,
  Mail,
  Ruler,
  FileCheck,
  Wallet,
  Banknote,
  Calculator,
  Briefcase,
  Scale,
  Gavel,
  Wifi,
  TrendingUp,
  AlertCircle,
  X,
  UserCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchPermissions } from "../../../../store/permissionSlice";
import { fetchRolePermissionsSidebar } from "../../../../store/sidebarPermissionSlice";
import { exportUsers } from "../../../../store/userSlice";

interface CollectionTableProps {
  colletion?: Collection[];
  onAddColletion?: () => void;
  onEditColletion?: (collection: Collection) => void;
  onDeleteColletion?: (collection: Collection) => void;
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
  plotOnlinePrice?: string | null;
  plotCreditPrice?: string | null;
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
  receivedOnlineAmount?: string | null;
  pendingOnlineAmount?: string | null;
  cashAmount: string;
  receivedCreditAmount?: string | null;
  pendingCreditAmount?: string | null;
  totalAmount: string;
  difference: string;
  incentive: string;
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  createdBy?: string;
  CPName?: string | null;
}

interface CalculationData {
  totalPlotValue: number;
  totalPaymentReceived: number;
  totalPendingAmount: number;
  totalMaintenance: number;
  totalStampDuty: number;
  totalLegalFees: number;
  totalOnlineAmount: number;
  totalReceivedOnlineAmount: number;
  totalPendingOnlineAmount: number;
  totalCreditPoints: number;
  totalReceivedCreditAmount: number;
  totalPendingCreditAmount: number;
  totalAmount: number;
  totalDifference: number;
  totalCpCommission: number;
  totalUserIncentive: number;
  recordCount: number;
}

const formatCurrency = (amount: string | number | null | undefined) => {
  if (!amount || amount === "N/A") return "N/A";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const isValidCPName = (cpName: string | null | undefined): boolean => {
  return (
    cpName !== null &&
    cpName !== undefined &&
    cpName !== "" &&
    cpName !== "N/A" &&
    cpName.trim() !== ""
  );
};

const PaginationButtons = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages: { type: string; value: number | string; key: string }[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++)
        pages.push({ type: "page", value: i, key: `page-${i}` });
    } else {
      pages.push({ type: "page", value: 1, key: "page-1" });
      if (currentPage <= 3) {
        for (let i = 2; i <= 3; i++)
          pages.push({ type: "page", value: i, key: `page-${i}` });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
      } else if (currentPage >= totalPages - 2) {
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = totalPages - 2; i <= totalPages; i++)
          pages.push({ type: "page", value: i, key: `page-${i}` });
      } else {
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = currentPage - 1; i <= currentPage + 1; i++)
          pages.push({ type: "page", value: i, key: `page-${i}` });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"}`}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((item) =>
          item.type === "ellipsis" ? (
            <span key={item.key} className="px-1.5 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>
          ) : (
            <button key={item.key} onClick={() => onPageChange(item.value as number)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === item.value ? "bg-orange-500 text-white shadow-md transform scale-105" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>{item.value}</button>
          )
        )}
      </div>
      <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className={`p-1.5 sm:p-2 rounded-lg border transition-all ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"}`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const getCollectionColumns = (hasCPNameData: boolean) => {
  const columns = [
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
    { label: "Online Price", accessor: "plotOnlinePrice", sortable: true, minWidth: 120 },
    { label: "Credit Price", accessor: "plotCreditPrice", sortable: true, minWidth: 120 },
    { label: "Plot Value", accessor: "plotValue", sortable: true, minWidth: 120 },
    { label: "Plot Online Amount", accessor: "onlineAmount", sortable: true, minWidth: 130 },
    { label: "Received Online Amount", accessor: "receivedOnlineAmount", sortable: true, minWidth: 130 },
    { label: "Pending Online Amount", accessor: "pendingOnlineAmount", sortable: true, minWidth: 130 },
    { label: "Plot Credit Points", accessor: "cashAmount", sortable: true, minWidth: 120 },
    { label: "Received Credit Points", accessor: "receivedCreditAmount", sortable: true, minWidth: 120 },
    { label: "Pending Credit Points", accessor: "pendingCreditAmount", sortable: true, minWidth: 120 },
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
  if (hasCPNameData) {
    columns.push({ label: "CPName", accessor: "CPName", sortable: true, minWidth: 120 });
  }
  return columns;
};

const getStatusColor = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "active" || s === "completed" || s === "done") return "bg-green-100 text-green-800 border-green-200";
  if (s === "cancelled" || s === "rejected") return "bg-red-100 text-red-800 border-red-200";
  return "bg-orange-100 text-orange-800 border-orange-200";
};

const getStatusIcon = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "active" || s === "completed" || s === "done") return <CheckCircle className="w-3 h-3" />;
  if (s === "cancelled" || s === "rejected") return <XCircle className="w-3 h-3" />;
  return <Clock className="w-3 h-3" />;
};

const MultiSelectDropdown: React.FC<{
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}> = ({ label, options, selectedValues, onChange, placeholder = "Select...", disabled = false, disabledMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (option === "All") {
      if (selectedValues.length === options.length - 1) {
        onChange([]);
      } else {
        onChange(options.filter(o => o !== "All"));
      }
    } else {
      if (selectedValues.includes(option)) {
        onChange(selectedValues.filter(v => v !== option));
      } else {
        onChange([...selectedValues, option]);
      }
    }
  };

  const isAllSelected = selectedValues.length === options.filter(o => o !== "All").length && selectedValues.length > 0;

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (isAllSelected) return "All Selected";
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <button type="button" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className={`w-full text-xs p-2 rounded-lg border text-left flex items-center justify-between ${disabled ? "bg-gray-200 cursor-not-allowed opacity-60" : "bg-gray-50 dark:bg-gray-700 hover:border-orange-400"}`}>
        <span className={`truncate ${selectedValues.length === 0 ? "text-gray-400" : ""}`}>{getDisplayText()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {disabled && disabledMessage && <div className="text-[10px] text-gray-400 mt-0.5">{disabledMessage}</div>}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div onClick={() => handleToggleOption("All")} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600">
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAllSelected ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
              {isAllSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-medium">Select All</span>
          </div>
          {options.filter(o => o !== "All").map((option) => (
            <div key={option} onClick={() => handleToggleOption(option)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedValues.includes(option) ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                {selectedValues.includes(option) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs truncate">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// FIXED: Changed props from selectedProject/selectedUser/selectedCPName to arrays
const CalculationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: CalculationData;
  selectedProjects: string[];
  selectedUsers: string[];
  selectedCPNames: string[];
}> = ({ isOpen, onClose, data, selectedProjects, selectedUsers, selectedCPNames }) => {
  if (!isOpen) return null;

  const calculationItems = [
    { label: "Total Plot Value", value: data.totalPlotValue, icon: Building2, color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Total Stamp Duty", value: data.totalStampDuty, icon: FileCheck, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Total Legal Fees", value: data.totalLegalFees, icon: Gavel, color: "from-slate-500 to-gray-500", bgColor: "bg-slate-50 dark:bg-slate-900/20" },
    { label: "Total Maintenance", value: data.totalMaintenance, icon: Calculator, color: "from-orange-500 to-cyan-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Plot Total Online Amount", value: data.totalOnlineAmount, icon: Wifi, color: "from-sky-500 to-orange-500", bgColor: "bg-sky-50 dark:bg-sky-900/20" },
    { label: "Total Received Online Amount", value: data.totalReceivedOnlineAmount, icon: Wifi, color: "from-orange-500 to-indigo-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Total Pending Online Amount", value: data.totalPendingOnlineAmount, icon: Wifi, color: "from-orange-500 to-red-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Total CP Commission", value: data.totalCpCommission, icon: Briefcase, color: "from-violet-500 to-purple-500", bgColor: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Plot Total Credit Points", value: data.totalCreditPoints, icon: Banknote, color: "from-teal-500 to-emerald-500", bgColor: "bg-teal-50 dark:bg-teal-900/20" },
    { label: "Total Received Credit Points", value: data.totalReceivedCreditAmount, icon: Banknote, color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Pending Credit Points", value: data.totalPendingCreditAmount, icon: Banknote, color: "from-rose-500 to-pink-500", bgColor: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Total User Incentive", value: data.totalUserIncentive, icon: TrendingUp, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
    { label: "Grand Total Amount", value: data.totalAmount, icon: Wallet, color: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Total Payment Received", value: data.totalPaymentReceived, icon: CheckCircle, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { label: "Total Pending Amount", value: data.totalPendingAmount, icon: AlertCircle, color: "from-red-500 to-rose-500", bgColor: "bg-red-50 dark:bg-red-900/20" },
    { label: "Total Difference", value: data.totalDifference, icon: Scale, color: data.totalDifference < 0 ? "from-red-500 to-pink-500" : "from-green-500 to-teal-500", bgColor: data.totalDifference < 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20" },
  ];

  // Check if all filters are empty (means "All")
  const isAllProjects = selectedProjects.length === 0;
  const isAllUsers = selectedUsers.length === 0;
  const isAllCPNames = selectedCPNames.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-md sm:text-1xl font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Collection Summary
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {/* FIXED: Now using arrays properly */}
                {!isAllProjects && selectedProjects.length > 0 && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm text-white font-medium">
                    Projects: {selectedProjects.length > 2 ? `${selectedProjects.length} selected` : selectedProjects.join(", ")}
                  </span>
                )}
                {!isAllUsers && selectedUsers.length > 0 && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm text-white font-medium">
                    Employees: {selectedUsers.length > 2 ? `${selectedUsers.length} selected` : selectedUsers.join(", ")}
                  </span>
                )}
                {!isAllCPNames && selectedCPNames.length > 0 && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm text-white font-medium">
                    CP Names: {selectedCPNames.length > 2 ? `${selectedCPNames.length} selected` : selectedCPNames.join(", ")}
                  </span>
                )}
                {isAllProjects && isAllUsers && isAllCPNames && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm text-white font-medium">
                    All Records
                  </span>
                )}
                <span className="px-3 py-1 bg-white/30 rounded-full text-xs sm:text-sm text-white font-semibold">
                  {data.recordCount} Records
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`${item.bgColor} rounded-xl p-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                      <Icon className="h-2 w-2 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.label}</span>
                  </div>
                  <p className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">Grand Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(data.totalAmount)}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.totalPendingAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollectionTable: React.FC<CollectionTableProps> = ({
  colletion = [],
  onEditColletion,
  onLeadClick,
  loading = false,
  disableInternalFetch = false,
  hasEditPermission = false,
}) => {
  const dispatch = useDispatch();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Collection; direction: "asc" | "desc"; } | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [selectedCPNames, setSelectedCPNames] = useState<string[]>([]);
  const [selectedRegistry, setSelectedRegistry] = useState("All");
  const [selectedEmiPlan, setSelectedEmiPlan] = useState("All");
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData>({
    totalPlotValue: 0, totalPaymentReceived: 0, totalPendingAmount: 0, totalMaintenance: 0,
    totalStampDuty: 0, totalLegalFees: 0, totalOnlineAmount: 0, totalReceivedOnlineAmount: 0,
    totalPendingOnlineAmount: 0, totalCreditPoints: 0, totalReceivedCreditAmount: 0,
    totalPendingCreditAmount: 0, totalAmount: 0, totalDifference: 0, totalCpCommission: 0,
    totalUserIncentive: 0, recordCount: 0,
  });

  useEffect(() => {
    if (!disableInternalFetch) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }) as any);
      dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: "" }) as any);
      dispatch(fetchRolePermissionsSidebar() as any);
    }
  }, [dispatch, disableInternalFetch]);

  useEffect(() => { setSelectedUsers([]); setSelectedPlots([]); setSelectedCPNames([]); }, [selectedProjects]);
  useEffect(() => { setSelectedPlots([]); setSelectedCPNames([]); }, [selectedUsers]);

  // const allProjects = useMemo(() => Array.from(new Set(colletion.map((l) => l.projectName || l.projectTitle).filter(Boolean) as string[])), [colletion]);

  // const availableEmployees = useMemo(() => {
  //   let data = colletion;
  //   if (selectedProjects.length > 0) {
  //     data = data.filter((l) => selectedProjects.includes(l.projectName || l.projectTitle || ""));
  //   }
  //   return Array.from(new Set(data.map((l) => l.employeeName || l.createdBy).filter(Boolean) as string[]));
  // }, [colletion, selectedProjects]);

  // const availablePlots = useMemo(() => {
  //   if (selectedProjects.length === 0 && selectedUsers.length === 0) return [];
  //   let data = colletion;
  //   if (selectedProjects.length > 0) data = data.filter((l) => selectedProjects.includes(l.projectName || l.projectTitle || ""));
  //   if (selectedUsers.length > 0) data = data.filter((l) => selectedUsers.includes(l.employeeName || l.createdBy || ""));
  //   return Array.from(new Set(data.map((l) => l.plotNumber).filter(Boolean) as string[]));
  // }, [colletion, selectedProjects, selectedUsers]);

  // const availableCPNames = useMemo(() => {
  //   if (selectedUsers.length === 0) return [];
  //   let data = colletion;
  //   if (selectedProjects.length > 0) data = data.filter((l) => selectedProjects.includes(l.projectName || l.projectTitle || ""));
  //   if (selectedUsers.length > 0) data = data.filter((l) => selectedUsers.includes(l.employeeName || l.createdBy || ""));
  //   const cpNames = data.map((l) => l.CPName).filter((cp): cp is string => isValidCPName(cp));
  //   return Array.from(new Set(cpNames));
  // }, [colletion, selectedProjects, selectedUsers]);


  const allProjects = useMemo(() =>
    Array.from(new Set(
      colletion
        .map((l) => (l.projectName || l.projectTitle || "").trim())
        .filter(Boolean)
    )),
    [colletion]);

  const availableEmployees = useMemo(() => {
    let data = colletion;
    if (selectedProjects.length > 0) {
      data = data.filter((l) => selectedProjects.includes((l.projectName || l.projectTitle || "").trim()));
    }
    return Array.from(new Set(
      data
        .map((l) => (l.employeeName || l.createdBy || "").trim())
        .filter(Boolean)
    ));
  }, [colletion, selectedProjects]);

  const availablePlots = useMemo(() => {
    if (selectedProjects.length === 0 && selectedUsers.length === 0) return [];
    let data = colletion;
    if (selectedProjects.length > 0) data = data.filter((l) => selectedProjects.includes((l.projectName || l.projectTitle || "").trim()));
    if (selectedUsers.length > 0) data = data.filter((l) => selectedUsers.includes((l.employeeName || l.createdBy || "").trim()));
    return Array.from(new Set(
      data
        .map((l) => (l.plotNumber || "").trim())
        .filter(Boolean)
    ));
  }, [colletion, selectedProjects, selectedUsers]);

  const availableCPNames = useMemo(() => {
    if (selectedUsers.length === 0) return [];
    let data = colletion;
    if (selectedProjects.length > 0) data = data.filter((l) => selectedProjects.includes((l.projectName || l.projectTitle || "").trim()));
    if (selectedUsers.length > 0) data = data.filter((l) => selectedUsers.includes((l.employeeName || l.createdBy || "").trim()));
    const cpNames = data
      .map((l) => (l.CPName || "").trim())
      .filter((cp): cp is string => isValidCPName(cp));
    return Array.from(new Set(cpNames));
  }, [colletion, selectedProjects, selectedUsers]);

  const anyCPNameExists = useMemo(() => colletion.some((l) => isValidCPName(l.CPName)), [colletion]);

  const filterOptions = useMemo(() => ({
    registries: ["All", ...Array.from(new Set(colletion.map((l) => l.registryStatus).filter((v): v is string => Boolean(v))))],
    emiPlans: ["All", ...Array.from(new Set(colletion.map((l) => l.emiPlan || l.emi).filter((v): v is string => Boolean(v))))],
  }), [colletion]);

  // const filteredCollections = useMemo(() => colletion.filter((item) => {
  //   const lowSearch = searchTerm.toLowerCase().trim();
  //   const matchesSearch = !lowSearch || (item.clientName || "").toLowerCase().includes(lowSearch) || (item.employeeName || "").toLowerCase().includes(lowSearch) || (item.plotNumber || "").toLowerCase().includes(lowSearch) || (item.mobileNumber || "").toLowerCase().includes(lowSearch) || (item.CPName || "").toLowerCase().includes(lowSearch);
  //   const matchesProject = selectedProjects.length === 0 || selectedProjects.includes(item.projectName || item.projectTitle || "");
  //   const matchesUser = selectedUsers.length === 0 || selectedUsers.includes(item.employeeName || item.createdBy || "");
  //   const matchesPlot = selectedPlots.length === 0 || selectedPlots.includes(item.plotNumber);
  //   const matchesCPName = selectedCPNames.length === 0 || selectedCPNames.includes(item.CPName || "");
  //   const matchesRegistry = selectedRegistry === "All" || item.registryStatus === selectedRegistry;
  //   const matchesEmi = selectedEmiPlan === "All" || (item.emiPlan || item.emi) === selectedEmiPlan;
  //   return matchesSearch && matchesProject && matchesUser && matchesPlot && matchesCPName && matchesRegistry && matchesEmi;
  // }), [colletion, searchTerm, selectedProjects, selectedUsers, selectedPlots, selectedCPNames, selectedRegistry, selectedEmiPlan]);




  const filteredCollections = useMemo(() => colletion.filter((item) => {
    const lowSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = !lowSearch || (item.clientName || "").toLowerCase().includes(lowSearch) || (item.employeeName || "").toLowerCase().includes(lowSearch) || (item.plotNumber || "").toLowerCase().includes(lowSearch) || (item.mobileNumber || "").toLowerCase().includes(lowSearch) || (item.CPName || "").toLowerCase().includes(lowSearch);
    const matchesProject = selectedProjects.length === 0 || selectedProjects.includes((item.projectName || item.projectTitle || "").trim());
    const matchesUser = selectedUsers.length === 0 || selectedUsers.includes((item.employeeName || item.createdBy || "").trim());
    const matchesPlot = selectedPlots.length === 0 || selectedPlots.includes((item.plotNumber || "").trim());
    const matchesCPName = selectedCPNames.length === 0 || selectedCPNames.includes((item.CPName || "").trim());
    const matchesRegistry = selectedRegistry === "All" || item.registryStatus === selectedRegistry;
    const matchesEmi = selectedEmiPlan === "All" || (item.emiPlan || item.emi) === selectedEmiPlan;
    return matchesSearch && matchesProject && matchesUser && matchesPlot && matchesCPName && matchesRegistry && matchesEmi;
  }), [colletion, searchTerm, selectedProjects, selectedUsers, selectedPlots, selectedCPNames, selectedRegistry, selectedEmiPlan]);


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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, pageSize, selectedProjects, selectedUsers, selectedPlots, selectedCPNames, selectedRegistry, selectedEmiPlan]);

  const handleSort = (key: keyof Collection) => setSortConfig({ key, direction: sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });

  const parseAmount = (value: string | number | null | undefined): number => {
    if (!value || value === "N/A") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  // const handleCalculate = () => {
  //   let dataToCalculate = colletion;
  //   if (selectedProjects.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedProjects.includes(item.projectName || item.projectTitle || ""));
  //   if (selectedUsers.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedUsers.includes(item.employeeName || item.createdBy || ""));
  //   if (selectedCPNames.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedCPNames.includes(item.CPName || ""));

  //   const calculations: CalculationData = {
  //     totalPlotValue: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.plotValue), 0),
  //     totalPaymentReceived: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.paymentReceived), 0),
  //     totalPendingAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingAmount), 0),
  //     totalMaintenance: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.maintenance), 0),
  //     totalStampDuty: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.stampDuty), 0),
  //     totalLegalFees: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.legalFees), 0),
  //     totalOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.onlineAmount), 0),
  //     totalReceivedOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.receivedOnlineAmount), 0),
  //     totalPendingOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingOnlineAmount), 0),
  //     totalCreditPoints: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.cashAmount), 0),
  //     totalReceivedCreditAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.receivedCreditAmount), 0),
  //     totalPendingCreditAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingCreditAmount), 0),
  //     totalAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.totalAmount), 0),
  //     totalDifference: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.difference), 0),
  //     totalCpCommission: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.commission), 0),
  //     totalUserIncentive: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.incentive), 0),
  //     recordCount: dataToCalculate.length,
  //   };
  //   setCalculationData(calculations);
  //   setIsCalculationModalOpen(true);
  // };




  const handleCalculate = () => {
    let dataToCalculate = colletion;
    if (selectedProjects.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedProjects.includes((item.projectName || item.projectTitle || "").trim()));
    if (selectedUsers.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedUsers.includes((item.employeeName || item.createdBy || "").trim()));
    if (selectedCPNames.length > 0) dataToCalculate = dataToCalculate.filter((item) => selectedCPNames.includes((item.CPName || "").trim()));

    const calculations: CalculationData = {
      totalPlotValue: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.plotValue), 0),
      totalPaymentReceived: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.paymentReceived), 0),
      totalPendingAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingAmount), 0),
      totalMaintenance: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.maintenance), 0),
      totalStampDuty: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.stampDuty), 0),
      totalLegalFees: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.legalFees), 0),
      totalOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.onlineAmount), 0),
      totalReceivedOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.receivedOnlineAmount), 0),
      totalPendingOnlineAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingOnlineAmount), 0),
      totalCreditPoints: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.cashAmount), 0),
      totalReceivedCreditAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.receivedCreditAmount), 0),
      totalPendingCreditAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.pendingCreditAmount), 0),
      totalAmount: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.totalAmount), 0),
      totalDifference: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.difference), 0),
      totalCpCommission: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.commission), 0),
      totalUserIncentive: dataToCalculate.reduce((sum, item) => sum + parseAmount(item.incentive), 0),
      recordCount: dataToCalculate.length,
    };
    setCalculationData(calculations);
    setIsCalculationModalOpen(true);
  };

  const formatCollectionData = (collection: Collection) => ({
    ...collection,
    formattedRegistryStatus: (<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(collection.registryStatus)}`}>{getStatusIcon(collection.registryStatus)}{collection.registryStatus || "N/A"}</span>),
    formattedPrice: formatCurrency(collection.price),
    formattedPlotOnlinePrice: formatCurrency(collection.plotOnlinePrice),
    formattedPlotCreditPrice: formatCurrency(collection.plotCreditPrice),
    formattedPlotValue: formatCurrency(collection.plotValue),
    formattedPaymentReceived: formatCurrency(collection.paymentReceived),
    formattedPendingAmount: formatCurrency(collection.pendingAmount),
    formattedCommission: formatCurrency(collection.commission),
    formattedMaintenance: formatCurrency(collection.maintenance),
    formattedStampDuty: formatCurrency(collection.stampDuty),
    formattedLegalFees: formatCurrency(collection.legalFees),
    formattedOnlineAmount: formatCurrency(collection.onlineAmount),
    formattedReceivedOnlineAmount: formatCurrency(collection.receivedOnlineAmount),
    formattedPendingOnlineAmount: formatCurrency(collection.pendingOnlineAmount),
    formattedCashAmount: formatCurrency(collection.cashAmount),
    formattedReceivedCreditAmount: formatCurrency(collection.receivedCreditAmount),
    formattedPendingCreditAmount: formatCurrency(collection.pendingCreditAmount),
    formattedTotalAmount: formatCurrency(collection.totalAmount),
    formattedDifference: formatCurrency(collection.difference),
    formattedIncentive: formatCurrency(collection.incentive),
    formattedEmi: collection.emiPlan || collection.emi,
  });

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Showing <span className="font-bold text-orange-600">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-green-700">{totalRecords.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          {totalPages > 1 && <PaginationButtons currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          {/* <button onClick={handleCalculate} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg">Calculate</button> */}


          <button onClick={handleCalculate} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md">
            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Calculate</span>
          </button>

        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search client, employee, plot, mobile, CP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border dark:bg-gray-800 border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-sm border rounded-lg p-1.5 bg-white dark:bg-gray-800">
            <option value={5}>5 entries</option>
            <option value={25}>25 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setViewMode("card")} className={`p-1.5 hover:bg-black hover:text-white ${viewMode === "card" ? "bg-orange-500 text-white" : "bg-black text-white"}`}><LayoutGrid className="w-5 h-5" /></button>
            <button onClick={() => setViewMode("table")} className={`p-1.5 hover:bg-black hover:text-white ${viewMode === "table" ? "bg-orange-500 text-white" : "bg-black text-white"}`}><Table2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
        <MultiSelectDropdown label="Project" options={["All", ...allProjects]} selectedValues={selectedProjects} onChange={setSelectedProjects} placeholder="All Projects" />
        <MultiSelectDropdown label="Employee" options={["All", ...availableEmployees]} selectedValues={selectedUsers} onChange={setSelectedUsers} placeholder={selectedProjects.length > 0 ? "Select Employee" : "All Employees"} />
        <MultiSelectDropdown label="Plot No." options={["All", ...availablePlots]} selectedValues={selectedPlots} onChange={setSelectedPlots} placeholder="Select Plot" disabled={selectedProjects.length === 0 && selectedUsers.length === 0} disabledMessage="Select Project or Employee first" />
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Registry</label>
          <select value={selectedRegistry} onChange={(e) => setSelectedRegistry(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">
            {filterOptions.registries.map((o: string) => (<option key={o} value={o}>{o}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">EMI Plan</label>
          <select value={selectedEmiPlan} onChange={(e) => setSelectedEmiPlan(e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-gray-50 dark:bg-gray-700">
            {filterOptions.emiPlans.map((o: string) => (<option key={o} value={o}>{o}</option>))}
          </select>
        </div>
        {anyCPNameExists && (
          <MultiSelectDropdown label="CP Name" options={["All", ...availableCPNames]} selectedValues={selectedCPNames} onChange={setSelectedCPNames} placeholder="Select CP Name" disabled={selectedUsers.length === 0} disabledMessage={selectedUsers.length === 0 ? "Select Employee first" : availableCPNames.length === 0 ? "No CP data available" : undefined} />
        )}
      </div>

      {loading ? (
        <div className="p-8 sm:p-12 text-center bg-transparent rounded-lg border"><div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div></div>
      ) : viewMode === "table" ? (
        <div className="rounded-lg shadow-sm border overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>{getCollectionColumns(anyCPNameExists).map(c => <th key={c.accessor} className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium uppercase text-gray-500 text-[10px] sm:text-xs whitespace-nowrap" onClick={() => handleSort(c.accessor as any)}>{c.label}</th>)}{hasEditPermission && <th className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs">Actions</th>}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCollections.map(item => (
                <tr key={item.id}>
                  {getCollectionColumns(anyCPNameExists).map(c => {
                    if (c.accessor === 'CPName') return <td key={c.accessor} className="px-2 sm:px-4 py-2 sm:py-4 text-[10px] sm:text-xs whitespace-nowrap">{isValidCPName(item.CPName) ? item.CPName : '-'}</td>;
                    const currencyFields = ['price', 'plotOnlinePrice', 'plotCreditPrice', 'plotValue', 'onlineAmount', 'receivedOnlineAmount', 'pendingOnlineAmount', 'cashAmount', 'receivedCreditAmount', 'pendingCreditAmount', 'paymentReceived', 'pendingAmount', 'maintenance', 'stampDuty', 'legalFees', 'commission', 'incentive', 'totalAmount', 'difference'];
                    if (currencyFields.includes(c.accessor)) return <td key={c.accessor} className="px-2 sm:px-4 py-2 sm:py-4 text-[10px] sm:text-xs whitespace-nowrap">{formatCurrency((item as any)[c.accessor])}</td>;
                    return <td key={c.accessor} className="px-2 sm:px-4 py-2 sm:py-4 text-[10px] sm:text-xs whitespace-nowrap">{(item as any)[c.accessor] || "N/A"}</td>;
                  })}
                  {hasEditPermission && (<td className="px-2 sm:px-4 py-2 sm:py-4"><button onClick={() => onEditColletion && onEditColletion(item)} className="text-orange-500"><Edit size={14} className="sm:w-4 sm:h-4" /></button></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {paginatedCollections.map((collection) => {
            const formatted = formatCollectionData(collection);
            const showCPName = isValidCPName(collection.CPName);
            return (
              <div key={collection.id} onMouseEnter={() => setHoveredId(collection.id)} onMouseLeave={() => setHoveredId(null)} className="relative overflow-hidden rounded-xl sm:rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg">
                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 sm:px-2 py-0.5 rounded">{collection.projectName || "N/A"}</span>
                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Registry:</span>
                        {!collection.registryStatus || collection.registryStatus === "Pending" || collection.registryStatus === "N/A" ? (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 border bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span className="capitalize">Pending</span></span>
                        ) : (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 border bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span className="capitalize">Done</span></span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-50 cursor-pointer" onClick={() => onLeadClick && onLeadClick(collection)}>{collection.clientName || "Unnamed Client"}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5 sm:gap-2"><Phone size={12} className="sm:w-3.5 sm:h-3.5 text-indigo-500 flex-shrink-0" /><span className="truncate">{collection.mobileNumber || "N/A"}</span></div>
                    <div className="flex items-center gap-1.5 sm:gap-2"><Mail size={12} className="sm:w-3.5 sm:h-3.5 text-orange-500 flex-shrink-0" /><span className="truncate">{collection.emailId || "N/A"}</span></div>
                    <div className="flex items-center gap-1.5 sm:gap-2"><User size={12} className="sm:w-3.5 sm:h-3.5 text-green-500 flex-shrink-0" /><span className="truncate">{collection.employeeName || "N/A"}</span></div>
                    <div className="flex items-center gap-1.5 sm:gap-2"><Hash size={12} className="sm:w-3.5 sm:h-3.5 text-purple-500 flex-shrink-0" /><span>Plot: {collection.plotNumber || "N/A"}</span></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div><p className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-0.5 sm:mb-1"><Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Plot Size</p><p className="text-xs sm:text-sm font-bold">{collection.plotSize || "N/A"}</p></div>
                    <div><p className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-0.5 sm:mb-1"><IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Price</p><p className="text-xs sm:text-sm font-bold">{formatted.formattedPrice}</p></div>
                    <div><p className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-0.5 sm:mb-1"><IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Online Price</p><p className="text-xs sm:text-sm font-bold">{formatted.formattedPlotOnlinePrice}</p></div>
                    <div><p className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-0.5 sm:mb-1"><IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Credit Price</p><p className="text-xs sm:text-sm font-bold">{formatted.formattedPlotCreditPrice}</p></div>
                    <div><p className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-0.5 sm:mb-1"><Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Plot Value</p><p className="text-xs sm:text-sm font-bold">{formatted.formattedPlotValue}</p></div>
                    <div><p className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-0.5 sm:mb-1">EMI Plan</p><p className="text-xs sm:text-sm font-bold">{formatted.formattedEmi || "N/A"}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-green-500" /> Payment Received</p><p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">{formatted.formattedPaymentReceived}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-red-500" /> Pending Amount</p><p className="text-sm sm:text-lg font-bold text-red-600 dark:text-red-400">{formatted.formattedPendingAmount}</p></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-orange-500" /> Plot Online Amt</p><p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400">{formatted.formattedOnlineAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-orange-500" />Received Online</p><p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400">{formatted.formattedReceivedOnlineAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-orange-500" />Pending Online</p><p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400">{formatted.formattedPendingOnlineAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-emerald-500" /> Plot Credit Pts</p><p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatted.formattedCashAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-emerald-500" />Received Credit</p><p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatted.formattedReceivedCreditAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-emerald-500" />Pending Credit</p><p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatted.formattedPendingCreditAmount}</p></div>
                  </div>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div><p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Calculator className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Maintenance</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedMaintenance}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><FileCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Stamp Duty</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedStampDuty}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Gavel className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Legal Fees</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedLegalFees}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Briefcase className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Cp Commission</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{formatted.formattedCommission}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> User Incentive</p><p className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">{formatted.formattedIncentive}</p></div>
                  </div>
                  <div className={`grid grid-cols-1 ${showCPName ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/10 border-orange-200 dark:border-orange-700`}>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Wallet className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Total Amount</p><p className="text-base sm:text-xl font-bold text-orange-600 dark:text-orange-400">{formatted.formattedTotalAmount}</p></div>
                    <div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><Scale className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Difference</p><p className={`text-base sm:text-xl font-bold ${parseFloat(String(collection.difference || 0)) < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{formatted.formattedDifference}</p></div>
                    {showCPName && (<div><p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center mb-0.5 sm:mb-1"><UserCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> CP Name</p><p className="text-base sm:text-xl font-bold text-purple-600 dark:text-purple-400">{collection.CPName}</p></div>)}
                  </div>
                  {hoveredId === collection.id && hasEditPermission && onEditColletion && (
                    <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                      <button onClick={() => onEditColletion(collection)} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"><Edit className="h-3 w-3 sm:h-4 sm:w-4" /> Edit</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CalculationModal isOpen={isCalculationModalOpen} onClose={() => setIsCalculationModalOpen(false)} data={calculationData} selectedProjects={selectedProjects} selectedUsers={selectedUsers} selectedCPNames={selectedCPNames} />
    </div>
  );
};

export default CollectionTable;