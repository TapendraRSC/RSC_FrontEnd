import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/libs/axios";
import { toast } from "react-toastify";

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
            const errorData = err.response?.data;
            console.log("Error Data:", errorData); // Debugging line
            const errorMessage = errorData?.message || err.message;

            toast.error(errorMessage);

            return rejectWithValue({
                message: errorMessage,
                duplicate: errorData?.duplicate,
                success: errorData?.success
            });
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

export const deleteBulkLeads = createAsyncThunk(
    "leads/deleteBulk",
    async (leadIds: number[], { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete("/leads/deleteBulkLeads", {
                data: { ids: leadIds }, // ✅ Backend expects "ids" key
            });
            return leadIds; // Return the IDs that were sent for deletion
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
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
                assignId: assignedTo, // ✅ Backend expects "assignId"
                leadIds, // ✅ Backend expects "leadIds"
            });
            return {
                leadIds,
                assignedTo,
                newAssignedUserName: res.data.newAssignedUserName || "Unknown User"
            };
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
                        latestFollowUpDate: item.latestFollowUpDate,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
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
            // ✅ Create Lead - Updated cases
            .addCase(createLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLead.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
            })
            .addCase(createLead.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload;
            })
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
            .addCase(deleteLead.fulfilled, (state, action) => {
                state.list = state.list.filter((l: any) => l.id !== action.payload);
            })

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
            })
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
                    // Clear current if it was deleted
                    if (state.current && deletedIds.includes(state.current.id)) {
                        state.current = null;
                    }
                }
            })
            .addCase(deleteBulkLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
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

                // Update current if it was transferred
                if (state.current && leadIds.includes(state.current.id)) {
                    state.current = {
                        ...state.current,
                        assignedTo,
                        assignedUserName: newAssignedUserName,
                    };
                }
            })
            .addCase(transferSelectedLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
});

// ------------------ Exports ------------------

export const { clearCurrentLead, clearError } = leadSlice.actions;
export default leadSlice.reducer;
