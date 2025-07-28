import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';


interface Permission {
    id: number;
    name: string;
}

interface PermissionState {
    list: Permission[];
    loading: boolean;
    error: string | null;
}

const initialState: PermissionState = {
    list: [],
    loading: false,
    error: null,
};

// Async thunk to fetch permissions
export const fetchPermissions = createAsyncThunk<Permission[]>(
    'permissions/fetchPermissions',
    async () => {
        const response = await axiosInstance.get('/permissions/getAllPermissions');
        if (response.status !== 200) {
            throw new Error('Failed to fetch permissions');
        }
        const data: Permission[] = response.data;
        return data;
    }
);

// Slice
const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Something went wrong';
            });
    },
});

export default permissionSlice.reducer;
