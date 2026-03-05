// 'use client';
// import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
// import { useForm, Controller, UseFormReturn } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import CommonDropdown from "../Common/CommonDropdown";
// import SearchableLeadDropdown from "../Common/SearchableLeadDropdown";
// import axiosInstance from "@/libs/axios";
// import { AppDispatch, RootState } from "../../../../store/store";
// import { fetchPlots } from "../../../../store/plotSlice";
// import { API_BASE_URL } from '../../../libs/api';

// interface DropdownOption {
//   label: string;
//   value: string | number;
// }

// interface ComprehensiveLeadModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: any) => void;
//   initialData?: any;
//   isLoading?: boolean;
// }

// interface LeadFormValues {
//   leadId: number | null;
//   name: string;
//   phone: string;
//   gender: string;
//   projectId: number | null;
//   plotId: number | null;
//   plotSize: string;
//   price: string;
//   onlinePrice: string;
//   creditPoint: string;
//   bookingAmount: number | string;
//   payment_reference: string;
//   payment_platform_id: number | string;
//   cpName: string;
//   remark: string;
//   status: string;
// }

// interface Lead {
//   id: number;
//   name?: string;
//   phone?: string;
// }

// interface Project {
//   id: number;
//   title: string;
//   name?: string;
// }

// interface PaymentPlatform {
//   id: number;
//   platform_name: string;
// }

// // Debounce hook
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => clearTimeout(handler);
//   }, [value, delay]);

//   return debouncedValue;
// }

// const BookingModal: React.FC<ComprehensiveLeadModalProps> = ({
//   isOpen,
//   onClose,
//   onSave,
//   initialData,
//   isLoading = false,
// }) => {

//   const dispatch = useDispatch<AppDispatch>();
//   const { plots, loading: plotsLoading } = useSelector(
//     (state: RootState) => state.plotSlice
//   );

//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [paymentPlatforms, setPaymentPlatforms] = useState<PaymentPlatform[]>([]);

//   // Lead search state
//   const [leadSearchQuery, setLeadSearchQuery] = useState("");
//   const debouncedLeadSearch = useDebounce(leadSearchQuery, 400);
//   const [leadsLoading, setLeadsLoading] = useState(false);
//   const [initialLeadsLoaded, setInitialLeadsLoaded] = useState(false);

//   // Pagination for leads
//   const [leadsPage, setLeadsPage] = useState(1);
//   const [hasMoreLeads, setHasMoreLeads] = useState(true);
//   const [totalLeadsCount, setTotalLeadsCount] = useState(0);

//   const [projectsLoading, setProjectsLoading] = useState(false);
//   const [paymentPlatformsLoading, setPaymentPlatformsLoading] = useState(false);
//   const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);

//   // Plot details state
//   const [plotDetailsLoading, setPlotDetailsLoading] = useState(false);

//   const [apiError, setApiError] = useState<string | null>(null);

//   // CRITICAL FIX: Track edit mode and prevent API overwrites
//   const isEditModeRef = useRef(false);
//   const skipPlotFetchRef = useRef(false);
//   const lastPlotIdRef = useRef<number | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     control,
//     watch,
//   }: UseFormReturn<LeadFormValues> = useForm<LeadFormValues>({
//     defaultValues: {
//       leadId: null,
//       name: "",
//       phone: "",
//       gender: "",
//       projectId: null,
//       plotId: null,
//       plotSize: "",
//       price: "",
//       onlinePrice: "",
//       creditPoint: "",
//       bookingAmount: "",
//       payment_reference: "",
//       payment_platform_id: "",
//       cpName: "",
//       remark: "",
//       status: "pending",
//     },
//   });

//   const selectedLeadId = watch("leadId");
//   const selectedProjectId = watch("projectId");
//   const selectedPlotId = watch("plotId");
//   const cpNameValue = watch("cpName");

//   // --- Lead Fetch ---
//   const fetchLeads = useCallback(async (searchQuery: string = "", page: number = 1, append: boolean = false) => {
//     setLeadsLoading(true);
//     setApiError(null);

//     try {
//       const response = await axiosInstance.get('/bookings/select-lead', {
//         params: {
//           search: searchQuery || undefined,
//           page: page,
//           limit: 20,
//         }
//       });

//       const data = response.data?.data || response.data || [];
//       const leadsArray = Array.isArray(data) ? data : (data.leads || []);
//       const total = response.data?.total || response.data?.totalCount || leadsArray.length;
//       const hasMore = response.data?.hasMore ?? (leadsArray.length === 20);

//       if (append) {
//         setLeads(prev => [...prev, ...leadsArray]);
//       } else {
//         setLeads(leadsArray);
//       }

//       setTotalLeadsCount(total);
//       setHasMoreLeads(hasMore);
//       setInitialLeadsLoaded(true);

//     } catch (error: any) {
//       console.error("Error fetching leads:", error);
//       if (!append) {
//         setLeads([]);
//       }
//       if (error.response?.status !== 404) {
//         setApiError(error.response?.data?.message || "Failed to fetch leads");
//       }
//     } finally {
//       setLeadsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (isOpen && !initialLeadsLoaded) {
//       fetchLeads("", 1, false);
//     }
//   }, [isOpen, initialLeadsLoaded, fetchLeads]);

//   useEffect(() => {
//     if (initialLeadsLoaded && debouncedLeadSearch !== undefined) {
//       setLeadsPage(1);
//       fetchLeads(debouncedLeadSearch, 1, false);
//     }
//   }, [debouncedLeadSearch, initialLeadsLoaded, fetchLeads]);

//   const loadMoreLeads = useCallback(() => {
//     if (!leadsLoading && hasMoreLeads) {
//       const nextPage = leadsPage + 1;
//       setLeadsPage(nextPage);
//       fetchLeads(leadSearchQuery, nextPage, true);
//     }
//   }, [leadsLoading, hasMoreLeads, leadsPage, leadSearchQuery, fetchLeads]);

//   const handleLeadSearchChange = useCallback((query: string) => {
//     setLeadSearchQuery(query);
//   }, []);

//   const fetchLeadBasicDetails = async (leadId: number) => {
//     setLeadDetailsLoading(true);
//     try {
//       const response = await axiosInstance.get(`/bookings/leads/${leadId}/basic`);
//       const leadData = response.data?.data || response.data;
//       if (leadData) {
//         setValue("name", leadData.name || "");
//         setValue("phone", leadData.phone || "");
//         if (leadData.gender) {
//           setValue("gender", leadData.gender);
//         }
//       }
//     } catch (error: any) {
//       console.error("Error fetching lead details:", error);
//     } finally {
//       setLeadDetailsLoading(false);
//     }
//   };

