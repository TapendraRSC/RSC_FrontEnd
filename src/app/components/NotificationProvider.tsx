// 'use client';

// import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
// import { Sparkles, XCircle, Clock, CheckCircle, Bell } from 'lucide-react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// type NotificationStatus = 'pending' | 'confirmed' | 'rejected';
// type StatusKey = 'Pending' | 'Confirmed' | 'Rejected';

// interface Notification {
//     id: number;
//     type: string;
//     title: string;
//     message: string;
//     bookingStatus: NotificationStatus;
//     bookingNumber: string;
//     created_at: string;
// }

// interface NotificationContextType {
//     notifications: Notification[];
//     unreadCount: number;
//     isRealTimeEnabled: boolean;
//     setIsRealTimeEnabled: (enabled: boolean) => void;
//     clearAllUnread: () => void;
//     fetchNotifications: () => void;
// }

// const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

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

// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [newNotification, setNewNotification] = useState<Notification | null>(null);
//     const [showPopup, setShowPopup] = useState(false);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

//     const previousNotificationsRef = useRef<Notification[]>([]);
//     const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const [showPermissionModal, setShowPermissionModal] = useState(false);
//     const [permissionDenied, setPermissionDenied] = useState(false);

//     // Browser Notification Permission with persistent modal
//     const requestNotificationPermission = async () => {
//         if (!('Notification' in window)) {
//             console.warn('This browser does not support notifications');
//             return;
//         }

//         if (Notification.permission === 'granted') {
//             setShowPermissionModal(false);
//             setPermissionDenied(false);
//             return;
//         }

//         if (Notification.permission === 'denied') {
//             setPermissionDenied(true);
//             setShowPermissionModal(true);
//             return;
//         }

//         if (Notification.permission === 'default') {
//             setShowPermissionModal(true);
//         }
//     };

//     const handleAllowNotifications = async () => {
//         try {
//             // Check if browser supports notifications
//             if (!('Notification' in window)) {
//                 alert('Your browser does not support notifications. Please use Chrome, Firefox, Edge, or Safari.');
//                 return;
//             }

//             // If already denied, show instructions
//             if (Notification.permission === 'denied') {
//                 setPermissionDenied(true);
//                 return;
//             }

//             // Request permission
//             const permission = await Notification.requestPermission();

//             if (permission === 'granted') {
//                 setShowPermissionModal(false);
//                 setPermissionDenied(false);

//                 // Show success notification
//                 try {
//                     const successNotif = new Notification('🎉 Notifications Enabled!', {
//                         body: 'You will now receive real-time updates from CRM',
//                         icon: '/notification-icon.png',
//                         badge: '/badge-icon.png',
//                         tag: 'permission-granted',
//                         requireInteraction: false,
//                     });

//                     setTimeout(() => successNotif.close(), 5000);
//                 } catch (err) {
//                     console.log('Success notification error:', err);
//                 }
//             } else if (permission === 'denied') {
//                 setPermissionDenied(true);
//             } else if (permission === 'default') {
//                 // User closed the prompt without selecting
//                 alert('Please click "Allow" to enable notifications');
//             }
//         } catch (error) {
//             console.error('Error requesting notification permission:', error);
//             alert('Error enabling notifications. Please try again.');
//         }
//     };

//     useEffect(() => {
//         // Check permission on mount
//         requestNotificationPermission();

//         // Re-check permission every 5 seconds if not granted
//         const permissionCheckInterval = setInterval(() => {
//             if (Notification.permission !== 'granted') {
//                 requestNotificationPermission();
//             }
//         }, 5000);

//         return () => clearInterval(permissionCheckInterval);
//     }, []);

//     // Play notification sound
//     const playNotificationSound = () => {
//         try {
//             const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//             const oscillator = audioContext.createOscillator();
//             const gainNode = audioContext.createGain();

//             oscillator.connect(gainNode);
//             gainNode.connect(audioContext.destination);

//             oscillator.frequency.value = 800;
//             oscillator.type = 'sine';

