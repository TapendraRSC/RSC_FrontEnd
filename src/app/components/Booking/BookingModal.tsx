'use client';
import React, { useEffect, useMemo, useState } from "react";
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

  // Fetch leads for dropdown
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
      if (error.response?.status !== 404) {
        setApiError(error.response?.data?.message || "Failed to fetch leads");
      }
    } finally {
      setLeadsLoading(false);
    }
  };

  // Fetch lead details when lead is selected
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

  // Fetch active projects
  const fetchActiveProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axiosInstance.get('/bookings/getActiveProject');
      const data = response.data?.data || response.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Lead options for dropdown
  const leadOptions: DropdownOption[] = useMemo(() => {
    return leads.map((lead) => ({
      label: lead.name
        ? `${lead.name} (ID: ${lead.id})`
        : lead.phone
          ? `${lead.phone} (ID: ${lead.id})`
          : `Lead ID: ${lead.id}`,
      value: lead.id,
    }));
  }, [leads]);

  // Project options for dropdown
  const projectOptions: DropdownOption[] = useMemo(() => {
    return projects.map((project) => ({
      label: project.title || project.name || `Project ${project.id}`,
      value: project.id,
    }));
  }, [projects]);

  // Plot options for dropdown - ONLY AVAILABLE PLOTS
  // Plot options - SABHI plots dropdown mein (no filter)
  const plotOptions: DropdownOption[] = useMemo(() => {
    if (!plots || !Array.isArray(plots) || plots.length === 0) {
      return [];
    }
    return plots.map((p: any) => ({
      label: `Plot ${p.plotNumber} - ${p.sqYard} Sq.Yd (${p.status || 'Available'})`,
      value: p.id
    }));
  }, [plots]);

  // AVAILABLE plots count ke liye separate calculation
  const availablePlotsCount = useMemo(() => {
    if (!plots || !Array.isArray(plots)) return 0;
    return plots.filter((p: any) =>
      p.status?.toLowerCase() === 'available' ||
      !p.status ||
      p.status === 'Available'
    ).length;
  }, [plots]);

  // Status options
  const statusOptions: DropdownOption[] = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" },
  ];

  // Fetch initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      fetchLeadsForSelect();
      fetchActiveProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      initialData?.projectTitle &&
      projects.length > 0
    ) {
      const project = projects.find(
        (p) =>
          p.title === initialData.projectTitle ||
          p.name === initialData.projectTitle
      );

      if (project) {
        setValue("projectId", project.id);
      }
    }
  }, [isOpen, initialData, projects, setValue]);


  useEffect(() => {
    if (
      initialData?.plotNumber &&
      plots.length > 0
    ) {
      const plot = plots.find(
        (p: any) =>
          String(p.plotNumber) === String(initialData.plotNumber)
      );

      if (plot) {
        setValue("plotId", plot.id);
      }
    }
  }, [plots, initialData, setValue]);


  // Fetch lead details when lead is selected
  useEffect(() => {
    if (selectedLeadId) {
      fetchLeadBasicDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  // Fetch plots when project is selected
  const prevProjectRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchPlots({
        projectId: selectedProjectId,
        page: 1,
        limit: 500
      }));
    }
  }, [selectedProjectId, dispatch]);

  // Reset plotId when project changes
  useEffect(() => {
    if (prevProjectRef.current !== null && prevProjectRef.current !== selectedProjectId) {
      setValue("plotId", null);
    }
    prevProjectRef.current = selectedProjectId;
  }, [selectedProjectId, setValue]);

  // Handle initial data for edit mode
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
        dispatch(fetchPlots({
          projectId: initialData.projectId,
          page: 1,
          limit: 500
        }));
      }
    } else if (isOpen) {
      reset({
        leadId: null,
        name: "",
        phone: "",
        projectId: null,
        plotId: null,
        bookingAmount: "",
        totalPlotAmount: "",
        status: "active",
      });
    }
  }, [isOpen, initialData, reset, dispatch]);

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  // Submit handler - calls API and notifies parent
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
      console.error("Error submitting booking:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save booking";
      setApiError(errorMessage);
      // Don't call onSave on error - modal stays open
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {initialData ? "Edit Booking" : "Add New Booking"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 dark:text-red-300 text-sm">{apiError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. Lead ID Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lead <span className="text-red-500">*</span>
              </label>
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
              {errors.leadId && (
                <p className="text-red-500 text-xs mt-1">{errors.leadId.message}</p>
              )}
            </div>

            {/* 2. Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "Name can only contain letters and spaces"
                  }
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                placeholder="Enter name"
                disabled={leadDetailsLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* 3. Phone Input */}
            {/* <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter valid 10-digit Indian mobile number"
                  }
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                placeholder="9876543210"
                maxLength={10}
                disabled={leadDetailsLoading}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div> */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^(\+91[\s-]?)?[6-9]\d{9}$/,
                    message: "Enter valid Indian mobile number",
                  },
                  setValueAs: (value) =>
                    value.replace(/^\+91[\s-]?/, "").trim(),
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                placeholder="9876543210"
                maxLength={13}
                disabled={leadDetailsLoading}
              />
            </div>


            {/* 4. Status (Disabled) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={statusOptions}
                    selected={statusOptions.find((opt) => opt.value === field.value) || statusOptions[0]}
                    onChange={(val: any) => field.onChange(val?.value || "active")}
                    placeholder="Select Status"
                    disabled={true}
                  />
                )}
              />
            </div>

            {/* 5. Project Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project <span className="text-red-500">*</span>
              </label>
              <Controller
                name="projectId"
                control={control}
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={projectOptions}
                    selected={projectOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(val: any) => field.onChange(val?.value || null)}
                    placeholder={projectsLoading ? "Loading Projects..." : "Select Project"}
                    allowClear
                    disabled={projectsLoading}
                  />
                )}
              />
              {errors.projectId && (
                <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>
              )}
            </div>

            {/* 6. Plot Dropdown */}
            {/* 6. Plot Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plot <span className="text-red-500">*</span>
              </label>
              <Controller
                name="plotId"
                control={control}
                rules={{ required: "Plot is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={plotOptions}  // SABHI plots
                    selected={plotOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(val: any) => field.onChange(val?.value || null)}
                    placeholder={
                      !selectedProjectId
                        ? "Select Project First"
                        : plotsLoading
                          ? "Loading Plots..."
                          : plotOptions.length === 0
                            ? "No Plots Available"
                            : "Select Plot"
                    }
                    allowClear
                    disabled={!selectedProjectId || plotsLoading}

                  />
                )}
              />
              {errors.plotId && (
                <p className="text-red-500 text-xs mt-1">{errors.plotId.message}</p>
              )}
              {/* Helper Messages */}
              {!selectedProjectId && (
                <p className="text-yellow-600 text-xs">Select a project first</p>
              )}
              {selectedProjectId && plotsLoading && (
                <p className="text-blue-600 text-xs">Loading plots...</p>
              )}
              {selectedProjectId && !plotsLoading && availablePlotsCount > 0 && (
                <p className="text-green-600 text-xs">{availablePlotsCount} available plots</p>
              )}
              {selectedProjectId && !plotsLoading && availablePlotsCount === 0 && (
                <p className="text-orange-600 text-xs">No available plots</p>
              )}
            </div>



            {/* 7. Booking Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Booking Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("bookingAmount", {
                  required: "Booking amount is required",
                  min: { value: 1, message: "Amount must be greater than 0" },
                  max: { value: 100000000, message: "Amount cannot exceed 10 Crore" },
                  validate: (value) =>
                    !isNaN(Number(value)) || "Please enter a valid number"
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500000"
              />
              {errors.bookingAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.bookingAmount.message}</p>
              )}
            </div>

            {/* 8. Total Plot Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Plot Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("totalPlotAmount", {
                  required: "Total plot amount is required",
                  min: { value: 1, message: "Amount must be greater than 0" },
                  max: { value: 1000000000, message: "Amount cannot exceed 100 Crore" },
                  validate: {
                    isNumber: (value) => !isNaN(Number(value)) || "Please enter a valid number",
                    greaterThanBooking: (value, formValues) => {
                      const booking = Number(formValues.bookingAmount);
                      const total = Number(value);
                      return total >= booking || "Total amount must be >= booking amount";
                    }
                  }
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2500000"
              />
              {errors.totalPlotAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.totalPlotAmount.message}</p>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                         text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isLoading || submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         text-sm font-medium shadow-sm 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || submitLoading}
            >
              {submitLoading ? "Saving..." : initialData ? "Update Booking" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComprehensiveLeadModal;