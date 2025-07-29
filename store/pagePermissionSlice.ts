// pagePermissionSlice.ts
import axiosInstance from '@/libs/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the PagePermission interface
interface PagePermission {
    id: number;
    pageName: string;
}

// Define the PagePermissionData interface
interface PagePermissionData {
    page: number;
    limit: number;
    permissions: PagePermission[];
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

// Async thunk to add a page permission
export const addPage = createAsyncThunk<PagePermission, { pageName: string }>(
    'pages/addPage',
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/pages/addPage', pageData);
            if (response.status !== 201) {
                throw new Error('Failed to add page');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add page');
        }
    }
);

// Async thunk to update a page permission
export const updatePage = createAsyncThunk<PagePermission, { id: number; pageName: string }>(
    'pages/updatePage',
    async ({ id, pageName }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/pages/updatePage/${id}`, { pageName });
            if (response.status !== 200) {
                throw new Error('Failed to update page');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update page');
        }
    }
);

// Async thunk to delete a page permission
export const deletePage = createAsyncThunk<number, number>(
    'pages/deletePage',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/pages/deletePage/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to delete page');
            }
            return id;
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
            .addCase(addPage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPage.fulfilled, (state, action: PayloadAction<PagePermission>) => {
                state.loading = false;
                if (state.list) {
                    state.list.data.permissions.push(action.payload);
                }
            })
            .addCase(addPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to add page';
            })
            .addCase(updatePage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePage.fulfilled, (state, action: PayloadAction<PagePermission>) => {
                state.loading = false;
                if (state.list) {
                    const index = state.list.data.permissions.findIndex(p => p.id === action.payload.id);
                    if (index !== -1) {
                        state.list.data.permissions[index] = action.payload;
                    }
                }
            })
            .addCase(updatePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update page';
            })
            .addCase(deletePage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePage.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                if (state.list) {
                    state.list.data.permissions = state.list.data.permissions.filter(p => p.id !== action.payload);
                }
            })
            .addCase(deletePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete page';
            });
    },
});

export default pagePermissionSlice.reducer;
