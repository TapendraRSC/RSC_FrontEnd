import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRolePermissionsSidebar = createAsyncThunk(
    'sidebarPermission/fetchRolePermissionsSidebar',
    async (_, { rejectWithValue }) => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('User not found in localStorage');

            const user = JSON.parse(userData);
            const roleId = user?.roleId;

            if (!roleId) throw new Error('Role ID missing in user object');

            const response = await axiosInstance.get(`/rolePermissions/roles/${roleId}/permissions`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch role permissions');
            }

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch role permissions');
        }
    }
);

// Types
interface SidebarPermissionState {
    permissions: any;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: SidebarPermissionState = {
    permissions: null,
    loading: false,
    error: null,
};

// Slice
const sidebarPermissionSlice = createSlice({
    name: 'sidebarPermission',
    initialState,
    reducers: {
        resetSidebarPermission: state => {
            state.permissions = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchRolePermissionsSidebar.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolePermissionsSidebar.fulfilled, (state, action) => {
                state.loading = false;
                state.permissions = action.payload;
            })
            .addCase(fetchRolePermissionsSidebar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetSidebarPermission } = sidebarPermissionSlice.actions;
export default sidebarPermissionSlice.reducer;