//             gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//             gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

//             oscillator.start(audioContext.currentTime);
//             oscillator.stop(audioContext.currentTime + 0.5);
//         } catch (error) {
//             console.error('Error playing sound:', error);
//         }
//     };

//     // Show browser notification
//     const showBrowserNotification = (notification: Notification) => {
//         if ('Notification' in window && Notification.permission === 'granted') {
//             const notif = new Notification('🔔 New Notification!', {
//                 body: `${notification.title}\n${notification.message}`,
//                 icon: '/notification-icon.png',
//                 badge: '/badge-icon.png',
//                 tag: `notification-${notification.id}`,
//                 requireInteraction: false,
//                 silent: false,
//             });

//             notif.onclick = () => {
//                 window.focus();
//                 // Navigate to notification
//                 if (notification.type === 'BOOKING_CREATED') {
//                     window.location.href = `/booking`;
//                 } else {
//                     window.location.href = `/lead`;
//                 }
//                 notif.close();
//             };

//             setTimeout(() => notif.close(), 10000);
//         }
//     };

//     // Update document title with unread count
//     const updateDocumentTitle = (count: number) => {
//         if (count > 0) {
//             document.title = `(${count}) New Notifications`;
//         } else {
//             document.title = 'Dashboard'; // Default title
//         }
//     };

//     const fetchNotifications = async () => {
//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) return;

//             const response = await fetch(
//                 `${API_BASE_URL}/notifications/get-All-Notifications`,
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (!response.ok) return;

//             const result = await response.json();
//             const rawData = Array.isArray(result) ? result : result.data || [];

//             const normalizedData: Notification[] = rawData
//                 .map((item: any) => ({
//                     ...item,
//                     bookingStatus:
//                         item.bookingStatus?.toLowerCase() === 'approved'
//                             ? 'confirmed'
//                             : item.bookingStatus?.toLowerCase(),
//                 }))
//                 .sort(
//                     (a: Notification, b: Notification) =>
//                         new Date(b.created_at).getTime() -
//                         new Date(a.created_at).getTime()
//                 );

//             // Check for new notifications
//             if (previousNotificationsRef.current.length > 0 && normalizedData.length > 0) {
//                 const newNotifications = normalizedData.filter(
//                     (newNotif) =>
//                         !previousNotificationsRef.current.some(
//                             (oldNotif) => oldNotif.id === newNotif.id
//                         )
//                 );

//                 if (newNotifications.length > 0 && isRealTimeEnabled) {
//                     const latestNew = newNotifications[0];
//                     setNewNotification(latestNew);
//                     setShowPopup(true);
//                     setUnreadCount((prev) => prev + newNotifications.length);

//                     // Trigger all notification methods
//                     playNotificationSound();
//                     showBrowserNotification(latestNew);
//                     updateDocumentTitle(unreadCount + newNotifications.length);

//                     // Vibrate if supported
//                     if ('vibrate' in navigator) {
//                         navigator.vibrate([200, 100, 200]);
//                     }
//                 }
//             }

//             previousNotificationsRef.current = normalizedData;
//             setNotifications(normalizedData);
//         } catch (err) {
//             console.error('Error fetching notifications:', err);
//         }
//     };

//     useEffect(() => {
//         fetchNotifications();

//         // Poll for new notifications every 10 seconds
//         if (isRealTimeEnabled) {
//             pollingIntervalRef.current = setInterval(() => {
//                 fetchNotifications();
//             }, 10000);
//         }

//         return () => {
//             if (pollingIntervalRef.current) {
//                 clearInterval(pollingIntervalRef.current);
//             }
//         };
//     }, [isRealTimeEnabled, unreadCount]);

//     const clearAllUnread = () => {
//         setUnreadCount(0);
//         updateDocumentTitle(0);
//     };

//     const handleClosePopup = () => {
//         setShowPopup(false);
//     };

//     const handleViewDetails = () => {
//         if (newNotification) {
//             if (newNotification.type === 'BOOKING_CREATED') {
//                 window.location.href = `/booking`;
//             } else {
//                 window.location.href = `/lead`;
//             }
//         }
//         setShowPopup(false);
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

//     return (
//         <NotificationContext.Provider
//             value={{
//                 notifications,
//                 unreadCount,
//                 isRealTimeEnabled,
//                 setIsRealTimeEnabled,
//                 clearAllUnread,
//                 fetchNotifications,
//             }}
//         >
//             {children}

//             {/* NOTIFICATION PERMISSION MODAL - Persistent until enabled */}
//             {showPermissionModal && (
//                 <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
//                     <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-2 border-blue-500 animate-scale-in">
//                         <div className="text-center">
//                             {/* Icon */}
//                             <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
//                                 <Bell className="text-white" size={40} />
//                             </div>

//                             {/* Title */}
//                             <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
//                                 Enable Notifications
//                             </h2>

//                             {/* Description */}
//                             {permissionDenied ? (
//                                 <div className="space-y-4">
//                                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//                                         Notifications are blocked. Please enable them manually:
//                                     </p>

//                                     <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-left">
//                                         <p className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
//                                             <span className="text-xl">🔒</span> How to Enable:
//                                         </p>
//                                         <ol className="text-xs text-red-600 dark:text-red-400 space-y-2 ml-6 list-decimal">
//                                             <li>Click the <strong>lock icon (🔒)</strong> or <strong>info icon (ℹ️)</strong> in your browser address bar</li>
//                                             <li>Find <strong>"Notifications"</strong> setting</li>
//                                             <li>Change it to <strong>"Allow"</strong></li>
//                                             <li>Refresh this page</li>
//                                         </ol>
//                                     </div>

//                                     <button
//                                         onClick={() => window.location.reload()}
//                                         className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
//                                     >
//                                         Refresh Page
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <p className="text-gray-600 dark:text-gray-400 mb-6">
//                                         Stay updated with real-time notifications for new bookings, confirmations, and important updates.
//                                     </p>

//                                     {/* Features List */}
//                                     <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 text-left">
//                                         <p className="font-bold text-sm text-blue-700 dark:text-blue-400 mb-3">
//                                             You'll receive:
//                                         </p>
//                                         <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
//                                             <li className="flex items-center gap-2">
//                                                 <span className="text-green-500">✓</span>
//                                                 <span>Instant booking updates</span>
//                                             </li>
//                                             <li className="flex items-center gap-2">
//                                                 <span className="text-green-500">✓</span>
//                                                 <span>Confirmation alerts</span>
//                                             </li>
//                                             <li className="flex items-center gap-2">
//                                                 <span className="text-green-500">✓</span>
//                                                 <span>Important status changes</span>
//                                             </li>
//                                             <li className="flex items-center gap-2">
//                                                 <span className="text-green-500">✓</span>
//                                                 <span>Real-time notifications</span>
//                                             </li>
//                                         </ul>
//                                     </div>

//                                     {/* Action Buttons */}
//                                     <div className="space-y-3">
//                                         <button
//                                             onClick={handleAllowNotifications}
//                                             className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
//                                         >
//                                             <Bell size={24} />
//                                             Enable Notifications
//                                         </button>

//                                         <div className="text-center space-y-1">
//                                             <p className="text-xs text-gray-500 dark:text-gray-500 font-bold">
//                                                 ⚠️ Important: Click "Allow" when browser asks
//                                             </p>
//                                             <p className="text-xs text-gray-400 dark:text-gray-600">
//                                                 Supported: Chrome • Firefox • Edge • Safari
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* GLOBAL NOTIFICATION POPUP - Persistent across all pages */}
//             {showPopup && newNotification && (
//                 <div className="fixed top-4 right-4 z-[9999] animate-slide-bounce">
//                     <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-2xl p-5 max-w-sm border-2 border-blue-400 relative overflow-hidden">
//                         {/* Animated background effect */}
//                         <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>

//                         <div className="relative z-10">
//                             <div className="flex items-start gap-3">
//                                 <div className="p-2 bg-white/20 rounded-xl animate-bounce-slow">
//                                     <Sparkles className="text-white" size={24} />
//                                 </div>
//                                 <div className="flex-1">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <h4 className="font-black text-base flex items-center gap-2">
//                                             🔔 New Notification!
//                                         </h4>
//                                     </div>
//                                     <div className="bg-white/20 rounded-lg p-2 mb-2">
//                                         {renderStatusBadge(newNotification.bookingStatus)}
//                                         <span className="ml-2 text-xs font-bold">
//                                             ID: {newNotification.bookingNumber}
//                                         </span>
//                                     </div>
//                                     <p className="text-sm font-bold mb-1">
//                                         {newNotification.title}
//                                     </p>
//                                     <p className="text-xs text-white/90 line-clamp-2">
//                                         {newNotification.message}
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={handleClosePopup}
//                                     className="text-white/70 hover:text-white transition-colors"
//                                 >
//                                     <XCircle size={20} />
//                                 </button>
//                             </div>
//                             <button
//                                 onClick={handleViewDetails}
//                                 className="mt-3 w-full py-2.5 bg-white text-blue-600 rounded-xl text-sm font-black hover:bg-blue-50 transition-all transform hover:scale-105"
//                             >
//                                 View Details →
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <style jsx global>{`
//                 @keyframes slide-bounce {
//                     0% {
//                         transform: translateX(120%) scale(0.8);
//                         opacity: 0;
//                     }
//                     60% {
//                         transform: translateX(-10px) scale(1.05);
//                         opacity: 1;
//                     }
//                     80% {
//                         transform: translateX(5px) scale(0.98);
//                     }
//                     100% {
//                         transform: translateX(0) scale(1);
//                         opacity: 1;
//                     }
//                 }

//                 @keyframes ring {
//                     0%, 100% { transform: rotate(0deg); }
//                     10%, 30% { transform: rotate(-10deg); }
//                     20%, 40% { transform: rotate(10deg); }
//                 }

//                 @keyframes bounce-slow {
//                     0%, 100% { transform: translateY(0); }
//                     50% { transform: translateY(-5px); }
//                 }

//                 @keyframes scale-in {
//                     0% {
//                         transform: scale(0.8);
//                         opacity: 0;
//                     }
//                     100% {
//                         transform: scale(1);
//                         opacity: 1;
//                     }
//                 }

//                 .animate-slide-bounce {
//                     animation: slide-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
//                 }

//                 .animate-ring {
//                     animation: ring 0.5s ease-in-out;
//                 }

//                 .animate-bounce-slow {
//                     animation: bounce-slow 2s ease-in-out infinite;
//                 }

//                 .animate-scale-in {
//                     animation: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
//                 }
//             `}</style>
//         </NotificationContext.Provider>
//     );
// };

// // Custom hook to use notification context
// export const useNotifications = () => {
//     const context = useContext(NotificationContext);
//     if (context === undefined) {
//         throw new Error('useNotifications must be used within a NotificationProvider');
//     }
//     return context;
// };




'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    entityStatus?: string;
    bookingStatus?: string;
    bookingNumber: string | null;
    created_at: string;
}

interface NotificationContextType {
    unreadCount: number;
    resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const fetchNotificationCount = async () => {
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
            const data: Notification[] = Array.isArray(result) ? result : result.data || [];

            // Count ALL pending notifications (both entityStatus and bookingStatus)
            const pendingCount = data.filter((item) => {
                const status = (item.entityStatus || item.bookingStatus || '').toLowerCase();
                return status === 'pending';
            }).length;

            setUnreadCount(pendingCount);

        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotificationCount();

        // Refresh every 10 seconds
        const interval = setInterval(fetchNotificationCount, 300000);

        return () => clearInterval(interval);
    }, []);

    const resetUnreadCount = () => {
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, resetUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};