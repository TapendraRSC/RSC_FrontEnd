import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

export const fetchLeadStages = createAsyncThunk(
    "leadStages/fetchAll",
    async (
        { page = 1, limit = 10, searchValue = "" }: { page?: number; limit?: number; searchValue?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.get(
                `/leadStages/getAllLeadsStages?page=${page}&limit=${limit}&search=${searchValue}`
            );
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchLeadStageById = createAsyncThunk(
    "leadStages/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/leadStages/getLeadStage/${id}`);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createLeadStage = createAsyncThunk(
    "leadStages/create",
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/leadStages/createLeadStage", payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateLeadStage = createAsyncThunk(
    "leadStages/update",
    async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/leadStages/updateLeadStage/${id}`, payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteLeadStage = createAsyncThunk(
    "leadStages/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/leadStages/deleteLeadStage/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

interface LeadStage {
    id: number;
    type: string;
}

interface LeadStageState {
    list: LeadStage[];
    current: LeadStage | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalPages: number;
    total: number;
}

const initialState: LeadStageState = {
    list: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
};

const leadStageSlice = createSlice({
    name: "leadStages",
    initialState,
    reducers: {
        clearCurrentLeadStage: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchLeadStages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLeadStages.fulfilled, (state, action) => {
                state.loading = false;
                // Update pagination info
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
                state.total = action.payload.total;

                // Map API response to state format
                state.list = action.payload.roles?.map((item: any) => ({
                    id: item.id,
                    type: item.type, // Keep the same field name as in interface
                })) || [];
            })
            .addCase(fetchLeadStages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by ID
            .addCase(fetchLeadStageById.fulfilled, (state, action) => {
                state.current = action.payload;
            })

            .addCase(createLeadStage.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            .addCase(updateLeadStage.fulfilled, (state, action) => {
                if (action.payload && action.payload.id) {
                    const index = state.list.findIndex((s) => s.id === action.payload.id);
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                }
            })


            // Delete
            .addCase(deleteLeadStage.fulfilled, (state, action) => {
                state.list = state.list.filter((s: any) => s.id !== action.payload);
            });
    },
});

export const { clearCurrentLeadStage, clearError } = leadStageSlice.actions;
export default leadStageSlice.reducer;