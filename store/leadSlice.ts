import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";

// ------------------ Async Thunks ------------------

// ✅ Fetch All Leads
export const fetchLeads = createAsyncThunk(
    "leads/fetchAll",
    async (
        {
            page = 1,
            limit = 10,
            searchValue = "",
        }: { page?: number; limit?: number; searchValue?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.get(
                `/leads/getAllLeads?page=${page}&limit=${limit}&search=${searchValue}`
            );
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Fetch Lead By ID
export const fetchLeadById = createAsyncThunk(
    "leads/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/leads/getLead/${id}`);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Create Lead
export const createLead = createAsyncThunk(
    "leads/create",
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/leads/create-lead-CRM", payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Update Lead
export const updateLead = createAsyncThunk(
    "leads/update",
    async (
        { id, payload }: { id: string; payload: any },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.put(`/leads/editLead/${id}`, payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Delete Lead
export const deleteLead = createAsyncThunk(
    "leads/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/leads/deleteLead/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ✅ Upload Leads (Excel File)
export const uploadLeads = createAsyncThunk(
    "leads/upload",
    async (file: File, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("excelFile", file);

            const res = await axiosInstance.post("/leads/upload-leads", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ------------------ Types ------------------

export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    assignedTo: number;

    // Platform info
    platformId: number;
    platformType?: string;

    // Plot info
    plotId: number;
    plotNumber?: string;
    plotPrice?: number;

    // Lead stage
    leadStageId: number;
    leadStage?: string;

    // Lead status
    leadStatusId: number;
    leadStatus?: string;
    assignedUserName?: string;
    interestStatus?: string;
}

interface LeadState {
    list: Lead[];
    current: Lead | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalPages: number;
    total: number;
}

const initialState: LeadState = {
    list: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
};

// ------------------ Slice ------------------

const leadSlice = createSlice({
    name: "leads",
    initialState,
    reducers: {
        clearCurrentLead: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ✅ Fetch Leads
            .addCase(fetchLeads.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
                state.total = action.payload.total;

                state.list =
                    action.payload.leads?.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        email: item.email,
                        phone: item.phone,
                        city: item.city,
                        state: item.state,
                        assignedTo: item.assignedTo,
                        platformId: item.platformId,
                        platformType: item.platformType,
                        plotId: item.plotId,
                        plotNumber: item.plotNumber,
                        plotPrice: item.plotPrice,
                        plotProjectId: item.plotProjectId,
                        plotProjectTitle: item.plotProjectTitle,
                        leadStageId: item.leadStageId,
                        leadStage: item.leadStage,
                        leadStatusId: item.leadStatusId,
                        leadStatus: item.leadStatus,
                        assignedUserName: item.assignedUserName,
                        interestStatus: item.interestStatus,
                    })) || [];

            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ✅ Fetch By ID
            .addCase(fetchLeadById.fulfilled, (state, action) => {
                state.current = action.payload;
            })

            // ✅ Create Lead
            .addCase(createLead.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            // ✅ Update Lead
            .addCase(updateLead.fulfilled, (state, action) => {
                if (action.payload && action.payload.id) {
                    const index = state.list.findIndex(
                        (l) => l.id === action.payload.id
                    );
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                }
            })

            // ✅ Delete Lead
            .addCase(deleteLead.fulfilled, (state, action) => {
                state.list = state.list.filter((l: any) => l.id !== action.payload);
            })

            // ✅ Upload Leads
            .addCase(uploadLeads.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadLeads.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    // agar API multiple leads return kare
                    state.list = [...state.list, ...action.payload];
                }
            })
            .addCase(uploadLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// ------------------ Exports ------------------

export const { clearCurrentLead, clearError } = leadSlice.actions;
export default leadSlice.reducer;
