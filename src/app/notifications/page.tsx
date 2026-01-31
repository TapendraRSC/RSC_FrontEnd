'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Bell,
    RefreshCcw,
    Calendar,
    ArrowUpRight,
    Inbox,
} from 'lucide-react';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type NotificationStatus = 'pending' | 'confirmed' | 'rejected';
type StatusKey = 'Pending' | 'Confirmed' | 'Rejected';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    bookingStatus: NotificationStatus;
    bookingNumber: string;
    created_at: string;
}




const STATUS_MAP: Record<NotificationStatus, StatusKey> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    rejected: 'Rejected',
};

const STATUS_CONFIG: Record<StatusKey, any> = {
    Pending: {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-400/10',
        icon: <Clock size={12} />,
    },
    Confirmed: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-400/10',
        icon: <CheckCircle size={12} />,
    },
    Rejected: {
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-400/10',
        icon: <XCircle size={12} />,
    },
};



const NotificationsPage = () => {
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/notifications/get-All-Notifications`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const result = await response.json();
            const rawData = Array.isArray(result)
                ? result
                : result.data || [];


            const normalizedData: Notification[] = rawData
                .map((item: any) => ({
                    ...item,
                    bookingStatus:
                        item.bookingStatus?.toLowerCase() === 'approved'
                            ? 'confirmed'
                            : item.bookingStatus?.toLowerCase(),
                }))
                .sort(
                    (a: Notification, b: Notification) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

            setNotifications(normalizedData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);



    const renderStatusBadge = (status: NotificationStatus) => {
        const style = STATUS_CONFIG[STATUS_MAP[status]];

        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${style.color} ${style.bg}`}
            >
                {style.icon}
                {STATUS_MAP[status]}
            </span>
        );
    };

    const handleNotificationClick = (item: Notification) => {
        if (item.type === 'BOOKING_CREATED') {
            router.push(`/booking?id=${item.bookingNumber}`);
        } else {
            router.push(`/lead?id=${item.id}`);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
            <div className="max-w-7xl mx-auto p-2 md:p-7">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Bell className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                Notifications
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Update Center
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchNotifications}
                        className="p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-gray-400 hover:text-blue-500"
                    >
                        <RefreshCcw
                            size={20}
                            className={loading ? 'animate-spin text-blue-500' : ''}
                        />
                    </button>
                </div>


                {loading ? (
                    <div className="flex flex-col items-center py-32 opacity-40">
                        <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
                        <span className="text-xs font-black uppercase">
                            Synchronizing...
                        </span>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="grid gap-6">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/70 dark:bg-slate-900/40 border rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl"
                            >
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        {renderStatusBadge(item.bookingStatus)}
                                        <span className="text-xs font-bold bg-transparent-100 px-4 py-1 rounded-full">
                                            ID: {item.bookingNumber}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(item.created_at).toLocaleString('en-IN')}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between items-center gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                        <p className="text-gray-500">{item.message}</p>
                                    </div>

                                    <button
                                        onClick={() => handleNotificationClick(item)}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                                    >
                                        View Details
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <Inbox className="mx-auto mb-4 text-gray-300" size={56} />
                        <h2 className="text-2xl font-bold">No notifications</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
