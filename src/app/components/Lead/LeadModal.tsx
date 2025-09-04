'use client';

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  const { data: users = [], loading: usersLoading } = useSelector(
    (state: RootState) => state.users
  );

  const actualUsersData = useMemo(() => {
    if (Array.isArray(users)) return users;
    if (users?.data) {
      if (Array.isArray(users.data)) return users.data;
      if (users.data?.data && Array.isArray(users.data.data)) return users.data.data;
    }
    return [];
  }, [users]);

  const { leadPlatforms, loading: platformLoading } = useSelector(
    (state: RootState) => state.leadPlateform
  );

  const actualPlatformOptions = useMemo(() => {
    return leadPlatforms.map((platform: any) => ({
      label: platform.platformType,
      value: platform.id,
    }));
  }, [leadPlatforms]);

  const { list: projectList, loading: statusLoading } = useSelector(
    (state: RootState) => state.projectStatus
  );

  const projectStatusOptions = useMemo(() => {
    const projects = projectList?.projects || [];
    return projects.map((p: any) => ({
      label: p.title,
      value: p.id,
    }));
  }, [projectList]);

  const { plots, loading: plotsLoading } = useSelector(
    (state: RootState) => state.plotSlice
  );

  const plotOptions = useMemo(() => {
    return plots.map((plot: any) => ({
      label: plot.plotNumber,
      value: plot.id,
    }));
  }, [plots]);

  const { list: stageList, loading: stageLoading } = useSelector(
    (state: RootState) => state.leadStages
  );

  const leadStageOptions = useMemo(() => {
    const stages = stageList || [];
    return stages.map((s: any) => ({
      label: s.type,
      value: s.id,
    }));
  }, [stageList]);

  const { list: statusList, loading: leadStatusLoading } = useSelector(
    (state: RootState) => state.statuses
  );

  const leadStatusOptions = useMemo(() => {
    const statuses = statusList || [];
    return statuses.map((s: any) => ({
      label: s.type,
      value: s.id,
    }));
  }, [statusList]);

  useEffect(() => {
    if (isOpen) {
      dispatch(exportUsers({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadPlatforms({ page: 1, limit: 100, search: "" }));
      dispatch(fetchProjectStatuses({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchLeadStages({ page: 1, limit: 100, searchValue: "" }));
      dispatch(fetchStatuses({ page: 1, limit: 100, searchValue: "" }));
    }
  }, [dispatch, isOpen]);

  const assignedToOptions = useMemo(() => {
    return actualUsersData.map((user: any) => ({
      label: user.name,
      value: user.id,
    }));
  }, [actualUsersData]);

  // Get logged-in user from localStorage
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Filter AssignedTo options based on roleId
  const filteredAssignedToOptions = useMemo(() => {
    if (currentUser.roleId === 36) {
      const userOption = assignedToOptions.find(
        (u: any) => u.value === currentUser.id
      );
      return userOption ? [userOption] : [];
    }
    return assignedToOptions;
  }, [assignedToOptions, currentUser]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
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
    },
  });

  // Set default AssignedTo if roleId is 36
  useEffect(() => {
    if (currentUser.roleId === 36) {
      setValue("assignedTo", currentUser.id);
    }
  }, [currentUser, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        projectStatusId: initialData.plotProjectId || null,
        plotId: initialData.plotId || null,
      });
    } else if (isOpen) {
      reset();
    }
  }, [initialData, isOpen, reset]);

  const selectedProjectId = watch("projectStatusId");

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(
        fetchPlots({
          projectId: selectedProjectId,
          page: 1,
          limit: 100,
          search: "",
        })
      );
    }
  }, [dispatch, selectedProjectId]);

  const onSubmit = (data: any) => {
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" style={{ margin: "0px" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="Name" required placeholder="Enter Name"
              register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="email" label="Email" type="email" placeholder="Enter Email"
              register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="phone" label="Phone" type="tel" required placeholder="Enter Phone"
              register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="city" label="City" placeholder="Enter City"
              register={register} errors={errors} clearErrors={clearErrors} />
            <FormInput name="state" label="State" placeholder="Enter State"
              register={register} errors={errors} clearErrors={clearErrors} />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To *</label>
              <CommonDropdown
                options={filteredAssignedToOptions}
                selected={
                  watch("assignedTo")
                    ? filteredAssignedToOptions.find(
                      (opt: any) => opt.value === watch("assignedTo")
                    ) || null
                    : null
                }
                onChange={(val: any) => setValue("assignedTo", val?.value || null)}
                placeholder={usersLoading ? "Loading..." : "Select Assignee"}
                error={!!errors.assignedTo}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium mb-1">Platform *</label>
              <CommonDropdown
                options={actualPlatformOptions}
                selected={
                  watch("platformId")
                    ? actualPlatformOptions.find((opt) => opt.value === watch("platformId")) || null
                    : null
                }
                onChange={(val: any) => setValue("platformId", val?.value || null)}
                placeholder={platformLoading ? "Loading..." : "Select Platform"}
                error={!!errors.platformId}
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium mb-1">Project *</label>
              <CommonDropdown
                options={projectStatusOptions}
                selected={
                  watch("projectStatusId")
                    ? projectStatusOptions.find((opt) => opt.value === watch("projectStatusId")) || null
                    : null
                }
                onChange={(val: any) => setValue("projectStatusId", val?.value || null)}
                placeholder={statusLoading ? "Loading..." : "Select Project"}
                error={!!errors.projectStatusId}
              />
            </div>

            {/* Plot */}
            <div>
              <label className="block text-sm font-medium mb-1">Plot *</label>
              <CommonDropdown
                options={plotOptions}
                selected={
                  watch("plotId")
                    ? plotOptions.find((opt) => opt.value === watch("plotId")) || null
                    : null
                }
                onChange={(val: any) => setValue("plotId", val?.value || null)}
                placeholder={plotsLoading ? "Loading..." : "Select Plot"}
                error={!!errors.plotId}
              />
            </div>

            {/* Lead Stage */}
            <div>
              <label className="block text-sm font-medium mb-1">Lead Stage *</label>
              <CommonDropdown
                options={leadStageOptions}
                selected={
                  watch("leadStageId")
                    ? leadStageOptions.find((opt) => opt.value === watch("leadStageId")) || null
                    : null
                }
                onChange={(val: any) => setValue("leadStageId", val?.value || null)}
                placeholder={stageLoading ? "Loading..." : "Select Lead Stage"}
                error={!!errors.leadStageId}
              />
            </div>

            {/* Lead Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Lead Status *</label>
              <CommonDropdown
                options={leadStatusOptions}
                selected={
                  watch("leadStatusId")
                    ? leadStatusOptions.find((opt) => opt.value === watch("leadStatusId")) || null
                    : null
                }
                onChange={(val: any) => setValue("leadStatusId", val?.value || null)}
                placeholder={leadStatusLoading ? "Loading..." : "Select Lead Status"}
                error={!!errors.leadStatusId}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border rounded-lg"
              disabled={isLoading}>
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Lead" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensiveLeadModal;
