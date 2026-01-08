'use client';
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CommonDropdown from "../Common/CommonDropdown";
import SearchableLeadDropdown from "../Common/SearchableLeadDropdown";
import axiosInstance from "@/libs/axios";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchPlots } from "../../../../store/plotSlice";

interface DropdownOption {
  label: string;
  value: string | number;
}

interface ComprehensiveLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

interface LeadFormValues {
  leadId: number | null;
  name: string;
  phone: string;
  projectId: number | null;
  plotId: number | null;
  bookingAmount: number | string;
  totalPlotAmount: number | string;
  status: string;
}

interface Lead {
  id: number;
  name?: string;
  phone?: string;
}

interface Project {
  id: number;
  title: string;
  name?: string;
}

const ComprehensiveLeadModal: React.FC<ComprehensiveLeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { plots, loading: plotsLoading } = useSelector((state: RootState) => state.plotSlice);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [leadsLoading, setLeadsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
    watch,
  }: UseFormReturn<LeadFormValues> = useForm<LeadFormValues>({
    defaultValues: {
      leadId: null,
      name: "",
      phone: "",
      projectId: null,
      plotId: null,
      bookingAmount: "",
      totalPlotAmount: "",
      status: "active",
    },
  });

  const selectedLeadId = watch("leadId");
  const selectedProjectId = watch("projectId");
  const prevProjectRef = useRef<number | null>(null);

  // --- API LOGIC ---

  const fetchLeadsForSelect = async () => {
    setLeadsLoading(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get('/bookings/select-lead');
      const data = response.data?.data || response.data || [];
      setLeads(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchLeadBasicDetails = async (leadId: number) => {
    setLeadDetailsLoading(true);
    try {
      const response = await axiosInstance.get(`/bookings/leads/${leadId}/basic`);
      const leadData = response.data?.data || response.data;
      if (leadData) {
        setValue("name", leadData.name || "");
        setValue("phone", leadData.phone || "");
      }
    } catch (error: any) {
      console.error("Error fetching lead details:", error);
    } finally {
      setLeadDetailsLoading(false);
    }
  };

  const fetchActiveProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      // Direct call as per your requirement
      const response = await axiosInstance.get('/projects/getAllProjects?page=1&limit=100');
      const projectData = response.data?.data?.projects || response.data?.projects || [];
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setApiError("Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      fetchLeadsForSelect();
      fetchActiveProjects();
    }
  }, [isOpen, fetchActiveProjects]);

  useEffect(() => {
    if (selectedLeadId) {
      fetchLeadBasicDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  // Project change handler
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchPlots({
        projectId: selectedProjectId,
        page: 1,
        limit: 500
      }));
    }

    // Reset plotId when project changes
    if (prevProjectRef.current !== null && prevProjectRef.current !== selectedProjectId) {
      setValue("plotId", null);
    }
    prevProjectRef.current = selectedProjectId;
  }, [selectedProjectId, dispatch, setValue]);

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        leadId: initialData.leadId || null,
        name: initialData.name || "",
        phone: initialData.phone || "",
        projectId: initialData.projectId || null,
        plotId: initialData.plotId || null,
        bookingAmount: initialData.bookingAmount || "",
        totalPlotAmount: initialData.totalPlotAmount || "",
        status: initialData.status || "active",
      });
      if (initialData.projectId) {
        dispatch(fetchPlots({ projectId: initialData.projectId, page: 1, limit: 500 }));
      }
    }
  }, [isOpen, initialData, reset, dispatch]);

  // --- OPTIONS ---

  const leadOptions: DropdownOption[] = useMemo(() => {
    return leads.map((lead) => ({
      label: lead.name ? `${lead.name} (ID: ${lead.id})` : `Lead ID: ${lead.id}`,
      value: lead.id,
    }));
  }, [leads]);

  const projectOptions: DropdownOption[] = useMemo(() => {
    return projects.map((project) => ({
      label: project.title || project.name || `Project ${project.id}`,
      value: project.id,
    }));
  }, [projects]);

  const plotOptions: DropdownOption[] = useMemo(() => {
    if (!plots || !Array.isArray(plots)) return [];
    return plots.map((p: any) => ({
      label: `Plot ${p.plotNumber} - ${p.sqYard} Sq.Yd (${p.status || 'Available'})`,
      value: p.id
    }));
  }, [plots]);

  const statusOptions: DropdownOption[] = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" },
  ];

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const onSubmit = async (data: LeadFormValues) => {
    const payload = {
      leadId: Number(data.leadId),
      projectId: Number(data.projectId),
      plotId: Number(data.plotId),
      bookingAmount: Number(data.bookingAmount),
      totalPlotAmount: Number(data.totalPlotAmount),
      name: data.name.trim(),
      phone: data.phone.trim(),
      status: data.status,
    };

    setSubmitLoading(true);
    setApiError(null);

    try {
      let response;
      if (initialData) {
        response = await axiosInstance.put(`/bookings/updateBooking/${initialData.id}`, payload);
      } else {
        response = await axiosInstance.post('/bookings/addBooking', payload);
      }
      onSave(response.data);
      handleClose();
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to save booking");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {initialData ? "Edit Booking" : "Add New Booking"}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-light">×</button>
        </div>

        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span className="text-red-700 dark:text-red-300 text-sm">{apiError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lead <span className="text-red-500">*</span></label>
              <Controller
                name="leadId"
                control={control}
                rules={{ required: "Lead is required" }}
                render={({ field }) => (
                  <SearchableLeadDropdown
                    options={leadOptions}
                    selected={leadOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(val) => field.onChange(val?.value || null)}
                    placeholder={leadsLoading ? "Loading Leads..." : "Select Lead"}
                    disabled={leadsLoading}
                  />
                )}
              />
              {errors.leadId && <p className="text-red-500 text-xs mt-1">{errors.leadId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
              <input type="text" {...register("name", { required: "Name is required" })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700" placeholder="Enter name" disabled={leadDetailsLoading} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
              <input type="tel" {...register("phone", { required: "Phone is required" })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="9876543210" disabled={leadDetailsLoading} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CommonDropdown options={statusOptions} selected={statusOptions.find((opt) => opt.value === field.value) || statusOptions[0]} onChange={(val: any) => field.onChange(val?.value || "active")} placeholder="Select Status" disabled={true} />
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project <span className="text-red-500">*</span></label>
              <Controller
                name="projectId"
                control={control}
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <CommonDropdown options={projectOptions} selected={projectOptions.find((opt) => opt.value === field.value) || null} onChange={(val: any) => field.onChange(val?.value || null)} placeholder={projectsLoading ? "Loading..." : "Select Project"} disabled={projectsLoading} />
                )}
              />
              {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot <span className="text-red-500">*</span></label>
              <Controller
                name="plotId"
                control={control}
                rules={{ required: "Plot is required" }}
                render={({ field }) => (
                  <CommonDropdown options={plotOptions} selected={plotOptions.find((opt) => opt.value === field.value) || null} onChange={(val: any) => field.onChange(val?.value || null)} placeholder={!selectedProjectId ? "Select Project First" : plotsLoading ? "Loading..." : "Select Plot"} disabled={!selectedProjectId || plotsLoading} />
                )}
              />
              {errors.plotId && <p className="text-red-500 text-xs mt-1">{errors.plotId.message}</p>}

              {!selectedProjectId && (
                <p className="text-yellow-600 text-xs">Select a project first</p>
              )}
              {selectedProjectId && plotsLoading && (
                <p className="text-blue-600 text-xs">Loading plots...</p>
              )}
              {selectedProjectId && !plotsLoading && plotOptions.length > 0 && (
                <p className="text-green-600 text-xs">{plotOptions.length} plots available</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Booking Amount <span className="text-red-500">*</span></label>
              <input type="number" {...register("bookingAmount", { required: "Required", min: 1 })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" placeholder="50000" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Plot Amount <span className="text-red-500">*</span></label>
              <input type="number" {...register("totalPlotAmount", { required: "Required", validate: (val, form) => Number(val) >= Number(form.bookingAmount) || "Should be >= Booking" })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" placeholder="2500000" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" disabled={submitLoading}>Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50" disabled={submitLoading}>
              {submitLoading ? "Saving..." : initialData ? "Update Booking" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComprehensiveLeadModal;