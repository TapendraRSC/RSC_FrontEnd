import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

interface ExportedUserState {
    data: any;
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
    async ({ page, limit, searchValue }: { page: number; limit: number; searchValue: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`users/exportUser?page=${page}&limit=${limit}&search=${searchValue}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to export users');
        }
    }
);

// Thunk to get a single user by ID
export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (id: number, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`users/getUser/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

// Thunk to add a user
export const addUser = createAsyncThunk(
    'users/addUser',
    async (userData: any, thunkAPI) => {
        try {
            const response = await axiosInstance.post('users/addUser', userData);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add user');
        }
    }
);

// Thunk to update a user
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }: { id: number; userData: any }, thunkAPI) => {
        try {
            const response = await axiosInstance.put(`users/updateUser/${id}`, userData);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

// Thunk to delete a user
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: number, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(`users/deleteUser/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete user');
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
            })
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(addUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
