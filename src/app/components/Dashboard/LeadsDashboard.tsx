'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
    User, Book, Folder, Users, MapPin, Globe, Facebook,
    TrendingUp, Calendar, Star
} from 'lucide-react';

const ComponentsDashboardSales = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const statsData = [
        { title: 'Associates', value: 25, icon: <User size={16} /> },
        { title: 'Bookings', value: 1637, icon: <Book size={16} /> },
        { title: 'Projects', value: 17, icon: <Folder size={16} /> },
        { title: 'Leads', value: 4912, icon: <Users size={16} /> },
        { title: 'Site Visits', value: 14, icon: <MapPin size={16} /> },
    ];

    const sourceData = [
        { title: 'HomeOnline', value: 0, icon: <Globe size={16} /> },
        { title: 'MagicBricks', value: 0, icon: <Globe size={16} /> },
        { title: 'Facebook', value: 30, icon: <Facebook size={16} /> },
        { title: 'Housing.com', value: 0, icon: <Globe size={16} /> },
        { title: '99acres.com', value: 0, icon: <Globe size={16} /> },
    ];

    const leadData = [
        { title: 'Total Lead', value: 7541 },
        { title: 'Fresh Lead', value: 68 },
    ];

    const agendaData = [
        { title: 'Today Visits', value: 0 },
        { title: 'Today Followups', value: 0 },
    ];

    const performerData = [
        { title: 'Leads', value: 58 },
        { title: 'Visits', value: 0 },
        { title: 'Bookings', value: 0 },
    ];

    const revenueChart: any = {
        series: [
            { name: 'Income', data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000] },
            { name: 'Expenses', data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000] },
        ],
        options: {
            chart: { type: 'area', toolbar: { show: false } },
            colors: ['#2563eb', '#9ca3af'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 },
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
        },
    };

    // --- UI Classes ---
    const cardBase = `
        group p-5 rounded-2xl bg-white border border-gray-200 shadow-sm
        hover:shadow-md hover:scale-[1.015] transition-all duration-200 ease-in-out
        cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500
    `;

    const iconWrap = `
        bg-blue-100 text-blue-600 p-2 rounded-full shrink-0
        group-hover:bg-blue-500 group-hover:text-white transition-all duration-300
    `;

    const titleStyle = `
        flex items-center gap-2 text-[13px] uppercase font-medium text-gray-500 tracking-wide
        group-hover:text-gray-700
    `;

    const valueStyle = `
        text-[28px] font-bold text-gray-900 group-hover:text-black
    `;

    const sectionTitle = `
        text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2
    `;

    return (
        <div className="p-6 space-y-8 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen overflow-y-auto">
            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {statsData.map((item, idx) => (
                    <div key={idx} className={cardBase}>
                        <div className={titleStyle}>
                            <span className={iconWrap}>{item.icon}</span>
                            {item.title}
                        </div>
                        <div className={valueStyle}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Sources */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {sourceData.map((item, idx) => (
                    <div key={idx} className={cardBase}>
                        <div className={titleStyle}>
                            <span className={iconWrap}>{item.icon}</span>
                            {item.title}
                        </div>
                        <div className={valueStyle}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Leads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {leadData.map((item, idx) => (
                    <div key={idx} className={cardBase}>
                        <div className={titleStyle}>
                            <span className={iconWrap}><TrendingUp size={16} /></span>
                            {item.title}
                        </div>
                        <div className={valueStyle}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Agenda */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className={sectionTitle}>
                    <Calendar size={18} /> Today’s Agenda
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {agendaData.map((item, idx) => (
                        <div key={idx} className="group">
                            <div className={titleStyle}>{item.title}</div>
                            <div className={valueStyle}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performer */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className={sectionTitle}>
                    <Star size={18} /> Performer of the Month
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {performerData.map((item, idx) => (
                        <div key={idx} className="group">
                            <div className={titleStyle}>{item.title}</div>
                            <div className={valueStyle}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Chart</h2>
                {isMounted && (
                    <ReactApexChart
                        options={revenueChart.options}
                        series={revenueChart.series}
                        type="area"
                        height={350}
                    />
                )}
            </div>
        </div>
    );
};

export default ComponentsDashboardSales;
