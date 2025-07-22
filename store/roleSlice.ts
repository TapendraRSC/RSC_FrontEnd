import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface RoleState {
    data: Role[];
    loading: boolean;
    error: string | null;
}

const initialState: RoleState = {
    data: [],
    loading: false,
    error: null,
};

// Thunk to fetch roles
export const getRoles = createAsyncThunk(
    'roles/getRoles',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get('roles/getRoles');
            return response.data?.data; // should be Role[]
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
);

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoles.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default roleSlice.reducer;
