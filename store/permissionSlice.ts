// permissionSlice.ts
import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Permission {
    id: number;
    permissionName: string;
}

interface PermissionData {
    page: number;
    limit: number;
    permissions: Permission[];
    total: number;
    totalPages: number;
}

interface PermissionState {
    list: {
        data: PermissionData;
    } | null;
    loading: boolean;
    error: string | any;
}

const initialState: PermissionState = {
    list: null,
    loading: false,
    error: null,
};

// Async thunk to fetch permissions
export const fetchPermissions = createAsyncThunk<PermissionData, { page?: number; limit?: number; searchValue?: string }>(
    'permissions/fetchPermissions',
    async ({ page = 1, limit = 10, searchValue = '' }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/permissions/getAllPermissions?page=${page}&limit=${limit}&search=${searchValue}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch permissions');
            }
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }
);

// Async thunk to add a permission
export const addPermission = createAsyncThunk<Permission, { permissionName: string }>(
    'permissions/addPermission',
    async (permissionData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/permissions/addPermission', permissionData);
            if (response.status !== 201) {
                throw new Error('Failed to add permission');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add permission');
        }
    }
);

// Async thunk to update a permission
export const updatePermission = createAsyncThunk<Permission, { id: number; permissionName: string }>(
    'permissions/updatePermission',
    async ({ id, permissionName }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/permissions/updatePermission/${id}`, { permissionName });
            if (response.status !== 200) {
                throw new Error('Failed to update permission');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update permission');
        }
    }
);

// Async thunk to delete a permission
export const deletePermission = createAsyncThunk<number, number>(
    'permissions/deletePermission',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/permissions/deletePermission/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to delete permission');
            }
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete permission');
        }
    }
);

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
            .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<PermissionData>) => {
                state.loading = false;
                state.list = { data: action.payload };
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Something went wrong';
            })
            .addCase(addPermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
                state.loading = false;
                if (state.list) {
                    state.list.data.permissions.push(action.payload);
                }
            })
            .addCase(addPermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to add permission';
            })
            .addCase(updatePermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePermission.fulfilled, (state, action: PayloadAction<Permission>) => {
                state.loading = false;
                if (state.list) {
                    const index = state.list.data.permissions.findIndex(p => p.id === action.payload.id);
                    if (index !== -1) {
                        state.list.data.permissions[index] = action.payload;
                    }
                }
            })
            .addCase(updatePermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update permission';
            })
            .addCase(deletePermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePermission.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                if (state.list) {
                    state.list.data.permissions = state.list.data.permissions.filter(p => p.id !== action.payload);
                }
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete permission';
            });
    },
});

export default permissionSlice.reducer;
