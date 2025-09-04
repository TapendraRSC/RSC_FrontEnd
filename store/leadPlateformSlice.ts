import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

export interface LeadPlatform {
    id: number;
    platformType: string; // API me 'platformType' hai, name nahi
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

            const data = res.data?.data; // ye nested data object hai
            if (!data) return rejectWithValue("No data found");

            return {
                leadPlatforms: data.roles || [], // roles array hi hume chahiye
                total: data.total || data.roles.length,
                totalPages: data.totalPages || 1,
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


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

export const updateLeadPlatform = createAsyncThunk(
    "leadPlatforms/update",
    async (
        { id, data }: { id: number; data: Omit<LeadPlatform, "id"> },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.put(`/leadPlatforms/updateLeadPlatform/${id}`, data);
            return res.data?.data as LeadPlatform;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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
            // Fetch
            .addCase(fetchLeadPlatforms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeadPlatforms.fulfilled, (state, action) => {
                state.loading = false;
                state.leadPlatforms = action.payload?.leadPlatforms || [];
                state.total = action.payload?.total || 0;
                state.totalPages = action.payload?.totalPages || 0;
            })
            .addCase(fetchLeadPlatforms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createLeadPlatform.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) state.leadPlatforms.unshift(action.payload);
            })
            // Update
            .addCase(updateLeadPlatform.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload?.id) return;
                state.leadPlatforms = state.leadPlatforms.map((lp) =>
                    lp.id === action.payload.id ? action.payload : lp
                );
            })
            // Delete
            .addCase(deleteLeadPlatform.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.leadPlatforms = state.leadPlatforms.filter((lp) => lp.id !== action.payload);
            });
    },
});

export const { clearCurrentLeadPlatform, setCurrentLeadPlatform } =
    leadPlatformSlice.actions;
export default leadPlatformSlice.reducer;
