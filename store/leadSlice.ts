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
            category = "all-leads",
            fromDate = "",
            toDate = "",
            platformId = "",
            assignedTo = "",
        }: {
            page?: number;
            limit?: number;
            searchValue?: string;
            category?: string;
            fromDate?: string;
            toDate?: string;
            platformId?: string;
            assignedTo?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.get(
                `/leads/getAllLeads` +
                `?page=${page}` +
                `&limit=${limit}` +
                `&search=${searchValue}` +
                `&category=${category}` +
                `&fromDate=${fromDate}` +
                `&toDate=${toDate}` +
                `&platformId=${platformId}` +
                `&assignedTo=${assignedTo}`
            );
            return res.data.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch leads';
            return rejectWithValue({ message: errorMessage, data: err.response?.data });
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
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch lead';
            return rejectWithValue({ message: errorMessage, data: err.response?.data });
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
            const errorData = err.response?.data;
            console.log("Create Lead Error Data:", errorData);

            const errorMessage = errorData?.message || err.message || 'Failed to create lead';

            // Return structured error object
            return rejectWithValue({
                message: errorMessage,
                duplicate: errorData?.duplicate || false,
                success: errorData?.success || false,
                data: errorData
            });
        }
    }
);

// ✅ Update Lead
export const updateLead = createAsyncThunk(
    "leads/update",
    async (
        { id, payload }: { id: string | number; payload: any },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.put(`/leads/editLead/${id}`, payload);
            return res.data.data;
        } catch (err: any) {
            const errorData = err.response?.data;
            console.log("Update Lead Error Data:", errorData);

            const errorMessage = errorData?.message || err.message || 'Failed to update lead';

            return rejectWithValue({
                message: errorMessage,
                success: errorData?.success || false,
                data: errorData
            });
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
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete lead';
            return rejectWithValue({ message: errorMessage, data: err.response?.data });
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

            return res.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to upload leads';
            return rejectWithValue({
                message: errorMessage,
                data: err.response?.data,
                results: err.response?.data?.results
            });
        }
    }
);

export const deleteBulkLeads = createAsyncThunk(
    "leads/deleteBulk",
    async (leadIds: number[], { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete("/leads/deleteBulkLeads", {
                data: { ids: leadIds },
            });
            return leadIds;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete leads';
            return rejectWithValue({ message: errorMessage, data: err.response?.data });
        }
    }
);

export const transferSelectedLeads = createAsyncThunk(
    "leads/transfer",
    async (
        { leadIds, assignedTo }: { leadIds: number[]; assignedTo: number },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post("/leads/transfer-leads", {
                assignId: assignedTo,
                leadIds,
            });
            return {
                leadIds,
                assignedTo,
                newAssignedUserName: res.data.newAssignedUserName || "Unknown User"
            };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to transfer leads';
            return rejectWithValue({ message: errorMessage, data: err.response?.data });
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
    platformId: number;
    platformType?: string;
    plotId: number;
    plotNumber?: string;
    plotPrice?: number;
    leadStageId: number;
    leadStage?: string;
    leadStatusId: number;
    leadStatus?: string;
    assignedUserName?: string;
    interestStatus?: string;
    latestFollowUpDate?: string;
    createdAt?: string;
    updatedAt?: string;
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
                state.error = null;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
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
                        latestFollowUpDate: item.latestFollowUpDate,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    })) || [];
            })
            .addCase(fetchLeads.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch leads';
            })

            // ✅ Fetch By ID
            .addCase(fetchLeadById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeadById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
            })
            .addCase(fetchLeadById.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch lead';
            })

            // ✅ Create Lead
            .addCase(createLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLead.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload) {
                    state.list.unshift(action.payload); // Add to beginning
                    state.total += 1;
                }
            })
            .addCase(createLead.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create lead';
            })

            // ✅ Update Lead
            .addCase(updateLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLead.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.id) {
                    const index = state.list.findIndex(
                        (l) => l.id === action.payload.id
                    );
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                    // Update current if it's the same lead
                    if (state.current && state.current.id === action.payload.id) {
                        state.current = action.payload;
                    }
                }
            })
            .addCase(updateLead.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update lead';
            })

            // ✅ Delete Lead
            .addCase(deleteLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLead.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const deletedId = Number(action.payload);
                state.list = state.list.filter((l) => l.id !== deletedId);
                state.total = Math.max(0, state.total - 1);
                if (state.current && state.current.id === deletedId) {
                    state.current = null;
                }
            })
            .addCase(deleteLead.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete lead';
            })

            // ✅ Upload Leads
            .addCase(uploadLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Handle based on response structure
                const data = action.payload?.data;
                if (Array.isArray(data)) {
                    state.list = [...data, ...state.list];
                    state.total += data.length;
                }
            })
            .addCase(uploadLeads.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to upload leads';
            })

            // ✅ Delete Bulk Leads
            .addCase(deleteBulkLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBulkLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const deletedIds = action.payload;
                if (Array.isArray(deletedIds)) {
                    state.list = state.list.filter(
                        (lead) => !deletedIds.includes(lead.id)
                    );
                    state.total = Math.max(0, state.total - deletedIds.length);
                    if (state.current && deletedIds.includes(state.current.id)) {
                        state.current = null;
                    }
                }
            })
            .addCase(deleteBulkLeads.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete leads';
            })

            // ✅ Transfer Selected Leads
            .addCase(transferSelectedLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(transferSelectedLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const { leadIds, assignedTo, newAssignedUserName } = action.payload;

                state.list = state.list.map((lead) =>
                    leadIds.includes(lead.id)
                        ? {
                            ...lead,
                            assignedTo,
                            assignedUserName: newAssignedUserName,
                        }
                        : lead
                );

                if (state.current && leadIds.includes(state.current.id)) {
                    state.current = {
                        ...state.current,
                        assignedTo,
                        assignedUserName: newAssignedUserName,
                    };
                }
            })
            .addCase(transferSelectedLeads.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to transfer leads';
            });
    },
});

// ------------------ Exports ------------------

export const { clearCurrentLead, clearError } = leadSlice.actions;
export default leadSlice.reducer;