import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
    user: any;
    token: string | null;
    loading: boolean;
    error: string | null;
    refreshToken?: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/signin", credentials);
            return response.data; // assume { user, token }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response.data.message || 'Login failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { accessToken, refreshToken, user } = action.payload;
                state.user = user;
                state.token = accessToken;
                state.refreshToken = refreshToken;
                state.loading = false;
                state.error = null;

                // Save to localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