//   // FIXED: Fetch plot details - ONLY when user manually changes plot
//   const fetchPlotBasicDetails = useCallback(async (projectId: number, plotId: number) => {
//     setPlotDetailsLoading(true);
//     try {
//       const response = await axiosInstance.get(`/bookings/projects/${projectId}/plots/${plotId}/basic`);
//       const plotData = response.data?.data || response.data;
//       if (plotData) {
//         setValue("plotSize", plotData.plotSize || "");
//         setValue("price", plotData.price || "");
//         setValue("onlinePrice", plotData.onlinePrice || plotData.online_price || "");
//         setValue("creditPoint", plotData.creditPoint || plotData.credit_price || "");
//       }
//     } catch (error: any) {
//       console.error("Error fetching plot details:", error);
//     } finally {
//       setPlotDetailsLoading(false);
//     }
//   }, [setValue]);

//   // CRITICAL FIX: Only fetch plot details when user MANUALLY changes plot
//   useEffect(() => {
//     if (!selectedProjectId || !selectedPlotId) {
//       lastPlotIdRef.current = null;
//       return;
//     }

//     // SKIP if edit mode and this is initial load
//     if (skipPlotFetchRef.current) {
//       console.log("SKIPPING plot fetch - edit mode initial load");
//       skipPlotFetchRef.current = false;
//       lastPlotIdRef.current = selectedPlotId;
//       return;
//     }

//     // Only fetch if user changed the plot (not initial load)
//     if (lastPlotIdRef.current !== null && lastPlotIdRef.current !== selectedPlotId) {
//       console.log("User changed plot, fetching new details");
//       fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
//     } else if (!isEditModeRef.current) {
//       // New booking mode - fetch details
//       console.log("New booking mode, fetching plot details");
//       fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
//     }

//     lastPlotIdRef.current = selectedPlotId;
//   }, [selectedProjectId, selectedPlotId, fetchPlotBasicDetails]);

//   const fetchActiveProjects = async () => {
//     setProjectsLoading(true);
//     try {
//       const response = await axiosInstance.get('/bookings/getActiveProject');
//       const data = response.data?.data || response.data || [];
//       setProjects(Array.isArray(data) ? data : []);
//     } catch (error: any) {
//       console.error("Error fetching projects:", error);
//       setProjects([]);
//       if (error.response?.status !== 404) {
//         setApiError("Failed to fetch projects");
//       }
//     } finally {
//       setProjectsLoading(false);
//     }
//   };

//   const fetchPaymentPlatforms = async () => {
//     setPaymentPlatformsLoading(true);
//     try {
//       const response = await axiosInstance.get('/payment/get-payment-Platforms');
//       const data = response.data?.data?.platforms || [];
//       setPaymentPlatforms(Array.isArray(data) ? data : []);
//     } catch (error: any) {
//       console.error("Error fetching payment platforms:", error);
//       setPaymentPlatforms([]);
//     } finally {
//       setPaymentPlatformsLoading(false);
//     }
//   };

//   // --- Options ---
//   const leadOptions: DropdownOption[] = useMemo(
//     () =>
//       leads.map((lead) => ({
//         label: lead.name
//           ? `${lead.name}${lead.phone ? ` - ${lead.phone}` : ''} (ID: ${lead.id})`
//           : lead.phone
//             ? `${lead.phone} (ID: ${lead.id})`
//             : `Lead ID: ${lead.id}`,
//         value: lead.id,
//       })),
//     [leads]
//   );

//   const projectOptions: DropdownOption[] = useMemo(
//     () =>
//       projects.map((project) => ({
//         label: project.title || project.name || `Project ${project.id}`,
//         value: project.id,
//       })),
//     [projects]
//   );

//   const plotOptions = useMemo(() => {
//     if (!plots || !Array.isArray(plots) || plots.length === 0) {
//       return [];
//     }
//     return plots.map((p: any) => ({
//       label: `Plot ${p.plotNumber} - ${p.plotSize} Sq.Yd (${p.status || "Available"})`,
//       value: p.id,
//       disabled: p.status?.toLowerCase() === "booked" || p.status?.toLowerCase() === "hold" || p.status?.toLowerCase() === "sold",
//     }));
//   }, [plots]);

//   const availablePlotsCount = useMemo(() => {
//     if (!plots || !Array.isArray(plots)) return 0;
//     return plots.filter(
//       (p: any) =>
//         p.status?.toLowerCase() === "available" || !p.status
//     ).length;
//   }, [plots]);

//   const platformOptions = useMemo(() =>
//     paymentPlatforms.map(p => ({ label: p.platform_name, value: p.id })),
//     [paymentPlatforms]);

//   const statusOptions: DropdownOption[] = [
//     { label: "Pending", value: "pending" },
//     { label: "Active", value: "active" },
//     { label: "Inactive", value: "inactive" },
//   ];

//   const genderOptions: DropdownOption[] = [
//     { label: "Male", value: "Male" },
//     { label: "Female", value: "Female" },
//     { label: "Other", value: "Other" },
//   ];

//   // Modal open effect
//   useEffect(() => {
//     if (isOpen) {
//       setApiError(null);
//       setLeadSearchQuery("");
//       setLeadsPage(1);
//       setInitialLeadsLoaded(false);
//       fetchActiveProjects();
//       fetchPaymentPlatforms();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (isOpen && initialData?.projectTitle && projects.length > 0) {
//       const project = projects.find(
//         (p) => p.title === initialData.projectTitle || p.name === initialData.projectTitle
//       );
//       if (project) {
//         setValue("projectId", project.id);
//       }
//     }
//   }, [isOpen, initialData, projects, setValue]);

//   useEffect(() => {
//     if (initialData?.plotNumber && plots.length > 0) {
//       const plot = plots.find(
//         (p: any) => String(p.plotNumber) === String(initialData.plotNumber)
//       );
//       if (plot) {
//         setValue("plotId", plot.id);
//       }
//     }
//   }, [plots, initialData, setValue]);

//   // FIXED: Only fetch lead details in NEW booking mode
//   useEffect(() => {
//     if (selectedLeadId && !isEditModeRef.current) {
//       fetchLeadBasicDetails(selectedLeadId);
//     }
//   }, [selectedLeadId]);

//   const prevProjectRef = useRef<number | null>(null);

//   useEffect(() => {
//     if (selectedProjectId) {
//       dispatch(
//         fetchPlots({
//           projectId: selectedProjectId,
//           page: 1,
//           limit: 500,
//         })
//       );
//     }
//   }, [selectedProjectId, dispatch]);

