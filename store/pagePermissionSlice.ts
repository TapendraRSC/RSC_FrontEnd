// pagePermissionSlice.ts
import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the PagePermission interface
interface PagePermission {
    id: number;
    pageName: string;
}

// Define the API Response interface
interface ApiResponse {
    message: string;
    success: boolean;
    data?: PagePermission;
    id?: number;
}

// Define the PagePermissionData interface - FIXED to match actual API response
interface PagePermissionData {
    page: number;
    limit: number;
    data: PagePermission[];  // Changed from 'permissions' to 'data'
    total: number;
    totalPages: number;
}

// Define the PagePermissionState interface
interface PagePermissionState {
    list: {
        data: PagePermissionData;
    } | null;
    loading: boolean;
    error: string | any;
}

// Initial state for the slice
const initialState: PagePermissionState = {
    list: null,
    loading: false,
    error: null,
};

// Async thunk to fetch page permissions
export const fetchPages = createAsyncThunk<PagePermissionData, { page?: number; limit?: number; searchValue?: string }>(
    'pages/fetchPages',
    async ({ page = 1, limit = 10, searchValue = '' }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/pages/getAllPages?page=${page}&limit=${limit}&search=${searchValue}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch pages');
            }
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pages');
        }
    }
);

// Async thunk to add a page permission - FIXED return type
export const addPage = createAsyncThunk<ApiResponse, { pageName: string }>(
    'pages/addPage',
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/pages/addPage', pageData);
            if (response.status !== 201 && response.status !== 200) {
                throw new Error('Failed to add page');
            }
            return response.data; // Returns { message, success, data }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add page');
        }
    }
);

// Async thunk to update a page permission - FIXED return type
export const updatePage = createAsyncThunk<ApiResponse, { id: number; pageName: string }>(
    'pages/updatePage',
    async ({ id, pageName }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/pages/updatePage/${id}`, { pageName });
            if (response.status !== 200) {
                throw new Error('Failed to update page');
            }
            return response.data; // Returns { message, success }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update page');
        }
    }
);

// Async thunk to delete a page permission - FIXED return type
export const deletePage = createAsyncThunk<ApiResponse & { deletedId: number }, number>(
    'pages/deletePage',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/pages/deletePage/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to delete page');
            }
            return { ...response.data, deletedId: id }; // Include the deleted ID
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete page');
        }
    }
);

// Create the slice
const pagePermissionSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Pages
            .addCase(fetchPages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPages.fulfilled, (state, action: PayloadAction<PagePermissionData>) => {
                state.loading = false;
                state.list = { data: action.payload };
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Something went wrong';
            })

            // Add Page
            .addCase(addPage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPage.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
                state.loading = false;
                // Don't manually update state - fetchPages will refresh the list
                // This prevents errors when data structure doesn't match
            })
            .addCase(addPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to add page';
            })

            // Update Page
            .addCase(updatePage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePage.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
                state.loading = false;
                // Don't manually update state - fetchPages will refresh the list
                // This prevents errors when data structure doesn't match
            })
            .addCase(updatePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update page';
            })

            // Delete Page
            .addCase(deletePage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePage.fulfilled, (state, action: PayloadAction<ApiResponse & { deletedId: number }>) => {
                state.loading = false;
                // Optionally remove from local state for instant UI update
                if (state.list?.data?.data) {
                    state.list.data.data = state.list.data.data.filter(
                        (p: PagePermission) => p.id !== action.payload.deletedId
                    );
                }
            })
            .addCase(deletePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete page';
            });
    },
});

export default pagePermissionSlice.reducer;