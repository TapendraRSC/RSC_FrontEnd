'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus, X, ArrowLeft, TrendingUp, Loader2, RefreshCw,
    AlertCircle, CheckCircle, XCircle, Activity, LayoutGrid,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Legend, AreaChart, Area,
} from 'recharts';

type Campaign = {
    id: number;
    campaign_name: string;
    created_at: string;
    views?: number;
    clicks?: number;
};

type CampaignSummary = {
    attempts: number;
    success: number;
    failed: number;
    conversionPercentage: string;
};

type CampaignTrendPoint = {
    date: string;
    attempts: number;
    success: number;
    failed: number;
};

type CampaignErrorItem = { reason: any; total: number; };

type CampaignLog = {
    id: number;
    event_type: string;
    payload: {
        phone?: string;
        name?: string;
        data?: { phone?: string; name?: string;[key: string]: any; };
        error?: any;
        [key: string]: any;
    };
    ip_address: string;
    user_agent: string;
    created_at: string;
};

type AnalyticsResponse = {
    success: boolean;
    data: {
        summary: CampaignSummary;
        trend: CampaignTrendPoint[];
        errors: CampaignErrorItem[];
        logs: CampaignLog[];
    };
};

type TimeRange = '7d' | '30d' | '60d' | '6m' | 'all';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '60d', label: '60 Days' },
    { value: '6m', label: '6 Months' },
    { value: 'all', label: 'All' },
];

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8002';
    }
    return 'https://development.rscgroupdholera.in/';
};

const BASE_URL = getBaseUrl();

const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseInt(val, 10) || 0;
    return 0;
};

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch { return dateString; }
};

const formatDateTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateString; }
};

const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return String(error.message);
    if (error?.error) return String(error.error);
    try { return JSON.stringify(error); } catch { return 'An unknown error occurred'; }
};

const getNameFromPayload = (payload: any): string | null => payload?.name || payload?.data?.name || null;
const getPhoneFromPayload = (payload: any): string | null => payload?.phone || payload?.data?.phone || null;

