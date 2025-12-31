'use client';
import React, { useEffect, useMemo, useCallback } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CommonDropdown from "../Common/CommonDropdown";
import FormInput from "../Common/FormInput";
import FormPhoneInput from "../Common/FormPhoneInput";
import { exportUsers } from "../../../../store/userSlice";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchLeadPlatforms } from "../../../../store/leadPlateformSlice";
import { fetchProjectStatuses } from "../../../../store/projectSlice";
import { fetchPlots } from "../../../../store/plotSlice";
import { fetchLeadStages } from "../../../../store/leadStageSlice";
import { fetchStatuses } from "../../../../store/statusMasterSlice";
import { INDIA_STATE_CITY } from "../Common/indiaStateCity";

interface DropdownOption {
  label: string;
  value: string | number;
  key?: string;
}

interface ComprehensiveLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  assignedTo: number | null;
  platformId: number | null;
  projectStatusId: number | null;
  plotId: number | null;
  leadStageId: number | null;
  leadStatusId: number | null;
  interestStatus: string | null;
}

const ComprehensiveLeadModal: React.FC<ComprehensiveLeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: users = [] } = useSelector((state: RootState) => state.users);
  const { leadPlatforms = [] } = useSelector((state: RootState) => state.leadPlateform);
  const { list: projectList = { projects: [] } } = useSelector((state: RootState) => state.projectStatus);
  const { plots = [] } = useSelector((state: RootState) => state.plotSlice);
  const { list: stageList = [] } = useSelector((state: RootState) => state.leadStages);
  const { list: statusList = [] } = useSelector((state: RootState) => state.statuses);

  const currentUser = useSelector((state: RootState) => state.auth?.user || {}) as any;
  const currentRole = useSelector((state: RootState) => state.auth?.role || "") as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    clearErrors,
  }: UseFormReturn<LeadFormValues> = useForm<LeadFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      assignedTo: null,
      platformId: null,
      projectStatusId: null,
      plotId: null,
      leadStageId: null,
      leadStatusId: null,
      interestStatus: null,
    },
  });

  const selectedState = watch("state");
  const selectedProjectId = watch("projectStatusId");

  const actualUsersData = useMemo(() => {
    if (Array.isArray(users)) return users;
    if (users?.data && Array.isArray(users.data)) return users.data;
    if (users?.data?.data && Array.isArray(users.data.data)) return users.data.data;
    return [];
  }, [users]) as any[];

  const assignedToOptions: DropdownOption[] = useMemo(
    () => actualUsersData.map((user: any) => ({ label: user.name || '', value: user.id })),
    [actualUsersData]
  );

  const actualPlatformOptions: DropdownOption[] = useMemo(
    () => leadPlatforms.map((platform: any) => ({
      label: platform.platformType || '',
      value: platform.id,
    })),
    [leadPlatforms]
  );

  const projectStatusOptions: DropdownOption[] = useMemo(() => {
    const projects = (projectList as any)?.projects || [];
    return projects.map((p: any) => ({ label: p.title || '', value: p.id }));
  }, [projectList]);

  const plotOptions: DropdownOption[] = useMemo(
    () => plots.map((plot: any) => ({ label: plot.plotNumber || '', value: plot.id })),
    [plots]
  );

  const leadStageOptions: DropdownOption[] = useMemo(
    () => (stageList || []).map((s: any) => ({ label: s.type || '', value: s.id })),
    [stageList]
  );

  const leadStatusOptions: DropdownOption[] = useMemo(
    () => (statusList || []).map((s: any) => ({ label: s.type || '', value: s.id })),
    [statusList]
  );

  const currentStatusOptions: DropdownOption[] = useMemo(
    () => [
      { label: "Interested", value: "interested" },
      { label: "Not Interested", value: "not interested" },
    ],
    []
  );

  const stateOptions: DropdownOption[] = useMemo(
    () => Object.keys(INDIA_STATE_CITY).map((state) => ({ label: state, value: state })),
    []
  );

  const cityOptions: DropdownOption[] = useMemo(() => {
    if (selectedState && INDIA_STATE_CITY[selectedState as keyof typeof INDIA_STATE_CITY]) {
      const cities = INDIA_STATE_CITY[selectedState as keyof typeof INDIA_STATE_CITY] || [];
      const uniqueCities = Array.from(new Set(cities)).map((city: string, index: number) => ({
        label: city,
        value: city,
        key: `${city.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      }));
      return uniqueCities;
    }
    return [];
  }, [selectedState]);

  const isAdmin = useMemo(
    () => currentRole?.toLowerCase() === "admin",
    [currentRole]
  );

  const filteredAssignedToOptions: DropdownOption[] = useMemo(() => {
    if (!isAdmin) {
      const userOption = assignedToOptions.find((u: DropdownOption) => u.value === currentUser.id);
      return userOption ? [userOption] : [];
    }
    return assignedToOptions;
  }, [assignedToOptions, currentUser?.id, isAdmin]);

  const defaultValues: LeadFormValues = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      assignedTo: !isAdmin ? (currentUser.id as number) ?? null : null,
      platformId: null,
      projectStatusId: null,
      plotId: null,
      leadStageId: null,
      leadStatusId: null,
      interestStatus: null,
    }),
    [currentUser.id, isAdmin]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadPlatforms({ page: 1, limit: 100, search: "" }));
      dispatch(fetchProjectStatuses({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchPlots({ projectId: initialData?.plotProjectId, page: 1, limit: 100, search: "" }));
      dispatch(fetchLeadStages({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchStatuses({ page: 1, limit: 100, searchValue: "" }));
    }
  }, [dispatch, isOpen, initialData?.plotProjectId]);

  const findOptionByName = useCallback((options: DropdownOption[], name: string): DropdownOption | null => {
    if (!name) return null;
    return options.find((opt: DropdownOption) => opt.label?.toLowerCase() === name.toLowerCase()) || null;
  }, []);

  useEffect(() => {
    if (isOpen && initialData) {
      const mappedData: LeadFormValues = {
        ...defaultValues,
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        city: initialData.city || "",
        state: initialData.state || "",
        interestStatus: initialData.interestStatus || null,
        projectStatusId: initialData.plotProjectId || null,
        assignedTo: null,
        platformId: null,
        plotId: null,
        leadStageId: null,
        leadStatusId: null,
      };

      reset(mappedData);

      const timeoutId = setTimeout(() => {
        if (initialData.assignedTo && assignedToOptions.length > 0) {
          const assignedOption = findOptionByName(assignedToOptions, initialData.assignedTo as string);
          if (assignedOption) setValue("assignedTo", assignedOption.value as number);
        }

        if (initialData.platformType || initialData.source) {
          const platformName = initialData.platformType || initialData.source;
          if (actualPlatformOptions.length > 0) {
            const platformOption = findOptionByName(actualPlatformOptions, platformName as string);
            if (platformOption) setValue("platformId", platformOption.value as number);
          }
        }

        if (initialData.stage && leadStageOptions.length > 0) {
          const stageOption = findOptionByName(leadStageOptions, initialData.stage as string);
          if (stageOption) setValue("leadStageId", stageOption.value as number);
        }

        if (initialData.status && leadStatusOptions.length > 0) {
          const statusOption = findOptionByName(leadStatusOptions, initialData.status as string);
          if (statusOption) setValue("leadStatusId", statusOption.value as number);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    } else if (isOpen) {
      reset(defaultValues);
    }
  }, [
    isOpen,
    initialData,
    reset,
    defaultValues,
    assignedToOptions,
    actualPlatformOptions,
    leadStageOptions,
    leadStatusOptions,
    setValue,
    findOptionByName,
  ]);

  useEffect(() => {
    if (initialData?.plotNumber && plots.length > 0) {
      const plotOption = findOptionByName(
        plots.map((p: any) => ({ label: p.plotNumber || '', value: p.id })),
        initialData.plotNumber as string
      );
      if (plotOption) setValue("plotId", plotOption.value as number);
    }
  }, [plots, initialData, setValue, findOptionByName]);

  useEffect(() => {
    if (!isAdmin && currentUser?.id) {
      setValue("assignedTo", currentUser.id as number);
    }
  }, [isAdmin, currentUser?.id, setValue]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(
        fetchPlots({ projectId: selectedProjectId as number, page: 1, limit: 100, search: "" })
      );
      setValue("plotId", null);
    }
  }, [dispatch, selectedProjectId, setValue]);

  useEffect(() => {
    setValue("city", "");
  }, [selectedState, setValue]);

  const onSubmit = (data: LeadFormValues) => onSave(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 dark:bg-black/60">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
            {initialData ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-xl sm:text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormInput
              name="name"
              label="Name"
              required
              placeholder="Enter Name"
              register={register}
              errors={errors}
              clearErrors={clearErrors}
            />

            <FormInput
              name="email"
              label="Email"
              placeholder="Enter email"
              register={register}
              errors={errors}
              clearErrors={clearErrors}
              validation={{
                validate: (value: string | number | null) => {
                  const stringValue = value?.toString() || "";
                  if (!stringValue || stringValue.trim() === "" || stringValue.toUpperCase() === "N/A") {
                    return true;
                  }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return emailRegex.test(stringValue) || "Please enter a valid email address";
                },
              }}
            />

            <FormPhoneInput
              name="phone"
              label="Phone"
              required
              placeholder="Enter phone number"
              control={control}
              errors={errors}
              clearErrors={clearErrors}
              setValue={setValue}
              maxLength={10}
              validation={{ required: "Phone number is required" }}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                State
                {/* <span className="text-red-500">*</span> */}
              </label>
              <Controller
                name="state"
                control={control}
                // rules={{ required: "State is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={stateOptions}
                    selected={stateOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(value) => {
                      field.onChange((value as any)?.value || "");
                      setValue("city", "");
                    }}
                    placeholder="Select State"
                    error={!!errors.state}
                    allowClear={true}
                  />
                )}
              />
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                City
                {/* <span className="text-red-500">*</span> */}
              </label>
              <Controller
                name="city"
                control={control}
                // rules={{ required: "City is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={cityOptions}
                    selected={cityOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(value) => field.onChange((value as any)?.value || "")}
                    placeholder={selectedState ? "Select City" : "First select state"}
                    error={!!errors.city}
                    allowClear={true}
                    disabled={!selectedState}
                  />
                )}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Status</label>
              <Controller
                name="interestStatus"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={currentStatusOptions}
                    selected={currentStatusOptions.find((opt) => opt.value === field.value) || null}
                    // onChange={(value: DropdownOption | null) => field.onChange(value?.value || null)}
                    onChange={(value) => field.onChange((value as any)?.value || null)}
                    placeholder="Select Current Status"
                    error={!!errors.interestStatus}
                    allowClear={true}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <Controller
                name="assignedTo"
                control={control}
                rules={{ required: "Assigned To is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={filteredAssignedToOptions}
                    selected={filteredAssignedToOptions.find((opt) => opt.value === field.value) || null}
                    // onChange={(value: DropdownOption | null) => field.onChange(value?.value || null)}
                    onChange={(value) => field.onChange((value as any)?.value || null)}
                    placeholder="Select Assignee"
                    error={!!errors.assignedTo}
                    allowClear={true}

                  />
                )}
              />
              {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Platform <span className="text-red-500">*</span>
              </label>
              <Controller
                name="platformId"
                control={control}
                rules={{ required: "Platform is required" }}
                render={({ field }) => (
                  <CommonDropdown
                    options={actualPlatformOptions}
                    selected={actualPlatformOptions.find((opt) => opt.value === field.value) || null}
                    // onChange={(value: DropdownOption | null) => field.onChange(value?.value || null)}
                    onChange={(value) => field.onChange((value as any)?.value || null)}
                    placeholder="Select Platform"
                    error={!!errors.platformId}
                    allowClear={true}
                  />
                )}
              />
              {errors.platformId && <p className="mt-1 text-sm text-red-600">{errors.platformId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lead Status</label>
              <Controller
                name="leadStatusId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={leadStatusOptions}
                    selected={leadStatusOptions.find((opt) => opt.value === field.value) || null}
                    // onChange={(value: DropdownOption | null) => field.onChange(value?.value || null)}
                    onChange={(value) => field.onChange((value as any)?.value || null)}
                    placeholder="Select Lead Status"
                    error={!!errors.leadStatusId}
                    allowClear={true}
                  />
                )}
              />
              {errors.leadStatusId && <p className="mt-1 text-sm text-red-600">{errors.leadStatusId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lead Stage</label>
              <Controller
                name="leadStageId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={leadStageOptions}
                    selected={leadStageOptions.find((opt) => opt.value === field.value) || null}
                    // onChange={(value: DropdownOption | null) => field.onChange(value?.value || null)}
                    onChange={(value) => field.onChange((value as any)?.value || null)}
                    placeholder="Select Lead Stage"
                    error={!!errors.leadStageId}
                    allowClear={true}
                  />
                )}
              />
              {errors.leadStageId && <p className="mt-1 text-sm text-red-600">{errors.leadStageId.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 sm:px-6 py-1.5 sm:py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : initialData ? "Update Lead" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensiveLeadModal;