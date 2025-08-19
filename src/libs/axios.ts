// libs/axios.ts
import axios from "axios";

// "http://crm.local:8000/",

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.29.137:8000/",
    withCredentials: true,
});

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

// 🛑 Avoid calling refresh if done recently
const shouldRefreshToken = () => {
    const now = Date.now();
    const minInterval = 1 * 60 * 1000; // don't refresh again for 1 min

    if (!lastRefreshTime || now - lastRefreshTime > minInterval) {
        return true;
    }
    return false;
};

const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshingPromise) {
        return refreshingPromise; // If already refreshing, return same promise
    }

    refreshingPromise = (async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");

            if (!refreshToken) throw new Error("Refresh token missing");

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }

            const response = await axios.post(
                `${axiosInstance.defaults.baseURL}auth/refreshToken`,
                { refreshToken },
                { headers }
            );

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            if (newAccessToken) {
                localStorage.setItem("accessToken", newAccessToken);
            }

            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            console.log("🔄 Tokens refreshed");

            lastRefreshTime = Date.now(); // ⏱️ Track refresh
            return newAccessToken;
        } catch (error) {
            console.error("❌ Token refresh failed:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            return null;
        } finally {
            refreshingPromise = null; // Clear lock
        }
    })();

    return refreshingPromise;
};

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        let accessToken = localStorage.getItem("accessToken");

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

// ✅ Response Interceptor
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