//   useEffect(() => {
//     if (
//       prevProjectRef.current !== null &&
//       prevProjectRef.current !== selectedProjectId
//     ) {
//       setValue("plotId", null);
//       // Reset skip flag since user changed project
//       skipPlotFetchRef.current = false;
//     }
//     prevProjectRef.current = selectedProjectId;
//   }, [selectedProjectId, setValue]);

//   useEffect(() => {
//     if (!cpNameValue || cpNameValue.trim() === "" || cpNameValue.toLowerCase() === "n/a") {
//       setValue("remark", "");
//     }
//   }, [cpNameValue, setValue]);

//   // CRITICAL: Load initial data for EDIT mode
//   useEffect(() => {
//     if (isOpen && initialData) {
//       // SET FLAGS FIRST - before any other code
//       isEditModeRef.current = true;
//       skipPlotFetchRef.current = true;
//       lastPlotIdRef.current = initialData.plotId || null;

//       console.log("========== EDIT MODE ==========");
//       console.log("initialData:", initialData);

//       // Get payment platform ID from multiple possible fields
//       const paymentPlatformId = initialData.payment_platform_id
//         || initialData.paymentPlatformId
//         || initialData.platform_id
//         || initialData.paymentPlatform?.id
//         || "";

//       // Pre-populate lead
//       if (initialData.leadId) {
//         const initialLead: Lead = {
//           id: initialData.leadId,
//           name: initialData.name,
//           phone: initialData.phone,
//         };
//         setLeads(prev => {
//           const exists = prev.some(l => l.id === initialLead.id);
//           return exists ? prev : [initialLead, ...prev];
//         });
//       }

//       // Fetch plots for the project
//       if (initialData.projectId) {
//         dispatch(
//           fetchPlots({
//             projectId: initialData.projectId,
//             page: 1,
//             limit: 500,
//           })
//         );
//       }

//       // RESET FORM WITH ALL VALUES
//       reset({
//         leadId: initialData.leadId || null,
//         name: initialData.name || "",
//         phone: initialData.phone || "",
//         gender: initialData.gender || "",
//         projectId: initialData.projectId || null,
//         plotId: initialData.plotId || null,
//         plotSize: initialData.plotSize || "",
//         price: initialData.price || initialData.price || "",
//         onlinePrice: initialData.onlinePrice || initialData.online_price || "",
//         creditPoint: initialData.creditPoint || initialData.credit_point || initialData.credit_price || "",
//         bookingAmount: initialData.bookingAmount || "",
//         status: initialData.status || "pending",
//         payment_reference: initialData.payment_reference || initialData.paymentReference || "",
//         payment_platform_id: paymentPlatformId,
//         cpName: initialData.cpName || initialData.cp_name || "",
//         remark: initialData.remark || "",
//       });

//       console.log("Form reset with values - onlinePrice:", initialData.onlinePrice, "creditPoint:", initialData.creditPoint);

//     } else if (isOpen && !initialData) {
//       // NEW BOOKING MODE
//       isEditModeRef.current = false;
//       skipPlotFetchRef.current = false;
//       lastPlotIdRef.current = null;

//       reset({
//         leadId: null,
//         name: "",
//         phone: "",
//         gender: "",
//         projectId: null,
//         plotId: null,
//         plotSize: "",
//         price: "",
//         onlinePrice: "",
//         creditPoint: "",
//         bookingAmount: "",
//         status: "pending",
//         payment_reference: "",
//         payment_platform_id: "",
//         cpName: "",
//         remark: "",
//       });
//     }
//   }, [isOpen, initialData, reset, dispatch]);

//   const handleClose = () => {
//     reset();
//     setApiError(null);
//     setLeadSearchQuery("");
//     setLeads([]);
//     setInitialLeadsLoaded(false);
//     setLeadsPage(1);
//     isEditModeRef.current = false;
//     skipPlotFetchRef.current = false;
//     lastPlotIdRef.current = null;
//     onClose();
//   };

//   const onSubmit = async (data: LeadFormValues) => {
//     const bookingId = initialData?.id || initialData?._id;

//     const payload = {
//       leadId: Number(data.leadId),
//       projectId: Number(data.projectId),
//       plotId: Number(data.plotId),
//       plotSize: String(data.plotSize || ""),
//       price: String(data.price || ""),
//       onlinePrice: String(data.onlinePrice || ""),
//       creditPoint: String(data.creditPoint || ""),
//       bookingAmount: String(data.bookingAmount),
//       name: data.name.trim(),
//       phone: data.phone.trim(),
//       gender: data.gender || null,
//       cpName: data.cpName || "",
//       remark: data.remark || "",
//       payment_platform_id: data.payment_platform_id ? Number(data.payment_platform_id) : null,
//       payment_reference: data.payment_reference || "",
//       status: data.status,
//     };

//     console.log("Submitting payload:", payload);

//     setSubmitLoading(true);
//     setApiError(null);

//     try {
//       let response;
//       if (bookingId) {
//         response = await axiosInstance.put(`${API_BASE_URL}/bookings/updateBooking/${bookingId}`, payload);
//       } else {
//         response = await axiosInstance.post(`${API_BASE_URL}/bookings/addBooking`, payload);
//       }

//       onSave(response.data);
//       handleClose();
//     } catch (error: any) {
//       console.error("Submission Error:", error.response?.data || error.message);
//       setApiError(error.response?.data?.message || "Failed to save booking");
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//             {initialData ? "Edit Booking" : "Add New Booking"}
//           </h2>
//           <button
//             onClick={handleClose}
//             className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-light"
//           >
//             ×
//           </button>
//         </div>

//         {/* API Error */}
//         {apiError && (
//           <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
//             <span className="text-red-700 dark:text-red-300">{apiError}</span>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {/* Lead */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Lead <span className="text-red-500">*</span>
//               </label>
//               <Controller
//                 name="leadId"
//                 control={control}
//                 rules={{ required: "Lead is required" }}
//                 render={({ field }) => (
//                   <SearchableLeadDropdown
//                     options={leadOptions}
//                     selected={leadOptions.find((opt) => opt.value === field.value) || null}
//                     onChange={(val) => field.onChange(val?.value || null)}
//                     onSearchChange={handleLeadSearchChange}
//                     onLoadMore={loadMoreLeads}
//                     hasMore={hasMoreLeads}
//                     placeholder={leadsLoading && !initialLeadsLoaded ? "Loading leads..." : "Search or select lead..."}
//                     disabled={false}
//                     isLoading={leadsLoading}
//                     totalCount={totalLeadsCount}
//                   />
//                 )}
//               />
//               {errors.leadId && <p className="text-red-500 text-xs mt-0.5">{errors.leadId.message}</p>}
//             </div>

