// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Clock,
//     CheckCircle,
//     XCircle,
//     Loader2,
//     Bell,
//     RefreshCcw,
//     Calendar,
//     ArrowUpRight,
//     Inbox,
// } from 'lucide-react';
// import { useNotifications } from '../components/NotificationProvider';

// type NotificationStatus = 'pending' | 'confirmed' | 'rejected';
// type StatusKey = 'Pending' | 'Confirmed' | 'Rejected';
// type TabType = 'all' | 'pending' | 'confirmed' | 'rejected';

// interface Notification {
//     id: number;
//     type: string;
//     title: string;
//     message: string;
//     bookingStatus: NotificationStatus;
//     bookingNumber: string;
//     created_at: string;
// }

// const STATUS_MAP: Record<NotificationStatus, StatusKey> = {
//     pending: 'Pending',
//     confirmed: 'Confirmed',
//     rejected: 'Rejected',
// };

// const STATUS_CONFIG: Record<StatusKey, any> = {
//     Pending: {
//         color: 'text-amber-600 dark:text-amber-400',
//         bg: 'bg-amber-50 dark:bg-amber-400/10',
//         icon: <Clock size={12} />,
//     },
//     Confirmed: {
//         color: 'text-emerald-600 dark:text-emerald-400',
//         bg: 'bg-emerald-50 dark:bg-emerald-400/10',
//         icon: <CheckCircle size={12} />,
//     },
//     Rejected: {
//         color: 'text-rose-600 dark:text-rose-400',
//         bg: 'bg-rose-50 dark:bg-rose-400/10',
//         icon: <XCircle size={12} />,
//     },
// };

// const TABS = [
//     { id: 'all' as TabType, label: 'All', icon: Bell },
//     { id: 'pending' as TabType, label: 'Pending', icon: Clock },
//     { id: 'confirmed' as TabType, label: 'Confirmed', icon: CheckCircle },
//     { id: 'rejected' as TabType, label: 'Rejected', icon: XCircle },
// ];

// const NotificationsPage = () => {
//     const router = useRouter();
//     const {
//         notifications,
//         unreadCount,
//         isRealTimeEnabled,
//         setIsRealTimeEnabled,
//         clearAllUnread,
//         fetchNotifications,
//     } = useNotifications();

//     const [activeTab, setActiveTab] = useState<TabType>('all');
//     const [loading, setLoading] = useState(false);

//     const handleRefresh = async () => {
//         setLoading(true);
//         await fetchNotifications();
//         setTimeout(() => setLoading(false), 500);
//     };

//     const getFilteredNotifications = () => {
//         if (activeTab === 'all') return notifications;
//         return notifications.filter((n) => n.bookingStatus === activeTab);
//     };

//     const getTabCount = (tab: TabType) => {
//         if (tab === 'all') return notifications.length;
//         return notifications.filter((n) => n.bookingStatus === tab).length;
//     };

//     const renderStatusBadge = (status: NotificationStatus) => {
//         const style = STATUS_CONFIG[STATUS_MAP[status]];

//         return (
//             <span
//                 className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${style.color} ${style.bg}`}
//             >
//                 {style.icon}
//                 {STATUS_MAP[status]}
//             </span>
//         );
//     };

//     const handleNotificationClick = (item: Notification) => {
//         if (item.type === 'BOOKING_CREATED') {
//             router.push(`/booking`);
//         } else {
//             router.push(`/lead`);
//         }
//     };

//     const filteredNotifications = getFilteredNotifications();

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
//             <div className="max-w-7xl mx-auto p-2 md:p-7">
//                 {/* HEADER */}
//                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-slate-800/60">
//                     <div className="flex items-center gap-4">
//                         <div className="relative p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
//                             <Bell id="bell-icon" className="text-white" size={24} />
//                             {unreadCount > 0 && (
//                                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center animate-pulse border-2 border-white">
//                                     {unreadCount > 99 ? '99+' : unreadCount}
//                                 </span>
//                             )}
//                         </div>
//                         <div>
//                             <h1 className="text-3xl font-black text-gray-900 dark:text-white">
//                                 Notifications
//                             </h1>
//                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
//                                 Update Center {isRealTimeEnabled && '• 🟢 Live'}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         {/* Real-time Toggle */}
//                         <button
//                             onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
//                             className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isRealTimeEnabled
//                                 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
//                                 : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'
//                                 }`}
//                         >
//                             <div
//                                 className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
//                                     }`}
//                             />
//                             {isRealTimeEnabled ? 'Live' : 'Paused'}
//                         </button>

//                         {/* Clear Unread */}
//                         {unreadCount > 0 && (
//                             <button
//                                 onClick={clearAllUnread}
//                                 className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
//                             >
//                                 Clear ({unreadCount})
//                             </button>
//                         )}

//                         {/* Refresh Button */}
//                         <button
//                             onClick={handleRefresh}
//                             className="p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-gray-400 hover:text-blue-500"
//                         >
//                             <RefreshCcw
//                                 size={20}
//                                 className={loading ? 'animate-spin text-blue-500' : ''}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 {/* TABS */}
//                 <div className="mb-6 bg-white dark:bg-slate-900/40 rounded-2xl p-2 border border-gray-200 dark:border-slate-800">
//                     <div className="flex gap-2 overflow-x-auto">
//                         {TABS.map((tab) => {
//                             const Icon = tab.icon;
//                             const count = getTabCount(tab.id);
//                             const isActive = activeTab === tab.id;

//                             return (
//                                 <button
//                                     key={tab.id}
//                                     onClick={() => setActiveTab(tab.id)}
//                                     className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
//                                         ? 'bg-blue-600 text-white shadow-lg'
//                                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
//                                         }`}
//                                 >
//                                     <Icon size={16} />
//                                     {tab.label}
//                                     <span
//                                         className={`px-2 py-0.5 rounded-full text-xs ${isActive
//                                             ? 'bg-white/20 text-white'
//                                             : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
//                                             }`}
//                                     >
//                                         {count}
//                                     </span>
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* NOTIFICATIONS LIST */}
//                 {loading ? (
//                     <div className="flex flex-col items-center py-32 opacity-40">
//                         <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
//                         <span className="text-xs font-black uppercase">Synchronizing...</span>
//                     </div>
//                 ) : filteredNotifications.length > 0 ? (
//                     <div className="grid gap-6">
//                         {filteredNotifications.map((item) => (
//                             <div
//                                 key={item.id}
//                                 className="bg-white/70 dark:bg-slate-900/40 border rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all"
//                             >
//                                 <div className="flex justify-between items-center gap-4">
//                                     <div className="flex items-center gap-3">
//                                         {renderStatusBadge(item.bookingStatus)}
//                                         <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 px-4 py-1 rounded-full">
//                                             ID: {item.bookingNumber}
//                                         </span>
//                                     </div>

//                                     <div className="flex items-center gap-2 text-xs text-gray-400">
//                                         <Calendar size={14} />
//                                         {new Date(item.created_at).toLocaleString('en-IN')}
//                                     </div>
//                                 </div>

//                                 <div className="mt-4 flex justify-between items-center gap-6">
//                                     <div>
//                                         <h3 className="text-lg font-bold">{item.title}</h3>
//                                         <p className="text-gray-500">{item.message}</p>
//                                     </div>

//                                     <button
//                                         onClick={() => handleNotificationClick(item)}
//                                         className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
//                                     >
//                                         View Details
//                                         <ArrowUpRight size={16} />
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-24">
//                         <Inbox className="mx-auto mb-4 text-gray-300" size={56} />
//                         <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
//                             No {activeTab !== 'all' ? activeTab : ''} notifications
//                         </h2>
//                         <p className="text-gray-400 mt-2">
//                             {activeTab !== 'all' ? 'Try switching to another tab' : "You're all caught up!"}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default NotificationsPage;



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
import { useNotifications } from '../components/NotificationProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type NotificationStatus = 'pending' | 'confirmed' | 'rejected';
type StatusKey = 'Pending' | 'Confirmed' | 'Rejected';
type TabType = 'all' | 'pending' | 'confirmed' | 'rejected';

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

const TABS = [
    { id: 'all' as TabType, label: 'All', icon: Bell },
    { id: 'pending' as TabType, label: 'Pending', icon: Clock },
    { id: 'confirmed' as TabType, label: 'Confirmed', icon: CheckCircle },
    { id: 'rejected' as TabType, label: 'Rejected', icon: XCircle },
];

const NotificationsPage = () => {
    const router = useRouter();
    const { resetUnreadCount } = useNotifications();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    // Reset unread count when page loads
    useEffect(() => {
        resetUnreadCount();
    }, [resetUnreadCount]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(
                `${API_BASE_URL}/notifications/get-All-Notifications`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) return;

            const result = await response.json();
            const rawData = Array.isArray(result) ? result : result.data || [];

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
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getFilteredNotifications = () => {
        if (activeTab === 'all') return notifications;
        return notifications.filter((n) => n.bookingStatus === activeTab);
    };

    const getTabCount = (tab: TabType) => {
        if (tab === 'all') return notifications.length;
        return notifications.filter((n) => n.bookingStatus === tab).length;
    };

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
            router.push(`/booking`);
        } else {
            router.push(`/lead`);
        }
    };

    const filteredNotifications = getFilteredNotifications();

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

                {/* TABS */}
                <div className="mb-6 bg-white dark:bg-slate-900/40 rounded-2xl p-2 border border-gray-200 dark:border-slate-800">
                    <div className="flex gap-2 overflow-x-auto">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const count = getTabCount(tab.id);
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* NOTIFICATIONS LIST */}
                {loading ? (
                    <div className="flex flex-col items-center py-32 opacity-40">
                        <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
                        <span className="text-xs font-black uppercase">Synchronizing...</span>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredNotifications.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/70 dark:bg-slate-900/40 border rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        {renderStatusBadge(item.bookingStatus)}
                                        <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 px-4 py-1 rounded-full">
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
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
                        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            No {activeTab !== 'all' ? activeTab : ''} notifications
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {activeTab !== 'all' ? 'Try switching to another tab' : "You're all caught up!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;