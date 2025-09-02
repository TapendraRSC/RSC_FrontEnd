import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import roleReducer from './roleSlice';
import permissionReducer from "./permissionSlice"
import pagePermissionReducer from './pagePermissionSlice';
import rolePermissionSlice from "./rolePermissionSlice"
import sidebarPermissionSlice from './sidebarPermissionSlice';
import projectStatusSlice from './projectSlice'
import landSlice from "./landSlice";
import plotSlice from "./plotSlice";
import leadStages from "./leadStageSlice";
import statuses from "./statusMasterSlice";
import leadPlateform from "./leadPlateformSlice";
import leads from "./leadSlice";
import followUps from "./followUpSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        roles: roleReducer,
        permissions: permissionReducer,
        pages: pagePermissionReducer,
        rolePermissions: rolePermissionSlice,
        sidebarPermissions: sidebarPermissionSlice,
        projectStatus: projectStatusSlice,
        lands: landSlice,
        plotSlice: plotSlice,
        leadStages: leadStages,
        statuses: statuses,
        leadPlateform: leadPlateform,
        leads: leads,
        followUps: followUps
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
