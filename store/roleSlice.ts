import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

interface Role {
    id: number;
    name: string;
    description?: string;
    roles?: any; // Assuming roles is an array of Role objects
}

interface RoleState {
    data: Role[];
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    roles: any[];
    searchValue: string;
}

const initialState: RoleState = {
    data: [],
    loading: false,
    error: null,
    successMessage: null,
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
    roles: [],
    searchValue: '',
};

// Async thunk to fetch roles
export const getRoles = createAsyncThunk(
    'roles/getRoles',
    async (
        { page = 1, limit = 10, searchValue }: { page?: number; limit?: number; searchValue?: string },
        thunkAPI
    ) => {
        try {
            const response = await axiosInstance.get(`roles/getRoles?page=${page}&limit=${limit}&search=${searchValue}`);
            return {
                ...response.data.data,
                page,
                limit,
                searchValue
            };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
);

// Async thunk to add a new role
export const addRole = createAsyncThunk(
    'roles/addRole',
    async ({ roleType }: { roleType: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('roles/addRoles', { roleType });
            return response.data; // { success, message, data: { role } }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add role');
        }
    }
);

// Async thunk to update a role
export const updateRole = createAsyncThunk(
    'roles/updateRole',
    async ({ id, roleType }: { id: number; roleType: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.put(`roles/updateRole/${id}`, { roleType });
            return response.data; // { success, message, data: { role } }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update role');
        }
    }
);

// Async thunk to delete a role
export const deleteRole = createAsyncThunk(
    'roles/deleteRole',
    async (id: number, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(`roles/deleteRole/${id}`);
            return response.data; // { success, message }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete role');
        }
    }
);

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearRoleMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle getRoles
            .addCase(getRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoles.fulfilled, (state, action) => {
                state.data = action.payload.roles || []; // Ensure it's an array
                state.roles = action.payload.roles;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.loading = false;
            })
            .addCase(getRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle addRole
            .addCase(addRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(addRole.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = 'Role added successfully';
                // Adjust this line based on the actual response structure
                const newRole = action.payload.data; // Assuming the role data is directly under `data`
                state.data = [...state.data, newRole];
            })
            .addCase(addRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle updateRole
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = 'Role updated successfully';
                console.log('Update Role Payload:', action.payload); // Log the payload
                if (action.payload.data && action.payload.data.role) {
                    const updatedRole = action.payload.data.role;
                    const index = state.data.findIndex(role => role.id === updatedRole.id);
                    if (index !== -1) {
                        state.data[index] = updatedRole;
                    }
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle deleteRole
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = 'Role deleted successfully';
                state.data = state.data.filter(role => role.id !== action.meta.arg);
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearRoleMessages } = roleSlice.actions;

export default roleSlice.reducer;
