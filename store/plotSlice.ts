// src/store/slices/plotSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

export interface Plot {
    id: number;
    plotNumber: number;
    sqYard: string;
    sqFeet?: string;
    city: string;
    remarks: string;
    facing?: string;
    status?: string;
    projectId: number;
    projectTitle?: string;
    landId?: number | null;
    landType?: string | null;
}

interface PlotState {
    plots: Plot[];
    total: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    currentPlot: Plot | null;
}

const initialState: PlotState = {
    plots: [],
    total: 0,
    totalPages: 0,
    loading: false,
    error: null,
    currentPlot: null,
};

// Fetch all plots
export const fetchPlots = createAsyncThunk(
    "plots/fetchPlots",
    async (
        params: { projectId?: number | string; page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string },
        { rejectWithValue }
    ) => {
        try {
            const {
                projectId,
                page = 1,
                limit = 10,
                search,
                sortBy,
                sortOrder
            } = params || {};

            const res = await axiosInstance.get(`/plots/getAllPlots`, {
                params: {
                    projectId,
                    page,
                    limit,
                    search: search || undefined,
                    sortBy,
                    sortOrder
                }
            });
            return res.data?.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Add a plot
export const addPlot = createAsyncThunk(
    "plots/addPlot",
    async (plotData: Omit<Plot, "id">, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/plots/addPlot", plotData);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Get plot by ID
export const getPlotById = createAsyncThunk(
    "plots/getPlotById",
    async (id: number, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/plots/getPlot/${id}`);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update plot
export const updatePlot = createAsyncThunk(
    "plots/updatePlot",
    async ({ id, data }: { id: number; data: Omit<Plot, "id"> }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/plots/updatePlot/${id}`, data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete plot
export const deletePlot = createAsyncThunk(
    "plots/deletePlot",
    async (id: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/plots/deletePlot/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const plotSlice = createSlice({
    name: "plots",
    initialState,
    reducers: {
        clearCurrentPlot: (state) => {
            state.currentPlot = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchPlots
            .addCase(fetchPlots.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlots.fulfilled, (state, action) => {
                state.loading = false;
                state.plots = action.payload.plots || []; // <-- yaha sirf array

                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchPlots.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // addPlot
            .addCase(addPlot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPlot.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addPlot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // getPlotById
            .addCase(getPlotById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPlotById.fulfilled, (state, action: PayloadAction<Plot>) => {
                state.loading = false;
                state.currentPlot = action.payload;
            })
            .addCase(getPlotById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // updatePlot
            .addCase(updatePlot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePlot.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePlot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // deletePlot
            .addCase(deletePlot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePlot.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.plots = state.plots.filter((plot) => plot.id !== action.payload);
            })
            .addCase(deletePlot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentPlot } = plotSlice.actions;
export default plotSlice.reducer;
