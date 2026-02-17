// libs/axios.ts - Updated with URL and cookie fixes
import axios from "axios";
import { CapacitorHttp, CapacitorCookies } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

import { API_BASE_URL } from '../libs/api';
// ✅ Fixed base URL with trailing slash (use env var fallback)

// libs/axios.ts



const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});



// Custom adapter for Capacitor with cookie handling
async function capacitorAdapter(config: any) {
    // ✅ Ensure proper URL formation
    let url = config.url;
    //  if (!url.startsWith('http')) {
    //     const baseURL = config.baseURL?.endsWith('/') ? config.baseURL : `${config.baseURL}/`;
    //     const endpoint = url.startsWith('/') ? url.substring(1) : url;
    //     url = `${baseURL}${endpoint}`;
    // }
    if (!url.startsWith('http')) {
        const base = config.baseURL.replace(/\/+$/, ''); // Remove trailing slash
        const path = url.replace(/^\/+/, '');          // Remove leading slash
        url = `${base}/${path}`;
    }

    console.log('📡 Capacitor HTTP Request:', config.method?.toUpperCase(), url);

    try {
        // Handle cookies for authentication
        if (Capacitor.isNativePlatform()) {
            // Get existing cookies
            const cookies = await CapacitorCookies.getCookies({ url });
            console.log('🍪 Existing cookies:', cookies);
        }

        const response = await CapacitorHttp.request({
            url: url,
            method: config.method?.toUpperCase() || 'GET',
            headers: {
                ...config.headers,
                'Content-Type': 'application/json',
            },
            data: config.data,
            webFetchExtra: {
                credentials: 'include' // Important for cookies
            }
        });

        console.log('✅ Response status:', response.status);

        // Handle cookies from response
        if (Capacitor.isNativePlatform() && response.headers) {
            const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
            if (setCookieHeader) {
                console.log('🍪 Setting cookies:', setCookieHeader);
            }
        }

        return {
            data: response.data,
            status: response.status,
            statusText: response.status >= 200 && response.status < 300 ? 'OK' : 'Error',
            headers: response.headers || {},
            config: config,
            request: {},
        };
    } catch (error: any) {
        console.error('❌ Capacitor HTTP Error:', error);
        const axiosError = new Error(`Request failed: ${error.message}`);
        (axiosError as any).config = config;
        (axiosError as any).response = {
            status: error.status || 500,
            data: error.data || { message: error.message }
        };
        throw axiosError;
    }
}

// Apply adapter only for native platforms
if (Capacitor.isNativePlatform()) {
    axiosInstance.defaults.adapter = capacitorAdapter;
}

// Storage helper
const storage = {
    getItem: (key: string): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    clear: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    }
};

let lastRefreshTime: number | null = null;
let refreshingPromise: Promise<string | null> | null = null;

const getTokenExpiry = (token: string | null) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000;
    } catch (error) {
        console.error("Token decode failed:", error);
        return null;
    }
};

const isTokenExpiringSoon = (token: string | null) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;

    const now = Date.now();
    const threshold = 10 * 60 * 1000;
    return (expiry - now) <= threshold;
};

const shouldRefreshToken = () => {
    const now = Date.now();
    const minInterval = 1 * 60 * 1000;

    if (!lastRefreshTime || now - lastRefreshTime > minInterval) {
        return true;
    }
    return false;
};

const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshingPromise) return refreshingPromise;

    refreshingPromise = (async () => {
        try {
            const refreshToken = storage.getItem("refreshToken");
            if (!refreshToken) throw new Error("Refresh token missing");

            console.log('🔄 Refreshing token...');

            const response = await axiosInstance.post(
                "auth/refreshToken", // No leading slash
                { refreshToken },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            if (newAccessToken) storage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) storage.setItem("refreshToken", newRefreshToken);

            lastRefreshTime = Date.now();
            console.log('✅ Token refreshed successfully');
            return newAccessToken;
        } catch (err) {
            console.error('❌ Token refresh failed:', err);
            storage.clear();
            if (typeof window !== 'undefined') {
                window.location.href = "/login";
            }
            return null;
        } finally {
            refreshingPromise = null;
        }
    })();

    return refreshingPromise;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        let accessToken = storage.getItem("accessToken");

        if (accessToken && isTokenExpiringSoon(accessToken) && shouldRefreshToken()) {
            console.log("⏰ Token expiring soon, refreshing...");
            const newToken = await refreshAccessToken();
            if (newToken) {
                accessToken = newToken;
            }
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("🔁 Got 401, trying refresh...");

            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;