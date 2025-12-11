// store/authSlice.ts
import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
    user: any;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    role: string | null;
}

// ---------------------- Initialize from localStorage ----------------------
const getInitialAuthState = (): AuthState => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        return {
            user: user ? JSON.parse(user) : null,
            token,
            refreshToken,
            role,
            loading: false,
            error: null,
            isAuthenticated: !!(token && user),
        };
    }
    return {
        user: null,
        token: null,
        refreshToken: null,
        role: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    };
};

const initialState: AuthState = getInitialAuthState();

// ---------------------- Thunks ----------------------

// Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/signin", credentials);

            if (!response.data.accessToken || !response.data.user) {
                throw new Error("Invalid response: missing token or user data");
            }

            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            // Optional: backend logout call
            // await axiosInstance.post('auth/logout');

            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
            return null;
        } catch (err) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
            return null;
        }
    }
);

// Check auth status
export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, thunkAPI) => {
        try {
            if (typeof window === 'undefined') return null;

            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');
            const role = localStorage.getItem('role');

            if (!token || !user) {
                throw new Error("No valid session found");
            }

            return {
                token,
                user: JSON.parse(user),
                refreshToken: localStorage.getItem('refreshToken'),
                role,
            };
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// ---------------------- Slice ----------------------
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuth(state) {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.role = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
        },
        updateTokens(state, action) {
            const { accessToken, refreshToken } = action.payload;
            state.token = accessToken;
            if (refreshToken) state.refreshToken = refreshToken;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            }
        },
        clearError(state) {
            state.error = null;
        },
        // Add this reducer to set user and role directly from Redux
        setUserAndRole(state, action) {
            const { user, role } = action.payload;
            state.user = user;
            state.role = role;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { accessToken, refreshToken, user, role } = action.payload;

                state.user = user;
                state.token = accessToken;
                state.refreshToken = refreshToken || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.role = role;

                try {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('user', JSON.stringify(user));
                        localStorage.setItem('role', role);
                        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                    }
                } catch { }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
                state.role = null;
            })

            // Check auth
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.refreshToken = action.payload.refreshToken;
                    state.role = action.payload.role;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.token = null;
                    state.refreshToken = null;
                    state.role = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.role = null;
                state.isAuthenticated = false;
            });
    }
});

export const { clearAuth, updateTokens, clearError, setUserAndRole } = authSlice.actions;
export default authSlice.reducer;

// ---------------------- Selectors ----------------------
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectUser = (state: any) => state.auth.user;
export const selectAuthLoading = (state: any) => state.auth.loading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectUserRole = (state: any) => state.auth.role;