//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 {...register("name", {
//                   required: "Name is required",
//                   minLength: { value: 2, message: "Name must be at least 2 characters" },
//                   maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
//                 })}
//                 className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
//                 placeholder="Enter name"
//                 disabled={leadDetailsLoading}
//               />
//               {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Phone <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 {...register("phone", {
//                   required: "Phone number is required",
//                   pattern: { value: /^(\+91[\s-]?)?[6-9]\d{9}$/, message: "Enter valid Indian mobile number" },
//                 })}
//                 className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
//                 placeholder="9876543210"
//                 maxLength={13}
//                 disabled={leadDetailsLoading}
//               />
//               {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>}
//             </div>

//             {/* Status */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
//               <Controller
//                 name="status"
//                 control={control}
//                 render={({ field }) => (
//                   <CommonDropdown
//                     options={statusOptions}
//                     selected={statusOptions.find((opt) => opt.value === field.value) || statusOptions[0]}
//                     onChange={(val: any) => field.onChange(val?.value)}
//                     placeholder="Select Status"
//                     disabled={true}
//                   />
//                 )}
//               />
//             </div>

//             {/* Project */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Project <span className="text-red-500">*</span>
//               </label>
//               <Controller
//                 name="projectId"
//                 control={control}
//                 rules={{ required: "Project is required" }}
//                 render={({ field }) => (
//                   <CommonDropdown
//                     options={projectOptions}
//                     selected={projectOptions.find((opt) => opt.value === field.value) || null}
//                     onChange={(val: any) => field.onChange(val?.value || null)}
//                     placeholder={projectsLoading ? "Loading Projects..." : "Select Project"}
//                     allowClear
//                     disabled={projectsLoading}
//                   />
//                 )}
//               />
//               {errors.projectId && <p className="text-red-500 text-xs mt-0.5">{errors.projectId.message}</p>}
//             </div>

//             {/* Plot */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Plot <span className="text-red-500">*</span>
//               </label>
//               <Controller
//                 name="plotId"
//                 control={control}
//                 rules={{ required: "Plot is required" }}
//                 render={({ field }) => (
//                   <CommonDropdown
//                     options={plotOptions}
//                     selected={plotOptions.find((opt) => opt.value === field.value) || null}
//                     onChange={(val: any) => field.onChange(val?.value || null)}
//                     placeholder={
//                       !selectedProjectId
//                         ? "Select Project First"
//                         : plotsLoading
//                           ? "Loading Plots..."
//                           : plotOptions.length === 0
//                             ? "No Plots Available"
//                             : "Select Plot"
//                     }
//                     allowClear
//                     disabled={!selectedProjectId || plotsLoading}
//                   />
//                 )}
//               />
//               {errors.plotId && <p className="text-red-500 text-xs mt-0.5">{errors.plotId.message}</p>}
//               {!selectedProjectId && <p className="text-yellow-600 text-xs mt-0.5">Select a project first</p>}
//               {selectedProjectId && plotsLoading && <p className="text-orange-600 text-xs mt-0.5">Loading plots...</p>}
//               {selectedProjectId && !plotsLoading && availablePlotsCount > 0 && (
//                 <p className="text-green-600 text-xs mt-0.5">{availablePlotsCount} available plots</p>
//               )}
//               {selectedProjectId && !plotsLoading && availablePlotsCount === 0 && (
//                 <p className="text-orange-600 text-xs mt-0.5">No available plots</p>
//               )}
//             </div>

//             {/* Plot Size */}
//             {selectedProjectId && selectedPlotId && (
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Size (Sq.Yd)</label>
//                 <input
//                   type="text"
//                   {...register("plotSize")}
//                   placeholder={plotDetailsLoading ? "Loading..." : "Enter plot size"}
//                   className="w-full h-11 px-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
//                   disabled={plotDetailsLoading}
//                 />
//               </div>
//             )}

//             {/* Plot Price */}
//             {selectedProjectId && selectedPlotId && (
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (per Sq.Yd)</label>
//                 <input
//                   type="text"
//                   {...register("price")}
//                   placeholder={plotDetailsLoading ? "Loading..." : "Enter price"}
//                   className="w-full h-11 px-3 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
//                   disabled={plotDetailsLoading}
//                 />
//               </div>
//             )}

//             {/* Online Price */}
//             {selectedProjectId && selectedPlotId && (
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Online Price</label>
//                 <input
//                   type="text"
//                   {...register("onlinePrice")}
//                   placeholder={plotDetailsLoading ? "Loading..." : "Enter online price"}
//                   className="w-full h-11 px-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
//                   disabled={plotDetailsLoading}
//                 />
//               </div>
//             )}

//             {/* Credit Price */}
//             {selectedProjectId && selectedPlotId && (
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit Price</label>
//                 <input
//                   type="text"
//                   {...register("creditPoint")}
//                   placeholder={plotDetailsLoading ? "Loading..." : "Enter credit price"}
//                   className="w-full h-11 px-3 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
//                   disabled={plotDetailsLoading}
//                 />
//               </div>
//             )}

//             {/* Booking Amount */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Booking Amount <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 {...register("bookingAmount", {
//                   required: "Booking amount is required",
//                   min: { value: 1, message: "Amount must be greater than 0" },
//                   max: { value: 100000000, message: "Amount cannot exceed 10 Crore" },
//                 })}
//                 className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
//                 placeholder="500000"
//               />
//               {errors.bookingAmount && <p className="text-red-500 text-xs mt-0.5">{errors.bookingAmount.message}</p>}
//             </div>

//             {/* Gender */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
//               <Controller
//                 name="gender"
//                 control={control}
//                 render={({ field }) => (
//                   <CommonDropdown
//                     options={genderOptions}
//                     selected={genderOptions.find((opt) => opt.value === field.value) || null}
//                     onChange={(val: any) => field.onChange(val?.value || "")}
//                     placeholder="Select Gender"
//                     allowClear
//                   />
//                 )}
//               />
//             </div>

//             {/* Transaction ID */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Transaction ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 {...register("payment_reference", {
//                   required: "Transaction ID is required",
//                   minLength: { value: 3, message: "Transaction ID too short" },
//                 })}
//                 className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
//                 placeholder="TXN123456"
//               />
//               {errors.payment_reference && <p className="text-red-500 text-xs mt-0.5">{errors.payment_reference.message}</p>}
//             </div>

