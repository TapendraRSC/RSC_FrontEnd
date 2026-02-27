// src/store/slices/plotSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

// ✅ Updated Plot interface to match actual API response fields
export interface Plot {
    id: number;
    plotNumber: string;
    plotSize: string;
    price: string;
    onlinePrice: string;
    creditPoint: number;
    city: string | null;
    facing: string | null;
    status: string;
    projectId: number;
    projectTitle: string;
}

interface PlotState {
    plots: Plot[];
    total: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    currentPlot: Plot | null;
    uploadLoading: boolean;
}

const initialState: PlotState = {
    plots: [],
    total: 0,
    totalPages: 0,
    loading: false,
    error: null,
    currentPlot: null,
    uploadLoading: false,
};

// ✅ Fetch all plots — fixed to correctly map API response
// API returns: { success: true, pagination: { page, limit, total, totalPages }, data: [...] }
export const fetchPlots = createAsyncThunk(
    "plots/fetchPlots",
    async (
        params: {
            projectId?: number | string;
            page?: number;
            limit?: number;
            search?: string;
            sortBy?: string;
            sortOrder?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const {
                projectId,
                page = 1,
                limit = 10,
                search,
                sortBy,
                sortOrder,
            } = params || {};

            const res = await axiosInstance.get(`/plots/getAllPlots`, {
                params: {
                    projectId,
                    page,
                    limit,
                    search: search || undefined,
                    sortBy,
                    sortOrder,
                },
            });

            // ✅ Normalize response so slice gets correct shape
            // res.data = { success: true, pagination: { total, totalPages, ... }, data: [...] }
            return {
                plots: res.data?.data || [],
                total: res.data?.pagination?.total || 0,
                totalPages: res.data?.pagination?.totalPages || 0,
            };
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

// Bulk upload plots
export const uploadPlotData = createAsyncThunk(
    "plots/uploadData",
    async (
        { projectId, file }: { projectId: string | number; file: File },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axiosInstance.post(
                `/plots/upload-data/${projectId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
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

            if (!res.data || !res.data.data) {
                return rejectWithValue("Plot not found");
            }

            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Plot not found"
            );
        }
    }
);

// Update plot
export const updatePlot = createAsyncThunk(
    "plots/updatePlot",
    async (
        { id, data }: { id: number; data: Omit<Plot, "id"> },
        { rejectWithValue }
    ) => {
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
        clearCurrentPlotBeforeFetch: (state) => {
            state.currentPlot = null;
            state.error = null;
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
                // ✅ Now correctly mapped: { plots: [...], total: 39, totalPages: 4 }
                state.plots = action.payload.plots || [];
                state.total = action.payload.total || 0;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchPlots.rejected, (state, action) => {
                state.loading = false;
                state.plots = [];
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

            // uploadPlotData
            .addCase(uploadPlotData.pending, (state) => {
                state.uploadLoading = true;
                state.error = null;
            })
            .addCase(uploadPlotData.fulfilled, (state) => {
                state.uploadLoading = false;
            })
            .addCase(uploadPlotData.rejected, (state, action) => {
                state.uploadLoading = false;
                state.error = action.payload as string;
            })

            // getPlotById
            .addCase(getPlotById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentPlot = null;
            })
            .addCase(
                getPlotById.fulfilled,
                (state, action: PayloadAction<Plot>) => {
                    state.loading = false;
                    state.currentPlot = action.payload;
                    state.error = null;
                }
            )
            .addCase(getPlotById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.currentPlot = null;
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
                state.plots = state.plots.filter(
                    (plot) => plot.id !== action.payload
                );
                if (state.currentPlot?.id === action.payload) {
                    state.currentPlot = null;
                }
            })
            .addCase(deletePlot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentPlot, clearCurrentPlotBeforeFetch } =
    plotSlice.actions;
export default plotSlice.reducer;