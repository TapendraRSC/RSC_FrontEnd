"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Users,
    Globe,
    Facebook,
    Activity,
    Search,
    Calendar,
    Clock,
    AlertTriangle,
    EyeOff,
    Sparkles,
    Target,
    Zap,
    Phone,
    Mail,
    UserCheck,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import axiosInstance from "@/libs/axios";
import { toast } from "react-toastify";

// Types
interface SearchResultItem {
    id?: number;
    leadName?: string;
    name?: string;
    email?: string | null;
    phone?: string;
    assignedUser?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SearchResultItem[];
}

interface StatItem {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    route?: string;
    tab?: string;
    trend?: number;
    trendDirection?: "up" | "down";
}

// Search Modal Component - Fully Responsive
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            style={{ margin: "0px" }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 flex-shrink-0">
                                <Search size={16} className="sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                                    Search Results
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {data.length} leads found
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group flex-shrink-0"
                        >
                            <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 text-lg sm:text-xl font-light">
                                ✕
                            </span>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
                    {data.length === 0 ? (
                        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                No results found
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm px-4">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {data?.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800/40 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-3 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-violet-300 dark:hover:border-violet-600 cursor-pointer"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Lead Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                                                <User className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg truncate">
                                                    {item?.leadName || item?.name || "N/A"}
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">Lead #{item?.id || idx + 1}</p>
                                            </div>
                                            <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors flex-shrink-0 hidden sm:block" size={20} />
                                        </div>

                                        {/* Contact Info - Wrap on mobile */}
                                        <div className="flex flex-wrap gap-2">
                                            {item?.phone && (
                                                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50">
                                                    <Phone className="text-emerald-500 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">{item.phone}</span>
                                                </div>
                                            )}
                                            {item?.email && (
                                                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 max-w-full">
                                                    <Mail className="text-amber-500 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 truncate max-w-[120px] sm:max-w-[180px]">
                                                        {item.email}
                                                    </span>
                                                </div>
                                            )}
                                            {item?.assignedUser && (
                                                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-700/50">
                                                    <UserCheck className="text-violet-500 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-medium text-violet-700 dark:text-violet-300 truncate max-w-[100px]">
                                                        {item.assignedUser}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Component
const SalesDashboard = () => {
    const router = useRouter();
    const [statsData, setStatsData] = useState<StatItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const sourceData = [
        { title: "HomeOnline", value: 0, icon: <Globe size={18} />, color: "purple" },
        { title: "MagicBricks", value: 0, icon: <Globe size={18} />, color: "red" },
        { title: "Facebook", value: 30, icon: <Facebook size={18} />, color: "blue" },
        { title: "Housing.com", value: 0, icon: <Globe size={18} />, color: "green" },
        { title: "99acres.com", value: 0, icon: <Globe size={18} />, color: "orange" },
    ];

    // Ref to prevent duplicate API calls (StrictMode double-mount)
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchStats();
    }, []);

    const getRouteAndTabForKey = (key: string): { route?: string; tab?: string } => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("user")) return { route: "/users" };
        if (lowerKey.includes("project")) return { route: "/projectstatus" };
        if (lowerKey.includes("todayfollowup") || lowerKey.includes("today_followup") || lowerKey.includes("today followup")) {
            return { route: "/lead", tab: "todayFollowup" };
        }
        if (lowerKey.includes("pendingfollowup") || lowerKey.includes("pending_followup") || lowerKey.includes("pending followup")) {
            return { route: "/lead", tab: "pendingFollowup" };
        }
        if (lowerKey.includes("futurefollowup") || lowerKey.includes("future_followup") || lowerKey.includes("future followup")) {
            return { route: "/lead", tab: "future-followup" };
        }
        if (lowerKey.includes("freshlead") || lowerKey.includes("fresh_lead") || lowerKey.includes("fresh lead")) {
            return { route: "/lead", tab: "freshLead" };
        }
        if (lowerKey.includes("hotlead") || lowerKey.includes("hot_lead") || lowerKey.includes("hot lead")) {
            return { route: "/lead", tab: "hotLead" };
        }
        if (lowerKey.includes("warmlead") || lowerKey.includes("warm_lead") || lowerKey.includes("warm lead")) {
            return { route: "/lead", tab: "warmLead" };
        }
        if (lowerKey.includes("coldlead") || lowerKey.includes("cold_lead") || lowerKey.includes("cold lead")) {
            return { route: "/lead", tab: "coldLead" };
        }
        if (lowerKey.includes("dumplead") || lowerKey.includes("dump_lead") || lowerKey.includes("dump lead")) {
            return { route: "/lead", tab: "dumpLead" };
        }
        if (lowerKey.includes("lead")) return { route: "/lead", tab: "list" };
        return {};
    };

    const getIconForKey = (key: string): React.ReactNode => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("user")) return <User size={20} />;
        if (lowerKey.includes("todayfollowup") || lowerKey.includes("today_followup")) return <Calendar size={20} />;
        if (lowerKey.includes("pendingfollowup") || lowerKey.includes("pending_followup")) return <Clock size={20} />;
        if (lowerKey.includes("futurefollowup") || lowerKey.includes("future_followup")) return <Clock size={20} />;
        if (lowerKey.includes("fresh")) return <Sparkles size={20} />;
        if (lowerKey.includes("hot")) return <Zap size={20} />;
        if (lowerKey.includes("warm")) return <Target size={20} />;
        if (lowerKey.includes("cold")) return <AlertTriangle size={20} />;
        if (lowerKey.includes("dump")) return <EyeOff size={20} />;
        return <Users size={20} />;
    };

    const getColorForKey = (key: string): string => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("user")) return "orange";
        if (lowerKey.includes("project")) return "purple";
        if (lowerKey.includes("todayfollowup") || lowerKey.includes("today_followup")) return "emerald";
        if (lowerKey.includes("pendingfollowup") || lowerKey.includes("pending_followup")) return "orange";
        if (lowerKey.includes("futurefollowup") || lowerKey.includes("future_followup")) return "cyan";
        if (lowerKey.includes("fresh")) return "violet";
        if (lowerKey.includes("hot")) return "rose";
        if (lowerKey.includes("warm")) return "amber";
        if (lowerKey.includes("cold")) return "sky";
        if (lowerKey.includes("dump")) return "slate";
        if (lowerKey.includes("plot")) return "pink";
        if (lowerKey.includes("lead")) return "indigo";
        return "orange";
    };

    const handleCardClick = (route?: string, tab?: string) => {
        if (route) {
            if (tab) {
                router.push(`${route}?tab=${tab}`);
            } else {
                router.push(route);
            }
        }
    };

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/dashboard/dashboard-stats");
            const data = res.data.data;
            const updatedStats: StatItem[] = Object.entries(data).map(([key, value]) => {
                const title = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                const { route, tab } = getRouteAndTabForKey(key);
                const icon = getIconForKey(key);
                const color = getColorForKey(key);
                const trend = Math.random() * 30 - 10;
                const trendDirection = trend >= 0 ? "up" : "down";

                return {
                    title,
                    value: (value as number) ?? 0,
                    icon,
                    color,
                    route,
                    tab,
                    trend: Math.abs(trend),
                    trendDirection
                };
            });
            setStatsData(updatedStats);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            setStatsData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.warning("Please enter a search term");
            return;
        }
        setIsSearching(true);
        try {
            const res = await axiosInstance.get(`dashboard/search-leads?search=${encodeURIComponent(searchQuery)}`);
            const results = Array.isArray(res.data?.data) ? res.data?.data : [res.data?.data];
            setSearchResults(results);
            setIsSearchModalOpen(true);
        } catch (error) {
            console.error("Error searching leads:", error);
            toast.error("Error searching leads");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const getGradientClasses = (color: string) => {
        const gradients: Record<string, string> = {
            blue: "from-blue-500 to-blue-600",
            emerald: "from-emerald-500 to-emerald-600",
            purple: "from-purple-500 to-purple-600",
            orange: "from-orange-500 to-orange-600",
            pink: "from-pink-500 to-pink-600",
            slate: "from-slate-500 to-slate-600",
            red: "from-red-500 to-red-600",
            rose: "from-rose-500 to-rose-600",
            green: "from-green-500 to-green-600",
            amber: "from-amber-500 to-amber-600",
            cyan: "from-cyan-500 to-cyan-600",
            sky: "from-sky-500 to-sky-600",
            violet: "from-violet-500 to-violet-600",
            indigo: "from-indigo-500 to-indigo-600",
        };
        return gradients[color] || gradients.orange;
    };

    const getColorClasses = (color: string, type = "bg") => {
        const colors: Record<string, string> = {
            blue: type === "bg" ? "bg-blue-500 text-white" : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/40",
            emerald: type === "bg" ? "bg-emerald-500 text-white" : "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/40",
            purple: type === "bg" ? "bg-purple-500 text-white" : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/40",
            orange: type === "bg" ? "bg-orange-500 text-white" : "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/40",
            pink: type === "bg" ? "bg-pink-500 text-white" : "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/40",
            slate: type === "bg" ? "bg-slate-500 text-white" : "text-slate-600 bg-slate-50 dark:text-slate-300 dark:bg-slate-800/50",
            red: type === "bg" ? "bg-red-500 text-white" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/40",
            green: type === "bg" ? "bg-green-500 text-white" : "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/40",
            yellow: type === "bg" ? "bg-yellow-500 text-white" : "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/40",
        };
        return colors[color] || colors.orange;
    };

    const getShadowClasses = (color: string) => {
        const shadows: Record<string, string> = {
            blue: "shadow-blue-500/25",
            emerald: "shadow-emerald-500/25",
            purple: "shadow-purple-500/25",
            orange: "shadow-orange-500/25",
            pink: "shadow-pink-500/25",
            slate: "shadow-slate-500/25",
            red: "shadow-red-500/25",
            rose: "shadow-rose-500/25",
            green: "shadow-green-500/25",
            amber: "shadow-amber-500/25",
            cyan: "shadow-cyan-500/25",
            sky: "shadow-sky-500/25",
            violet: "shadow-violet-500/25",
            indigo: "shadow-indigo-500/25",
        };
        return shadows[color] || shadows.orange;
    };

    // Skeleton - Responsive
    const renderSkeleton = (count: number) => {
        return Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4 md:p-5 animate-pulse">
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl sm:rounded-2xl flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                        <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1.5"></div>
                        <div className="h-5 sm:h-6 md:h-7 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden mt-2 sm:mt-3">
                    <div className="h-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full w-2/3"></div>
                </div>
            </div>
        ));
    };

    // Source Skeleton - Responsive
    const renderSourceSkeleton = (count: number) => {
        return Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 animate-pulse">
                <div className="inline-flex w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl mb-1.5 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-4 sm:h-5 md:h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
            </div>
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Decorative Background Elements - Hidden on very small screens */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
                <div className="absolute -top-40 -right-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gradient-to-br from-orange-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gradient-to-br from-rose-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-2 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">

                    {/* Header Section - Fully Responsive */}
                    <div className="flex flex-col gap-4">
                        {/* Title Row */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <Activity className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent leading-tight">
                                    Sales Dashboard
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 sm:mt-1 truncate">
                                    Real-time analytics & lead performance
                                </p>
                            </div>
                        </div>

                        {/* Search Bar - Full Width on Mobile */}
                        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md lg:ml-auto">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search leads..."
                                        maxLength={50}
                                        className="w-full pl-10 sm:pl-12 pr-20 sm:pr-28 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-0 focus:border-violet-500 dark:focus:border-violet-400 transition-all text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                                        <Search className="text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSearching}
                                        className="absolute right-1.5 sm:right-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                                    >
                                        {isSearching ? (
                                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                                        )}
                                        <span className="hidden xs:inline">Search</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Main Stats Grid - Responsive */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {isLoading
                            ? renderSkeleton(16)
                            : statsData.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleCardClick(item.route, item.tab)}
                                    className={`group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4 md:p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 ${item.route ? 'cursor-pointer' : ''}`}
                                >
                                    {/* Card Content - Vertical Layout for better fit */}
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        {/* Icon - Responsive */}
                                        <div className={`p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getGradientClasses(item.color)} shadow-lg ${getShadowClasses(item.color)} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                            <div className="text-white w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                        </div>
                                        {/* Text Content */}
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            {/* Title - Small, can wrap to 2 lines */}
                                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight line-clamp-2 break-words">
                                                {item.title}
                                            </p>
                                            {/* Value - Always visible, never cut */}
                                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">
                                                {(item.value ?? 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden mt-2 sm:mt-3">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${getGradientClasses(item.color)} transition-all duration-500`}
                                            style={{ width: `${Math.min((item.value / 100) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Lead Sources Section - Fully Responsive */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
                        {/* Header */}
                        <h2 className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <Globe className="text-orange-500 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Lead Sources</span>
                        </h2>

                        {/* Grid - Responsive */}
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                            {isLoading
                                ? renderSourceSkeleton(5)
                                : sourceData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                                    >
                                        {/* Icon */}
                                        <div className={`inline-flex p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl ${getColorClasses(item.color, "bg")} group-hover:scale-110 transition-transform duration-300`}>
                                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                        </div>

                                        {/* Title */}
                                        <p className="mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate px-0.5">
                                            {item.title}
                                        </p>

                                        {/* Value */}
                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 dark:text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                data={searchResults}
            />
        </div>
    );
};

export default SalesDashboard;