'use client';
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
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
  address: string;
  aadharFront: File | null;
  aadharBack: File | null;
  panFront: File | null;
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const EditDocViewer = ({
  label,
  url,
  borderColor,
  bgColor,
}: {
  label: string;
  url: string | null;
  borderColor: string;
  bgColor: string;
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {url ? (
        <div className={`flex items-center justify-center w-full h-28 border-2 rounded-lg overflow-hidden ${borderColor} ${bgColor}`}>
          <img src={url} alt={label} className="h-full w-full object-contain p-1" />
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg ${borderColor} ${bgColor}`}>
          <span className="text-2xl">🪪</span>
          <span className="text-xs text-gray-400 mt-1">Not uploaded</span>
        </div>
      )}
    </div>
  );
};

const BookingModal: React.FC<ComprehensiveLeadModalProps> = ({
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
  const [paymentPlatforms, setPaymentPlatforms] = useState<PaymentPlatform[]>([]);

  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const debouncedLeadSearch = useDebounce(leadSearchQuery, 400);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [initialLeadsLoaded, setInitialLeadsLoaded] = useState(false);
  const [leadsPage, setLeadsPage] = useState(1);
  const [hasMoreLeads, setHasMoreLeads] = useState(true);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [paymentPlatformsLoading, setPaymentPlatformsLoading] = useState(false);
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [plotDetailsLoading, setPlotDetailsLoading] = useState(false);

  const [aadharFrontPreview, setAadharFrontPreview] = useState<string | null>(null);
  const [aadharBackPreview, setAadharBackPreview] = useState<string | null>(null);
  const [panFrontPreview, setPanFrontPreview] = useState<string | null>(null);

  const isEditModeRef = useRef(false);
  const skipPlotFetchRef = useRef(false);
  const lastPlotIdRef = useRef<number | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control, watch }: UseFormReturn<LeadFormValues> = useForm<LeadFormValues>({
    defaultValues: {
      leadId: null, name: "", phone: "", gender: "",
      projectId: null, plotId: null, plotSize: "", price: "",
      onlinePrice: "", creditPoint: "", bookingAmount: "",
      payment_reference: "", payment_platform_id: "",
      cpName: "", remark: "", status: "pending",
      address: "", aadharFront: null, aadharBack: null, panFront: null,
    },
  });

  const selectedLeadId = watch("leadId");
  const selectedProjectId = watch("projectId");
  const selectedPlotId = watch("plotId");
  const cpNameValue = watch("cpName");

  const fetchLeads = useCallback(async (searchQuery: string = "", page: number = 1, append: boolean = false) => {
    setLeadsLoading(true);
    try {
      const response = await axiosInstance.get('/bookings/select-lead', { params: { search: searchQuery || undefined, page, limit: 20 } });
      const data = response.data?.data || response.data || [];
      const leadsArray = Array.isArray(data) ? data : (data.leads || []);
      const total = response.data?.total || response.data?.totalCount || leadsArray.length;
      const hasMore = response.data?.hasMore ?? (leadsArray.length === 20);
      if (append) setLeads(prev => [...prev, ...leadsArray]); else setLeads(leadsArray);
      setTotalLeadsCount(total); setHasMoreLeads(hasMore); setInitialLeadsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      if (!append) setLeads([]);
      if (error.response?.status !== 404) toast.error(error.response?.data?.message || "Failed to fetch leads");
    } finally { setLeadsLoading(false); }
  }, []);

  useEffect(() => { if (isOpen && !initialLeadsLoaded) fetchLeads("", 1, false); }, [isOpen, initialLeadsLoaded, fetchLeads]);
  useEffect(() => { if (initialLeadsLoaded && debouncedLeadSearch !== undefined) { setLeadsPage(1); fetchLeads(debouncedLeadSearch, 1, false); } }, [debouncedLeadSearch, initialLeadsLoaded, fetchLeads]);

  const loadMoreLeads = useCallback(() => {
    if (!leadsLoading && hasMoreLeads) { const nextPage = leadsPage + 1; setLeadsPage(nextPage); fetchLeads(leadSearchQuery, nextPage, true); }
  }, [leadsLoading, hasMoreLeads, leadsPage, leadSearchQuery, fetchLeads]);

  const handleLeadSearchChange = useCallback((query: string) => setLeadSearchQuery(query), []);

  const fetchLeadBasicDetails = useCallback(async (leadId: number) => {
    setLeadDetailsLoading(true);
    try {
      const response = await axiosInstance.get(`/bookings/leads/${leadId}/basic`);
      const leadData = response.data?.data || response.data;
      if (leadData) {
        const rawName = leadData.name || "";
        const isPhoneInName = /^[\d\s\+\-]{7,}$/.test(rawName.trim());
        setValue("name", isPhoneInName ? "" : rawName);
        setValue("phone", leadData.phone || leadData.mobile || "");
        if (leadData.gender) setValue("gender", leadData.gender);
      }
    } catch (error: any) { console.error("Error fetching lead details:", error); }
    finally { setLeadDetailsLoading(false); }
  }, [setValue]);

  useEffect(() => {
    if (!selectedLeadId) return;
    fetchLeadBasicDetails(selectedLeadId);
  }, [selectedLeadId, fetchLeadBasicDetails]);

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
    } catch (error: any) { console.error("Error fetching plot details:", error); }
    finally { setPlotDetailsLoading(false); }
  }, [setValue]);

  useEffect(() => {
    if (!selectedProjectId || !selectedPlotId) { lastPlotIdRef.current = null; return; }
    if (skipPlotFetchRef.current) { skipPlotFetchRef.current = false; lastPlotIdRef.current = selectedPlotId; return; }
    if (lastPlotIdRef.current !== null && lastPlotIdRef.current !== selectedPlotId) fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
    else if (!isEditModeRef.current) fetchPlotBasicDetails(selectedProjectId, selectedPlotId);
    lastPlotIdRef.current = selectedPlotId;
  }, [selectedProjectId, selectedPlotId, fetchPlotBasicDetails]);

  const fetchActiveProjects = async () => {
    setProjectsLoading(true);
    try { const r = await axiosInstance.get('/bookings/getActiveProject'); const d = r.data?.data || r.data || []; setProjects(Array.isArray(d) ? d : []); }
    catch (e: any) { console.error(e); setProjects([]); if (e.response?.status !== 404) toast.error("Failed to fetch projects"); }
    finally { setProjectsLoading(false); }
  };

  const fetchPaymentPlatforms = async () => {
    setPaymentPlatformsLoading(true);
    try { const r = await axiosInstance.get('/payment/get-payment-Platforms'); const d = r.data?.data?.platforms || []; setPaymentPlatforms(Array.isArray(d) ? d : []); }
    catch (e: any) { console.error(e); setPaymentPlatforms([]); }
    finally { setPaymentPlatformsLoading(false); }
  };

  const leadOptions: DropdownOption[] = useMemo(() => leads.map(lead => ({
    label: lead.name ? `${lead.name}${lead.phone ? ` - ${lead.phone}` : ''} (ID: ${lead.id})` : lead.phone ? `${lead.phone} (ID: ${lead.id})` : `Lead ID: ${lead.id}`,
    value: lead.id,
  })), [leads]);

  const projectOptions: DropdownOption[] = useMemo(() => projects.map(p => ({ label: p.title || p.name || `Project ${p.id}`, value: p.id })), [projects]);

  const plotOptions = useMemo(() => {
    if (!plots || !Array.isArray(plots) || plots.length === 0) return [];
    return [...plots].sort((a: any, b: any) => {
      const aA = a.status?.toLowerCase() === "available"; const bA = b.status?.toLowerCase() === "available";
      if (aA && !bA) return -1; if (!aA && bA) return 1; return 0;
    }).map((p: any) => ({
      label: `Plot ${p.plotNumber} - ${p.plotSize} Sq.Yd (${p.status || "Available"})`,
      value: p.id,
      disabled: ["booked", "hold", "sold", "company reserved"].includes(p.status?.toLowerCase()),
    }));
  }, [plots]);

  const availablePlotsCount = useMemo(() => (!plots || !Array.isArray(plots)) ? 0 : plots.filter((p: any) => p.status?.toLowerCase() === "available" || !p.status).length, [plots]);
  const platformOptions = useMemo(() => paymentPlatforms.map(p => ({ label: p.platform_name, value: p.id })), [paymentPlatforms]);

  const statusOptions: DropdownOption[] = [{ label: "Pending", value: "pending" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }];
  const genderOptions: DropdownOption[] = [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }];

  useEffect(() => {
    if (isOpen) { setLeadSearchQuery(""); setLeadsPage(1); setInitialLeadsLoaded(false); fetchActiveProjects(); fetchPaymentPlatforms(); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData?.projectTitle && projects.length > 0) {
      const p = projects.find(p => p.title === initialData.projectTitle || p.name === initialData.projectTitle);
      if (p) setValue("projectId", p.id);
    }
  }, [isOpen, initialData, projects, setValue]);

  useEffect(() => {
    if (initialData?.plotNumber && plots.length > 0) {
      const p = plots.find((p: any) => String(p.plotNumber) === String(initialData.plotNumber));
      if (p) setValue("plotId", p.id);
    }
  }, [plots, initialData, setValue]);

  const prevProjectRef = useRef<number | null>(null);
  useEffect(() => { if (selectedProjectId) dispatch(fetchPlots({ projectId: selectedProjectId, page: 1, limit: 600 })); }, [selectedProjectId, dispatch]);
  useEffect(() => {
    if (prevProjectRef.current !== null && prevProjectRef.current !== selectedProjectId) { setValue("plotId", null); skipPlotFetchRef.current = false; }
    prevProjectRef.current = selectedProjectId;
  }, [selectedProjectId, setValue]);

  useEffect(() => { if (!cpNameValue || cpNameValue.trim() === "" || cpNameValue.toLowerCase() === "n/a") setValue("remark", ""); }, [cpNameValue, setValue]);

  useEffect(() => {
    if (isOpen && initialData) {
      isEditModeRef.current = true;
      skipPlotFetchRef.current = true;
      lastPlotIdRef.current = initialData.plotId || null;

      const paymentPlatformId = initialData.payment_platform_id || initialData.paymentPlatformId || initialData.platform_id || initialData.paymentPlatform?.id || "";

      if (initialData.leadId) {
        const lead: Lead = { id: initialData.leadId, name: initialData.name, phone: initialData.phone };
        setLeads(prev => { const exists = prev.some(l => l.id === lead.id); return exists ? prev : [lead, ...prev]; });
      }
      if (initialData.projectId) dispatch(fetchPlots({ projectId: initialData.projectId, page: 1, limit: 500 }));

      reset({
        leadId: initialData.leadId || null,
        name: initialData.name || "",
        phone: initialData.phone || "",
        gender: initialData.gender || "",
        projectId: initialData.projectId || null,
        plotId: initialData.plotId || null,
        plotSize: initialData.plotSize || "",
        price: initialData.price || initialData.totalPlotAmount || "",
        onlinePrice: initialData.onlinePrice || initialData.onlinePlotAmount || initialData.online_price || "",
        creditPoint: initialData.creditPoint || initialData.creditPointAmount || initialData.credit_point || initialData.credit_price || "",
        bookingAmount: initialData.bookingAmount || "",
        status: initialData.status || "pending",
        payment_reference: initialData.payment_reference || initialData.paymentReference || "",
        payment_platform_id: paymentPlatformId,
        cpName: initialData.cpName || initialData.cp_name || "",
        remark: initialData.remark || "",
        address: initialData.address || "",
        aadharFront: null, aadharBack: null, panFront: null,
      });

      setTimeout(() => { }, 150);

    } else if (isOpen && !initialData) {
      isEditModeRef.current = false;
      skipPlotFetchRef.current = false;
      lastPlotIdRef.current = null;
      setAadharFrontPreview(null); setAadharBackPreview(null); setPanFrontPreview(null);

      reset({
        leadId: null, name: "", phone: "", gender: "",
        projectId: null, plotId: null, plotSize: "", price: "",
        onlinePrice: "", creditPoint: "", bookingAmount: "",
        status: "pending", payment_reference: "", payment_platform_id: "",
        cpName: "", remark: "", address: "",
        aadharFront: null, aadharBack: null, panFront: null,
      });

      setTimeout(() => { }, 150);
    }
  }, [isOpen, initialData, reset, dispatch]);

  const handleClose = () => {
    reset(); setLeadSearchQuery(""); setLeads([]); setInitialLeadsLoaded(false); setLeadsPage(1);
    setAadharFrontPreview(null); setAadharBackPreview(null); setPanFrontPreview(null);
    isEditModeRef.current = false; skipPlotFetchRef.current = false; lastPlotIdRef.current = null;
    onClose();
  };

  const onSubmit = async (data: LeadFormValues) => {
    const bookingId = initialData?.id || initialData?._id;
    const formData = new FormData();
    formData.append("leadId", String(Number(data.leadId)));
    formData.append("projectId", String(Number(data.projectId)));
    formData.append("plotId", String(Number(data.plotId)));
    formData.append("plotSize", String(data.plotSize || ""));
    formData.append("price", String(data.price || ""));
    formData.append("onlinePrice", String(data.onlinePrice || ""));
    formData.append("creditPoint", String(data.creditPoint || ""));
    formData.append("bookingAmount", String(data.bookingAmount));
    formData.append("name", data.name.trim());
    formData.append("phone", data.phone.trim());
    formData.append("gender", data.gender || "");
    formData.append("cpName", data.cpName || "");
    formData.append("remark", data.remark || "");
    formData.append("payment_reference", data.payment_reference || "");
    formData.append("status", data.status);
    formData.append("address", data.address || "");
    if (data.payment_platform_id) formData.append("payment_platform_id", String(Number(data.payment_platform_id)));
    if (data.aadharFront) formData.append("aadharFront", data.aadharFront);
    if (data.aadharBack) formData.append("aadharBack", data.aadharBack);
    if (data.panFront) formData.append("panFront", data.panFront);

    setSubmitLoading(true);
    try {
      let response;
      if (bookingId) {
        response = await axiosInstance.put(`${API_BASE_URL}/bookings/updateBooking/${bookingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Booking updated successfully!");
      } else {
        response = await axiosInstance.post(`${API_BASE_URL}/bookings/addBooking`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Booking created successfully!");
      }
      onSave(response.data);
      handleClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || (bookingId ? "Failed to update booking" : "Failed to create booking");
      toast.error(msg);
    } finally { setSubmitLoading(false); }
  };

  if (!isOpen) return null;

  const panUrl = initialData?.panCardNumber?.startsWith?.('http') && initialData?.panCardNumber?.length > 20
    ? initialData.panCardNumber
    : initialData?.panCard?.startsWith?.('http') ? initialData.panCard
      : initialData?.pan_card?.startsWith?.('http') ? initialData.pan_card
        : null;

  const aadharFrontUrl = initialData?.aadharCardFrontImage
    || initialData?.aadharFrontImage
    || initialData?.aadhar_front_image
    || initialData?.aadharFront
    || null;

  const aadharBackUrl = initialData?.aadharCardBackImage
    || initialData?.aadharBackImage
    || initialData?.aadhar_back_image
    || initialData?.aadharBack
    || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {initialData ? "Edit Booking" : "Add New Booking"}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-light">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lead <span className="text-red-500">*</span></label>
              <Controller name="leadId" control={control} rules={{ required: "Lead is required" }} render={({ field }) => (
                <SearchableLeadDropdown options={leadOptions} selected={leadOptions.find(o => o.value === field.value) || null} onChange={val => field.onChange(val?.value || null)} onSearchChange={handleLeadSearchChange} onLoadMore={loadMoreLeads} hasMore={hasMoreLeads} placeholder={leadsLoading && !initialLeadsLoaded ? "Loading leads..." : "Search or select lead..."} disabled={false} isLoading={leadsLoading} totalCount={totalLeadsCount} />
              )} />
              {errors.leadId && <p className="text-red-500 text-xs mt-0.5">{errors.leadId.message}</p>}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
              <input type="text" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" }, maxLength: { value: 100, message: "Name cannot exceed 100 characters" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700" placeholder="Enter name" disabled={leadDetailsLoading} />
              {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
              <input type="tel" {...register("phone", { required: "Phone number is required", pattern: { value: /^(\+91[\s-]?)?[6-9]\d{9}$/, message: "Enter valid Indian mobile number" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700" placeholder="9876543210" maxLength={13} disabled={true} />
              {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>}
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Controller name="status" control={control} render={({ field }) => (
                <CommonDropdown options={statusOptions} selected={statusOptions.find(o => o.value === field.value) || statusOptions[0]} onChange={(val: any) => field.onChange(val?.value)} placeholder="Select Status" disabled={true} />
              )} />
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project <span className="text-red-500">*</span></label>
              <Controller name="projectId" control={control} rules={{ required: "Project is required" }} render={({ field }) => (
                <CommonDropdown options={projectOptions} selected={projectOptions.find(o => o.value === field.value) || null} onChange={(val: any) => field.onChange(val?.value || null)} placeholder={projectsLoading ? "Loading Projects..." : "Select Project"} allowClear disabled={projectsLoading} />
              )} />
              {errors.projectId && <p className="text-red-500 text-xs mt-0.5">{errors.projectId.message}</p>}
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot <span className="text-red-500">*</span></label>
              <Controller name="plotId" control={control} rules={{ required: "Plot is required" }} render={({ field }) => (
                <CommonDropdown options={plotOptions} selected={plotOptions.find(o => o.value === field.value) || null} onChange={(val: any) => field.onChange(val?.value || null)} placeholder={!selectedProjectId ? "Select Project First" : plotsLoading ? "Loading Plots..." : plotOptions.length === 0 ? "No Plots Available" : "Select Plot"} allowClear disabled={!selectedProjectId || plotsLoading} />
              )} />
              {errors.plotId && <p className="text-red-500 text-xs mt-0.5">{errors.plotId.message}</p>}
              {!selectedProjectId && <p className="text-yellow-600 text-xs mt-0.5">Select a project first</p>}
              {selectedProjectId && plotsLoading && <p className="text-orange-600 text-xs mt-0.5">Loading plots...</p>}
              {selectedProjectId && !plotsLoading && availablePlotsCount > 0 && <p className="text-green-600 text-xs mt-0.5">{availablePlotsCount} available plots</p>}
              {selectedProjectId && !plotsLoading && availablePlotsCount === 0 && <p className="text-orange-600 text-xs mt-0.5">No available plots</p>}
            </div>

            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Size (Sq.Yd)</label>
                <input type="text" {...register("plotSize")} placeholder={plotDetailsLoading ? "Loading..." : "Enter plot size"} className="w-full h-11 px-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" disabled={plotDetailsLoading} />
              </div>
            )}

            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                <input type="text" {...register("price")} placeholder={plotDetailsLoading ? "Loading..." : "Enter price"} className="w-full h-11 px-3 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500" disabled={plotDetailsLoading} />
              </div>
            )}

            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Online Price</label>
                <input type="text" {...register("onlinePrice")} placeholder={plotDetailsLoading ? "Loading..." : "Enter online price"} className="w-full h-11 px-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500" disabled={plotDetailsLoading} />
              </div>
            )}

            {selectedProjectId && selectedPlotId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit Price</label>
                <input type="text" {...register("creditPoint")} placeholder={plotDetailsLoading ? "Loading..." : "Enter credit price"} className="w-full h-11 px-3 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500" disabled={plotDetailsLoading} />
              </div>
            )}


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Booking Amount <span className="text-red-500">*</span></label>
              <input type="number" {...register("bookingAmount", { required: "Booking amount is required", min: { value: 1, message: "Amount must be greater than 0" }, max: { value: 100000000, message: "Amount cannot exceed 10 Crore" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500" placeholder="500000" />
              {errors.bookingAmount && <p className="text-red-500 text-xs mt-0.5">{errors.bookingAmount.message}</p>}
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender <span className="text-red-500">*</span></label>
              <Controller name="gender" control={control} rules={{ validate: value => (value && value.trim() !== "") || "Gender is required" }} render={({ field }) => (
                <CommonDropdown options={genderOptions} selected={genderOptions.find(o => o.value === field.value) || null} onChange={(val: any) => field.onChange(val?.value || "")} placeholder="Select Gender" allowClear />
              )} />
              {errors.gender && <p className="text-red-500 text-xs mt-0.5">{errors.gender.message}</p>}
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID <span className="text-red-500">*</span></label>
              <input type="text" {...register("payment_reference", { required: "Transaction ID is required", minLength: { value: 3, message: "Transaction ID too short" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500" placeholder="TXN123456" />
              {errors.payment_reference && <p className="text-red-500 text-xs mt-0.5">{errors.payment_reference.message}</p>}
            </div>


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Platform <span className="text-red-500">*</span></label>
              <Controller name="payment_platform_id" control={control} rules={{ required: "Platform required" }} render={({ field }) => {
                const sel = platformOptions.find(o => o.value && field.value && Number(o.value) === Number(field.value));
                return <CommonDropdown options={platformOptions} selected={sel || null} onChange={(v: any) => field.onChange(v?.value || "")} placeholder={paymentPlatformsLoading ? "Loading..." : "Select Platform"} disabled={paymentPlatformsLoading} />;
              }} />
              {errors.payment_platform_id && <p className="text-red-500 text-xs mt-0.5">{errors.payment_platform_id.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address <span className="text-red-500">*</span></label>
              <textarea {...register("address", { required: "Address is required", minLength: { value: 10, message: "Address too short" }, maxLength: { value: 300, message: "Address too long" } })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none" placeholder="Enter full address..." />
              {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address.message}</p>}
            </div>


            {initialData ? (
              <>
                <EditDocViewer label="PAN Card Front" url={panUrl} borderColor="border-green-400 dark:border-green-600" bgColor="bg-green-50 dark:bg-green-900/20" />
                <EditDocViewer label="Aadhar Card Front" url={aadharFrontUrl} borderColor="border-blue-400 dark:border-blue-600" bgColor="bg-blue-50 dark:bg-blue-900/20" />
                <EditDocViewer label="Aadhar Card Back" url={aadharBackUrl} borderColor="border-orange-400 dark:border-orange-600" bgColor="bg-orange-50 dark:bg-orange-900/20" />
              </>
            ) : (
              <>



                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aadhar Card Front <span className="text-red-500">*</span></label>
                  <Controller name="aadharFront" control={control} rules={{ required: "Aadhar front is required" }} render={({ field }) => (
                    <div className="relative">
                      <input type="file" accept="image/*,.pdf" id="aadharFront" className="hidden" onChange={e => { const f = e.target.files?.[0] || null; field.onChange(f); if (f?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => setAadharFrontPreview(r.result as string); r.readAsDataURL(f); } else setAadharFrontPreview(null); }} />
                      <label htmlFor="aadharFront" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg cursor-pointer bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        {aadharFrontPreview ? <img src={aadharFrontPreview} alt="Aadhar Front" className="h-full w-full object-contain rounded-lg p-1" /> : <div className="flex flex-col items-center gap-1"><span className="text-2xl">📤</span><span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Upload Aadhar Front</span><span className="text-xs text-gray-400">JPG, PNG or PDF</span></div>}
                      </label>
                      {field.value && <button type="button" onClick={() => { field.onChange(null); setAadharFrontPreview(null); const i = document.getElementById("aadharFront") as HTMLInputElement; if (i) i.value = ""; }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>}
                    </div>
                  )} />
                  {errors.aadharFront && <p className="text-red-500 text-xs mt-0.5">{errors.aadharFront.message}</p>}
                </div>


                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aadhar Card Back <span className="text-red-500">*</span></label>
                  <Controller name="aadharBack" control={control} rules={{ required: "Aadhar back is required" }} render={({ field }) => (
                    <div className="relative">
                      <input type="file" accept="image/*,.pdf" id="aadharBack" className="hidden" onChange={e => { const f = e.target.files?.[0] || null; field.onChange(f); if (f?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => setAadharBackPreview(r.result as string); r.readAsDataURL(f); } else setAadharBackPreview(null); }} />
                      <label htmlFor="aadharBack" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg cursor-pointer bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                        {aadharBackPreview ? <img src={aadharBackPreview} alt="Aadhar Back" className="h-full w-full object-contain rounded-lg p-1" /> : <div className="flex flex-col items-center gap-1"><span className="text-2xl">📤</span><span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Upload Aadhar Back</span><span className="text-xs text-gray-400">JPG, PNG or PDF</span></div>}
                      </label>
                      {field.value && <button type="button" onClick={() => { field.onChange(null); setAadharBackPreview(null); const i = document.getElementById("aadharBack") as HTMLInputElement; if (i) i.value = ""; }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>}
                    </div>
                  )} />
                  {errors.aadharBack && <p className="text-red-500 text-xs mt-0.5">{errors.aadharBack.message}</p>}
                </div>



                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PAN Card Front <span className="text-red-500">*</span></label>
                  <Controller name="panFront" control={control} rules={{ required: "PAN card is required" }} render={({ field }) => (
                    <div className="relative">
                      <input type="file" accept="image/*,.pdf" id="panFront" className="hidden" onChange={e => { const f = e.target.files?.[0] || null; field.onChange(f); if (f?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => setPanFrontPreview(r.result as string); r.readAsDataURL(f); } else setPanFrontPreview(null); }} />
                      <label htmlFor="panFront" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg cursor-pointer bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        {panFrontPreview ? <img src={panFrontPreview} alt="PAN" className="h-full w-full object-contain rounded-lg p-1" /> : <div className="flex flex-col items-center gap-1"><span className="text-2xl">📤</span><span className="text-xs text-green-600 dark:text-green-400 font-medium">Upload PAN Front</span><span className="text-xs text-gray-400">JPG, PNG or PDF</span></div>}
                      </label>
                      {field.value && <button type="button" onClick={() => { field.onChange(null); setPanFrontPreview(null); const i = document.getElementById("panFront") as HTMLInputElement; if (i) i.value = ""; }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>}
                    </div>
                  )} />
                  {errors.panFront && <p className="text-red-500 text-xs mt-0.5">{errors.panFront.message}</p>}
                </div>
              </>
            )}


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CP Name</label>
              <input type="text" {...register("cpName", { minLength: { value: 2, message: "CP Name must be at least 2 characters" }, maxLength: { value: 50, message: "CP Name cannot exceed 50 characters" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500" placeholder="Mitesh Patel" />
              {errors.cpName && <p className="text-red-500 text-xs mt-0.5">{errors.cpName.message}</p>}
            </div>

            {cpNameValue && cpNameValue.trim() !== "" && cpNameValue.toLowerCase() !== "n/a" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label>
                <input type="text" {...register("remark", { minLength: { value: 3, message: "Remark too short" }, maxLength: { value: 200, message: "Remark too long" } })} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500" placeholder="Enter Remarks" />
                {errors.remark && <p className="text-red-500 text-xs mt-0.5">{errors.remark.message}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-5 h-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled={submitLoading}>Cancel</button>
            <button type="submit" className={`px-5 h-10 text-white rounded-lg text-sm font-medium shadow-sm transition-colors ${submitLoading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`} disabled={submitLoading}>
              {submitLoading ? "Saving..." : initialData ? "Update Booking" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;