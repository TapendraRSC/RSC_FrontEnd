// src/store/slices/leadPlatformSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

export interface LeadPlatform {
    id: number;
    name: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface LeadPlatformState {
    leadPlatforms: LeadPlatform[];
    total: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    currentLeadPlatform: LeadPlatform | null;
}

const initialState: LeadPlatformState = {
    leadPlatforms: [],
    total: 0,
    totalPages: 0,
    loading: false,
    error: null,
    currentLeadPlatform: null,
};

// ✅ Fetch all lead platforms
export const fetchLeadPlatforms = createAsyncThunk(
    "leadPlatforms/fetchAll",
    async (
        params: { page?: number; limit?: number; search?: string },
        { rejectWithValue }
    ) => {
        try {
            const { page = 1, limit = 10, search } = params || {};
            const res = await axiosInstance.get(`/leadPlatforms/getAllLeadPlatforms`, {
                params: { page, limit, search: search || undefined },
            });
            return res.data?.data; // { leadPlatforms, total, totalPages }
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ✅ Create new lead platform
export const createLeadPlatform = createAsyncThunk(
    "leadPlatforms/create",
    async (data: Omit<LeadPlatform, "id">, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/leadPlatforms/createLeadPlatform`, data);
            return res.data?.data as LeadPlatform;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ✅ Update lead platform
export const updateLeadPlatform = createAsyncThunk(
    "leadPlatforms/update",
    async ({ id, data }: { id: number; data: Omit<LeadPlatform, "id"> }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/leadPlatforms/updateLeadPlatform/${id}`, data);
            return res.data?.data as LeadPlatform;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ✅ Delete lead platform
export const deleteLeadPlatform = createAsyncThunk(
    "leadPlatforms/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/leadPlatforms/deleteLeadPlatform/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const leadPlatformSlice = createSlice({
    name: "leadPlatforms",
    initialState,
    reducers: {
        clearCurrentLeadPlatform: (state) => {
            state.currentLeadPlatform = null;
        },
        setCurrentLeadPlatform: (state, action: PayloadAction<LeadPlatform | null>) => {
            state.currentLeadPlatform = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // 🔹 fetchLeadPlatforms
            .addCase(fetchLeadPlatforms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeadPlatforms.fulfilled, (state, action) => {
                state.loading = false;
                state.leadPlatforms = action.payload?.roles || [];
                state.total = action.payload?.total || 0;
                state.totalPages = action.payload?.totalPages || 0;
            })
            .addCase(fetchLeadPlatforms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 🔹 createLeadPlatform
            .addCase(createLeadPlatform.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLeadPlatform.fulfilled, (state, action) => {
                state.loading = false;
                state.leadPlatforms.unshift(action.payload); // add new at top
            })
            .addCase(createLeadPlatform.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 🔹 updateLeadPlatform
            .addCase(updateLeadPlatform.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLeadPlatform.fulfilled, (state, action) => {
                state.loading = false;
                state.leadPlatforms = state.leadPlatforms.map((lp) =>
                    lp.id === action.payload.id ? action.payload : lp
                );
            })
            .addCase(updateLeadPlatform.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 🔹 deleteLeadPlatform
            .addCase(deleteLeadPlatform.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLeadPlatform.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.leadPlatforms = state.leadPlatforms.filter((lp) => lp.id !== action.payload);
            })
            .addCase(deleteLeadPlatform.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentLeadPlatform, setCurrentLeadPlatform } = leadPlatformSlice.actions;
export default leadPlatformSlice.reducer;
