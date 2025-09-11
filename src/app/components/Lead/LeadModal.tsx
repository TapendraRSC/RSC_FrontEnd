'use client';

import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CommonDropdown from "../Common/CommonDropdown";
import FormInput from "../Common/FormInput";
import { exportUsers } from "../../../../store/userSlice";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchLeadPlatforms } from "../../../../store/leadPlateformSlice";
import { fetchProjectStatuses } from "../../../../store/projectSlice";
import { fetchPlots } from "../../../../store/plotSlice";
import { fetchLeadStages } from "../../../../store/leadStageSlice";
import { fetchStatuses } from "../../../../store/statusMasterSlice";
import FormPhoneInput from "../Common/FormPhoneInput";

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

  // ------------------ Redux selectors ------------------
  const { data: users = [] } = useSelector((state: RootState) => state.users);
  const { leadPlatforms } = useSelector((state: RootState) => state.leadPlateform);
  const { list: projectList } = useSelector((state: RootState) => state.projectStatus);
  const { plots } = useSelector((state: RootState) => state.plotSlice);
  const { list: stageList } = useSelector((state: RootState) => state.leadStages);
  const { list: statusList } = useSelector((state: RootState) => state.statuses);

  // ------------------ Dropdown options ------------------
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

  // ------------------ New Current Status options ------------------
  const currentStatusOptions = useMemo(
    () => [
      { label: "Interested", value: "Interested" },
      { label: "Not Interested", value: "Not Interested" },
    ],
    []
  );

  // ------------------ Current user ------------------
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const filteredAssignedToOptions = useMemo(() => {
    if (currentUser.roleId === 36) {
      const userOption = assignedToOptions.find((u: any) => u.value === currentUser.id);
      return userOption ? [userOption] : [];
    }
    return assignedToOptions;
  }, [assignedToOptions, currentUser]);

  // ------------------ React Hook Form ------------------
  const defaultValues = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      assignedTo: currentUser.roleId === 36 ? currentUser.id : null,
      platformId: null,
      projectStatusId: null,
      plotId: null,
      leadStageId: null,
      leadStatusId: null,
      interestStatus: null, // ✅ Default value
    }),
    [currentUser]
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control, clearErrors } = useForm({
    defaultValues,
  });

  // ------------------ Fetch data when modal opens ------------------
  useEffect(() => {
    if (isOpen) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadPlatforms({ page: 1, limit: 100, search: "" }));
      dispatch(fetchProjectStatuses({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadStages({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchStatuses({ page: 1, limit: 100, searchValue: "" }));
    }
  }, [dispatch, isOpen]);

  // ------------------ Reset form on modal open or initialData changes ------------------
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...defaultValues,
          ...initialData,
          projectStatusId: initialData.plotProjectId || null,
          plotId: null,
          interestStatus: initialData.interestStatus || "Interested",
        });

        if (initialData.plotProjectId) {
          dispatch(fetchPlots({ projectId: initialData.plotProjectId, page: 1, limit: 100, search: "" }));
        }
      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, initialData, reset, defaultValues, dispatch]);

  // ------------------ Set plot value after plots are loaded (edit case) ------------------
  useEffect(() => {
    if (initialData?.plotId && plots.length > 0) {
      const plotExists = plots.find((p: any) => p.id === initialData.plotId);
      if (plotExists) {
        setValue("plotId", initialData.plotId);
      }
    }
  }, [plots, initialData, setValue]);

  // ------------------ Reset form on close ------------------
  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  // ------------------ Fetch plots when project changes ------------------
  const selectedProjectId = watch("projectStatusId");
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchPlots({ projectId: selectedProjectId, page: 1, limit: 100, search: "" }));
      setValue("plotId", null);
    } else {
      setValue("plotId", null);
    }
  }, [dispatch, selectedProjectId, setValue]);

  // ------------------ Submit ------------------
  const onSubmit = (data: any) => onSave(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60" style={{ margin: "0px" }}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {initialData ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="Name" required placeholder="Enter Name" register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="email" label="Email" type="email" placeholder="Enter Email" register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput
              name="phone"
              label="Phone"
              type="number"
              required
              placeholder="Enter Phone"
              register={register}
              errors={errors}
              clearErrors={clearErrors}
              maxLength={10}
              validation={{
                required: "Phone number is required",
                validate: {
                  is10Digits: (value: any) => (value && value.toString().length === 10) || "Phone number must be exactly 10 digits",
                },
              }}
            />
            <FormInput name="city" label="City" placeholder="Enter City" register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="state" label="State" placeholder="Enter State" register={register} errors={errors} clearErrors={clearErrors} />
            {/* ✅ Current Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Status
              </label>
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

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned To */}
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
                    selected={filteredAssignedToOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(value: any) => field.onChange(value?.value || null)}
                    placeholder="Select Assignee"
                    error={!!errors.assignedTo}
                    allowClear={true}
                  />
                )}
              />
              {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message as string}</p>}
            </div>

            {/* Platform */}
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

            {/* Project */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Project
              </label>
              <Controller
                name="projectStatusId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={projectStatusOptions}
                    selected={projectStatusOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(value: any) => field.onChange(value?.value || null)}
                    placeholder="Select Project"
                    error={!!errors.projectStatusId}
                    allowClear={true}
                  />
                )}
              />
              {errors.projectStatusId && <p className="mt-1 text-sm text-red-600">{errors.projectStatusId.message as string}</p>}
            </div>

            {/* Plot */}
            <div>
              <label className="block text-sm font-medium mb-1">Plot</label>
              <Controller
                name="plotId"
                control={control}
                render={({ field }) => (
                  <CommonDropdown
                    options={plotOptions}
                    selected={plotOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(val: any) => field.onChange(val?.value || null)}
                    placeholder="Select Plot"
                    allowClear={true}
                  />
                )}
              />
            </div>

            {/* Lead Stage */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Lead Stage
              </label>
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

            {/* Lead Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Lead Status
              </label>
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


          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
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
