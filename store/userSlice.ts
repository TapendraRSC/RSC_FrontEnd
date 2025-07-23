import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

interface ExportedUserState {
    data: any; // You can type this better if you know the structure
    loading: boolean;
    error: string | null;
}

const initialState: ExportedUserState = {
    data: null,
    loading: false,
    error: null,
};

// Thunk to export users
export const exportUsers = createAsyncThunk(
    'users/exportUsers',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get('users/exportUser');
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to export users');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(exportUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportUsers.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(exportUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