//             {/* Payment Platform */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Payment Platform <span className="text-red-500">*</span>
//               </label>
//               <Controller
//                 name="payment_platform_id"
//                 control={control}
//                 rules={{ required: "Platform required" }}
//                 render={({ field }) => {
//                   const selectedPlatform = platformOptions.find(
//                     (opt) => opt.value && field.value && Number(opt.value) === Number(field.value)
//                   );
//                   return (
//                     <CommonDropdown
//                       options={platformOptions}
//                       selected={selectedPlatform || null}
//                       onChange={(v: any) => field.onChange(v?.value || "")}
//                       placeholder={paymentPlatformsLoading ? "Loading..." : "Select Platform"}
//                       disabled={paymentPlatformsLoading}
//                     />
//                   );
//                 }}
//               />
//               {errors.payment_platform_id && <p className="text-red-500 text-xs mt-0.5">{errors.payment_platform_id.message}</p>}
//             </div>

//             {/* CP Name */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CP Name</label>
//               <input
//                 type="text"
//                 {...register("cpName", {
//                   minLength: { value: 2, message: "CP Name must be at least 2 characters" },
//                   maxLength: { value: 50, message: "CP Name cannot exceed 50 characters" },
//                 })}
//                 className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
//                 placeholder="Mitesh Patel"
//               />
//               {errors.cpName && <p className="text-red-500 text-xs mt-0.5">{errors.cpName.message}</p>}
//             </div>

//             {/* Remarks */}
//             {cpNameValue && cpNameValue.trim() !== "" && cpNameValue.toLowerCase() !== "n/a" && (
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label>
//                 <input
//                   type="text"
//                   {...register("remark", {
//                     minLength: { value: 3, message: "Remark too short" },
//                     maxLength: { value: 200, message: "Remark too long" },
//                   })}
//                   className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
//                   placeholder="Enter Remarks"
//                 />
//                 {errors.remark && <p className="text-red-500 text-xs mt-0.5">{errors.remark.message}</p>}
//               </div>
//             )}
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-5 h-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
//               disabled={submitLoading}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className={`px-5 h-10 text-white rounded-lg text-sm font-medium shadow-sm transition-colors ${submitLoading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
//                 }`}
//               disabled={submitLoading}
//             >
//               {submitLoading ? "Saving..." : initialData ? "Update Booking" : "Add Booking"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;



'use client';
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CommonDropdown from "../Common/CommonDropdown";
import SearchableLeadDropdown from "../Common/SearchableLeadDropdown";
import axiosInstance from "@/libs/axios";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchPlots } from "../../../../store/plotSlice";
import { API_BASE_URL } from '../../../libs/api';

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
  gender: string;
  projectId: number | null;
  plotId: number | null;
  plotSize: string;
  price: string;
  onlinePrice: string;
  creditPoint: string;
  bookingAmount: number | string;
  payment_reference: string;
  payment_platform_id: number | string;
  cpName: string;
  remark: string;
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

