"use client";
import React, { useEffect, useState } from "react";
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
    Tag,
    AlertTriangle,
    EyeOff,
} from "lucide-react";
import axiosInstance from "@/libs/axios";
import { toast } from "react-toastify";
import { Phone, Mail, UserCheck } from "lucide-react";

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

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ margin: "0px" }}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Search size={20} className="text-blue-500" />
                            Search Results
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xl">
                                ✕
                            </span>
                        </button>
                    </div>

                    {/* Results */}
                    {data.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                No results found
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        {/* Lead Name */}
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <User className="text-blue-500 flex-shrink-0" size={18} />
                                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                {item?.leadName || item?.name || "N/A"}
                                            </p>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            {item?.phone && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Phone className="text-green-500 flex-shrink-0" size={16} />
                                                    <span className="text-slate-600 dark:text-slate-300">{item.phone}</span>
                                                </div>
                                            )}
                                            {item?.email && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Mail className="text-amber-500 flex-shrink-0" size={16} />
                                                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                                                        {item.email}
                                                    </span>
                                                </div>
                                            )}
                                            {item?.assignedUser && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="text-purple-500 flex-shrink-0" size={16} />
                                                    <span className="text-slate-600 dark:text-slate-300">
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

interface StatItem {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    route?: string;
    tab?: string; // Add tab parameter for lead filtering
}

const SalesDashboard = () => {
    const router = useRouter();
    const [statsData, setStatsData] = useState<StatItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const sourceData = [
        { title: "HomeOnline", value: 0, icon: <Globe size={18} />, color: "slate" },
        { title: "MagicBricks", value: 0, icon: <Globe size={18} />, color: "red" },
        { title: "Facebook", value: 30, icon: <Facebook size={18} />, color: "blue" },
        { title: "Housing.com", value: 0, icon: <Globe size={18} />, color: "green" },
        { title: "99acres.com", value: 0, icon: <Globe size={18} />, color: "yellow" },
    ];

    useEffect(() => {
        fetchStats();
    }, []);

    // Mapping for API keys to tab IDs and routes
    const getRouteAndTabForKey = (key: string): { route?: string; tab?: string } => {
        const lowerKey = key.toLowerCase();

        // User related
        if (lowerKey.includes("user")) {
            return { route: "/users" };
        }

        // Project related
        if (lowerKey.includes("project")) {
            return { route: "/projectstatus" };
        }

        // Lead related with specific tabs
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

        // Generic lead (all leads)
        if (lowerKey.includes("lead")) {
            return { route: "/lead", tab: "list" };
        }

        return {};
    };

    // Get icon based on key
    const getIconForKey = (key: string): React.ReactNode => {
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes("user")) return <User size={18} />;
        if (lowerKey.includes("todayfollowup") || lowerKey.includes("today_followup")) return <Calendar size={18} />;
        if (lowerKey.includes("pendingfollowup") || lowerKey.includes("pending_followup")) return <Clock size={18} />;
        if (lowerKey.includes("futurefollowup") || lowerKey.includes("future_followup")) return <Clock size={18} />;
        if (lowerKey.includes("fresh")) return <Tag size={18} />;
        if (lowerKey.includes("hot") || lowerKey.includes("warm") || lowerKey.includes("cold")) return <AlertTriangle size={18} />;
        if (lowerKey.includes("dump")) return <EyeOff size={18} />;

        return <Users size={18} />;
    };

    // Get color based on key
    const getColorForKey = (key: string): string => {
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes("user")) return "blue";
        if (lowerKey.includes("project")) return "purple";
        if (lowerKey.includes("todayfollowup") || lowerKey.includes("today_followup")) return "emerald";
        if (lowerKey.includes("pendingfollowup") || lowerKey.includes("pending_followup")) return "orange";
        if (lowerKey.includes("futurefollowup") || lowerKey.includes("future_followup")) return "blue";
        if (lowerKey.includes("fresh")) return "green";
        if (lowerKey.includes("hot")) return "red";
        if (lowerKey.includes("warm")) return "orange";
        if (lowerKey.includes("cold")) return "blue";
        if (lowerKey.includes("dump")) return "slate";
        if (lowerKey.includes("plot")) return "pink";
        if (lowerKey.includes("lead")) return "orange";

        return "blue";
    };

    const handleCardClick = (route?: string, tab?: string) => {
        if (route) {
            if (tab) {
                // Navigate with tab query parameter
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

                return {
                    title,
                    value: (value as number) ?? 0,
                    icon,
                    color,
                    route,
                    tab
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
        return colors[color] || colors.blue;
    };

    const renderSkeleton = (count: number) => {
        return Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-xl mb-3"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
        ));
    };

    const renderSourceSkeleton = (count: number) => {
        return Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="text-center bg-slate-50 dark:bg-slate-900 rounded-xl p-3 animate-pulse">
                <div className="inline-flex w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-xl mb-2"></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
            </div>
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-black p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white/20 dark:border-slate-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Activity size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                Sales Dashboard
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Real-time insights & performance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto mb-6">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search leads..."
                            maxLength={15}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="text-slate-400" size={18} />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {isLoading
                        ? renderSkeleton(5)
                        : statsData.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleCardClick(item.route, item.tab)}
                                className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 hover:shadow-xl transition-transform hover:-translate-y-1 ${item.route ? 'cursor-pointer hover:scale-105' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-xl ${getColorClasses(item.color, "bg")}`}>
                                        {item.icon}
                                    </div>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    {item.title}
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    {(item.value ?? 0).toLocaleString()}
                                </p>
                            </div>
                        ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Globe className="text-blue-500" size={18} />
                        Lead Sources
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {isLoading
                            ? renderSourceSkeleton(sourceData.length)
                            : sourceData.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-3 hover:shadow-lg transition-transform hover:-translate-y-1"
                                >
                                    <div className={`inline-flex p-3 rounded-xl ${getColorClasses(item.color, "bg")}`}>
                                        {item.icon}
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {item.title}
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Search Modal */}
                <SearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    data={searchResults}
                />
            </div>
        </div>
    );
};

export default SalesDashboard;