import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface PaymentPlatform {
    id: number;
    platform_name: string;
    created_at?: string;
}

interface PaymentPlatformData {
    platforms: PaymentPlatform[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

interface PaymentPlatformState {
    list: { data: PaymentPlatformData } | null;
    loading: boolean;
    error: string | null;
}

const initialState: PaymentPlatformState = {
    list: null,
    loading: false,
    error: null,
};

export const fetchPages = createAsyncThunk(
    'paymentPlatforms/fetchAll',
    async ({ page = 1, limit = 10, searchValue = '' }: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/payment/get-payment-Platforms?page=${page}&limit=${limit}&search=${searchValue}`);
            return response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors || error.response?.data?.message || 'Failed to fetch payment platforms';
            return rejectWithValue(errorMessage);
        }
    }
);

export const addPage = createAsyncThunk(
    'paymentPlatforms/add',
    async (data: { platform_name: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/payment/add-payment-Platform', data);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors || error.response?.data?.message || 'Failed to add payment platform';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updatePage = createAsyncThunk(
    'paymentPlatforms/update',
    async ({ id, platform_name }: { id: number, platform_name: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/payment/update-payment-Platform/${id}`, { platform_name });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors || error.response?.data?.message || 'Failed to update payment platform';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deletePage = createAsyncThunk(
    'paymentPlatforms/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/payment/delete-payment-Platform/${id}`);
            return { id };
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors || error.response?.data?.message || 'Failed to delete payment platform';
            return rejectWithValue(errorMessage);
        }
    }
);

const paymentPlatformsSlice = createSlice({
    name: 'paymentPlatforms',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.pending, (state) => { 
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPages.fulfilled, (state, action: PayloadAction<PaymentPlatformData>) => {
                state.loading = false;
                state.list = { data: action.payload };
                state.error = null;
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addPage.pending, (state) => {
                state.loading = true;
            })
            .addCase(addPage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updatePage.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deletePage.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deletePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default paymentPlatformsSlice.reducer;