// Get cutoff date based on range
const getCutoffDate = (range: TimeRange): Date | null => {
    const daysMap: Record<TimeRange, number> = { '7d': 7, '30d': 30, '60d': 60, '6m': 180, 'all': Infinity };
    const days = daysMap[range];
    if (days === Infinity) return null;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const CampaignSource = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    // Raw data from API (unfiltered)
    const [rawTrend, setRawTrend] = useState<CampaignTrendPoint[]>([]);
    const [rawLogs, setRawLogs] = useState<CampaignLog[]>([]);
    const [errors, setErrors] = useState<CampaignErrorItem[]>([]);
    const [logs, setLogs] = useState<CampaignLog[]>([]);
    const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');

    // Filter trend data based on selected range
    const filteredTrendData = useMemo(() => {
        if (!rawTrend.length) return [];

        const cutoffDate = getCutoffDate(selectedRange);

        let parsedData = rawTrend.map(item => ({
            date: item.date,
            attempts: parseNum(item.attempts),
            success: parseNum(item.success),
            failed: parseNum(item.failed),
            displayDate: formatDate(item.date),
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Apply date filter if not 'all'
        if (cutoffDate) {
            parsedData = parsedData.filter(item => new Date(item.date) >= cutoffDate);
        }

        return parsedData;
    }, [rawTrend, selectedRange]);

    // Filter logs based on selected range
    const filteredLogs = useMemo(() => {
        if (!rawLogs.length) return [];

        const cutoffDate = getCutoffDate(selectedRange);
        if (!cutoffDate) return rawLogs;

        return rawLogs.filter(log => new Date(log.created_at) >= cutoffDate);
    }, [rawLogs, selectedRange]);

    // Calculate errors from filtered logs
    const filteredErrors = useMemo(() => {
        // Get only failed logs from filtered logs
        const failedLogs = filteredLogs.filter(log =>
            String(log.event_type).includes('failed') || log.payload?.error
        );

        if (!failedLogs.length) return [];

        // Group errors by reason and count them
        const errorMap = new Map<string, number>();

        failedLogs.forEach(log => {
            let errorReason = '';

            if (log.payload?.error) {
                if (typeof log.payload.error === 'object' && log.payload.error?.message) {
                    errorReason = String(log.payload.error.message);
                } else {
                    errorReason = String(log.payload.error);
                }
            } else {
                errorReason = String(log.event_type);
            }

            if (errorReason) {
                errorMap.set(errorReason, (errorMap.get(errorReason) || 0) + 1);
            }
        });

        // Convert to array and sort by total (descending)
        return Array.from(errorMap.entries())
            .map(([reason, total]) => ({ reason, total }))
            .sort((a, b) => b.total - a.total);
    }, [filteredLogs]);

    // Calculate summary from filtered trend data
    const filteredSummary = useMemo((): CampaignSummary | null => {
        if (!filteredTrendData.length) return null;

        const totals = filteredTrendData.reduce((acc, item) => ({
            attempts: acc.attempts + item.attempts,
            success: acc.success + item.success,
            failed: acc.failed + item.failed,
        }), { attempts: 0, success: 0, failed: 0 });

        const conversionPercentage = totals.attempts > 0
            ? ((totals.success / totals.attempts) * 100).toFixed(2)
            : '0.00';

        return { ...totals, conversionPercentage };
    }, [filteredTrendData]);

    const fetchCampaigns = async () => {
        try {
            setCampaignsLoading(true);
            setCampaignsError(null);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/campaigns/getAllCampaigns`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`API failed with status ${res.status}`);
            const json = await res.json();
            setCampaigns(Array.isArray(json.data || json.campaigns) ? (json.data || json.campaigns) : []);
        } catch (error: any) {
            setCampaignsError(getErrorMessage(error));
            setCampaigns([]);
            toast.error(getErrorMessage(error));
        } finally {
            setCampaignsLoading(false);
        }
    };

    const handleAddCampaign = async () => {
        if (!newCampaignName.trim()) { toast.error('Campaign name is required'); return; }
        try {
            setIsCreating(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/campaigns/create-campaign`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ campaign_name: newCampaignName.trim() }),
            });
            if (!res.ok) throw new Error(`API failed with status ${res.status}`);
            const json = await res.json();
            if (!json.success && json.error) throw new Error(getErrorMessage(json.error));
            await fetchCampaigns();
            setNewCampaignName('');
            setIsModalOpen(false);
            toast.success('Campaign created successfully');
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsCreating(false);
        }
    };

    const fetchAnalytics = async (campaignId: number) => {
        try {
            setAnalyticsLoading(true);
            setAnalyticsError(null);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/logs/get-form-logs/${campaignId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`API failed with status ${res.status}`);
            const json: AnalyticsResponse = await res.json();
            if (!json.success) throw new Error("Failed to fetch analytics");
            const data = json.data;

            // Store raw data (will be filtered by useMemo)
            setRawTrend(data.trend || []);
            setRawLogs(data.logs || []);
            setErrors(data.errors || []);
            setLogs(data.logs || []);
        } catch (error: any) {
            setAnalyticsError(getErrorMessage(error));
            toast.error(getErrorMessage(error));
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Ref to prevent duplicate fetch
    const campaignsFetchedRef = useRef(false);

    useEffect(() => {
        if (campaignsFetchedRef.current) return;
        campaignsFetchedRef.current = true;
        fetchCampaigns();
    }, []);
    useEffect(() => { if (selectedCampaign) fetchAnalytics(selectedCampaign.id); }, [selectedCampaign]);

    const resetAnalyticsState = () => {
        setSelectedCampaign(null);
        setRawTrend([]);
        setRawLogs([]);
        setAnalyticsError(null);
        setSelectedRange('all');
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                    <p className="text-slate-400 text-xs mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-300 text-xs">{entry.name}:</span>
                            <span className="text-white text-xs font-semibold">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Analytics View
    if (selectedCampaign) {
        return (
            <div className="p-4 sm:p-6 w-full min-h-screen bg-slate-50 dark:bg-slate-950">
                <ToastContainer position="top-right" />

                <button onClick={resetAnalyticsState} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition">
                    <ArrowLeft size={20} /><span>Back to Campaigns</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">{selectedCampaign.campaign_name}</h1>
                        {selectedCampaign.created_at && <p className="text-sm text-slate-500 dark:text-slate-400">Created: {formatDateTime(selectedCampaign.created_at)}</p>}
                    </div>
                    <button onClick={() => fetchAnalytics(selectedCampaign.id)} disabled={analyticsLoading} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">
                        <RefreshCw size={16} className={analyticsLoading ? 'animate-spin' : ''} />Refresh Data
                    </button>
                </div>

                {analyticsLoading && !filteredSummary && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}

                {analyticsError && !filteredSummary && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-500 text-sm mb-4">{analyticsError}</p>
                        <button onClick={() => fetchAnalytics(selectedCampaign.id)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">Retry</button>
                    </div>
                )}

                {filteredSummary && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Activity size={20} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Total Attempts</span>
                                </div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">{(filteredSummary.attempts || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Success</span>
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{(filteredSummary.success || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Failed</span>
                                </div>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{(filteredSummary.failed || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</span>
                                </div>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{filteredSummary.conversionPercentage || '0'}%</p>
                            </div>
                        </div>

                        {/* Growth Trend Chart with Filter */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow-sm">
                            {/* Header with Title and Filter */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={20} className="text-orange-500" />
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Performance Trend</h2>
                                </div>

                                {/* Time Range Filter Buttons */}
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    {TIME_RANGE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedRange(option.value)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedRange === option.value
                                                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredTrendData.length === 0 ? (
                                <div className="h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-slate-400 dark:text-slate-500">No trend data available for selected range</p>
                                </div>
                            ) : (
                                /* Scrollable container for large data */
                                <div className="overflow-x-auto">
                                    <div style={{ minWidth: filteredTrendData.length > 15 ? `${filteredTrendData.length * 60}px` : '100%' }}>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} vertical={false} />
                                                    <XAxis
                                                        dataKey="displayDate"
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        axisLine={{ stroke: '#334155', strokeOpacity: 0.3 }}
                                                        tickLine={false}
                                                        dy={8}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        allowDecimals={false}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        iconType="circle"
                                                        formatter={(value) => <span className="text-slate-400 text-sm">{value}</span>}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="attempts"
                                                        name="Attempts"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2}
                                                        fill="url(#colorAttempts)"
                                                        dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                                                        activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="success"
                                                        name="Success"
                                                        stroke="#22c55e"
                                                        strokeWidth={2}
                                                        fill="url(#colorSuccess)"
                                                        dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
                                                        activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="failed"
                                                        name="Failed"
                                                        stroke="#ef4444"
                                                        strokeWidth={2}
                                                        fill="url(#colorFailed)"
                                                        dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                                                        activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-red-500" />
                                    Top Errors
                                </h3>
                                {errors.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No errors found!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                        {errors.map((errItem, idx) => {

                                            let displayMessage = "";
                                            try {
                                                const parsedReason = typeof errItem.reason === 'string'
                                                    ? JSON.parse(errItem.reason)
                                                    : errItem.reason;

                                                displayMessage = parsedReason?.message || String(errItem.reason);
                                            } catch (e) {
                                                displayMessage = String(errItem.reason);
                                            }

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
                                                >
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                        {displayMessage}
                                                    </span>

                                                    <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">
                                                        {errItem.total}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>


                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-orange-500" />
                                    Recent Form Logs
                                </h3>
                                {logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Activity className="w-10 h-10 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No logs found
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                        {logs.map((data, index) => {
                                            // Get name and phone using helper functions (handles both direct and nested payload.data)
                                            const logName = getNameFromPayload(data.payload);
                                            const logPhone = getPhoneFromPayload(data.payload);

                                            return (
                                                <div
                                                    key={data.id || index}
                                                    className={`border rounded-lg p-3 ${String(data.event_type).includes('failed') || data.payload?.error
                                                        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10'
                                                        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${String(data.event_type).includes('failed') || data.payload?.error
                                                            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                                            : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                                            }`}>
                                                            {String(data.event_type)}
                                                        </span>
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                                            {formatDateTime(data.created_at)}
                                                        </span>
                                                    </div>


                                                    {logName && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                                                            Name: {String(logName)}
                                                        </p>
                                                    )}

                                                    {logPhone && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                                                            Phone: {String(logPhone)}
                                                        </p>
                                                    )}



                                                    {data.ip_address && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            IP: {String(data.ip_address)}
                                                        </p>
                                                    )}

                                                    {data.payload?.error && (
                                                        <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
                                                            {/* DISPLAY MESSAGE VALUE ONLY */}
                                                            Error: {typeof data.payload.error === 'object' && data.payload.error !== null && 'message' in data.payload.error
                                                                ? String(data.payload.error.message)
                                                                : String(data.payload.error)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Campaign List View
    return (
        <div className="p-4 sm:p-6 w-full min-h-screen bg-slate-50 dark:bg-slate-950">
            <ToastContainer position="top-right" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">Campaign Sources</h1>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCampaigns} disabled={campaignsLoading} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <RefreshCw size={16} className={campaignsLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium">
                        <Plus size={18} />Add Campaign
                    </button>
                </div>
            </div>

            {campaignsLoading && campaigns.length === 0 && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}

            {campaignsError && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-red-500 text-sm mb-4">{campaignsError}</p>
                    <button onClick={fetchCampaigns} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">Retry</button>
                </div>
            )}

            {!campaignsLoading && !campaignsError && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><TrendingUp className="w-8 h-8 text-slate-400" /></div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No campaigns yet. Create your first campaign!</p>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">Create Campaign</button>
                </div>
            )}

            {campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">{campaign.campaign_name}</h2>
                                {campaign.created_at && <p className="text-xs text-slate-500 dark:text-slate-400">Created: {formatDateTime(campaign.created_at)}</p>}
                            </div>
                            <button onClick={() => setSelectedCampaign(campaign)} className="w-full px-4 py-2 rounded-lg text-sm bg-orange-600 text-white hover:bg-orange-700 transition">View Analytics</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Add New Campaign</h2>
                            <button onClick={() => { setIsModalOpen(false); setNewCampaignName(''); }} disabled={isCreating} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"><X size={20} /></button>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Campaign Name</label>
                            <input type="text" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} placeholder="e.g. dholera_triangle" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus disabled={isCreating} onKeyDown={(e) => { if (e.key === 'Enter' && newCampaignName.trim()) handleAddCampaign(); }} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setIsModalOpen(false); setNewCampaignName(''); }} disabled={isCreating} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">Cancel</button>
                            <button onClick={handleAddCampaign} disabled={!newCampaignName.trim() || isCreating} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignSource;