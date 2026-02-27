'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../../libs/api';

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