interface PaymentPlatform {
  id: number;
  platform_name: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const BookingModal: React.FC<ComprehensiveLeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}) => {

  const dispatch = useDispatch<AppDispatch>();
  const { plots, loading: plotsLoading } = useSelector(
    (state: RootState) => state.plotSlice
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [paymentPlatforms, setPaymentPlatforms] = useState<PaymentPlatform[]>([]);

  // Lead search state
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const debouncedLeadSearch = useDebounce(leadSearchQuery, 400);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [initialLeadsLoaded, setInitialLeadsLoaded] = useState(false);

  // Pagination for leads
  const [leadsPage, setLeadsPage] = useState(1);
  const [hasMoreLeads, setHasMoreLeads] = useState(true);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [paymentPlatformsLoading, setPaymentPlatformsLoading] = useState(false);
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Plot details state
  const [plotDetailsLoading, setPlotDetailsLoading] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  // CRITICAL FIX: Track edit mode and prevent API overwrites
  const isEditModeRef = useRef(false);
  const skipPlotFetchRef = useRef(false);
  const lastPlotIdRef = useRef<number | null>(null);

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
      gender: "",
      projectId: null,
      plotId: null,
      plotSize: "",
      price: "",
      onlinePrice: "",
      creditPoint: "",
      bookingAmount: "",
      payment_reference: "",
      payment_platform_id: "",
      cpName: "",
      remark: "",
      status: "pending",
    },
  });

  const selectedLeadId = watch("leadId");
  const selectedProjectId = watch("projectId");
  const selectedPlotId = watch("plotId");
  const cpNameValue = watch("cpName");

  // --- Lead Fetch ---
  const fetchLeads = useCallback(async (searchQuery: string = "", page: number = 1, append: boolean = false) => {
    setLeadsLoading(true);
    setApiError(null);

    try {
      const response = await axiosInstance.get('/bookings/select-lead', {
        params: {
          search: searchQuery || undefined,
          page: page,
          limit: 20,
        }
      });

      const data = response.data?.data || response.data || [];
      const leadsArray = Array.isArray(data) ? data : (data.leads || []);
      const total = response.data?.total || response.data?.totalCount || leadsArray.length;
      const hasMore = response.data?.hasMore ?? (leadsArray.length === 20);

      if (append) {
        setLeads(prev => [...prev, ...leadsArray]);
      } else {
        setLeads(leadsArray);
      }

      setTotalLeadsCount(total);
      setHasMoreLeads(hasMore);
      setInitialLeadsLoaded(true);

    } catch (error: any) {
      console.error("Error fetching leads:", error);
      if (!append) {
        setLeads([]);
      }
      if (error.response?.status !== 404) {
        setApiError(error.response?.data?.message || "Failed to fetch leads");
      }
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !initialLeadsLoaded) {
      fetchLeads("", 1, false);
    }
  }, [isOpen, initialLeadsLoaded, fetchLeads]);

  useEffect(() => {
    if (initialLeadsLoaded && debouncedLeadSearch !== undefined) {
      setLeadsPage(1);
      fetchLeads(debouncedLeadSearch, 1, false);
    }
  }, [debouncedLeadSearch, initialLeadsLoaded, fetchLeads]);

  const loadMoreLeads = useCallback(() => {
    if (!leadsLoading && hasMoreLeads) {
      const nextPage = leadsPage + 1;
      setLeadsPage(nextPage);
      fetchLeads(leadSearchQuery, nextPage, true);
    }
  }, [leadsLoading, hasMoreLeads, leadsPage, leadSearchQuery, fetchLeads]);

  const handleLeadSearchChange = useCallback((query: string) => {
    setLeadSearchQuery(query);
  }, []);

  const fetchLeadBasicDetails = async (leadId: number) => {
    setLeadDetailsLoading(true);
    try {
      const response = await axiosInstance.get(`/bookings/leads/${leadId}/basic`);
      const leadData = response.data?.data || response.data;
      if (leadData) {
        setValue("name", leadData.name || "");
        setValue("phone", leadData.phone || "");
        if (leadData.gender) {
          setValue("gender", leadData.gender);
        }
      }
    } catch (error: any) {
      console.error("Error fetching lead details:", error);
    } finally {
      setLeadDetailsLoading(false);
    }
  };

  // FIXED: Fetch plot details - ONLY when user manually changes plot
  const fetchPlotBasicDetails = useCallback(async (projectId: number, plotId: number) => {
    setPlotDetailsLoading(true);
    try {
      const response = await axiosInstance.get(`/bookings/projects/${projectId}/plots/${plotId}/basic`);
      const plotData = response.data?.data || response.data;
      if (plotData) {
        setValue("plotSize", plotData.plotSize || "");
        setValue("price", plotData.price || "");
        setValue("onlinePrice", plotData.onlinePrice || plotData.online_price || "");
        setValue("creditPoint", plotData.creditPoint || plotData.credit_price || "");
      }
    } catch (error: any) {
      console.error("Error fetching plot details:", error);
    } finally {
      setPlotDetailsLoading(false);
    }
  }, [setValue]);

  // CRITICAL FIX: Only fetch plot details when user MANUALLY changes plot
  useEffect(() => {
    if (!selectedProjectId || !selectedPlotId) {
      lastPlotIdRef.current = null;
      return;
    }

    // SKIP if edit mode and this is initial load
    if (skipPlotFetchRef.current) {
      console.log("SKIPPING plot fetch - edit mode initial load");
      skipPlotFetchRef.current = false;
      lastPlotIdRef.current = selectedPlotId;
      return;
    }

    // Only fetch if user changed the plot (not initial load)
    if (lastPlotIdRef.current !== null && lastPlotIdRef.current !== selectedPlotId) {
      console.log("User changed plot, fetching new details");
      fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
    } else if (!isEditModeRef.current) {
      // New booking mode - fetch details
      console.log("New booking mode, fetching plot details");
      fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
    }

    lastPlotIdRef.current = selectedPlotId;
  }, [selectedProjectId, selectedPlotId, fetchPlotBasicDetails]);

  const fetchActiveProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axiosInstance.get('/bookings/getActiveProject');
      const data = response.data?.data || response.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      if (error.response?.status !== 404) {
        setApiError("Failed to fetch projects");
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchPaymentPlatforms = async () => {
    setPaymentPlatformsLoading(true);
    try {
      const response = await axiosInstance.get('/payment/get-payment-Platforms');
      const data = response.data?.data?.platforms || [];
      setPaymentPlatforms(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching payment platforms:", error);
      setPaymentPlatforms([]);
    } finally {
      setPaymentPlatformsLoading(false);
    }
  };

  // --- Options ---
  const leadOptions: DropdownOption[] = useMemo(
    () =>
      leads.map((lead) => ({
        label: lead.name
          ? `${lead.name}${lead.phone ? ` - ${lead.phone}` : ''} (ID: ${lead.id})`
          : lead.phone
            ? `${lead.phone} (ID: ${lead.id})`
            : `Lead ID: ${lead.id}`,
        value: lead.id,
      })),
    [leads]
  );

  const projectOptions: DropdownOption[] = useMemo(
    () =>
      projects.map((project) => ({
        label: project.title || project.name || `Project ${project.id}`,
        value: project.id,
      })),
    [projects]
  );

  // const plotOptions = useMemo(() => {
  //   if (!plots || !Array.isArray(plots) || plots.length === 0) {
  //     return [];
  //   }
  //   return plots.map((p: any) => ({
  //     label: `Plot ${p.plotNumber} - ${p.plotSize} Sq.Yd (${p.status || "Available"})`,
  //     value: p.id,
  //     disabled: p.status?.toLowerCase() === "booked" || p.status?.toLowerCase() === "hold" || p.status?.toLowerCase() === "sold" || p.status?.toLowerCase() === "company reserved",
  //   }));
  // }, [plots]);

  const plotOptions = useMemo(() => {
    if (!plots || !Array.isArray(plots) || plots.length === 0) {
      return [];
    }

    const sortedPlots = [...plots].sort((a: any, b: any) => {
      const aStatus = a.status?.toLowerCase() || "available";
      const bStatus = b.status?.toLowerCase() || "available";

      const isAAvailable = aStatus === "available";
      const isBAvailable = bStatus === "available";

      // Available first
      if (isAAvailable && !isBAvailable) return -1;
      if (!isAAvailable && isBAvailable) return 1;

      return 0;
    });

    return sortedPlots.map((p: any) => ({
      label: `Plot ${p.plotNumber} - ${p.plotSize} Sq.Yd (${p.status || "Available"})`,
      value: p.id,
      disabled:
        p.status?.toLowerCase() === "booked" ||
        p.status?.toLowerCase() === "hold" ||
        p.status?.toLowerCase() === "sold" ||
        p.status?.toLowerCase() === "company reserved",
    }));
  }, [plots]);


  // const plotOptions = useMemo(() => {
  //   if (!plots || !Array.isArray(plots) || plots.length === 0) {
  //     return [];
  //   }

  //   const sortedPlots = [...plots].sort((a: any, b: any) => {
  //     return Number(a.plotNumber) - Number(b.plotNumber);
  //   });

  //   return sortedPlots.map((p: any) => ({
  //     label: `Plot ${p.plotNumber} - ${p.plotSize} Sq.Yd (${p.status || "Available"})`,
  //     value: p.id,
  //     disabled:
  //       p.status?.toLowerCase() === "booked" ||
  //       p.status?.toLowerCase() === "hold" ||
  //       p.status?.toLowerCase() === "sold" ||
  //       p.status?.toLowerCase() === "company reserved",
  //   }));
  // }, [plots]);

  const availablePlotsCount = useMemo(() => {
    if (!plots || !Array.isArray(plots)) return 0;
    return plots.filter(
      (p: any) =>
        p.status?.toLowerCase() === "available" || !p.status
    ).length;
  }, [plots]);

  const platformOptions = useMemo(() =>
    paymentPlatforms.map(p => ({ label: p.platform_name, value: p.id })),
    [paymentPlatforms]);

  const statusOptions: DropdownOption[] = [
    { label: "Pending", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const genderOptions: DropdownOption[] = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  // Modal open effect
  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      setLeadSearchQuery("");
      setLeadsPage(1);
      setInitialLeadsLoaded(false);
      fetchActiveProjects();
      fetchPaymentPlatforms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData?.projectTitle && projects.length > 0) {
      const project = projects.find(
        (p) => p.title === initialData.projectTitle || p.name === initialData.projectTitle
      );
      if (project) {
        setValue("projectId", project.id);
      }
    }
  }, [isOpen, initialData, projects, setValue]);

  useEffect(() => {
    if (initialData?.plotNumber && plots.length > 0) {
      const plot = plots.find(
        (p: any) => String(p.plotNumber) === String(initialData.plotNumber)
      );
      if (plot) {
        setValue("plotId", plot.id);
      }
    }
  }, [plots, initialData, setValue]);

  // FIXED: Only fetch lead details in NEW booking mode
  useEffect(() => {
    if (selectedLeadId && !isEditModeRef.current) {
      fetchLeadBasicDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  const prevProjectRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(
        fetchPlots({
          projectId: selectedProjectId,
          page: 1,
          limit: 600,
        })
      );
    }
  }, [selectedProjectId, dispatch]);

  useEffect(() => {
    if (
      prevProjectRef.current !== null &&
      prevProjectRef.current !== selectedProjectId
    ) {
      setValue("plotId", null);
      // Reset skip flag since user changed project
      skipPlotFetchRef.current = false;
    }
    prevProjectRef.current = selectedProjectId;
  }, [selectedProjectId, setValue]);

  useEffect(() => {
    if (!cpNameValue || cpNameValue.trim() === "" || cpNameValue.toLowerCase() === "n/a") {
      setValue("remark", "");
    }
  }, [cpNameValue, setValue]);

  // CRITICAL: Load initial data for EDIT mode
  useEffect(() => {
    if (isOpen && initialData) {
      // SET FLAGS FIRST - before any other code
      isEditModeRef.current = true;
      skipPlotFetchRef.current = true;
      lastPlotIdRef.current = initialData.plotId || null;

      console.log("========== EDIT MODE ==========");
      console.log("initialData:", initialData);

      // Get payment platform ID from multiple possible fields
      const paymentPlatformId = initialData.payment_platform_id
        || initialData.paymentPlatformId
        || initialData.platform_id
        || initialData.paymentPlatform?.id
        || "";

      // Pre-populate lead
      if (initialData.leadId) {
        const initialLead: Lead = {
          id: initialData.leadId,
          name: initialData.name,
          phone: initialData.phone,
        };
        setLeads(prev => {
          const exists = prev.some(l => l.id === initialLead.id);
          return exists ? prev : [initialLead, ...prev];
        });
      }

      // Fetch plots for the project
      if (initialData.projectId) {
        dispatch(
          fetchPlots({
            projectId: initialData.projectId,
            page: 1,
            limit: 500,
          })
        );
      }

      // RESET FORM WITH ALL VALUES - handle all possible field name variations
      reset({
        leadId: initialData.leadId || null,
        name: initialData.name || "",
        phone: initialData.phone || "",
        gender: initialData.gender || "",
        projectId: initialData.projectId || null,
        plotId: initialData.plotId || null,
        plotSize: initialData.plotSize || "",
        // FIX: Handle all price field variations from API
        price: initialData.price || initialData.price || initialData.totalPlotAmount || "",
        onlinePrice: initialData.onlinePrice || initialData.onlinePlotAmount || initialData.online_price || "",
        creditPoint: initialData.creditPoint || initialData.creditPointAmount || initialData.credit_point || initialData.credit_price || "",
        bookingAmount: initialData.bookingAmount || "",
        status: initialData.status || "pending",
        payment_reference: initialData.payment_reference || initialData.paymentReference || "",
        payment_platform_id: paymentPlatformId,
        cpName: initialData.cpName || initialData.cp_name || "",
        remark: initialData.remark || "",
      });

      console.log("=== Form Reset Values ===");
      console.log("price:", initialData.price || initialData.price || initialData.totalPlotAmount);
      console.log("onlinePrice:", initialData.onlinePrice || initialData.onlinePlotAmount);
      console.log("creditPoint:", initialData.creditPoint || initialData.creditPointAmount);

    } else if (isOpen && !initialData) {
      // NEW BOOKING MODE
      isEditModeRef.current = false;
      skipPlotFetchRef.current = false;
      lastPlotIdRef.current = null;

      reset({
        leadId: null,
        name: "",
        phone: "",
        gender: "",
        projectId: null,
        plotId: null,
        plotSize: "",
        price: "",
        onlinePrice: "",
        creditPoint: "",
        bookingAmount: "",
        status: "pending",
        payment_reference: "",
        payment_platform_id: "",
        cpName: "",
        remark: "",
      });
    }
  }, [isOpen, initialData, reset, dispatch]);

  const handleClose = () => {
    reset();
    setApiError(null);
    setLeadSearchQuery("");
    setLeads([]);
    setInitialLeadsLoaded(false);
    setLeadsPage(1);
    isEditModeRef.current = false;
    skipPlotFetchRef.current = false;
    lastPlotIdRef.current = null;
    onClose();
  };

  const onSubmit = async (data: LeadFormValues) => {
    const bookingId = initialData?.id || initialData?._id;

    const payload = {
      leadId: Number(data.leadId),
      projectId: Number(data.projectId),
      plotId: Number(data.plotId),
      plotSize: String(data.plotSize || ""),
      price: String(data.price || ""),
      onlinePrice: String(data.onlinePrice || ""),
      creditPoint: String(data.creditPoint || ""),
      bookingAmount: String(data.bookingAmount),
      name: data.name.trim(),
      phone: data.phone.trim(),
      gender: data.gender || null,
      cpName: data.cpName || "",
      remark: data.remark || "",
      payment_platform_id: data.payment_platform_id ? Number(data.payment_platform_id) : null,
      payment_reference: data.payment_reference || "",
      status: data.status,
    };

    console.log("Submitting payload:", payload);

    setSubmitLoading(true);
    setApiError(null);

    try {
      let response;
      if (bookingId) {
        response = await axiosInstance.put(`${API_BASE_URL}/bookings/updateBooking/${bookingId}`, payload);
      } else {
        response = await axiosInstance.post(`${API_BASE_URL}/bookings/addBooking`, payload);
      }

      onSave(response.data);
      handleClose();
    } catch (error: any) {
      console.error("Submission Error:", error.response?.data || error.message);
      setApiError(error.response?.data?.message || "Failed to save booking");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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

        {/* API Error */}
        {apiError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
            <span className="text-red-700 dark:text-red-300">{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Lead */}
            <div className="space-y-1.5">
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
                    onSearchChange={handleLeadSearchChange}
                    onLoadMore={loadMoreLeads}
                    hasMore={hasMoreLeads}
                    placeholder={leadsLoading && !initialLeadsLoaded ? "Loading leads..." : "Search or select lead..."}
                    disabled={false}
                    isLoading={leadsLoading}
                    totalCount={totalLeadsCount}
                  />
                )}
              />
              {errors.leadId && <p className="text-red-500 text-xs mt-0.5">{errors.leadId.message}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
                })}
                className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
                placeholder="Enter name"
                disabled={leadDetailsLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone <span className="text-red-500">*</span>
              </label>
              <input

                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: { value: /^(\+91[\s-]?)?[6-9]\d{9}$/, message: "Enter valid Indian mobile number" },
                })}
                className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
                placeholder="9876543210"
                maxLength={13}
                // disabled={leadDetailsLoading}
                disabled={true}

              />
              {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={statusOptions}
                    selected={statusOptions.find((opt) => opt.value === field.value) || statusOptions[0]}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select Status"
                    disabled={true}
                  />
                )}
              />
            </div>

            {/* Project */}
            <div className="space-y-1.5">
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
              {errors.projectId && <p className="text-red-500 text-xs mt-0.5">{errors.projectId.message}</p>}
            </div>

            {/* Plot */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plot <span className="text-red-500">*</span>
              </label>
              <Controller
                name="plotId"
                control={control}
                rules={{ required: "Plot is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={plotOptions}
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
              {errors.plotId && <p className="text-red-500 text-xs mt-0.5">{errors.plotId.message}</p>}
              {!selectedProjectId && <p className="text-yellow-600 text-xs mt-0.5">Select a project first</p>}
              {selectedProjectId && plotsLoading && <p className="text-orange-600 text-xs mt-0.5">Loading plots...</p>}
              {selectedProjectId && !plotsLoading && availablePlotsCount > 0 && (
                <p className="text-green-600 text-xs mt-0.5">{availablePlotsCount} available plots</p>
              )}
              {selectedProjectId && !plotsLoading && availablePlotsCount === 0 && (
                <p className="text-orange-600 text-xs mt-0.5">No available plots</p>
              )}
            </div>

            {/* Plot Size */}
            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Size (Sq.Yd)</label>
                <input
                  type="text"
                  {...register("plotSize")}
                  placeholder={plotDetailsLoading ? "Loading..." : "Enter plot size"}
                  className="w-full h-11 px-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  disabled={plotDetailsLoading}
                />
              </div>
            )}

            {/* Plot Price */}
            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                <input
                  type="text"
                  {...register("price")}
                  placeholder={plotDetailsLoading ? "Loading..." : "Enter price"}
                  className="w-full h-11 px-3 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
                  disabled={plotDetailsLoading}
                />
              </div>
            )}

            {/* Online Price */}
            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Online Price</label>
                <input
                  type="text"
                  {...register("onlinePrice")}
                  placeholder={plotDetailsLoading ? "Loading..." : "Enter online price"}
                  className="w-full h-11 px-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  disabled={plotDetailsLoading}
                />
              </div>
            )}

            {/* Credit Price */}
            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit Price</label>
                <input
                  type="text"
                  {...register("creditPoint")}
                  placeholder={plotDetailsLoading ? "Loading..." : "Enter credit price"}
                  className="w-full h-11 px-3 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  disabled={plotDetailsLoading}
                />
              </div>
            )}

            {/* Booking Amount */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Booking Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("bookingAmount", {
                  required: "Booking amount is required",
                  min: { value: 1, message: "Amount must be greater than 0" },
                  max: { value: 100000000, message: "Amount cannot exceed 10 Crore" },
                })}
                className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="500000"
              />
              {errors.bookingAmount && <p className="text-red-500 text-xs mt-0.5">{errors.bookingAmount.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender <span className="text-red-500">*</span>
              </label>

              <Controller
                name="gender"
                control={control}
                rules={{
                  validate: (value) =>
                    value && value.trim() !== "" || "Gender is required",
                }}
                render={({ field }) => (
                  <CommonDropdown
                    options={genderOptions}
                    selected={
                      genderOptions.find((opt) => opt.value === field.value) || null
                    }
                    onChange={(val: any) => field.onChange(val?.value || "")}
                    placeholder="Select Gender"
                    allowClear
                  />
                )}
              />

              {errors.gender && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.gender.message}
                </p>
              )}
            </div>


            {/* Transaction ID */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("payment_reference", {
                  required: "Transaction ID is required",
                  minLength: { value: 3, message: "Transaction ID too short" },
                })}
                className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="TXN123456"
              />
              {errors.payment_reference && <p className="text-red-500 text-xs mt-0.5">{errors.payment_reference.message}</p>}
            </div>

            {/* Payment Platform */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Platform <span className="text-red-500">*</span>
              </label>
              <Controller
                name="payment_platform_id"
                control={control}
                rules={{ required: "Platform required" }}
                render={({ field }) => {
                  const selectedPlatform = platformOptions.find(
                    (opt) => opt.value && field.value && Number(opt.value) === Number(field.value)
                  );
                  return (
                    <CommonDropdown
                      options={platformOptions}
                      selected={selectedPlatform || null}
                      onChange={(v: any) => field.onChange(v?.value || "")}
                      placeholder={paymentPlatformsLoading ? "Loading..." : "Select Platform"}
                      disabled={paymentPlatformsLoading}
                    />
                  );
                }}
              />
              {errors.payment_platform_id && <p className="text-red-500 text-xs mt-0.5">{errors.payment_platform_id.message}</p>}
            </div>

            {/* CP Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CP Name</label>
              <input
                type="text"
                {...register("cpName", {
                  minLength: { value: 2, message: "CP Name must be at least 2 characters" },
                  maxLength: { value: 50, message: "CP Name cannot exceed 50 characters" },
                })}
                className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="Mitesh Patel"
              />
              {errors.cpName && <p className="text-red-500 text-xs mt-0.5">{errors.cpName.message}</p>}
            </div>

            {/* Remarks */}
            {cpNameValue && cpNameValue.trim() !== "" && cpNameValue.toLowerCase() !== "n/a" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label>
                <input
                  type="text"
                  {...register("remark", {
                    minLength: { value: 3, message: "Remark too short" },
                    maxLength: { value: 200, message: "Remark too long" },
                  })}
                  className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Remarks"
                />
                {errors.remark && <p className="text-red-500 text-xs mt-0.5">{errors.remark.message}</p>}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 h-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={submitLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-5 h-10 text-white rounded-lg text-sm font-medium shadow-sm transition-colors ${submitLoading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
                }`}
              disabled={submitLoading}
            >
              {submitLoading ? "Saving..." : initialData ? "Update Booking" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;