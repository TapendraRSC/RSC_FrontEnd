import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

// ✅ Fetch All Statuses (pagination + search)
export const fetchStatuses = createAsyncThunk(
    "statuses/fetchAll",
    async (
        { page = 1, limit = 10, searchValue = "" }: { page?: number; limit?: number; searchValue?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.get(
                `/leadStatus/getAllLeadsStatus?page=${page}&limit=${limit}&search=${searchValue}`
            );
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Fetch By ID
export const fetchStatusById = createAsyncThunk(
    "statuses/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/leadStatus/getLeadStatus/${id}`);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Create Status
export const createStatus = createAsyncThunk(
    "statuses/create",
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/leadStatus/createLeadStatus", payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Update Status
export const updateStatus = createAsyncThunk(
    "statuses/update",
    async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/leadStatus/updateLeadStatus/${id}`, payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Delete Status
export const deleteStatus = createAsyncThunk(
    "statuses/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/leadStatus/deleteLeadStatus/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

interface Status {
    id: number;
    type: string;
}

interface StatusState {
    list: Status[];
    current: Status | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalPages: number;
    total: number;
}

const initialState: StatusState = {
    list: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
};

const statusSlice = createSlice({
    name: "statuses",
    initialState,
    reducers: {
        clearCurrentStatus: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchStatuses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStatuses.fulfilled, (state, action) => {
                state.loading = false;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
                state.total = action.payload.total;
                state.list =
                    action.payload.roles?.map((item: any) => ({
                        id: item.id,
                        type: item.type,
                    })) || [];
            })
            .addCase(fetchStatuses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch By ID
            .addCase(fetchStatusById.fulfilled, (state, action) => {
                state.current = action.payload;
            })

            // Create
            .addCase(createStatus.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            // Update
            .addCase(updateStatus.fulfilled, (state, action) => {
                if (action.payload && action.payload.id) {
                    const index = state.list.findIndex((s) => s.id === action.payload.id);
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                }
            })

            // Delete
            .addCase(deleteStatus.fulfilled, (state, action) => {
                state.list = state.list.filter((s: any) => s.id !== action.payload);
            });
    },
});

export const { clearCurrentStatus, clearError } = statusSlice.actions;
export default statusSlice.reducer;
