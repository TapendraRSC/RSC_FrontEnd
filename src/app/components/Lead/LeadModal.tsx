'use client';
import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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

interface ComprehensiveLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
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
  const { leadPlatforms } = useSelector((state: RootState) => state.leadPlateform);
  const { list: projectList } = useSelector((state: RootState) => state.projectStatus);
  const { plots } = useSelector((state: RootState) => state.plotSlice);
  const { list: stageList } = useSelector((state: RootState) => state.leadStages);
  const { list: statusList } = useSelector((state: RootState) => state.statuses);

  // Get current user and role from Redux instead of localStorage
  const currentUser = useSelector((state: RootState) => state.auth?.user || {});
  const currentRole = useSelector((state: RootState) => state.auth?.role || "");


  console.log(currentRole, "currentRole");

  const actualUsersData = useMemo(() => {
    if (Array.isArray(users)) return users;
    if (users?.data) {
      if (Array.isArray(users.data)) return users.data;
      if (users.data?.data && Array.isArray(users.data.data)) return users.data.data;
    }
    return [];
  }, [users]);

  const assignedToOptions = useMemo(
    () => actualUsersData.map((user: any) => ({ label: user.name, value: user.id })),
    [actualUsersData]
  );
  const actualPlatformOptions = useMemo(
    () => leadPlatforms.map((platform: any) => ({ label: platform.platformType, value: platform.id })),
    [leadPlatforms]
  );
  const projectStatusOptions = useMemo(() => {
    const projects = projectList?.projects || [];
    return projects.map((p: any) => ({ label: p.title, value: p.id }));
  }, [projectList]);
  const plotOptions = useMemo(() => plots.map((plot: any) => ({ label: plot.plotNumber, value: plot.id })), [plots]);
  const leadStageOptions = useMemo(
    () => (stageList || []).map((s: any) => ({ label: s.type, value: s.id })),
    [stageList]
  );
  const leadStatusOptions = useMemo(
    () => (statusList || []).map((s: any) => ({ label: s.type, value: s.id })),
    [statusList]
  );
  const currentStatusOptions = useMemo(
    () => [
      { label: "Interested", value: "interested" },
      { label: "Not Interested", value: "not interested" },
    ],
    []
  );

  const isAdmin = useMemo(() => {
    return currentRole?.toLowerCase() === "admin";
  }, [currentRole]);

  const filteredAssignedToOptions = useMemo(() => {
    // If not Admin, only show current user in dropdown
    if (!isAdmin) {
      const userOption = assignedToOptions.find((u: any) => u.value === currentUser.id);
      return userOption ? [userOption] : [];
    }
    return assignedToOptions;
  }, [assignedToOptions, currentUser, isAdmin]);

  const defaultValues = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      assignedTo: !isAdmin ? currentUser.id : null,
      platformId: null,
      projectStatusId: null,
      plotId: null,
      leadStageId: null,
      leadStatusId: null,
      interestStatus: null,
    }),
    [currentUser, isAdmin]
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control, clearErrors } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadPlatforms({ page: 1, limit: 100, search: "" }));
      dispatch(fetchProjectStatuses({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadStages({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchStatuses({ page: 1, limit: 100, searchValue: "" }));
    }
  }, [dispatch, isOpen]);

  const findOptionByName = (options: any[], name: string) => {
    if (!name) return null;
    return options.find((opt: any) =>
      opt.label?.toLowerCase() === name.toLowerCase()
    );
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        if (initialData.plotProjectId) {
          dispatch(fetchPlots({ projectId: initialData.plotProjectId, page: 1, limit: 100, search: "" }));
        }

        const mappedData = {
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

        setTimeout(() => {
          if (initialData.assignedTo) {
            const assignedOption = findOptionByName(assignedToOptions, initialData.assignedTo);
            if (assignedOption) {
              setValue("assignedTo", assignedOption.value);
            }
          }

          if (initialData.platformType || initialData.source) {
            const platformName = initialData.platformType || initialData.source;
            const platformOption = findOptionByName(actualPlatformOptions, platformName);
            if (platformOption) {
              setValue("platformId", platformOption.value);
            }
          }

          if (initialData.stage) {
            const stageOption = findOptionByName(leadStageOptions, initialData.stage);
            if (stageOption) {
              setValue("leadStageId", stageOption.value);
            }
          }

          if (initialData.status) {
            const statusOption = findOptionByName(leadStatusOptions, initialData.status);
            if (statusOption) {
              setValue("leadStatusId", statusOption.value);
            }
          }
        }, 500);

      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, initialData, reset, defaultValues, dispatch, assignedToOptions, actualPlatformOptions, leadStageOptions, leadStatusOptions, setValue]);

  useEffect(() => {
    if (initialData?.plotNumber && plots.length > 0) {
      const plotOption = findOptionByName(plots.map(p => ({ ...p, label: p.plotNumber })), initialData.plotNumber);
      if (plotOption) {
        setValue("plotId", plotOption.id);
      }
    }
  }, [plots, initialData, setValue]);

  useEffect(() => {
    if (!isAdmin && currentUser?.id) {
      setValue('assignedTo', currentUser.id);
    }
  }, [isAdmin, currentUser, setValue]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const selectedProjectId = watch("projectStatusId");
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchPlots({ projectId: selectedProjectId, page: 1, limit: 100, search: "" }));
      if (!initialData || selectedProjectId !== initialData.plotProjectId) {
        setValue("plotId", null);
      }
    } else {
      setValue("plotId", null);
    }
  }, [dispatch, selectedProjectId, setValue, initialData]);

  const onSubmit = (data: any) => onSave(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 dark:bg-black/60" style={{ margin: "0px" }}>
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
            <FormInput name="name" label="Name" required placeholder="Enter Name" register={register} errors={errors} clearErrors={clearErrors} />

            <FormInput
              name="email"
              label="Email"
              placeholder="Enter email"
              register={register}
              errors={errors}
              setValue={setValue}
              clearErrors={clearErrors}
              validation={{
                validate: (value: string) => {
                  if (!value || value.trim() === "" || value.toUpperCase() === "N/A") {
                    return true;
                  }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return emailRegex.test(value) || "Please enter a valid email address";
                }
              }}
            />

            <FormPhoneInput
              name="phone"
              label="Phone"
              required
              placeholder="Enter phone number"
              register={register}
              errors={errors}
              clearErrors={clearErrors}
              setValue={setValue}
              control={control}
              maxLength={10}
              validation={{ required: "Phone number is required" }}
            />
            <FormInput name="city" label="City" placeholder="Enter City" register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="state" label="State" placeholder="Enter State" register={register} errors={errors} clearErrors={clearErrors} />
            <div>
              <label className="block text-sm font-medium mb-1">Current Status</label>
              <Controller
                name="interestStatus"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={currentStatusOptions}
                    selected={currentStatusOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(val: any) => field.onChange(val?.value || null)}
                    placeholder="Select Current Status"
                    error={!!errors.interestStatus}
                    allowClear={true}
                  />
                )}
              />
              {errors.interestStatus && <p className="mt-1 text-sm text-red-600">{errors.interestStatus.message as string}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assigned To <span className="text-red-500">*</span>
              </label>

              {isAdmin ? (
                <Controller
                  name="assignedTo"
                  control={control}
                  rules={{ required: "Assigned To is required" }}
                  render={({ field }) => (
                    <CommonDropdown
                      options={filteredAssignedToOptions}
                      selected={filteredAssignedToOptions.find((opt: any) => opt.value === field.value) || null}
                      onChange={(value: any) => field.onChange(value?.value || null)}
                      placeholder="Select Assignee"
                      error={!!errors.assignedTo}
                      allowClear={true}
                    />
                  )}
                />
              ) : (
                <>
                  <Controller
                    name="assignedTo"
                    control={control}
                    rules={{ required: "Assigned To is required" }}
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed">
                    {currentUser?.name || 'Current User'}
                  </div>
                </>
              )}

              {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message as string}</p>}
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
                    selected={actualPlatformOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(value: any) => field.onChange(value?.value || null)}
                    placeholder="Select Platform"
                    error={!!errors.platformId}
                    allowClear={true}
                  />
                )}
              />
              {errors.platformId && <p className="mt-1 text-sm text-red-600">{errors.platformId.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lead Status</label>
              <Controller
                name="leadStatusId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={leadStatusOptions}
                    selected={leadStatusOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(value: any) => field.onChange(value?.value || null)}
                    placeholder="Select Lead Status"
                    error={!!errors.leadStatusId}
                    allowClear={true}
                  />
                )}
              />
              {errors.leadStatusId && <p className="mt-1 text-sm text-red-600">{errors.leadStatusId.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lead Stage</label>
              <Controller
                name="leadStageId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={leadStageOptions}
                    selected={leadStageOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(value: any) => field.onChange(value?.value || null)}
                    placeholder="Select Lead Stage"
                    error={!!errors.leadStageId}
                    allowClear={true}
                  />
                )}
              />
              {errors.leadStageId && <p className="mt-1 text-sm text-red-600">{errors.leadStageId.message as string}</p>}
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