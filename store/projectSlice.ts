import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';

export interface ProjectStatus {
    id: number;
    projectStatusName: string;
    status: 'active' | 'inactive';
}

interface ProjectStatusData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    projects: ProjectStatus[];
}

interface State {
    list: ProjectStatusData | null;
    loading: boolean;
    error: string | null;
}

const initialState: State = {
    list: null,
    loading: false,
    error: null,
};

export const fetchProjectStatuses = createAsyncThunk<
    ProjectStatusData,
    { page?: number; limit?: number; searchValue?: string }
>(
    'projectStatus/fetchAll',
    async ({ page = 1, limit = 10, searchValue = '' }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(
                `/projectStatus/getAllProjectStatus?page=${page}&limit=${limit}&search=${searchValue}`
            );
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
        }
    }
);

export const addStatus = createAsyncThunk<ProjectStatus, { projectStatusName: string }>(
    'projectStatus/add',
    async (data, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post('/projectStatus/addProjectStatus', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add');
        }
    }
);

export const updateStatus = createAsyncThunk<ProjectStatus, { id: number; projectStatusName: string }>(
    'projectStatus/update',
    async ({ id, projectStatusName }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/projectStatus/updateProjectStatus/${id}`, {
                projectStatusName,
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update');
        }
    }
);

export const deleteStatus = createAsyncThunk<number, number>(
    'projectStatus/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/projectStatus/deleteProjectStatus/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete');
        }
    }
);

const projectStatusSlice = createSlice({
    name: 'projectStatus',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectStatuses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectStatuses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchProjectStatuses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(addStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(addStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(updateStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(deleteStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default projectStatusSlice.reducer;
