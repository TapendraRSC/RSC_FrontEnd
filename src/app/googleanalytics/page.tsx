'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    ArrowLeft,
    TrendingUp,
    Loader2,
    RefreshCw,
    Copy,
    Check,
    AlertCircle,
    CheckCircle,
    XCircle,
    Activity,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
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

type CampaignErrorItem = {
    reason: any;
    total: number;
};

type CampaignLog = {
    id: number;
    event_type: string;
    payload: {
        phone?: string;
        error?: any;
        [key: string]: any;
    };
    ip_address: string;
    user_agent: string;
    created_at: string;
};

// API Response type
type AnalyticsResponse = {
    success: boolean;
    data: {
        summary: CampaignSummary;
        trend: CampaignTrendPoint[];
        errors: CampaignErrorItem[];
        logs: CampaignLog[];
    };
};

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
    }
    return 'https://backend.rscgroupdholera.in';
};

const BASE_URL = getBaseUrl();


const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
        });
    } catch {
        return dateString;
    }
};

// const formatDateTime = (dateString: string) => {
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//         });
//     } catch {
//         return dateString;
//     }
// };

const formatDateTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};


const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object') {
        if (error.message) {
            return String(error.message);
        }
        if (error.error) {
            return String(error.error);
        }
        try {
            return JSON.stringify(error);
        } catch {
            return 'An unknown error occurred';
        }
    }
    return 'An unknown error occurred';
};

