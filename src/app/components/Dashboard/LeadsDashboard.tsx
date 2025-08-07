'use client';

import React, { useEffect, useState } from 'react';
import {
    User, Book, Folder, Users, MapPin, Globe, Facebook,
    TrendingUp, Calendar, Star, ArrowUp, ArrowDown, Activity
} from 'lucide-react';

const ComponentsDashboardSales = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const statsData = [
        { title: 'Associates', value: 25, icon: <User size={18} />, trend: '+12%', trendUp: true, color: 'blue' },
        { title: 'Bookings', value: 1637, icon: <Book size={18} />, trend: '+8.2%', trendUp: true, color: 'emerald' },
        { title: 'Projects', value: 17, icon: <Folder size={18} />, trend: '+3.1%', trendUp: true, color: 'purple' },
        { title: 'Leads', value: 4912, icon: <Users size={18} />, trend: '-2.4%', trendUp: false, color: 'orange' },
        { title: 'Site Visits', value: 14, icon: <MapPin size={18} />, trend: '+5.7%', trendUp: true, color: 'pink' },
    ];

    const sourceData = [
        { title: 'HomeOnline', value: 0, icon: <Globe size={18} />, color: 'slate' },
        { title: 'MagicBricks', value: 0, icon: <Globe size={18} />, color: 'red' },
        { title: 'Facebook', value: 30, icon: <Facebook size={18} />, color: 'blue' },
        { title: 'Housing.com', value: 0, icon: <Globe size={18} />, color: 'green' },
        { title: '99acres.com', value: 0, icon: <Globe size={18} />, color: 'yellow' },
    ];

    const leadData = [
        { title: 'Total Lead', value: 7541, trend: '+15.3%', trendUp: true },
        { title: 'Fresh Lead', value: 68, trend: '+22.1%', trendUp: true },
    ];

    const agendaData = [
        { title: 'Today Visits', value: 0, target: 5 },
        { title: 'Today Followups', value: 0, target: 12 },
    ];

    const performerData = [
        { title: 'Leads', value: 58, color: 'bg-blue-500' },
        { title: 'Visits', value: 0, color: 'bg-emerald-500' },
        { title: 'Bookings', value: 0, color: 'bg-purple-500' },
    ];

    // Chart data with more realistic values
    const revenueChart = {
        series: [
            { name: 'Income', data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000] },
            { name: 'Expenses', data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000] },
        ],
        options: {
            chart: {
                type: 'area',
                toolbar: { show: false },
                background: 'transparent',
                sparkline: { enabled: false }
            },
            colors: ['#3b82f6', '#ef4444'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                },
            },
            grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 3,
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: {
                    style: { colors: '#64748b', fontSize: '12px' }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    style: { colors: '#64748b', fontSize: '12px' },
                    formatter: (val: any) => `₹${val / 1000}k`
                }
            },
            tooltip: {
                theme: 'light',
                style: { fontSize: '12px' },
                y: {
                    formatter: (val: any) => `₹${val.toLocaleString()}`
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '13px',
                fontWeight: 500,
                markers: { radius: 6 }
            }
        },
    };

    const getColorClasses = (color: any, type = 'bg') => {
        const colors: any = {
            blue: type === 'bg' ? 'bg-blue-500' : 'text-blue-600 bg-blue-50',
            emerald: type === 'bg' ? 'bg-emerald-500' : 'text-emerald-600 bg-emerald-50',
            purple: type === 'bg' ? 'bg-purple-500' : 'text-purple-600 bg-purple-50',
            orange: type === 'bg' ? 'bg-orange-500' : 'text-orange-600 bg-orange-50',
            pink: type === 'bg' ? 'bg-pink-500' : 'text-pink-600 bg-pink-50',
            slate: type === 'bg' ? 'bg-slate-500' : 'text-slate-600 bg-slate-50',
            red: type === 'bg' ? 'bg-red-500' : 'text-red-600 bg-red-50',
            green: type === 'bg' ? 'bg-green-500' : 'text-green-600 bg-green-50',
            yellow: type === 'bg' ? 'bg-yellow-500' : 'text-yellow-600 bg-yellow-50',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 md:p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <div className="mb-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 shadow-lg mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Activity size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Sales Dashboard
                            </h1>
                            <p className="text-sm text-slate-600">Real-time insights and performance metrics</p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    {statsData.map((item, idx) => (
                        <div key={idx} className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-blue-200/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                            {/* Animated gradient border */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm" />

                            {/* Glass morphism effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:rotate-6 group-hover:scale-110 ${getColorClasses(item.color, 'icon')}`}>
                                        {item.icon}
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 ${item.trendUp
                                        ? 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200'
                                        : 'text-red-700 bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                                        }`}>
                                        {item.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                        {item.trend}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                        {item.title}
                                    </p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                        {item.value.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sources Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
                            <Globe size={24} />
                        </div>
                        <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Lead Sources
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {sourceData.map((item, idx) => (
                            <div key={idx} className="group text-center p-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-400">
                                <div className={`inline-flex p-4 rounded-2xl mb-4 transition-all duration-400 group-hover:scale-125 group-hover:rotate-12 shadow-lg ${getColorClasses(item.color, 'icon')}`}>
                                    {item.icon}
                                </div>
                                <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{item.title}</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leads Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {leadData.map((item, idx) => (
                        <div key={idx} className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110 ${item.trendUp
                                        ? 'text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-300'
                                        : 'text-red-700 bg-gradient-to-r from-red-100 to-red-200 border border-red-300'
                                        }`}>
                                        {item.trendUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                        {item.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
                                    {item.title}
                                </p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {item.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Agenda & Performer Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Today's Agenda */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-60" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg">
                                    <Calendar size={24} />
                                </div>
                                <span className="bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">
                                    Today's Agenda
                                </span>
                            </h2>
                            <div className="space-y-6">
                                {agendaData.map((item, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-6 bg-gradient-to-r from-white to-emerald-50/50 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{item.title}</p>
                                            <p className="text-sm text-slate-600 font-medium">Target: {item.target}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">{item.value}</p>
                                            <div className="w-24 bg-slate-200 rounded-full h-3 mt-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                    style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performer of the Month */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-60" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl shadow-lg">
                                    <Star size={24} />
                                </div>
                                <span className="bg-gradient-to-r from-slate-800 to-orange-600 bg-clip-text text-transparent">
                                    Top Performer
                                </span>
                            </h2>
                            <div className="space-y-6">
                                {performerData.map((item, idx) => (
                                    <div key={idx} className="group flex items-center gap-6 p-6 bg-gradient-to-r from-white to-yellow-50/50 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        <div className={`w-4 h-4 rounded-full shadow-lg transition-all duration-300 group-hover:scale-150 ${item.color}`} />
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-lg">{item.title}</p>
                                        </div>
                                        <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-60" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl shadow-lg">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
                                    Revenue Overview
                                </span>
                            </h2>
                            <div className="text-right bg-gradient-to-br from-white to-purple-50 p-4 rounded-2xl shadow-lg">
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">This Year</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₹2.1M</p>
                            </div>
                        </div>
                        {isMounted && (
                            <div className="h-96 relative">
                                <div className="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
                                    <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse" />
                                    <div className="absolute top-8 right-6 w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
                                    <div className="absolute bottom-6 left-8 w-2 h-2 bg-cyan-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />

                                    <div className="text-center z-10">
                                        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40">
                                            <TrendingUp size={64} className="text-purple-400 mx-auto mb-6" />
                                            <p className="text-xl font-bold text-slate-700 mb-2">Revenue Chart Visualization</p>
                                            <p className="text-sm text-slate-600">Income vs Expenses Analysis</p>
                                            <div className="flex items-center justify-center gap-4 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-slate-600">Income</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-slate-600">Expenses</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsDashboardSales;