import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

export interface FollowUp {
    id: number;
    leadId: any;
    leadStatusId: number;
    inquiryStatus?: string;   // ✅ added
    followUpDate: string;
    budget: string;
    remark: string;
    createdBy: string;
}

interface FollowUpsState {
    followUps: FollowUp[];
    loading: boolean;
    error: string | null;
}

const initialState: FollowUpsState = {
    followUps: [],
    loading: false,
    error: null,
};

// Fetch all follow-ups for a lead
export const fetchFollowUps = createAsyncThunk(
    'followUps/fetchFollowUps',
    async (leadId: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/follow-ups/getAllFollowUps/${leadId}`);
            return response.data?.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Save a new follow-up
export const saveFollowUp = createAsyncThunk(
    'followUps/saveFollowUp',
    async (
        data: {
            leadId: any;
            leadStatusId: number;
            inquiryStatus?: string;   // ✅ added here too
            followUpDate: string;
            budget: string;
            remark: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post('/follow-ups/save-followUp', data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const followUpsSlice = createSlice({
    name: 'followUps',
    initialState,
    reducers: {
        clearFollowUps(state) {
            state.followUps = [];
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch follow-ups
            .addCase(fetchFollowUps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFollowUps.fulfilled, (state, action: PayloadAction<FollowUp[]>) => {
                state.loading = false;
                state.followUps = action.payload;
            })
            .addCase(fetchFollowUps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Save follow-up
            .addCase(saveFollowUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveFollowUp.fulfilled, (state, action: PayloadAction<FollowUp>) => {
                state.loading = false;
                state.followUps.push(action.payload);
            })
            .addCase(saveFollowUp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearFollowUps } = followUpsSlice.actions;

export default followUpsSlice.reducer;
