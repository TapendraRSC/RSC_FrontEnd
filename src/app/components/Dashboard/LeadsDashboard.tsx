"use client";
import React, { useEffect, useState } from "react";
import {
    User,
    Book,
    Folder,
    Users,
    MapPin,
    Globe,
    Facebook,
    TrendingUp,
    Calendar,
    Star,
    ArrowUp,
    ArrowDown,
    Activity,
} from "lucide-react";

const SalesDashboard = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const statsData = [
        { title: "Associates", value: 25, icon: <User size={18} />, trend: "+12%", trendUp: true, color: "blue" },
        { title: "Bookings", value: 1637, icon: <Book size={18} />, trend: "+8.2%", trendUp: true, color: "emerald" },
        { title: "Projects", value: 17, icon: <Folder size={18} />, trend: "+3.1%", trendUp: true, color: "purple" },
        { title: "Leads", value: 4912, icon: <Users size={18} />, trend: "-2.4%", trendUp: false, color: "orange" },
        { title: "Site Visits", value: 14, icon: <MapPin size={18} />, trend: "+5.7%", trendUp: true, color: "pink" },
    ];

    const sourceData = [
        { title: "HomeOnline", value: 0, icon: <Globe size={18} />, color: "slate" },
        { title: "MagicBricks", value: 0, icon: <Globe size={18} />, color: "red" },
        { title: "Facebook", value: 30, icon: <Facebook size={18} />, color: "blue" },
        { title: "Housing.com", value: 0, icon: <Globe size={18} />, color: "green" },
        { title: "99acres.com", value: 0, icon: <Globe size={18} />, color: "yellow" },
    ];

    const leadData = [
        { title: "Total Lead", value: 7541, trend: "+15.3%", trendUp: true },
        { title: "Fresh Lead", value: 68, trend: "+22.1%", trendUp: true },
    ];

    const agendaData = [
        { title: "Today Visits", value: 0, target: 5 },
        { title: "Today Followups", value: 0, target: 12 },
    ];

    const performerData = [
        { title: "Leads", value: 58, color: "bg-blue-500" },
        { title: "Visits", value: 0, color: "bg-emerald-500" },
        { title: "Bookings", value: 0, color: "bg-purple-500" },
    ];

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
                                <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${item.trendUp
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {item.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                    {item.trend}
                                </div>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-600">{item.title}</p>
                            <p className="text-xl sm:text-2xl font-bold">{item.value.toLocaleString()}</p>
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

                {/* LEADS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leadData.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-center">
                                <TrendingUp className="text-blue-500" />
                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${item.trendUp
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {item.trend}
                                </div>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-600">{item.title}</p>
                            <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* AGENDA + PERFORMER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Agenda */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="text-emerald-500" size={18} />
                            Today's Agenda
                        </h2>
                        {agendaData.map((item, idx) => (
                            <div key={idx} className="mb-4">
                                <div className="flex justify-between">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="font-bold">{item.value}</p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Performer */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Star className="text-yellow-500" size={18} />
                            Top Performer
                        </h2>
                        {performerData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center mb-4">
                                <p className="font-semibold">{item.title}</p>
                                <p className="font-bold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* REVENUE */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-purple-500" size={18} />
                        Revenue Overview
                    </h2>
                    {isMounted && (
                        <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-xl">
                            <p className="text-slate-500">Chart Visualization</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
