import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces
interface Land {
    id: number;
    type: string;
}

interface LandData {
    page: number;
    limit: number;
    roles: Land[];
    total: number;
    totalPages: number;
}

interface LandState {
    list: LandData | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: LandState = {
    list: null,
    loading: false,
    error: null,
};

// Async thunk for fetching lands
export const fetchLands = createAsyncThunk(
    'lands/fetchLands',
    async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/lands/getLands?page=${page}&limit=${limit}`);
            if (response.status !== 200) throw new Error('Failed to fetch lands');
            return response.data.data as LandData;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lands');
        }
    }
);

export const addLand = createAsyncThunk(
    'lands/addLand',
    async (landData: { type: any }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/lands/addLand', landData);
            return response.data.data; // make sure this is the single new Land object
        } catch (error: any) {
            console.error('Error adding land:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to add land');
        }
    }
);

export const updateLand = createAsyncThunk(
    'lands/updateLand',
    async ({ id, type }: { id: number; type: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/lands/updateLand/${id}`, { type });
            console.log("Update API raw response:", response.data); // <--- check here
            if (response.status !== 200) {
                throw new Error('Failed to update land');
            }
            return response.data.data; // adjust after seeing the log
        } catch (error: any) {
            console.error('Error updating land:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to update land');
        }
    }
);


// Async thunk for deleting a land
export const deleteLand = createAsyncThunk(
    'lands/deleteLand',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/lands/deleteLand/${id}`);
            if (response.status !== 200) throw new Error('Failed to delete land');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete land');
        }
    }
);

// Create the slice
const landSlice = createSlice({
    name: 'lands',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle fetchLands
            .addCase(fetchLands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLands.fulfilled, (state, action: PayloadAction<LandData>) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchLands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Something went wrong';
            })
            // Handle addLand
            .addCase(addLand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addLand.fulfilled, (state, action: PayloadAction<Land>) => {
                state.loading = false;
                if (state.list?.roles) {
                    state.list.roles.push(action.payload);
                    state.list.total += 1;
                }
            })
            .addCase(addLand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to add land';
            })
            // Handle updateLand
            .addCase(updateLand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLand.fulfilled, (state, action: PayloadAction<Land | undefined>) => {
                state.loading = false;
                if (!action.payload || action.payload.id == null) return;

                const index = state.list?.roles.findIndex(land => land.id === action.payload!.id);
                if (index !== undefined && index !== -1) {
                    state.list!.roles[index] = action.payload!;
                }
            })

            .addCase(updateLand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to update land';
            })
            // Handle deleteLand
            .addCase(deleteLand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLand.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                if (state.list?.roles) {
                    state.list.roles = state.list.roles.filter((land) => land.id !== action.payload);
                    state.list.total -= 1;
                }
            })
            .addCase(deleteLand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to delete land';
            });
    },
});

export default landSlice.reducer;