const CampaignSource = () => {
    // Campaign list state
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Selected campaign & analytics
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [summary, setSummary] = useState<CampaignSummary | null>(null);
    const [trend, setTrend] = useState<CampaignTrendPoint[]>([]);
    const [errors, setErrors] = useState<CampaignErrorItem[]>([]);
    const [logs, setLogs] = useState<CampaignLog[]>([]);

    // Copy state
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchCampaigns = async () => {
        try {
            setCampaignsLoading(true);
            setCampaignsError(null);

            const token = localStorage.getItem("accessToken");

            const res = await fetch(`${BASE_URL}/campaigns/getAllCampaigns`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`API failed with status ${res.status}`);
            }

            const json = await res.json();
            const campaignsData = json.data || json.campaigns || [];

            setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        } catch (error: any) {
            console.error("API error:", error);
            const errorMsg = getErrorMessage(error);
            setCampaignsError(errorMsg);
            setCampaigns([]);
            toast.error(errorMsg);
        } finally {
            setCampaignsLoading(false);
        }
    };

    const handleAddCampaign = async () => {
        if (!newCampaignName.trim()) {
            toast.error('Campaign name is required');
            return;
        }

        try {
            setIsCreating(true);

            const token = localStorage.getItem("accessToken");

            const res = await fetch(`${BASE_URL}/campaigns/create-campaign`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    campaign_name: newCampaignName.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error(`API failed with status ${res.status}`);
            }

            const json = await res.json();

            if (!json.success && json.error) {
                throw new Error(getErrorMessage(json.error));
            }

            // Refresh campaigns list after creating
            await fetchCampaigns();

            setNewCampaignName('');
            setIsModalOpen(false);
            toast.success('Campaign created successfully');
        } catch (error: any) {
            console.error("API error:", error);
            const errorMsg = getErrorMessage(error);
            toast.error(errorMsg);
        } finally {
            setIsCreating(false);
        }
    };

    const fetchAnalytics = async (campaignId: number) => {
        try {
            setAnalyticsLoading(true);
            setAnalyticsError(null);

            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `${BASE_URL}/logs/get-form-logs/${campaignId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`API failed with status ${res.status}`);
            }

            const json: AnalyticsResponse = await res.json();

            if (!json.success) {
                throw new Error("Failed to fetch analytics");
            }

            // Set data from API response
            const data = json.data;

            setSummary(data.summary || null);

            // Format trend data for chart (convert date to readable format)
            const formattedTrend = (data.trend || []).map((item) => ({
                ...item,
                date: formatDate(item.date),
            }));
            setTrend(formattedTrend);

            setErrors(data.errors || []);
            setLogs(data.logs || []);

        } catch (error: any) {
            console.error("API error:", error);
            const errorMsg = getErrorMessage(error);
            setAnalyticsError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Copy campaign ID to clipboard
    const copyToClipboard = (id: number) => {
        navigator.clipboard.writeText(id.toString());
        setCopiedId(id);
        toast.success('Campaign ID copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Fetch campaigns on component mount
    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Fetch analytics when campaign is selected
    useEffect(() => {
        if (selectedCampaign) {
            fetchAnalytics(selectedCampaign.id);
        }
    }, [selectedCampaign]);

    // Reset analytics state
    const resetAnalyticsState = () => {
        setSelectedCampaign(null);
        setSummary(null);
        setTrend([]);
        setErrors([]);
        setLogs([]);
        setAnalyticsError(null);
    };

    if (selectedCampaign) {
        return (
            <div className="p-4 sm:p-6 w-full min-h-screen bg-slate-50 dark:bg-slate-950">
                <ToastContainer position="top-right" />


                <button
                    onClick={resetAnalyticsState}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Campaigns</span>
                </button>


                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">
                            {selectedCampaign.campaign_name}
                        </h1>
                        {/* <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {selectedCampaign.id}
                            </p>
                            <button
                                onClick={() => copyToClipboard(selectedCampaign.id)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                                {copiedId === selectedCampaign.id ? (
                                    <Check size={14} className="text-green-500" />
                                ) : (
                                    <Copy size={14} className="text-slate-400" />
                                )}
                            </button>
                        </div> */}
                        {selectedCampaign.created_at && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Created: {formatDateTime(selectedCampaign.created_at)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => fetchAnalytics(selectedCampaign.id)}
                        disabled={analyticsLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                        <RefreshCw
                            size={16}
                            className={analyticsLoading ? 'animate-spin' : ''}
                        />
                        Refresh Data
                    </button>
                </div>


                {analyticsLoading && !summary && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}


                {analyticsError && !summary && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-500 text-sm mb-4">{analyticsError}</p>
                        <button
                            onClick={() => fetchAnalytics(selectedCampaign.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}


                {summary && (
                    <>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Activity size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Total Attempts
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                                    {summary.attempts.toLocaleString()}
                                </p>
                            </div>


                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Success
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {summary.success.toLocaleString()}
                                </p>
                            </div>


                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Failed
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {summary.failed.toLocaleString()}
                                </p>
                            </div>


                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Conversion Rate
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {summary.conversionPercentage}%
                                </p>
                            </div>
                        </div>


                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                Performance Trend
                            </h2>

                            {trend.length === 0 ? (
                                <div className="h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-slate-400 dark:text-slate-500">
                                        No trend data available
                                    </p>
                                </div>
                            ) : (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trend}>
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
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e2e8f0"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tickLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                allowDecimals={false}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tickLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                            />
                                            <Legend
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                iconType="circle"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="attempts"
                                                name="Attempts"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fill="url(#colorAttempts)"
                                                dot={{ r: 4, fill: '#3b82f6' }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="success"
                                                name="Success"
                                                stroke="#22c55e"
                                                strokeWidth={2}
                                                fill="url(#colorSuccess)"
                                                dot={{ r: 4, fill: '#22c55e' }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="failed"
                                                name="Failed"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                fill="url(#colorFailed)"
                                                dot={{ r: 4, fill: '#ef4444' }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
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
                                    <Activity size={18} className="text-blue-500" />
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
                                        {logs.map((data, index) => (
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


                                                {data.payload?.name && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                                                        name: {String(data.payload.name)}
                                                    </p>
                                                )}

                                                {data.payload?.phone && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                                                        Phone: {String(data.payload.phone)}
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }


    return (
        <div className="p-4 sm:p-6 w-full min-h-screen bg-slate-50 dark:bg-slate-950">
            <ToastContainer position="top-right" />


            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">
                    Campaign Sources
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCampaigns}
                        disabled={campaignsLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        <RefreshCw
                            size={16}
                            className={campaignsLoading ? 'animate-spin' : ''}
                        />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        <Plus size={18} />
                        Add Campaign
                    </button>
                </div>
            </div>


            {campaignsLoading && campaigns.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {campaignsError && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-red-500 text-sm mb-4">{campaignsError}</p>
                    <button
                        onClick={fetchCampaigns}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        Retry
                    </button>
                </div>
            )}


            {!campaignsLoading && !campaignsError && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        No campaigns yet. Create your first campaign!
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        Create Campaign
                    </button>
                </div>
            )}


            {campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                                    {campaign.campaign_name}
                                </h2>
                                {campaign.created_at && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Created: {formatDateTime(campaign.created_at)}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedCampaign(campaign)}
                                className="w-full px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                View Analytics
                            </button>
                        </div>
                    ))}
                </div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Add New Campaign
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewCampaignName('');
                                }}
                                disabled={isCreating}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Campaign Name
                            </label>
                            <input
                                type="text"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                                placeholder="e.g. dholera_triangle"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                disabled={isCreating}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newCampaignName.trim()) {
                                        handleAddCampaign();
                                    }
                                }}
                            />

                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewCampaignName('');
                                }}
                                disabled={isCreating}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCampaign}
                                disabled={!newCampaignName.trim() || isCreating}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignSource;