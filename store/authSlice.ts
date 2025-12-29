// store/authSlice.ts
import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
    user: any;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    role: string | null;
    error: string | null;
    isAuthenticated: boolean;
    otpSent: boolean; //  NEW for OTP flow
}

// ---------------------- Initialize from localStorage ----------------------
const getInitialAuthState = (): AuthState => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        //  FIXED: Safely parse user - handle "undefined" string
        let user = null;
        try {
            if (userStr && userStr !== 'undefined' && userStr !== 'null') {
                user = JSON.parse(userStr);
            }
        } catch {
            user = null; // Invalid JSON = clear it
            localStorage.removeItem('user');
        }

        return {
            user,
            token,
            refreshToken,
            role,
            loading: false,
            error: null,
            isAuthenticated: !!(token && user),
            otpSent: false,
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
        otpSent: false,
    };
};

const initialState: AuthState = getInitialAuthState();

// ---------------------- Thunks ----------------------

// Login - OTP flow (no token/user yet)
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/signin", credentials);
            const data = response.data;

            // ✅ OTP flow: just check success - NO token/user required
            if (data.success || data.message?.includes('OTP')) {
                return data;
            }

            throw new Error(data.message || 'Login failed');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);



export const completeLogin = createAsyncThunk(
    'auth/completeLogin',
    async ({ userId, otp }: { userId: string; otp: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/verify-otp", {
                userId: userId, 
                otp
            });
            const data = response.data;

            if (!data.accessToken || !data.user) {
                throw new Error("Invalid response: missing token or user data");
            }

            return data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'OTP verification failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
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
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                throw new Error("No valid session found");
            }

            // ✅ Safe parse
            let user = null;
            try {
                if (userStr !== 'undefined' && userStr !== 'null') {
                    user = JSON.parse(userStr);
                }
            } catch {
                throw new Error("Invalid user data");
            }

            if (!user) {
                throw new Error("No valid user data");
            }

            return {
                token,
                user,
                refreshToken: localStorage.getItem('refreshToken'),
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
            state.otpSent = false;
            state.error = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
        },
        clearOtpSent(state) {
            state.otpSent = false;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login - OTP sent (no token yet)
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true; // ✅ Just mark OTP sent
                state.error = null;
                // Don't set token/user here - comes after OTP
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.otpSent = false;
            })

            // Complete login after OTP
            .addCase(completeLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeLogin.fulfilled, (state, action) => {
                const { accessToken, refreshToken, user, role } = action.payload;

                state.user = user;
                state.token = accessToken;
                state.refreshToken = refreshToken || null;
                state.role = role || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.otpSent = false;
                state.error = null;

                // ✅ Safe localStorage set
                try {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('user', JSON.stringify(user));
                        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                        if (role) localStorage.setItem('role', role);
                    }
                } catch { }
            })
            .addCase(completeLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.otpSent = false;
                state.loading = false;
                state.error = null;
            })

            // Check auth
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.otpSent = false;
            });
    }
});

export const { clearAuth, clearOtpSent, clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectUser = (state: any) => state.auth.user;
export const selectAuthLoading = (state: any) => state.auth.loading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectOtpSent = (state: any) => state.auth.otpSent;
