import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the necessary interfaces
interface RolePermission {
    pageId: number;
    permissionIds: number[];
}

interface RolePermissionRequest {
    roleId: number;
    permissions: RolePermission[];
}

interface RolePermissionState {
    rolePermissions: RolePermissionRequest | null;
    loading: boolean;
    error: string | null;
}

const initialState: RolePermissionState = {
    rolePermissions: null,
    loading: false,
    error: null,
};

// Async thunk to fetch role permissions
export const fetchRolePermissions = createAsyncThunk(
    'rolePermissions/fetchRolePermissions',
    async (roleId: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/rolePermissions/roles/${roleId}/permissions`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch role permissions');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch role permissions');
        }
    }
);

// Async thunk to set role permissions
export const setRolePermissions = createAsyncThunk(
    'rolePermissions/setRolePermissions',
    async (rolePermissionData: RolePermissionRequest, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/rolePermissions/set-role-permissions', rolePermissionData);
            if (response.status !== 200) {
                throw new Error('Failed to set role permissions');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to set role permissions');
        }
    }
);

const rolePermissionSlice = createSlice({
    name: 'rolePermissions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionRequest>) => {
                state.loading = false;
                state.rolePermissions = action.payload;
            })
            .addCase(fetchRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(setRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionRequest>) => {
                state.loading = false;
                state.rolePermissions = action.payload;
            })
            .addCase(setRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default rolePermissionSlice.reducer;
