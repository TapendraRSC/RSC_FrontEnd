"use client";
import React, { useEffect, useState } from "react";
import {
    User,
    Folder,
    Users,
    MapPin,
    Globe,
    Facebook,
    TrendingUp,
    Activity,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import axiosInstance from "@/libs/axios";

interface StatItem {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const SalesDashboard = () => {
    const [statsData, setStatsData] = useState<StatItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/dashboard/dashboard-stats");
            const data = res.data.data;

            const updatedStats: any = Object.entries(data).map(([key, value]) => {
                // Convert camelCase key to Title Case
                const title = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());

                // Choose icon and color dynamically
                let icon: React.ReactNode = <Users size={18} />;
                let color = "blue";

                if (key.toLowerCase().includes("user")) icon = <User size={18} />;
                if (key.toLowerCase().includes("plot")) color = "pink";
                if (key.toLowerCase().includes("project")) color = "purple";
                if (key.toLowerCase().includes("lead")) color = "orange";

                return { title, value: value ?? 0, icon, color };
            });

            setStatsData(updatedStats);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            setStatsData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getColorClasses = (color: string, type = "bg") => {
        const colors: Record<string, string> = {
            blue: type === "bg" ? "bg-blue-500 text-white" : "text-blue-600 bg-blue-50",
            emerald: type === "bg" ? "bg-emerald-500 text-white" : "text-emerald-600 bg-emerald-50",
            purple: type === "bg" ? "bg-purple-500 text-white" : "text-purple-600 bg-purple-50",
            orange: type === "bg" ? "bg-orange-500 text-white" : "text-orange-600 bg-orange-50",
            pink: type === "bg" ? "bg-pink-500 text-white" : "text-pink-600 bg-pink-50",
            slate: type === "bg" ? "bg-slate-500 text-white" : "text-slate-600 bg-slate-50",
            red: type === "bg" ? "bg-red-500 text-white" : "text-red-600 bg-red-50",
            green: type === "bg" ? "bg-green-500 text-white" : "text-green-600 bg-green-50",
            yellow: type === "bg" ? "bg-yellow-500 text-white" : "text-yellow-600 bg-yellow-50",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
                {/* HEADER */}
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white/20">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Activity size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Sales Dashboard
                            </h1>
                            <p className="text-sm text-slate-600">Real-time insights & performance</p>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {statsData.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${getColorClasses(item.color, "bg")}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-600">{item.title}</p>
                            <p className="text-xl sm:text-2xl font-bold">{(item.value ?? 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* LEAD SOURCES */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Globe className="text-blue-500" size={18} />
                        Lead Sources
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {sourceData.map((item, idx) => (
                            <div
                                key={idx}
                                className="text-center bg-slate-50 rounded-xl p-3 hover:shadow-lg transition-transform hover:-translate-y-1"
                            >
                                <div className={`inline-flex p-3 rounded-xl ${getColorClasses(item.color, "bg")}`}>
                                    {item.icon}
                                </div>
                                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                                <p className="text-lg font-bold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
